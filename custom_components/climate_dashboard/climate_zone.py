"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import homeassistant.util.dt as dt_util
from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import (
    ATTR_TEMPERATURE,
    EVENT_HOMEASSISTANT_STARTED,
    PRECISION_TENTHS,
    UnitOfTemperature,
)
from homeassistant.core import CoreState, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify

from .storage import ClimateDashboardStorage, OverrideType, ScheduleBlock

_LOGGER = logging.getLogger(__name__)

# Default settings
DEFAULT_TOLERANCE = 0.3
DEFAULT_TEMP_HEAT = 20.0
DEFAULT_TEMP_COOL = 24.0
SAFETY_TARGET_TEMP = 5.0


@dataclass
class ZoneOverride:
    """Representation of an active override."""

    type: OverrideType
    end_time: datetime | None  # Optional for Infinite hold
    target_temp_low: float | None = None
    target_temp_high: float | None = None
    hvac_mode: HVACMode | None = None


class ClimateZone(ClimateEntity, RestoreEntity):
    """Representation of a Climate Zone.

    This entity is instantiated based on a ClimateZoneConfig.
    """

    _attr_has_entity_name = True
    _attr_name = None
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_precision = PRECISION_TENTHS
    _attr_precision = PRECISION_TENTHS

    def __init__(
        self,
        hass: HomeAssistant,
        storage: ClimateDashboardStorage,
        unique_id: str,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        coolers: list[str],
        window_sensors: list[str],
        schedule: list[ScheduleBlock] | None = None,
        restore_delay_minutes: int = 0,
    ) -> None:
        """Initialize the climate zone.

        Args:
            hass: HomeAssistant instance.
            storage: Storage instance.
            unique_id: Unique ID for the zone.
            name: Friendly name of the zone.
            temperature_sensor: Entity ID of the temperature sensor.
            heaters: List of heater entity IDs (switch or climate).
            coolers: List of cooler entity IDs (climate).
            window_sensors: List of window binary_sensor entity IDs.
            schedule: List of schedule blocks.
            restore_delay_minutes: Minutes to wait before restoring AUTO mode.
        """
        self.hass = hass
        self._storage = storage
        self._attr_unique_id = unique_id
        self._attr_name = name

        self.entity_id = f"climate.zone_{slugify(name)}"

        # State attributes
        self._active_override: ZoneOverride | None = None

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._coolers = coolers
        self._window_sensors = window_sensors
        self._schedule = schedule or []
        self._restore_delay_minutes = restore_delay_minutes
        self._restore_delay_minutes = restore_delay_minutes
        # self._restore_timer: Callable[[], None] | None = None
        self._attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO]
        self._attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO]
        if self._coolers:
            self._attr_hvac_modes.append(HVACMode.COOL)

        self._attr_current_temperature: float | None = None
        self._attr_target_temperature: float | None = DEFAULT_TEMP_HEAT
        self._attr_hvac_mode = HVACMode.AUTO
        self._attr_hvac_action = HVACAction.IDLE

        self._attr_next_scheduled_change: str | None = None
        self._attr_next_scheduled_temp_heat: float | None = None
        self._attr_next_scheduled_temp_cool: float | None = None

        # self._attr_manual_override_end: str | None = None

        self._attr_target_temperature_high: float | None = None
        self._attr_target_temperature_low: float | None = None

        self._attr_open_window_sensor: str | None = None

        # Safety & Failsafe Attributes
        self._attr_safety_mode: bool = False
        self._attr_using_fallback_sensor: str | None = None

        self._window_open_timestamp: datetime | None = None

        # Listen for storage/setting changes (Global Away Mode)
        self._storage.async_add_listener(self._async_on_storage_change)

    async def async_update_config(
        self,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        coolers: list[str],
        window_sensors: list[str],
        schedule: list[ScheduleBlock] | None = None,
        restore_delay_minutes: int | None = None,
    ) -> None:
        """Update configuration dynamically.

        Args:
            name: New friendly name.
            temperature_sensor: New temperature sensor entity ID.
            heaters: New list of heaters.
            coolers: New list of coolers.
            window_sensors: New list of window sensors.
            schedule: New schedule list (optional).
            restore_delay_minutes: New restore delay (optional).
        """
        self._attr_name = name
        self.entity_id = f"climate.zone_{slugify(name)}"

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._coolers = coolers
        self._window_sensors = window_sensors
        self._schedule = schedule or []

        if restore_delay_minutes is not None:
            self._restore_delay_minutes = restore_delay_minutes

        # Handle Entity ID Change (Rename)
        new_entity_id = f"climate.zone_{slugify(name)}"
        if new_entity_id != self.entity_id:
            old_entity_id = self.entity_id

            # 1. Update Registry
            from homeassistant.helpers import entity_registry as er

            registry = er.async_get(self.hass)

            # Check if old entity is in registry
            if registry.async_get(old_entity_id):
                _LOGGER.info("Renaming entity %s to %s in registry", old_entity_id, new_entity_id)
                registry.async_update_entity(old_entity_id, new_entity_id=new_entity_id)
            else:
                # If not in registry (dynamic only), we must manually remove old state
                _LOGGER.info("Renaming dynamic entity %s to %s (removing old state)", old_entity_id, new_entity_id)
                self.hass.states.async_remove(old_entity_id)

            # 2. Update Self
            self.entity_id = new_entity_id

        # Re-apply schedule if auto
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

        self.async_write_ha_state()

    @property
    def supported_features(self) -> ClimateEntityFeature:
        """Return the list of supported features."""
        if self._attr_hvac_mode == HVACMode.AUTO and self._heaters and self._coolers:
            return ClimateEntityFeature.TARGET_TEMPERATURE_RANGE
        return ClimateEntityFeature.TARGET_TEMPERATURE

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the extra state attributes."""
        return {
            "is_climate_dashboard_zone": True,
            "unique_id": self.unique_id,
            "schedule": self._schedule,
            "temperature_sensor": self._temperature_sensor,
            "heaters": self._heaters,
            "coolers": self._coolers,
            "window_sensors": self._window_sensors,
            "restore_delay_minutes": self._restore_delay_minutes,
            "next_scheduled_change": self._attr_next_scheduled_change,
            "next_scheduled_temp_heat": self._attr_next_scheduled_temp_heat,
            "next_scheduled_temp_cool": self._attr_next_scheduled_temp_cool,
            # "manual_override_end": self._attr_manual_override_end, # Deprecated
            "override_type": self._active_override.type if self._active_override else None,
            "override_end": self._active_override.end_time.isoformat()
            if self._active_override and self._active_override.end_time
            else None,
            "open_window_sensor": self._attr_open_window_sensor,
            "safety_mode": self._attr_safety_mode,
            "using_fallback_sensor": self._attr_using_fallback_sensor,
        }

    # ... (skipping unchanged methods until async_set_hvac_mode)

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added."""
        await super().async_added_to_hass()

        # Restore state
        # Restore state
        if (last_state := await self.async_get_last_state()) is not None:
            # Check for Unique ID match to prevent ghost state from deleted entities
            if last_state.attributes.get("unique_id") == self.unique_id:
                if last_state.state in self._attr_hvac_modes:
                    self._attr_hvac_mode = HVACMode(last_state.state)
                else:
                    self._attr_hvac_mode = HVACMode.AUTO

                if last_state.attributes.get(ATTR_TEMPERATURE):
                    self._attr_target_temperature = float(last_state.attributes[ATTR_TEMPERATURE])

        # Track temperature sensor changes
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._temperature_sensor], self._async_sensor_changed)
        )

        # Track window sensor changes
        if self._window_sensors:
            self.async_on_remove(
                async_track_state_change_event(self.hass, self._window_sensors, self._async_window_changed)
            )

        # Track time for schedule (every minute)
        self.async_on_remove(async_track_time_change(self.hass, self._on_time_change, second=0))

        # Initial update
        self._async_update_temp()

        # Initial schedule check
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

        # Wait for HA to be fully started before running control logic
        if self.hass.state == CoreState.running:
            await self._async_initial_control()
        else:
            self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, self._async_initial_control)

    @callback
    async def _async_initial_control(self, _event: Any = None) -> None:
        """Run initial control loop after HA startup."""
        _LOGGER.debug("Running initial control for %s", self.entity_id)

        # Retry loop: Wait for sensor to become valid
        for attempt in range(1, 61):  # Try for 60 seconds
            self._async_update_temp()
            if self._attr_current_temperature is not None:
                break

            if attempt % 10 == 0:
                _LOGGER.debug(
                    "Zone %s waiting for sensor %s (Attempt %d/60)", self.name, self._temperature_sensor, attempt
                )
            await asyncio.sleep(1.0)

        # Finally run control (will trigger Safety Mode if still None)
        await self._async_control_actuator()

    @callback
    def _on_time_change(self, now: datetime) -> None:
        """Check schedule on time change."""
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

    def _apply_schedule(self) -> None:
        """Apply the current schedule block.

        Locates the active schedule block for the current time.
        If no block matches (gap in schedule), it looks back at previous days
        to find the last applied setting (continuity logic).
        """
        if not self._schedule:
            return

        now = dt_util.now()

        # Check Active Override
        if self._active_override:
            # Check expiry
            if self._active_override.end_time and now >= self._active_override.end_time:
                # Expired -> Clear
                _LOGGER.debug("Override expired for %s", self.entity_id)
                self._active_override = None

                # Revert to AUTO if not in AUTO?
                # This ensures we go back to following the schedule fully.
                if self._attr_hvac_mode != HVACMode.AUTO:
                    self._attr_hvac_mode = HVACMode.AUTO
            else:
                # Active -> Skip schedule application
                # Recalculate next change for display
                self._calculate_next_scheduled_change(now)
                self.async_write_ha_state()
                self.hass.async_create_task(self._async_control_actuator())
                return

        day_name = now.strftime("%a").lower()
        current_time_str = now.strftime("%H:%M")

        active_block = None

        todays_blocks = [b for b in self._schedule if day_name in b["days"]]
        todays_blocks.sort(key=lambda b: b["start_time"])

        for block in todays_blocks:
            if block["start_time"] <= current_time_str:
                active_block = block
            else:
                break

        # Reset Dual Setpoints
        self._attr_target_temperature_low = None
        self._attr_target_temperature_high = None
        self._attr_target_temperature = None

        if active_block:
            t_heat = active_block.get("temp_heat", DEFAULT_TEMP_HEAT)
            t_cool = active_block.get("temp_cool", DEFAULT_TEMP_COOL)

            if self._attr_hvac_mode == HVACMode.HEAT:
                self._attr_target_temperature = t_heat
            elif self._attr_hvac_mode == HVACMode.COOL:
                self._attr_target_temperature = t_cool
            elif self._attr_hvac_mode == HVACMode.AUTO:
                # DUAL MODE (Heaters + Coolers): Use Range
                if self._heaters and self._coolers:
                    self._attr_target_temperature_low = t_heat
                    self._attr_target_temperature_high = t_cool
                    self._attr_target_temperature = None
                # SINGLE MODE (Heaters Only): Use Target (Heat)
                elif self._heaters:
                    self._attr_target_temperature = t_heat
                # SINGLE MODE (Coolers Only): Use Target (Cool)
                elif self._coolers:
                    self._attr_target_temperature = t_cool
                # Fallback / No Actuators
                else:
                    self._attr_target_temperature = t_heat
        else:
            # Lookback Logic: Check previous days
            days_map = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
            current_day_idx = now.weekday()

            found_block = None

            # Look back up to 7 days
            for i in range(1, 8):
                prev_day_idx = (current_day_idx - i) % 7
                prev_day_name = days_map[prev_day_idx]

                prev_day_blocks = [b for b in self._schedule if prev_day_name in b["days"]]
                if prev_day_blocks:
                    # Sort by start time and take the LAST block of that day
                    prev_day_blocks.sort(key=lambda b: b["start_time"])
                    found_block = prev_day_blocks[-1]
                    break

            if found_block:
                t_heat = found_block.get("temp_heat", DEFAULT_TEMP_HEAT)
                t_cool = found_block.get("temp_cool", DEFAULT_TEMP_COOL)

                if self._attr_hvac_mode == HVACMode.HEAT:
                    self._attr_target_temperature = t_heat
                elif self._attr_hvac_mode == HVACMode.COOL:
                    self._attr_target_temperature = t_cool
                elif self._attr_hvac_mode == HVACMode.AUTO:
                    # DUAL MODE (Heaters + Coolers): Use Range
                    if self._heaters and self._coolers:
                        self._attr_target_temperature_low = t_heat
                        self._attr_target_temperature_high = t_cool
                        self._attr_target_temperature = None
                    # SINGLE MODE (Heaters Only): Use Target (Heat)
                    elif self._heaters:
                        self._attr_target_temperature = t_heat
                    # SINGLE MODE (Coolers Only): Use Target (Cool)
                    elif self._coolers:
                        self._attr_target_temperature = t_cool
                    # Fallback
                    else:
                        self._attr_target_temperature = t_heat

        # Calculate next scheduled change
        self._calculate_next_scheduled_change(now)

        self.async_write_ha_state()
        self.hass.async_create_task(self._async_control_actuator())

    def _calculate_next_scheduled_change(self, now: datetime) -> None:
        """Calculate the next scheduled change.

        Scans the schedule for the next upcoming block start time.
        Sets _attr_next_scheduled_change and related attributes for UI display.

        Args:
            now: Current datetime.
        """
        self._attr_next_scheduled_change = None
        self._attr_next_scheduled_temp_heat = None
        self._attr_next_scheduled_temp_cool = None

        if not self._schedule:
            return

        # Days of week map (0=Mon, 6=Sun) to match storage format
        days_map = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        current_day_idx = now.weekday()
        current_time_str = now.strftime("%H:%M")

        # 1. Search remaining blocks today
        day_name = days_map[current_day_idx]
        todays_blocks = [b for b in self._schedule if day_name in b["days"]]
        todays_blocks.sort(key=lambda b: b["start_time"])

        for block in todays_blocks:
            if block["start_time"] > current_time_str:
                # Found next block today
                next_dt = now.replace(
                    hour=int(block["start_time"][:2]),
                    minute=int(block["start_time"][3:]),
                    second=0,
                    microsecond=0,
                )

                self._attr_next_scheduled_change = next_dt.isoformat()
                self._attr_next_scheduled_temp_heat = block.get("temp_heat")
                self._attr_next_scheduled_temp_cool = block.get("temp_cool")
                return

        # 2. Search next days (up to 7 days ahead)
        for i in range(1, 8):
            next_day_idx = (current_day_idx + i) % 7
            next_day_name = days_map[next_day_idx]

            next_day_blocks = [b for b in self._schedule if next_day_name in b["days"]]
            if next_day_blocks:
                # Found earliest block on next active day
                next_day_blocks.sort(key=lambda b: b["start_time"])
                first_block = next_day_blocks[0]

                next_dt = now + timedelta(days=i)
                next_dt = next_dt.replace(
                    hour=int(first_block["start_time"][:2]),
                    minute=int(first_block["start_time"][3:]),
                    second=0,
                    microsecond=0,
                )

                self._attr_next_scheduled_change = next_dt.isoformat()
                self._attr_next_scheduled_temp_heat = first_block.get("temp_heat")
                self._attr_next_scheduled_temp_cool = first_block.get("temp_cool")
                return

    @callback
    def _async_sensor_changed(self, event: Any) -> None:
        """Handle sensor state changes."""
        old_temp = self._attr_current_temperature
        self._async_update_temp()

        # Prevent feedback loops: Only act if temperature actually changed
        if self._attr_current_temperature == old_temp:
            return

        self.hass.async_create_task(self._async_control_actuator())
        self.async_write_ha_state()

    @callback
    def _async_window_changed(self, event: Any) -> None:
        """Handle window sensor state changes."""
        self.hass.async_create_task(self._async_control_actuator())
        self.async_write_ha_state()

    @callback
    def _async_update_temp(self) -> None:
        """Update sensor temperature."""
        state = self.hass.states.get(self._temperature_sensor)
        if not state or state.state in ("unknown", "unavailable"):
            self._attr_current_temperature = None
            return

        # If it's a climate entity, get the attribute
        if state.domain == "climate":
            self._attr_current_temperature = state.attributes.get("current_temperature")
        else:
            # Assume it's a sensor (state is the value)
            try:
                self._attr_current_temperature = float(state.state)
            except ValueError:
                self._attr_current_temperature = None

    @callback
    def _async_on_storage_change(self) -> None:
        """Handle storage changes (e.g. Away Mode toggle)."""
        settings = self._storage.settings

        # If Away Mode turned OFF, try to restore schedule
        if not settings.get("is_away_mode_on"):
            if self._attr_hvac_mode == HVACMode.AUTO:
                self._apply_schedule()

        self.hass.async_create_task(self._async_control_actuator())
        self.async_write_ha_state()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Set new target hvac mode."""
        self._attr_hvac_mode = hvac_mode

        # Clear existing override when mode changes manually
        # Unless this IS the setting of a mode with a restore delay?
        # Let's say explicit mode change clears any previous "next block" temperature holds.
        self._active_override = None

        if hvac_mode == HVACMode.AUTO:
            self._apply_schedule()
        elif hvac_mode in (HVACMode.HEAT, HVACMode.COOL):
            # If manual mode and delay is set, create DURATION override
            if self._restore_delay_minutes > 0:
                _LOGGER.info("Scheduling manual mode with auto-restore in %s minutes", self._restore_delay_minutes)
                end_time = dt_util.now() + timedelta(minutes=self._restore_delay_minutes)

                self._active_override = ZoneOverride(type=OverrideType.DURATION, end_time=end_time, hvac_mode=hvac_mode)

        await self._async_control_actuator()
        self.async_write_ha_state()

    # _restore_schedule Removed - Handled by _apply_schedule logic on override expiry

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set new target temperature."""
        if (mode := kwargs.get("hvac_mode")) is not None:
            self._attr_hvac_mode = mode

        # Track if we need to apply override logic
        set_temp = False
        new_temp = None
        new_low = None
        new_high = None

        # Handle Single Point
        if (temp := kwargs.get(ATTR_TEMPERATURE)) is not None:
            new_temp = temp
            set_temp = True

        # Handle Dual Point
        low = kwargs.get("target_temp_low")
        high = kwargs.get("target_temp_high")
        if low is not None and high is not None:
            new_low = low
            new_high = high
            set_temp = True

        if not set_temp and mode is None:
            return

        # If changing temp, create override
        if set_temp:
            # Update attributes immediately for feedback
            if new_temp is not None:
                self._attr_target_temperature = new_temp
            if new_low is not None:
                self._attr_target_temperature_low = new_low
                self._attr_target_temperature_high = new_high
                self._attr_target_temperature = None  # Clear single target if dual set

            # Determine Override Type
            settings = self._storage.settings
            override_type = settings.get("default_override_type", OverrideType.NEXT_BLOCK)

            end_time = None
            now = dt_util.now()

            if override_type == OverrideType.NEXT_BLOCK:
                # Use current lookahead if available, or calculate it
                if not self._attr_next_scheduled_change:
                    self._calculate_next_scheduled_change(now)

                if self._attr_next_scheduled_change:
                    end_time = datetime.fromisoformat(self._attr_next_scheduled_change)
                else:
                    # Fallback to Duration if no next block (e.g. empty schedule)?
                    # Or just infinite hold? Let's use 24h fallback.
                    end_time = now + timedelta(hours=24)

            elif override_type == OverrideType.DURATION:
                minutes = settings.get("default_timer_minutes", 60)
                end_time = now + timedelta(minutes=minutes)

            # Create Override
            if end_time:
                self._active_override = ZoneOverride(
                    type=override_type,
                    end_time=end_time,
                    target_temp_low=self._attr_target_temperature_low,
                    target_temp_high=self._attr_target_temperature_high,
                    # We store just the temperature override.
                    # If mode was changed, strictly speaking it should be an override too?
                )

        await self._async_control_actuator()
        self.async_write_ha_state()

    def _get_open_window_sensor(self) -> str | None:
        """Check if any window is open and return its friendly name (or None)."""
        for window in self._window_sensors:
            state = self.hass.states.get(window)
            if state and state.state == "on":
                return state.attributes.get("friendly_name") or window
        return None

    def _get_backup_sensor_value(self) -> tuple[float, str] | None:
        """Attempt to find a fallback sensor in the same Area."""
        ent_reg = er.async_get(self.hass)
        my_entry = ent_reg.async_get(self.entity_id)

        if not my_entry or not my_entry.area_id:
            return None

        # Find other sensors in area
        candidates = [
            e
            for e in ent_reg.entities.values()
            if e.area_id == my_entry.area_id
            and e.domain == "sensor"
            and e.entity_id != self._temperature_sensor
            and e.disabled_by is None
        ]

        for cand in candidates:
            state = self.hass.states.get(cand.entity_id)
            if not state or state.state in ("unknown", "unavailable"):
                continue

            # Check for temperature class or unit
            uom = state.attributes.get("unit_of_measurement")
            d_class = state.attributes.get("device_class")

            if d_class == "temperature" or uom in (UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT):
                try:
                    val = float(state.state)
                    # Found one!
                    return (val, cand.entity_id)
                except ValueError:
                    continue

        return None

    async def _async_control_actuator(self) -> None:
        """Control the actuators based on state.

        Core control loop that:
        1. Checks for open windows (Safety Stop).
        2. Checks for HVAC Mode OFF.
        3. Handles Failsafe/Safety Mode if sensors are invalid.
        4. Calculates demand based on Mode (HEAT/COOL/AUTO) and Target.
        5. Calls _async_set_heaters / _async_set_coolers accordingly.
        """
        # Force update of sensor state to avoid stale fallback values!
        self._async_update_temp()

        # Safety Check: Windows
        open_sensor = self._get_open_window_sensor()
        self._attr_open_window_sensor = open_sensor

        if open_sensor:
            # Window IS Open
            # Check delay
            now = dt_util.now()
            if self._window_open_timestamp is None:
                self._window_open_timestamp = now
                _LOGGER.debug("Zone %s: Window open detected. Starting delay.", self.name)

            settings = self._storage.settings
            delay = settings.get("window_open_delay_seconds", 30)

            time_open = (now - self._window_open_timestamp).total_seconds()

            if time_open < delay:
                # Delay active - Do NOT force off yet
                _LOGGER.debug("Zone %s: Window open delay active (%d/%d s).", self.name, int(time_open), delay)
                # Continue to normal logic (heating stays on)
            else:
                # Delay passed -> Force OFF
                await self._async_turn_off_all(force_off=True)
                self._attr_hvac_action = HVACAction.OFF
                self._attr_safety_mode = False
                self._attr_using_fallback_sensor = None
                self.async_write_ha_state()
                return

        else:
            # Window IS Closed
            if self._window_open_timestamp is not None:
                _LOGGER.debug("Zone %s: Window closed. Resetting delay.", self.name)
                self._window_open_timestamp = None

        if self._attr_hvac_mode == HVACMode.OFF:
            await self._async_turn_off_all(force_off=True)
            self._attr_hvac_action = HVACAction.OFF
            self._attr_safety_mode = False
            self._attr_using_fallback_sensor = None
            self.async_write_ha_state()
            self.async_write_ha_state()
            return

        # --- GLOBAL AWAY MODE OVERRIDE ---
        settings = self._storage.settings
        if settings.get("is_away_mode_on"):
            # Force Away Temperatures
            away_temp = float(settings.get("away_temperature", 16.0))
            away_cool_temp = float(settings.get("away_temperature_cool", 30.0))

            # Apply logic based on Mode capabilities
            if self._heaters and self._coolers and self._attr_hvac_mode == HVACMode.AUTO:
                # DUAL MODE -> Use Range
                self._attr_target_temperature = None
                self._attr_target_temperature_low = away_temp
                self._attr_target_temperature_high = away_cool_temp
                _LOGGER.debug("Zone %s in Global Away Mode (Range: %s - %s)", self.name, away_temp, away_cool_temp)
            else:
                # SINGLE MODE -> Use appropriate target
                # If in COOL mode, use the cool setback.
                # If in HEAT mode, use the heat setback.
                if self._attr_hvac_mode == HVACMode.COOL:
                    self._attr_target_temperature = away_cool_temp
                    _LOGGER.debug("Zone %s in Global Away Mode (Cool Target: %s)", self.name, away_cool_temp)
                else:
                    # HEAT or AUTO (single)
                    self._attr_target_temperature = away_temp
                    _LOGGER.debug("Zone %s in Global Away Mode (Heat Target: %s)", self.name, away_temp)

        if self._attr_hvac_mode in (HVACMode.HEAT, HVACMode.AUTO):
            current = self._attr_current_temperature

            # --- FAILSAFE LOGIC ---
            if current is None:
                # 1. Try Area Fallback
                fallback = self._get_backup_sensor_value()
                if fallback:
                    current, sensor_id = fallback
                    self._attr_using_fallback_sensor = sensor_id
                    self._attr_safety_mode = False
                    self._attr_current_temperature = current  # Update state for UI
                    _LOGGER.warning("Zone %s using fallback sensor: %s", self.name, sensor_id)
                else:
                    # 2. Safety Mode (Delegated Protection)
                    self._attr_safety_mode = True
                    self._attr_using_fallback_sensor = None
                    self._attr_hvac_action = HVACAction.IDLE  # Or special action?

                    _LOGGER.warning("Zone %s entering SAFETY MODE (No sensors). Delegating to TRVs.", self.name)

                    # - Smart Actuators: Set to SAFETY_TARGET_TEMP (5C) + HEAT
                    # - Dumb Actuators: OFF
                    for entity_id in self._heaters:
                        domain = entity_id.split(".")[0]
                        if domain == "climate":
                            # TRV / AC Logic
                            # Check supported range
                            state = self.hass.states.get(entity_id)
                            safe_temp = SAFETY_TARGET_TEMP

                            if state:
                                min_temp = state.attributes.get("min_temp")
                                if min_temp is not None and safe_temp < min_temp:
                                    safe_temp = min_temp

                                await self.hass.services.async_call(
                                    "climate",
                                    "set_temperature",
                                    {"entity_id": entity_id, "temperature": safe_temp, "hvac_mode": HVACMode.HEAT},
                                    blocking=True,
                                )
                        elif domain == "switch":
                            if self.hass.states.get(entity_id):
                                # Unsafe to run switch blindly
                                await self.hass.services.async_call("switch", "turn_off", {"entity_id": entity_id})

                    # Also turn off coolers if any
                    await self._async_set_coolers(False)

                    self.async_write_ha_state()
                    return
            else:
                # Normal Operation
                self._attr_safety_mode = False
                self._attr_using_fallback_sensor = None

            target = self._attr_target_temperature

            # Zone-Level Mode Logic
            if self._attr_hvac_mode == HVACMode.HEAT:
                # Winter Strategy: Keep at or above target
                target = self._attr_target_temperature
                if target is not None:
                    if current < (target - DEFAULT_TOLERANCE):
                        self._attr_hvac_action = HVACAction.HEATING
                        await self._async_set_heaters(True)
                        await self._async_set_coolers(False, force_off=True)
                    else:
                        self._attr_hvac_action = HVACAction.IDLE
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(False, force_off=True)

            elif self._attr_hvac_mode == HVACMode.COOL:
                # Summer Strategy: Keep at or below target
                target = self._attr_target_temperature
                if target is not None:
                    if current > (target + DEFAULT_TOLERANCE) and self._coolers:
                        self._attr_hvac_action = HVACAction.COOLING
                        await self._async_set_heaters(False, force_off=True)
                        await self._async_set_coolers(True)
                    else:
                        self._attr_hvac_action = HVACAction.IDLE
                        await self._async_set_heaters(False, force_off=True)
                        await self._async_set_coolers(False)

            elif self._attr_hvac_mode == HVACMode.AUTO:
                # Shoulder Strategy: Keep within Low/High
                low = self._attr_target_temperature_low
                high = self._attr_target_temperature_high

                if low is None or (high is None and self._attr_target_temperature is not None):
                    # Ensure strict float logic
                    base_temp = self._attr_target_temperature or DEFAULT_TEMP_HEAT
                    low = base_temp - DEFAULT_TOLERANCE
                    high = base_temp + DEFAULT_TOLERANCE

                if low is not None and high is not None:
                    if current < (low - DEFAULT_TOLERANCE):
                        self._attr_hvac_action = HVACAction.HEATING
                        await self._async_set_heaters(True)
                        await self._async_set_coolers(False)
                    elif current > (high + DEFAULT_TOLERANCE) and self._coolers:
                        self._attr_hvac_action = HVACAction.COOLING
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(True)
                    else:
                        self._attr_hvac_action = HVACAction.IDLE
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(False)

            self.async_write_ha_state()

    async def _async_turn_off_all(self, force_off: bool = True) -> None:
        """Turn off all actuators."""
        await self._async_set_heaters(False, force_off=force_off)
        await self._async_set_coolers(False, force_off=force_off)

    async def _async_set_heaters(self, enable: bool, force_off: bool = False) -> None:
        """Control heaters."""
        for entity_id in self._heaters:
            domain = entity_id.split(".")[0]
            if domain == "switch":
                if self.hass.states.get(entity_id):
                    # Switch follows demand strictly, but definitely OFF if force_off
                    is_on = enable and not force_off
                    service = "turn_on" if is_on else "turn_off"
                    await self.hass.services.async_call("switch", service, {"entity_id": entity_id})
            elif domain == "climate":
                state = self.hass.states.get(entity_id)
                if not state:
                    continue

                features = state.attributes.get("supported_features", 0)
                service_data: dict[str, Any] = {"entity_id": entity_id}

                # Resolve Target Mode (Active)
                # We want to know the active mode to send with set_temperature,
                # even if we are Idle (enable=False) or forcing off.
                valid_modes = state.attributes.get("hvac_modes", [])
                target_mode = None

                if HVACMode.HEAT_COOL in valid_modes:
                    target_mode = HVACMode.HEAT_COOL
                elif HVACMode.HEAT in valid_modes:
                    target_mode = HVACMode.HEAT
                elif HVACMode.AUTO in valid_modes:
                    target_mode = HVACMode.AUTO

                # Resolve Target Temp
                target = self._attr_target_temperature
                if target is None:
                    target = self._attr_target_temperature_low

                if features & ClimateEntityFeature.TARGET_TEMPERATURE and target is not None:
                    service_data["temperature"] = target
                elif features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE:
                    low = self._attr_target_temperature_low
                    high = self._attr_target_temperature_high

                    if low is not None and high is not None:
                        service_data["target_temp_low"] = low
                        service_data["target_temp_high"] = high
                    elif target is not None:
                        service_data["target_temp_low"] = target
                        service_data["target_temp_high"] = target + 5

                # 1. Update Temperature (Sync)
                if "temperature" in service_data or "target_temp_low" in service_data:
                    if target_mode and not force_off:
                        service_data["hvac_mode"] = target_mode

                    await self.hass.services.async_call(
                        "climate",
                        "set_temperature",
                        service_data,
                        blocking=True,
                    )

                # 2. Set Mode
                if force_off:
                    if state.state != HVACMode.OFF:
                        await self.hass.services.async_call(
                            "climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": HVACMode.OFF}
                        )
                else:
                    # Active OR Idle -> Maintain Active Mode (Heat/Auto)
                    if target_mode and state.state != target_mode:
                        await self.hass.services.async_call(
                            "climate",
                            "set_hvac_mode",
                            {"entity_id": entity_id, "hvac_mode": target_mode},
                            blocking=True,
                        )

    async def _async_set_coolers(self, enable: bool, force_off: bool = False) -> None:
        """Control coolers."""
        for entity_id in self._coolers:
            domain = entity_id.split(".")[0]
            if domain == "climate":
                state = self.hass.states.get(entity_id)
                if not state:
                    continue
                features = state.attributes.get("supported_features", 0)
                service_data: dict[str, Any] = {"entity_id": entity_id}

                # Resolve Target Mode (Cool)
                valid_modes = state.attributes.get("hvac_modes", [])
                target_mode = HVACMode.COOL
                if HVACMode.COOL not in valid_modes:
                    if HVACMode.HEAT_COOL in valid_modes:
                        target_mode = HVACMode.HEAT_COOL
                    elif HVACMode.AUTO in valid_modes:
                        target_mode = HVACMode.AUTO

                # Resolve Target for Cooling (HIGH setpoint)
                target = self._attr_target_temperature
                if target is None:
                    target = self._attr_target_temperature_high

                if features & ClimateEntityFeature.TARGET_TEMPERATURE and target is not None:
                    service_data["temperature"] = target
                elif features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE:
                    low = self._attr_target_temperature_low
                    high = self._attr_target_temperature_high

                    if low is not None and high is not None:
                        service_data["target_temp_low"] = low
                        service_data["target_temp_high"] = high
                    elif target is not None:
                        service_data["target_temp_high"] = target
                        service_data["target_temp_low"] = target - 5  # Safety gap

                # 1. Update Temperature (Sync)
                if "temperature" in service_data or "target_temp_high" in service_data:
                    if target_mode and not force_off:
                        service_data["hvac_mode"] = target_mode

                    await self.hass.services.async_call(
                        "climate",
                        "set_temperature",
                        service_data,
                        blocking=True,
                    )

                # 2. Set Mode
                if force_off:
                    if state.state != HVACMode.OFF:
                        await self.hass.services.async_call(
                            "climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": HVACMode.OFF}
                        )
                else:
                    # Active or Idle -> Keep COOL mode
                    if state.state != target_mode:
                        await self.hass.services.async_call(
                            "climate",
                            "set_hvac_mode",
                            {"entity_id": entity_id, "hvac_mode": target_mode},
                            blocking=True,
                        )
