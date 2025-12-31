"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, cast

import homeassistant.util.dt as dt_util
from homeassistant.components.climate import (
    ATTR_TARGET_TEMP_HIGH,
    ATTR_TARGET_TEMP_LOW,
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

from .engine import ClimateIntent, IntentSource, ReconciliationEngine, TargetSetpoints
from .reconciler import Reconciler
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
        presence_sensors: list[str],
        occupancy_timeout_minutes: int,
        occupancy_setback_temp: float,
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
            presence_sensors: List of presence binary_sensor entity IDs.
            occupancy_timeout_minutes: Minutes to wait before setback.
            occupancy_setback_temp: Temperature for setback.
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

        # Initialize New Engine Components
        self._engine = ReconciliationEngine(tolerance=DEFAULT_TOLERANCE)
        self._reconciler = Reconciler(self.hass)
        self._intents: list[ClimateIntent] = []
        self._active_intent: ClimateIntent | None = None

        # Initialize schedule state
        self._next_schedule_block: ScheduleBlock | None = None

        self._temperature_sensor = temperature_sensor
        self._heaters = heaters
        self._thermostats = thermostats
        self._coolers = coolers
        self._window_sensors = window_sensors
        self._presence_sensors = presence_sensors
        self._occupancy_timeout_minutes = occupancy_timeout_minutes
        self._occupancy_setback_temp = occupancy_setback_temp
        self._last_presence_timestamp: datetime | None = None

        # Initialize Managers
        self._schedule_manager = ScheduleManager(schedule or [])
        self._safety_monitor = SafetyMonitor(
            self.hass, self._storage, unique_id, self._window_sensors, self._temperature_sensor
        )

        self._attr_hvac_modes = [HVACMode.OFF]
        if self._heaters:
            self._attr_hvac_modes.append(HVACMode.HEAT)
        if self._coolers:
            self._attr_hvac_modes.append(HVACMode.COOL)
        if self._heaters or self._coolers:
            self._attr_hvac_modes.append(HVACMode.AUTO)

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

    async def async_update_config(
        self,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        thermostats: list[str],
        coolers: list[str],
        window_sensors: list[str],
        presence_sensors: list[str],
        occupancy_timeout_minutes: int,
        occupancy_setback_temp: float,
        schedule: list[ScheduleBlock] | None = None,
    ) -> None:
        """Update configuration dynamically.

        Args:
            name: New friendly name.
            temperature_sensor: New temperature sensor entity ID.
            heaters: New list of heaters.
            coolers: New list of coolers.
            window_sensors: New list of window sensors.
            presence_sensors: New list of presence sensors.
            occupancy_timeout_minutes: New timeout.
            occupancy_setback_temp: New setback temperature.
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
        self._presence_sensors = presence_sensors
        self._occupancy_timeout_minutes = occupancy_timeout_minutes
        self._occupancy_setback_temp = occupancy_setback_temp
        self._schedule = schedule or []
        self._schedule_manager = ScheduleManager(self._schedule)
        self._safety_monitor = SafetyMonitor(
            self.hass, self._storage, self.unique_id, self._window_sensors, self._temperature_sensor
        )

        # Re-setup listeners
        self.async_on_remove(
            async_track_state_change_event(self.hass, self._presence_sensors, self._async_presence_changed)
        )

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
    def target_temperature_high(self) -> float | None:
        """Return the upper bound temperature."""
        return self._attr_target_temperature_high

    def _has_heating_capability(self) -> bool:
        """Check if this zone has any heating capability (local or circuit)."""
        if self._heaters:
            return True
        # Check circuits
        for circuit in self._storage.circuits:
            if self.unique_id in circuit.get("member_zones", []) and circuit.get("heaters"):
                return True
        return False

    def _has_cooling_capability(self) -> bool:
        """Check if this zone has any cooling capability."""
        # Note: We don't currently have "Cooling Circuits", so just check local coolers
        return bool(self._coolers)

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
            "presence_sensors": self._presence_sensors,
            "occupancy_timeout_minutes": self._occupancy_timeout_minutes,
            "occupancy_setback_temp": self._occupancy_setback_temp,
            "next_scheduled_change": self._attr_next_scheduled_change,
            "next_scheduled_temp_heat": self._attr_next_scheduled_temp_heat,
            "next_scheduled_temp_cool": self._attr_next_scheduled_temp_cool,
            "active_intent_source": (self._active_intent.source.value if self._active_intent else None),
            # Legacy Override Attributes for UI
            "override_type": (
                OverrideType.PERMANENT
                if self._active_intent
                and self._active_intent.source in (IntentSource.MANUAL_APP, IntentSource.MANUAL_DIAL)
                else None
            ),
            "override_end": (
                self._active_intent.expires_at.isoformat()
                if self._active_intent and self._active_intent.expires_at
                else None
            ),
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

                # Restore Temperatures
                target = None
                low = None
                high = None
                if last_state.attributes.get(ATTR_TEMPERATURE):
                    target = float(last_state.attributes[ATTR_TEMPERATURE])
                if last_state.attributes.get(ATTR_TARGET_TEMP_LOW):
                    low = float(last_state.attributes[ATTR_TARGET_TEMP_LOW])
                if last_state.attributes.get(ATTR_TARGET_TEMP_HIGH):
                    high = float(last_state.attributes[ATTR_TARGET_TEMP_HIGH])

                self._attr_target_temperature = target
                self._attr_target_temperature_low = low
                self._attr_target_temperature_high = high

                # Restore Manual Intent if not Auto
                # This ensures that if the user left it in HEAT/COOL, it stays there.
                if self._attr_hvac_mode != HVACMode.AUTO:
                    # Apply defaults if missing
                    if self._attr_hvac_mode == HVACMode.HEAT and target is None:
                        target = self._default_temp_heat
                    elif self._attr_hvac_mode == HVACMode.COOL and target is None:
                        target = self._default_temp_cool

                    self._intents.append(
                        ClimateIntent(
                            source=IntentSource.MANUAL_APP,
                            mode=self._attr_hvac_mode,
                            setpoints=TargetSetpoints(target=target, low=low, high=high),
                        )
                    )

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

        # Track presence sensor changes
        if self._presence_sensors:
            self.async_on_remove(
                async_track_state_change_event(self.hass, self._presence_sensors, self._async_presence_changed)
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

        # Initialize last presence timestamp
        for eid in self._presence_sensors:
            state = self.hass.states.get(eid)
            if state and state.state == "on":
                self._last_presence_timestamp = dt_util.now()
                break

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
        await self._async_reconcile()

    @callback
    def _on_time_change(self, now: datetime) -> None:
        """Check schedule and occupancy on time change."""
        if self._attr_hvac_mode != HVACMode.OFF:
            self.hass.async_create_task(self._async_reconcile())

    def _apply_schedule(self) -> None:
        """Apply the current schedule block.

        Delegates lookup to ScheduleManager and applies results to attributes.
        """
        if not self._schedule:
            return

        now = dt_util.now()

        # Calculate next scheduled change for UI
        self._calculate_next_scheduled_change(now)

        self.hass.async_create_task(self._async_reconcile())

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
        """Handle thermostat state changes (Upstream Sync)."""
        if self._startup_grace_period:
            return

        new_state = event.data.get("new_state")
        if not new_state:
            return

        # 1. Filter Echoes
        if self._reconciler.is_echo(new_state.entity_id, new_state):
            return

        # 2. Filter Non-User Changes (e.g. current_temperature update)
        old_state = event.data.get("old_state")
        mode_changed = True  # Default to True if no old state

        if old_state:
            mode_changed = old_state.state != new_state.state
            temp_changed = old_state.attributes.get(ATTR_TEMPERATURE) != new_state.attributes.get(ATTR_TEMPERATURE)

            if not mode_changed and not temp_changed:
                return

        # 3. Extract User Intent from Dial
        # We treat any difference between Desired and Reported as a User Intent
        # unless it's an echo we just filtered.
        new_mode = HVACMode(new_state.state)
        new_temp = new_state.attributes.get(ATTR_TEMPERATURE)

        if new_temp is not None:
            _LOGGER.info("Upstream Sync: User adjusted %s to %s", new_state.entity_id, new_temp)

            # Map based on current mode (Windowing logic in reverse)
            target = self._attr_target_temperature
            low = self._attr_target_temperature_low
            high = self._attr_target_temperature_high

            # Determine Intent Mode
            # If Zone is already AUTO, we interpret HEAT/COOL inputs as setpoint adjustments within AUTO.
            intent_mode = new_mode
            if self._attr_hvac_mode == HVACMode.AUTO and new_mode in (HVACMode.HEAT, HVACMode.COOL):
                intent_mode = HVACMode.AUTO

            # Only update setpoints if mode DID NOT change (i.e. user turned the dial)
            # If mode changed, we assume user just switched context, so we preserve current setpoints.
            if not mode_changed:
                min_diff = 1.0
                if new_mode == HVACMode.COOL:
                    high = new_temp
                    if low is not None and high < (low + min_diff):
                        low = high - min_diff
                else:
                    # If we are in AUTO but switched to HEAT side, update LOW
                    if intent_mode == HVACMode.AUTO:
                        low = new_temp
                        if high is not None and low > (high - min_diff):
                            high = low + min_diff
                    else:
                        target = new_temp

            # Determine Expiration for Dial Overrides
            settings = self._storage.settings
            override_type = settings.get("default_override_type", OverrideType.PERMANENT)

            expires_at = None
            now = dt_util.now()

            if override_type == OverrideType.DURATION:
                minutes = settings.get("default_timer_minutes", 60)
                expires_at = now + timedelta(minutes=minutes)
            elif override_type == OverrideType.NEXT_BLOCK:
                next_change = self._schedule_manager.get_next_change(now)
                if next_change:
                    expires_at = next_change.time

            self._intents.append(
                ClimateIntent(
                    source=IntentSource.MANUAL_DIAL,
                    mode=intent_mode,
                    setpoints=TargetSetpoints(target=target, low=low, high=high),
                    expires_at=expires_at,
                )
            )

            self.hass.async_create_task(self._async_reconcile())

    @callback
    async def _async_reconcile(self) -> None:
        """The heartbeat of the Reconciliation Engine."""
        async with self._control_lock:
            now = dt_util.now()
            # 1. Collect Active Intents
            all_intents = list(self._intents)

            # Add Away Mode Intent
            settings = self._storage.settings
            if settings.get("is_away_mode_on"):
                away_temp = float(settings.get("away_temperature", 16.0))
                away_cool_temp = float(settings.get("away_temperature_cool", 30.0))
                all_intents.append(
                    ClimateIntent(
                        source=IntentSource.AWAY_MODE,
                        mode=HVACMode.AUTO,
                        setpoints=TargetSetpoints(
                            target=away_temp,
                            low=away_temp,
                            high=away_cool_temp,
                        ),
                    )
                )

            # Add Schedule Intent
            schedule_setting = self._schedule_manager.get_active_setting(now)
            if schedule_setting:
                all_intents.append(
                    ClimateIntent(
                        source=IntentSource.SCHEDULE,
                        mode=HVACMode.AUTO,
                        setpoints=TargetSetpoints(low=schedule_setting.temp_heat, high=schedule_setting.temp_cool),
                    )
                )

            # Add Occupancy Setback Intent
            if self._presence_sensors:
                is_occupied = False
                for eid in self._presence_sensors:
                    state = self.hass.states.get(eid)
                    if state and state.state == "on":
                        is_occupied = True
                        self._last_presence_timestamp = now
                        break

                if not is_occupied and self._last_presence_timestamp:
                    elapsed = (now - self._last_presence_timestamp).total_seconds() / 60
                    if elapsed >= self._occupancy_timeout_minutes:
                        _LOGGER.debug("Zone %s: Adding Occupancy Setback intent (elapsed %.1fm)", self.name, elapsed)

                        # Calculate Setback (Offset)
                        # Default to absolute if no schedule (fallback)
                        sb_target = self._occupancy_setback_temp
                        sb_low = self._occupancy_setback_temp
                        sb_high = self._occupancy_setback_temp + 10.0

                        if schedule_setting:
                            # Use as offset: Heat - Offset, Cool + Offset
                            sb_low = schedule_setting.temp_heat - self._occupancy_setback_temp
                            sb_high = schedule_setting.temp_cool + self._occupancy_setback_temp
                            sb_target = sb_low  # Map target to low for display in single mode

                        all_intents.append(
                            ClimateIntent(
                                source=IntentSource.OCCUPANCY_SETBACK,
                                mode=HVACMode.AUTO,
                                setpoints=TargetSetpoints(
                                    target=sb_target,
                                    low=sb_low,
                                    high=sb_high,
                                ),
                            )
                        )

            # 2. Calculate Desired State
            self._async_update_temp()

            is_window_open = self._safety_monitor.check_window_timeout(now)
            self._attr_open_window_sensor = self._safety_monitor.open_window_sensor

            desired = self._engine.calculate_desired_state(
                intents=all_intents,
                current_temp=self._attr_current_temperature,
                now=now,
                current_action=self._attr_hvac_action,
                is_window_open=is_window_open,
            )

            # Validate Action against Hardware (Engine doesn't know about hardware/circuits)
            if desired.action == HVACAction.HEATING and not self._has_heating_capability():
                desired.action = HVACAction.IDLE
            elif desired.action == HVACAction.COOLING and not self._has_cooling_capability():
                desired.action = HVACAction.IDLE

            # 3. Update Zone Entity State
            self._active_intent = desired.intent
            self._attr_hvac_mode = desired.mode
            self._attr_hvac_action = desired.action

            # ... (rest of logic)

            # Dual Mode Logic: If Auto and Dual Capable, hide single target
            if desired.mode == HVACMode.AUTO:
                if self._heaters and self._coolers:
                    # True Dual Mode -> Use Range
                    self._attr_target_temperature = None
                elif self._heaters:
                    # Single Mode (Heat) -> Map Low to Target
                    self._attr_target_temperature = desired.setpoints.low
                elif self._coolers:
                    # Single Mode (Cool) -> Map High to Target
                    self._attr_target_temperature = desired.setpoints.high
            else:
                self._attr_target_temperature = desired.setpoints.target

            self._attr_target_temperature_low = desired.setpoints.low
            self._attr_target_temperature_high = desired.setpoints.high

            _LOGGER.debug(
                "Zone %s Reconciled: Mode=%s Action=%s Target=%s Low=%s High=%s",
                self.name,
                desired.mode,
                desired.action,
                self._attr_target_temperature,
                self._attr_target_temperature_low,
                self._attr_target_temperature_high,
            )

            self.async_write_ha_state()

            # 4. Push to Hardware (Reconciliation)
            # HMIs (Dials/Displays)
            for eid in self._thermostats:
                await self._reconciler.reconcile_hmi(eid, desired)

            # Actuators (Heaters/Coolers)
            should_heat = desired.action == HVACAction.HEATING
            should_cool = desired.action == HVACAction.COOLING

            # Heaters
            for eid in self._heaters:
                domain = eid.split(".")[0]
                if domain == "switch":
                    await self._reconciler.reconcile_switch(eid, should_heat)
                elif domain == "climate":
                    # For TRVs: if heating, force open (30C). If not, force closed (7C).
                    # But if we are cooling, we MUST force closed.
                    await self._reconciler.reconcile_climate_actuator(eid, should_heat=should_heat, should_cool=False)

            # Coolers
            for eid in self._coolers:
                domain = eid.split(".")[0]
                if domain == "climate":
                    await self._reconciler.reconcile_climate_actuator(eid, should_heat=False, should_cool=should_cool)

    @callback
    def _async_sensor_changed(self, event: Any) -> None:
        """Handle sensor state changes."""
        old_temp = self._attr_current_temperature
        self._async_update_temp()

        # Prevent feedback loops: Only act if temperature actually changed
        if self._attr_current_temperature == old_temp:
            return

        self.hass.async_create_task(self._async_reconcile())
        self.async_write_ha_state()

    @callback
    def _async_window_changed(self, event: Any) -> None:
        """Handle window sensor state changes."""
        self.hass.async_create_task(self._async_reconcile())
        self.async_write_ha_state()

    @callback
    def _async_presence_changed(self, event: Any) -> None:
        """Handle presence sensor state changes."""
        new_state = event.data.get("new_state")
        if new_state and new_state.state == "on":
            self._last_presence_timestamp = dt_util.now()
            _LOGGER.info("Presence detected in %s: Triggering reconciliation", self.name)
            self.hass.async_create_task(self._async_reconcile())

        self.async_write_ha_state()

    @callback
    def _async_heater_changed(self, event: Any) -> None:
        """Handle heater state changes.

        This detects if a heater has reverted its mode (Stubborn Device) or been changed externally.
        We trigger the control loop to verify/enforce.
        """
        # If the change is just temperature update (and it's a sensor), sensor_changed handles it.
        # We care about MODE changes here.
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")

        if not new_state or not old_state:
            return

        # Check if Echo
        if self._reconciler.is_echo(new_state.entity_id, new_state):
            return

        # Check for meaningful change (Mode or Target Temp)
        mode_changed = new_state.state != old_state.state
        temp_changed = new_state.attributes.get(ATTR_TEMPERATURE) != old_state.attributes.get(ATTR_TEMPERATURE)

        if mode_changed or temp_changed:
            _LOGGER.info(
                "Heater %s changed externally (Mode=%s, Temp=%s). Triggering Reconcile.",
                new_state.entity_id,
                new_state.state,
                new_state.attributes.get(ATTR_TEMPERATURE),
            )
            # Trigger control loop to verify/enforce.
            self.hass.async_create_task(self._async_reconcile())
            self.async_write_ha_state()

    @callback
    def _async_update_temp(self) -> None:
        """Update sensor temperature."""
        state = self.hass.states.get(self._temperature_sensor)

        # 1. Primary Sensor Check
        if not state or state.state in ("unknown", "unavailable"):
            # Try Fallback
            fallback = self._safety_monitor.get_fallback_temperature()
            if fallback:
                val, eid = fallback
                self._attr_current_temperature = val
                self._attr_using_fallback_sensor = eid
                self._attr_safety_mode = False
                return

            # No Fallback -> Safety Mode
            self._attr_current_temperature = None
            self._attr_using_fallback_sensor = None
            if not self._startup_grace_period:
                self._attr_safety_mode = True
            return

        self._attr_using_fallback_sensor = None
        self._attr_safety_mode = False

        raw_value = None
        # If it's a climate entity, get the attribute
        if state.domain == "climate":
            raw_value = state.attributes.get("current_temperature")
            if raw_value is not None:
                try:
                    raw_value = float(raw_value)
                except ValueError:
                    raw_value = None
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

        # If Away Mode turned ON, cancel live overrides
        if settings.get("is_away_mode_on"):
            _LOGGER.info("Away Mode enabled: Clearing manual overrides for %s", self.name)
            self._intents = [
                i for i in self._intents if i.source not in (IntentSource.MANUAL_APP, IntentSource.MANUAL_DIAL)
            ]

        # If Away Mode turned OFF, try to restore schedule
        if not settings.get("is_away_mode_on"):
            if self._attr_hvac_mode == HVACMode.AUTO:
                self._apply_schedule()

        self.hass.async_create_task(self._async_reconcile())
        self.async_write_ha_state()

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Set new target hvac mode."""
        target = self._attr_target_temperature
        low = self._attr_target_temperature_low
        high = self._attr_target_temperature_high

        # Populate defaults if switching modes
        if hvac_mode == HVACMode.HEAT:
            if target is None:
                target = low if low else self._default_temp_heat
        elif hvac_mode == HVACMode.COOL:
            if target is None:
                target = high if high else self._default_temp_cool
        elif hvac_mode == HVACMode.AUTO:
            if low is None:
                low = target if target else self._default_temp_heat
            if high is None:
                high = self._default_temp_cool
            target = None

        # Determine Intent Source and Expiration
        settings = self._storage.settings
        override_type = settings.get("default_override_type", OverrideType.PERMANENT)

        if override_type == OverrideType.DISABLED:
            _LOGGER.warning("Manual mode override ignored: Overrides are disabled.")
            self.hass.async_create_task(self._async_reconcile())
            return

        expires_at = None
        now = dt_util.now()

        if override_type == OverrideType.DURATION:
            minutes = settings.get("default_timer_minutes", 60)
            expires_at = now + timedelta(minutes=minutes)
        elif override_type == OverrideType.NEXT_BLOCK:
            next_change = self._schedule_manager.get_next_change(now)
            if next_change:
                expires_at = next_change.time

        self._intents.append(
            ClimateIntent(
                source=IntentSource.MANUAL_APP,
                mode=hvac_mode,
                setpoints=TargetSetpoints(target=target, low=low, high=high),
                expires_at=expires_at,
            )
        )

        self.hass.async_create_task(self._async_reconcile())

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set new target temperature."""
        mode = kwargs.get("hvac_mode")
        if mode is None:
            mode = self._attr_hvac_mode

        target = kwargs.get(ATTR_TEMPERATURE)
        low = kwargs.get("target_temp_low")
        high = kwargs.get("target_temp_high")

        # AUTO Mode Logic: Map 'target' to 'low' or 'high' if strictly single mode
        if mode == HVACMode.AUTO:
            if self._heaters and not self._coolers:
                # Single Mode (Heat) -> Map target to low
                if target is not None:
                    low = target
                    target = None
            elif self._coolers and not self._heaters:
                # Single Mode (Cool) -> Map target to high
                if target is not None:
                    high = target
                    target = None

        # Determine Intent Source and Expiration
        settings = self._storage.settings
        override_type = settings.get("default_override_type", OverrideType.PERMANENT)

        if override_type == OverrideType.DISABLED:
            _LOGGER.warning("Manual temperature override ignored: Overrides are disabled.")
            self.hass.async_create_task(self._async_reconcile())
            return

        expires_at = None
        now = dt_util.now()

        if override_type == OverrideType.DURATION:
            minutes = settings.get("default_timer_minutes", 60)
            expires_at = now + timedelta(minutes=minutes)
        elif override_type == OverrideType.NEXT_BLOCK:
            next_change = self._schedule_manager.get_next_change(now)
            if next_change:
                expires_at = next_change.time

        self._intents.append(
            ClimateIntent(
                source=IntentSource.MANUAL_APP,
                mode=mode,
                setpoints=TargetSetpoints(target=target, low=low, high=high),
                expires_at=expires_at,
            )
        )

        self.hass.async_create_task(self._async_reconcile())
