"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, ClassVar

import homeassistant.util.dt as dt_util
from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import (
    ATTR_TEMPERATURE,
    PRECISION_TENTHS,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify

from .storage import ScheduleBlock

_LOGGER = logging.getLogger(__name__)

# Default settings
DEFAULT_TOLERANCE = 0.3
DEFAULT_TARGET_TEMP = 20.0


class ClimateZone(ClimateEntity, RestoreEntity):
    """Representation of a Climate Zone.

    This entity is instantiated based on a ClimateZoneConfig.
    """

    _attr_has_entity_name = True
    _attr_name = None
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_precision = PRECISION_TENTHS
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_hvac_modes: ClassVar[list[HVACMode]] = [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO]

    def __init__(
        self,
        hass: HomeAssistant,
        unique_id: str,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        coolers: list[str],
        window_sensors: list[str],
        schedule: list[ScheduleBlock] | None = None,
        restore_delay_minutes: int = 0,
    ) -> None:
        """Initialize the climate zone."""
        self.hass = hass
        self._attr_unique_id = unique_id
        self._attr_name = name

        self.entity_id = f"climate.zone_{slugify(name)}"

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._coolers = coolers
        self._window_sensors = window_sensors
        self._schedule = schedule or []
        self._restore_delay_minutes = restore_delay_minutes
        self._restore_timer = None

        self._attr_current_temperature: float | None = None
        self._attr_target_temperature = DEFAULT_TARGET_TEMP
        self._attr_hvac_mode = HVACMode.AUTO
        self._attr_hvac_action = HVACAction.IDLE

        self._attr_next_scheduled_change: str | None = None
        self._attr_next_scheduled_temp: float | None = None
        self._attr_manual_override_end: str | None = None

        self._attr_target_temperature_high: float | None = None
        self._attr_target_temperature_low: float | None = None

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
        """Update configuration dynamically."""
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
            "next_scheduled_temp": self._attr_next_scheduled_temp,
            "manual_override_end": self._attr_manual_override_end,
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

        await self._async_control_actuator()

    @callback
    def _on_time_change(self, now: datetime) -> None:
        """Check schedule on time change."""
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

    def _apply_schedule(self) -> None:
        """Apply the current schedule block."""
        if not self._schedule:
            return

        # Check Temporary Hold in Auto
        now = dt_util.now()
        if self._attr_manual_override_end:
            try:
                override_end = datetime.fromisoformat(self._attr_manual_override_end)
                if now < override_end:
                    # Hold active, do NOT apply schedule
                    # Recalculate next change (it might still be relevant for display)
                    self._calculate_next_scheduled_change(now)
                    self.async_write_ha_state()
                    self.hass.async_create_task(self._async_control_actuator())
                    return
                else:
                    # Hold expired
                    self._attr_manual_override_end = None
            except ValueError:
                self._attr_manual_override_end = None
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
            # Legacy Fallback
            legacy_target = active_block.get("target_temp", DEFAULT_TARGET_TEMP)
            t_heat = active_block.get("temp_heat", legacy_target)
            t_cool = active_block.get("temp_cool", legacy_target)

            if self._attr_hvac_mode == HVACMode.HEAT:
                self._attr_target_temperature = t_heat
            elif self._attr_hvac_mode == HVACMode.COOL:
                self._attr_target_temperature = t_cool
            elif self._attr_hvac_mode == HVACMode.AUTO:
                self._attr_target_temperature_low = t_heat
                self._attr_target_temperature_high = t_cool
                # HA requires target_temperature to be None for proper range display usually,
                # or mid-point. But for dual point control logic, low/high is key.
                self._attr_target_temperature = None
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
                legacy_target = found_block.get("target_temp", DEFAULT_TARGET_TEMP)
                t_heat = found_block.get("temp_heat", legacy_target)
                t_cool = found_block.get("temp_cool", legacy_target)

                if self._attr_hvac_mode == HVACMode.HEAT:
                    self._attr_target_temperature = t_heat
                elif self._attr_hvac_mode == HVACMode.COOL:
                    self._attr_target_temperature = t_cool
                elif self._attr_hvac_mode == HVACMode.AUTO:
                    self._attr_target_temperature_low = t_heat
                    self._attr_target_temperature_high = t_cool
                    self._attr_target_temperature = None

        # Calculate next scheduled change
        self._calculate_next_scheduled_change(now)

        self.async_write_ha_state()
        self.hass.async_create_task(self._async_control_actuator())

    def _calculate_next_scheduled_change(self, now: datetime) -> None:
        """Calculate the next scheduled change."""
        self._attr_next_scheduled_change = None
        self._attr_next_scheduled_temp = None

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
                self._attr_next_scheduled_temp = block["target_temp"]
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
                self._attr_next_scheduled_temp = first_block["target_temp"]
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

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Set new target hvac mode."""
        self._attr_hvac_mode = hvac_mode

        # Handle Auto-Restore Timer
        if self._restore_timer:
            self._restore_timer()  # Cancel existing
            self._restore_timer = None
            self._attr_manual_override_end = None

        if hvac_mode == HVACMode.AUTO:
            self._apply_schedule()
        elif hvac_mode in (HVACMode.HEAT, HVACMode.COOL):
            # If manual mode and delay is set, schedule restore
            if self._restore_delay_minutes > 0:
                _LOGGER.info("Scheduling auto-restore to AUTO in %s minutes", self._restore_delay_minutes)

                # Calculate end time
                end_time = dt_util.now() + timedelta(minutes=self._restore_delay_minutes)
                self._attr_manual_override_end = end_time.isoformat()

                self._restore_timer = async_call_later(
                    self.hass, self._restore_delay_minutes * 60, self._restore_schedule
                )

        await self._async_control_actuator()
        self.async_write_ha_state()

    @callback
    def _restore_schedule(self, _now: datetime) -> None:
        """Restore schedule after delay."""
        _LOGGER.info("Auto-restoring zone %s to AUTO mode", self.entity_id)
        self._restore_timer = None
        self._attr_manual_override_end = None
        self.hass.async_create_task(self.async_set_hvac_mode(HVACMode.AUTO))

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set new target temperature."""
        if (mode := kwargs.get("hvac_mode")) is not None:
            self._attr_hvac_mode = mode

        if (temp := kwargs.get(ATTR_TEMPERATURE)) is None:
            return
        self._attr_target_temperature = temp

        # Implement Temporary Hold if in Auto
        if self._attr_hvac_mode == HVACMode.AUTO and self._attr_next_scheduled_change:
            # Lookahead already calculated. Hold until then.
            # Only set if not already set or different?
            self._attr_manual_override_end = self._attr_next_scheduled_change

        await self._async_control_actuator()
        self.async_write_ha_state()

    def _is_window_open(self) -> bool:
        """Check if any window is open."""
        for window in self._window_sensors:
            state = self.hass.states.get(window)
            if state and state.state == "on":
                return True
        return False

    async def _async_control_actuator(self) -> None:
        """Control the actuators based on state."""
        # Safety Check: Windows
        if self._is_window_open():
            # Force everything OFF
            await self._async_turn_off_all()
            self._attr_hvac_action = HVACAction.OFF
            self.async_write_ha_state()
            return

        if self._attr_hvac_mode == HVACMode.OFF:
            await self._async_turn_off_all()
            self._attr_hvac_action = HVACAction.OFF
            self.async_write_ha_state()
            return

        if self._attr_hvac_mode in (HVACMode.HEAT, HVACMode.AUTO):
            if self._attr_current_temperature is None:
                await self._async_turn_off_all()
                self._attr_hvac_action = HVACAction.IDLE
                self.async_write_ha_state()
                return

            target = self._attr_target_temperature
            current = self._attr_current_temperature

            # Zone-Level Mode Logic
            if self._attr_hvac_mode == HVACMode.HEAT:
                # Winter Strategy: Keep at or above target
                target = self._attr_target_temperature
                if target is not None:
                    if current < (target - DEFAULT_TOLERANCE):
                        self._attr_hvac_action = HVACAction.HEATING
                        await self._async_set_heaters(True)
                        await self._async_set_coolers(False)
                    else:
                        self._attr_hvac_action = HVACAction.IDLE
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(False)

            elif self._attr_hvac_mode == HVACMode.COOL:
                # Summer Strategy: Keep at or below target
                target = self._attr_target_temperature
                if target is not None:
                    if current > (target + DEFAULT_TOLERANCE) and self._coolers:
                        self._attr_hvac_action = HVACAction.COOLING
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(True)
                    else:
                        self._attr_hvac_action = HVACAction.IDLE
                        await self._async_set_heaters(False)
                        await self._async_set_coolers(False)

            elif self._attr_hvac_mode == HVACMode.AUTO:
                # Shoulder Strategy: Keep within Low/High
                low = self._attr_target_temperature_low
                high = self._attr_target_temperature_high

                if low is None or (high is None and self._attr_target_temperature is not None):
                    low = self._attr_target_temperature - DEFAULT_TOLERANCE
                    high = self._attr_target_temperature + DEFAULT_TOLERANCE

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

    async def _async_turn_off_all(self) -> None:
        """Turn off all actuators."""
        await self._async_set_heaters(False)
        await self._async_set_coolers(False)

    async def _async_set_heaters(self, enable: bool) -> None:
        """Control heaters."""
        for entity_id in self._heaters:
            domain = entity_id.split(".")[0]
            if domain == "switch":
                service = "turn_on" if enable else "turn_off"
                await self.hass.services.async_call("switch", service, {"entity_id": entity_id})
            elif domain == "climate":
                state = self.hass.states.get(entity_id)
                if not state:
                    continue

                features = state.attributes.get("supported_features", 0)

                if enable:
                    # Smart Thermostat Logic
                    valid_modes = state.attributes.get("hvac_modes", [])
                    target_mode = None

                    if HVACMode.HEAT_COOL in valid_modes:
                        target_mode = HVACMode.HEAT_COOL
                    elif HVACMode.HEAT in valid_modes:
                        target_mode = HVACMode.HEAT
                    elif HVACMode.AUTO in valid_modes:
                        target_mode = HVACMode.AUTO

                    if target_mode and state.state != target_mode:
                        await self.hass.services.async_call(
                            "climate",
                            "set_hvac_mode",
                            {"entity_id": entity_id, "hvac_mode": target_mode},
                            blocking=True,
                        )

                    service_data: dict[str, Any] = {"entity_id": entity_id}

                    # Resolve Target
                    # In Auto/Dual mode, target_temperature is None.
                    # For Heating, we want to target the LOW setpoint.
                    target = self._attr_target_temperature
                    if target is None:
                        target = self._attr_target_temperature_low

                    if features & ClimateEntityFeature.TARGET_TEMPERATURE and target is not None:
                        service_data["temperature"] = target
                    elif features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE:
                        # If range supported, send both if available, else construct from target
                        low = self._attr_target_temperature_low
                        high = self._attr_target_temperature_high

                        if low is not None and high is not None:
                            service_data["target_temp_low"] = low
                            service_data["target_temp_high"] = high
                        elif target is not None:
                            service_data["target_temp_low"] = target
                            service_data["target_temp_high"] = target + 5  # Safety gap

                    if "temperature" in service_data or "target_temp_low" in service_data:
                        if target_mode:
                            service_data["hvac_mode"] = target_mode

                        await self.hass.services.async_call(
                            "climate",
                            "set_temperature",
                            service_data,
                            blocking=True,
                        )
                else:
                    await self.hass.services.async_call(
                        "climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": HVACMode.OFF}
                    )

    async def _async_set_coolers(self, enable: bool) -> None:
        """Control coolers."""
        for entity_id in self._coolers:
            domain = entity_id.split(".")[0]
            if domain == "climate":
                if enable:
                    state = self.hass.states.get(entity_id)
                    if not state:
                        continue
                    features = state.attributes.get("supported_features", 0)
                    valid_modes = state.attributes.get("hvac_modes", [])

                    target_mode = HVACMode.COOL
                    if HVACMode.COOL not in valid_modes:
                        if HVACMode.HEAT_COOL in valid_modes:
                            target_mode = HVACMode.HEAT_COOL
                        elif HVACMode.AUTO in valid_modes:
                            target_mode = HVACMode.AUTO

                    if state.state != target_mode:
                        await self.hass.services.async_call(
                            "climate",
                            "set_hvac_mode",
                            {"entity_id": entity_id, "hvac_mode": target_mode},
                            blocking=True,
                        )

                    service_data: dict[str, Any] = {
                        "entity_id": entity_id,
                        "hvac_mode": target_mode,
                    }

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

                    if "temperature" in service_data or "target_temp_high" in service_data:
                        await self.hass.services.async_call(
                            "climate",
                            "set_temperature",
                            service_data,
                            blocking=True,
                        )
                else:
                    await self.hass.services.async_call(
                        "climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": HVACMode.OFF}
                    )
