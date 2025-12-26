"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, cast

import homeassistant.util.dt as dt_util
from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import (
    ATTR_TEMPERATURE,
    ATTR_UNIT_OF_MEASUREMENT,
    EVENT_HOMEASSISTANT_STARTED,
    PRECISION_TENTHS,
    UnitOfTemperature,
)
from homeassistant.core import CoreState, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import slugify
from homeassistant.util.unit_conversion import TemperatureConverter

from .actuator import Actuator, ActuatorType, ClimateActuator, SwitchActuator, ThermostatSync
from .safety import SafetyMonitor
from .schedule_manager import ScheduleManager
from .storage import ClimateDashboardStorage, OverrideType, ScheduleBlock

_LOGGER = logging.getLogger(__name__)

# Default settings
DEFAULT_TOLERANCE = 0.3
DEFAULT_TEMP_HEAT = 20.0
DEFAULT_TEMP_COOL = 24.0
SAFETY_TARGET_TEMP = 5.0
THROTTLE_LIMIT = 10


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
    _attr_precision = PRECISION_TENTHS

    def __init__(
        self,
        hass: HomeAssistant,
        storage: ClimateDashboardStorage,
        unique_id: str,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        thermostats: list[str],
        coolers: list[str],
        window_sensors: list[str],
        schedule: list[ScheduleBlock] | None = None,
    ) -> None:
        """Initialize the climate zone.

        Args:
            hass: HomeAssistant instance.
            storage: Storage instance.
            unique_id: Unique ID for the zone.
            name: Friendly name of the zone.
            temperature_sensor: Entity ID of the temperature sensor.
            heaters: List of heater entity IDs (switch or climate).
            thermostats: List of thermostat entity IDs (climate active sync).
            coolers: List of cooler entity IDs (climate).
            window_sensors: List of window binary_sensor entity IDs.
            schedule: List of schedule blocks.
        """
        self.hass = hass
        self._storage = storage
        self._attr_unique_id = unique_id
        self._attr_name = name

        self.entity_id = f"climate.zone_{slugify(name)}"

        self._attr_hvac_mode = HVACMode.AUTO
        self._attr_preset_mode = None
        self._attr_hvac_action = HVACAction.OFF
        self._attr_target_temperature: float | None = None
        self._attr_current_temperature: float | None = None

        # Convert Default Constants to System Unit
        self._default_temp_heat = DEFAULT_TEMP_HEAT
        self._default_temp_cool = DEFAULT_TEMP_COOL
        self._safety_target_temp = SAFETY_TARGET_TEMP

        if self.temperature_unit == UnitOfTemperature.FAHRENHEIT:
            self._default_temp_heat = TemperatureConverter.convert(
                DEFAULT_TEMP_HEAT, UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT
            )
            self._default_temp_cool = TemperatureConverter.convert(
                DEFAULT_TEMP_COOL, UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT
            )
            self._safety_target_temp = TemperatureConverter.convert(
                SAFETY_TARGET_TEMP, UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT
            )

        # Initialize schedule state
        self._active_override: ZoneOverride | None = None
        self._next_schedule_block: ScheduleBlock | None = None

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._thermostats = thermostats
        self._coolers = coolers
        self._window_sensors = window_sensors

        # Initialize Managers
        self._schedule_manager = ScheduleManager(schedule or [])
        self._safety_monitor = SafetyMonitor(
            self.hass, self._storage, unique_id, self._window_sensors, self._temperature_sensor
        )

        self._heaters_actuators: list[Actuator] = []
        self._coolers_actuators: list[Actuator] = []
        self._thermostats_sync: list[ThermostatSync] = []

        self._attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO]
        if self._coolers:
            self._attr_hvac_modes.append(HVACMode.COOL)

        self._attr_next_scheduled_change: str | None = None
        self._attr_next_scheduled_temp_heat: float | None = None
        self._attr_next_scheduled_temp_cool: float | None = None

        self._attr_target_temperature_high: float | None = None
        self._attr_target_temperature_low: float | None = None

        self._attr_open_window_sensor: str | None = None
        self._control_lock = asyncio.Lock()
        self._last_control_time: float = 0.0
        self._throttle_count: int = 0

        # Safety & Failsafe Attributes
        self._attr_safety_mode: bool = False
        self._attr_using_fallback_sensor: str | None = None

        self._window_open_timestamp: datetime | None = None

        # Startup Grace Period (Prevents Safety Mode during initialization)
        self._startup_grace_period: bool = True
        self._startup_task: asyncio.Task | None = None

        # Create Actuators
        self._create_actuators()

        # Listen for storage/setting changes (Global Away Mode)
        self._storage.async_add_listener(self._async_on_storage_change)

    @property
    def _schedule(self) -> list[ScheduleBlock]:
        """Return the schedule from the manager."""
        return self._schedule_manager.schedule

    @_schedule.setter
    def _schedule(self, value: list[ScheduleBlock]) -> None:
        """Update the schedule in the manager."""
        self._schedule_manager.schedule = value

    def _create_actuators(self) -> None:
        """Create actuator objects based on config."""
        self._heaters_actuators = []
        for eid in self._heaters:
            domain = eid.split(".")[0]
            if domain == "switch":
                self._heaters_actuators.append(SwitchActuator(self.hass, eid))
            elif domain == "climate":
                is_internal = eid == self._temperature_sensor
                self._heaters_actuators.append(ClimateActuator(self.hass, eid, ActuatorType.HEATER, is_internal))

        self._coolers_actuators = []
        for eid in self._coolers:
            domain = eid.split(".")[0]
            if domain == "climate":
                is_internal = eid == self._temperature_sensor
                self._coolers_actuators.append(ClimateActuator(self.hass, eid, ActuatorType.COOLER, is_internal))

        self._thermostats_sync = []
        for eid in self._thermostats:
            # Check if this thermostat is already handled as an active actuator (external sensor mode)
            is_internal = eid == self._temperature_sensor
            is_actuator = (self._heaters and eid in self._heaters) or (self._coolers and eid in self._coolers)

            if is_actuator and not is_internal:
                # Controlled by actuator logic (Dummy Valve), skip passive sync
                continue

            self._thermostats_sync.append(ThermostatSync(self.hass, eid))
            _LOGGER.debug(
                "Zone %s: Added ThermostatSync for %s (Internal=%s, Actuator=%s)",
                self.name,
                eid,
                is_internal,
                is_actuator,
            )

    async def async_update_config(
        self,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        thermostats: list[str],
        coolers: list[str],
        window_sensors: list[str],
        schedule: list[ScheduleBlock] | None = None,
    ) -> None:
        """Update configuration dynamically.

        Args:
            name: New friendly name.
            temperature_sensor: New temperature sensor entity ID.
            heaters: New list of heaters.
            coolers: New list of coolers.
            window_sensors: New list of window sensors.
            schedule: New schedule list (optional).
        """
        self._attr_name = name

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

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._thermostats = thermostats
        self._coolers = coolers
        self._window_sensors = window_sensors
        self._schedule = schedule or []
        self._schedule_manager = ScheduleManager(self._schedule)
        self._safety_monitor = SafetyMonitor(
            self.hass, self._storage, self.unique_id, self._window_sensors, self._temperature_sensor
        )

        # Re-create Actuators
        self._create_actuators()

        # Re-apply schedule if auto
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

        self.async_write_ha_state()

    @property
    def temperature_unit(self) -> str:
        """Return the unit of measurement used by the platform."""
        return cast(str, self.hass.config.units.temperature_unit)

    @property
    def target_temperature(self) -> float | None:
        """Return the temperature we try to reach."""
        return self._attr_target_temperature

    @property
    def supported_features(self) -> ClimateEntityFeature:
        """Return the list of supported features."""
        # Dynamic Feature Flags
        features = ClimateEntityFeature.TURN_OFF | ClimateEntityFeature.TURN_ON

        # If we have heaters AND coolers, we support range (AUTO mode)
        if self._heaters and self._coolers:
            features |= ClimateEntityFeature.TARGET_TEMPERATURE_RANGE
            features |= ClimateEntityFeature.TARGET_TEMPERATURE
        else:
            features |= ClimateEntityFeature.TARGET_TEMPERATURE

        return features

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the extra state attributes."""
        return {
            "is_climate_dashboard_zone": True,
            "unique_id": self.unique_id,
            "schedule": self._schedule,
            "temperature_sensor": self._temperature_sensor,
            "heaters": self._heaters,
            "thermostats": self._thermostats,
            "coolers": self._coolers,
            "window_sensors": self._window_sensors,
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
        if (last_state := await self.async_get_last_state()) is not None:
            # Check for Unique ID match to prevent ghost state from deleted entities
            if last_state.attributes.get("unique_id") == self.unique_id:
                if last_state.state in self._attr_hvac_modes:
                    self._attr_hvac_mode = HVACMode(last_state.state)
                else:
                    self._attr_hvac_mode = HVACMode.AUTO

                if last_state.attributes.get(ATTR_TEMPERATURE):
                    self._attr_target_temperature = float(last_state.attributes[ATTR_TEMPERATURE])

                _LOGGER.info("Zone %s restored state: %s", self.name, self._attr_hvac_mode)
        else:
            _LOGGER.info("Zone %s has no restored state. Defaulting to %s", self.name, self._attr_hvac_mode)

        # Track temperature sensor changes
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._temperature_sensor], self._async_sensor_changed)
        )

        # Track window sensor changes
        if self._window_sensors:
            self.async_on_remove(
                async_track_state_change_event(self.hass, self._window_sensors, self._async_window_changed)
            )

        # Track thermostat changes (Upstream Sync)
        if self._thermostats:
            self.async_on_remove(
                async_track_state_change_event(self.hass, self._thermostats, self._async_thermostat_changed)
            )

        # Track heater changes (Mode Enforcement)
        if self._heaters:
            # Only track those that are NOT also the sensor (to avoid double tracking)
            # Actually, tracking twice is fine, we just need to handle it.
            self.async_on_remove(async_track_state_change_event(self.hass, self._heaters, self._async_heater_changed))

        # Track time for schedule (every minute)
        self.async_on_remove(async_track_time_change(self.hass, self._on_time_change, second=0))

        # Initial update
        self._async_update_temp()

        # Initial schedule check
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

        # Wait for HA to be fully started before running control logic
        if self.hass.state == CoreState.running:
            self._startup_task = self.hass.async_create_task(self._async_initial_control())
        else:
            self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, self._async_initial_control)

    async def async_will_remove_from_hass(self) -> None:
        """Run when entity will be removed."""
        if self._startup_task:
            self._startup_task.cancel()
            self._startup_task = None
        await super().async_will_remove_from_hass()

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

        # End grace period
        self._startup_grace_period = False

        # Finally run control (will trigger Safety Mode if still None/Unavailable)
        # Finally run control (will trigger Safety Mode if still None/Unavailable)
        await self._async_control_actuator(force=True)

    @callback
    def _on_time_change(self, now: datetime) -> None:
        """Check schedule on time change."""
        if self._attr_hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

    def _apply_schedule(self) -> None:
        """Apply the current schedule block.

        Delegates lookup to ScheduleManager and applies results to attributes.
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

                if self._attr_hvac_mode != HVACMode.AUTO:
                    self._attr_hvac_mode = HVACMode.AUTO
            else:
                # Active -> Skip schedule application
                self._calculate_next_scheduled_change(now)
                self.async_write_ha_state()
                self.hass.async_create_task(self._async_control_actuator())
                return

        setting = self._schedule_manager.get_active_setting(now)

        # Reset Setpoints
        self._attr_target_temperature_low = None
        self._attr_target_temperature_high = None
        self._attr_target_temperature = None

        if setting:
            t_heat = setting.temp_heat
            t_cool = setting.temp_cool

            if self._attr_hvac_mode == HVACMode.HEAT:
                self._attr_target_temperature = t_heat
            elif self._attr_hvac_mode == HVACMode.COOL:
                self._attr_target_temperature = t_cool
            elif self._attr_hvac_mode == HVACMode.AUTO:
                # DUAL MODE (Heaters + Coolers): Use Range
                if self._heaters and self._coolers:
                    self._attr_target_temperature_low = t_heat
                    self._attr_target_temperature_high = t_cool
                # SINGLE MODE
                elif self._heaters:
                    self._attr_target_temperature = t_heat
                elif self._coolers:
                    self._attr_target_temperature = t_cool
                else:
                    self._attr_target_temperature = t_heat

        # Calculate next scheduled change
        self._calculate_next_scheduled_change(now)

        self.async_write_ha_state()
        self.hass.async_create_task(self._async_control_actuator())

    def _calculate_next_scheduled_change(self, now: datetime) -> None:
        """Calculate the next scheduled change using ScheduleManager."""
        self._attr_next_scheduled_change = None
        self._attr_next_scheduled_temp_heat = None
        self._attr_next_scheduled_temp_cool = None

        next_change = self._schedule_manager.get_next_change(now)
        if next_change:
            self._attr_next_scheduled_change = next_change.time.isoformat()
            self._attr_next_scheduled_temp_heat = next_change.temp_heat
            self._attr_next_scheduled_temp_cool = next_change.temp_cool

    @callback
    def _async_thermostat_changed(self, event: Any) -> None:
        """Handle thermostat state changes (Upstream Sync).

        If the physical thermostat is adjusted manually, we treat it as a Manual Override.
        """
        # Ignore upstream sync during startup (prevent stale device state from overriding schedule)
        if self._startup_grace_period:
            return

        new_state = event.data.get("new_state")
        if not new_state:
            return

        # 2. Prevent Infinite Loop: Actuator Control vs Upstream Sync
        # If this thermostat is ALSO a heater/cooler controlled by us, and we are using
        # External Sensor logic (so we force it to Max/Min), then we must IGNORE its state changes.
        # Otherwise: We force it to 30 -> It reports 30 -> We set Zone Target to 30 -> We force it to 30... (Loop)

        is_internal_sensor = self._temperature_sensor == new_state.entity_id
        is_actuator_controlled = (self._heaters and new_state.entity_id in self._heaters) or (
            self._coolers and new_state.entity_id in self._coolers
        )

        if is_actuator_controlled and not is_internal_sensor:
            # We are driving this device as a dummy actuator (Bang-Bang).
            # We should NOT accept its setpoint changes as user input, because they are likely our own commands.
            # However, sophisticated users might still want to turn the dial?
            # No, if we force it to 30, turning the dial to 22 will just be overwritten next cycle anyway.
            # So ignoring it is the correct "Child Lock" behavior to prevent the loop.
            # So ignoring it is the correct "Child Lock" behavior to prevent the loop.
            return

        # 1. Check for Target Temp Change
        new_temp = new_state.attributes.get("temperature")
        current_target = self._attr_target_temperature

        # Find sync helper
        sync_helper = next((s for s in self._thermostats_sync if s.entity_id == new_state.entity_id), None)
        if sync_helper and not sync_helper.check_is_external_change(new_state):
            return

        # Check if overrides are disabled
        settings = self._storage.settings
        override_disabled = settings.get("default_override_type", OverrideType.DISABLED) == OverrideType.DISABLED

        if new_temp is not None and not override_disabled:
            if current_target is not None:
                # Single Point -> Single Point
                diff = abs(float(new_temp) - float(current_target))
                if diff > 0.1:
                    _LOGGER.info(
                        "Upstream Sync: Thermostat %s set to %s (Zone was %s). Creating Override.",
                        new_state.entity_id,
                        new_temp,
                        current_target,
                    )
                    self.hass.async_create_task(self.async_set_temperature(temperature=new_temp))

            elif self._attr_target_temperature_low is not None:
                # Single Point Dial -> Dual Point Zone
                # Interpret Dial change as shifting the Range
                current_low = self._attr_target_temperature_low
                current_high = self._attr_target_temperature_high

                # Default to shifting based on Low (Heating)
                baseline_temp = current_low

                # If Dial is in COOL mode, it represents the High setpoint
                if new_state.state == HVACMode.COOL and current_high is not None:
                    baseline_temp = current_high

                # If high is somehow missing, assume a default delta
                if current_high is None:
                    current_high = current_low + 3.0

                diff = float(new_temp) - float(baseline_temp)

                if abs(diff) > 0.1:
                    new_low = current_low + diff
                    new_high = current_high + diff

                    _LOGGER.info(
                        "Upstream Sync: Thermostat %s set to %s (Zone Baseline was %s). Shifting Range by %s.",
                        new_state.entity_id,
                        new_temp,
                        baseline_temp,
                        diff,
                    )
                    self.hass.async_create_task(
                        self.async_set_temperature(target_temp_low=new_low, target_temp_high=new_high)
                    )

        # Always trigger downstream sync check (e.g. for Mode Sync updates)
        self.hass.async_create_task(self._async_control_actuator())

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
    def _async_heater_changed(self, event: Any) -> None:
        """Handle heater state changes.

        This detects if a heater has reverted its mode (Stubborn Device) or been changed externally.
        We trigger the control loop to enforce our state if necessary.
        """
        # If the change is just temperature update (and it's a sensor), sensor_changed handles it.
        # We care about MODE changes here.
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")

        if not new_state or not old_state:
            return

        if new_state.state != old_state.state:
            # Mode changed! Trigger control loop to verify/enforce.
            self.hass.async_create_task(self._async_control_actuator())
            self.async_write_ha_state()

    @callback
    def _async_update_temp(self) -> None:
        """Update sensor temperature."""
        state = self.hass.states.get(self._temperature_sensor)
        if not state or state.state in ("unknown", "unavailable"):
            self._attr_current_temperature = None
            return

        raw_value = None
        # If it's a climate entity, get the attribute
        if state.domain == "climate":
            raw_value = state.attributes.get("current_temperature")
        else:
            # Assume it's a sensor (state is the value)
            try:
                raw_value = float(state.state)
            except ValueError:
                raw_value = None

        if raw_value is None:
            self._attr_current_temperature = None
            return

        # Unit Conversion
        sensor_unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        if sensor_unit and sensor_unit != self.temperature_unit:
            try:
                self._attr_current_temperature = TemperatureConverter.convert(
                    raw_value, sensor_unit, self.temperature_unit
                )
            except Exception:
                _LOGGER.warning("Failed to convert temperature from %s to %s", sensor_unit, self.temperature_unit)
                self._attr_current_temperature = raw_value
        else:
            self._attr_current_temperature = raw_value

    @callback
    def _async_on_storage_change(self) -> None:
        """Handle storage changes (e.g. Away Mode toggle)."""
        settings = self._storage.settings

        # If Away Mode turned OFF, try to restore schedule
        if not settings.get("is_away_mode_on"):
            if self._attr_hvac_mode == HVACMode.AUTO:
                self._apply_schedule()

        self.hass.async_create_task(self._async_control_actuator(force=True))
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
            pass

        await self._async_control_actuator(force=True)
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
            _LOGGER.debug(
                "Zone %s async_set_temperature triggering Override: NewTemp=%s, Low=%s, High=%s",
                self.name,
                new_temp,
                new_low,
                new_high,
            )
            # Update attributes immediately for feedback
            if new_temp is not None:
                self._attr_target_temperature = new_temp
            if new_low is not None:
                self._attr_target_temperature_low = new_low
                self._attr_target_temperature_high = new_high
                self._attr_target_temperature = None  # Clear single target if dual set

            # Determine Override Type
            settings = self._storage.settings
            override_type = settings.get("default_override_type", OverrideType.DISABLED)

            if override_type == OverrideType.DISABLED:
                _LOGGER.info("Zone %s: Overrides disabled. Reverting manual change to schedule.", self.name)
                self._apply_schedule()
                return

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

        await self._async_control_actuator(force=True)
        self.async_write_ha_state()

    async def _async_control_actuator(self, force: bool = False) -> None:
        """Control the actuators based on state.

        Core control loop that:
        1. Checks for open windows (Safety Stop).
        2. Checks for HVAC Mode OFF.
        3. Handles Failsafe/Safety Mode if sensors are invalid.
        4. Calculates demand based on Mode (HEAT/COOL/AUTO) and Target.
        5. Calls _async_set_heaters / _async_set_coolers accordingly.
        """
        async with self._control_lock:
            # Throttle Control Loop to prevent event floods if actuators are "fighting" (e.g. stubborn mode)
            # We allow frequent updates if they are far apart, but if we get slammed with updates, we throttle.
            now_ts = asyncio.get_running_loop().time()

            # Reset bucket if time passed
            if hasattr(self, "_last_control_time") and (now_ts - self._last_control_time) > 2.0:
                self._throttle_count = 0

            if not force:
                # Check Budget
                if self._throttle_count >= THROTTLE_LIMIT:
                    # Exhausted budget for this window
                    _LOGGER.warning("Zone %s: Throttling excessive control updates to prevent loop.", self.name)
                    return
                self._throttle_count += 1

            self._last_control_time = now_ts

            # Force update of sensor state to avoid stale fallback values!
            self._async_update_temp()

            # Safety Check: Windows
            if self._safety_monitor.check_window_timeout(dt_util.now()):
                # Delay passed -> Force OFF
                await self._async_turn_off_all(force_off=True)
                self._attr_hvac_action = HVACAction.OFF
                self._attr_safety_mode = False
                self._attr_using_fallback_sensor = None
                self._attr_open_window_sensor = self._safety_monitor.open_window_sensor
                self.async_write_ha_state()
                return

            self._attr_open_window_sensor = self._safety_monitor.open_window_sensor

            if self._attr_hvac_mode == HVACMode.OFF:
                await self._async_turn_off_all(force_off=True)
                self._attr_hvac_action = HVACAction.OFF
                self._attr_safety_mode = False
                self._attr_using_fallback_sensor = None
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
                    if self._attr_hvac_mode == HVACMode.COOL:
                        self._attr_target_temperature = away_cool_temp
                        _LOGGER.debug("Zone %s in Global Away Mode (Cool Target: %s)", self.name, away_cool_temp)
                    else:
                        # HEAT or AUTO (single)
                        self._attr_target_temperature = away_temp
                        _LOGGER.debug("Zone %s in Global Away Mode (Heat Target: %s)", self.name, away_temp)

            if self._attr_hvac_mode in (HVACMode.HEAT, HVACMode.AUTO, HVACMode.COOL):
                current = self._attr_current_temperature

                # --- FAILSAFE LOGIC ---
                if current is None:
                    # Check for startup grace period - SKIP Safety Mode if waiting
                    if self._startup_grace_period:
                        _LOGGER.debug(
                            "Zone %s skipping Safety Mode check (Startup Grace Period Active)",
                            self.name,
                        )
                        return

                    # 1. Try Area Fallback
                    fallback = self._safety_monitor.get_fallback_temperature()
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
                        self._attr_hvac_action = HVACAction.IDLE

                        _LOGGER.warning("Zone %s entering SAFETY MODE (No sensors). Delegating to TRVs.", self.name)

                        # Set actuators to safety mode
                        for actuator in self._heaters_actuators:
                            if isinstance(actuator, ClimateActuator):
                                # TRV / AC Logic: Set to 5C and HEAT
                                await actuator.async_control(
                                    enable=True, target_temp=SAFETY_TARGET_TEMP, force_target=True
                                )
                            elif isinstance(actuator, SwitchActuator):
                                # Dumb Actuators: OFF
                                await actuator.async_control(enable=False)

                        # Also turn off coolers if any
                        await self._async_set_coolers(False, force_off=True)

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

            # Sync to physical thermostats
            await self._async_sync_thermostats()

            self.async_write_ha_state()

    async def _async_turn_off_all(self, force_off: bool = True) -> None:
        """Turn off all actuators."""
        await self._async_set_heaters(False, force_off=force_off)
        await self._async_set_coolers(False, force_off=force_off)

    async def _async_set_heaters(self, enable: bool, force_off: bool = False, force_target: bool = False) -> None:
        """Control heaters."""
        for actuator in self._heaters_actuators:
            await actuator.async_control(
                enable=enable,
                target_temp=self._attr_target_temperature,
                target_low=self._attr_target_temperature_low,
                target_high=self._attr_target_temperature_high,
                force_off=force_off,
                force_target=force_target,
            )

    async def _async_set_coolers(self, enable: bool, force_off: bool = False, force_target: bool = False) -> None:
        """Control coolers."""
        for actuator in self._coolers_actuators:
            await actuator.async_control(
                enable=enable,
                target_temp=self._attr_target_temperature,
                target_low=self._attr_target_temperature_low,
                target_high=self._attr_target_temperature_high,
                force_off=force_off,
                force_target=force_target,
            )

    async def _async_sync_thermostats(self) -> None:
        """Sync target temperature to physical thermostats."""
        for sync in self._thermostats_sync:
            await sync.async_sync(
                target_temp=self._attr_target_temperature,
                target_low=self._attr_target_temperature_low,
                target_high=self._attr_target_temperature_high,
                zone_hvac_mode=self._attr_hvac_mode,
                zone_hvac_action=self._attr_hvac_action,
            )
