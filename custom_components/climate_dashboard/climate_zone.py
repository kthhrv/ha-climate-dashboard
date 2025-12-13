"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, ClassVar

import homeassistant.util.dt as dt_util
from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACMode,
)
from homeassistant.const import (
    ATTR_TEMPERATURE,
    PRECISION_TENTHS,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
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

        self._attr_current_temperature: float | None = None
        self._attr_target_temperature = DEFAULT_TARGET_TEMP
        self._attr_hvac_mode = HVACMode.OFF

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the extra state attributes."""
        return {
            "is_climate_dashboard_zone": True,
            "schedule": self._schedule,
            "temperature_sensor": self._temperature_sensor,
            "heaters": self._heaters,
            "coolers": self._coolers,
            "window_sensors": self._window_sensors,
        }

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added."""
        await super().async_added_to_hass()

        # Restore state
        if (last_state := await self.async_get_last_state()) is not None:
            if last_state.state in self._attr_hvac_modes:
                self._attr_hvac_mode = HVACMode(last_state.state)
            else:
                self._attr_hvac_mode = HVACMode.OFF

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

        now = dt_util.now()
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

        if active_block:
            if active_block["hvac_mode"] == "heat":
                self._attr_target_temperature = active_block["target_temp"]

        self.async_write_ha_state()
        self.hass.async_create_task(self._async_control_actuator())

    @callback
    def _async_sensor_changed(self, event: Any) -> None:
        """Handle sensor state changes."""
        self._async_update_temp()
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
        if state and state.state not in ("unknown", "unavailable"):
            try:
                self._attr_current_temperature = float(state.state)
            except ValueError:
                self._attr_current_temperature = None
        else:
            self._attr_current_temperature = None

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Set new target hvac mode."""
        self._attr_hvac_mode = hvac_mode
        if hvac_mode == HVACMode.AUTO:
            self._apply_schedule()

        await self._async_control_actuator()
        self.async_write_ha_state()

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set new target temperature."""
        if (temp := kwargs.get(ATTR_TEMPERATURE)) is None:
            return
        self._attr_target_temperature = temp
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
            return

        if self._attr_hvac_mode == HVACMode.OFF:
            await self._async_turn_off_all()
            return

        if self._attr_hvac_mode in (HVACMode.HEAT, HVACMode.AUTO):
            if self._attr_current_temperature is None:
                await self._async_turn_off_all()
                return

            target = self._attr_target_temperature
            current = self._attr_current_temperature

            error = target - current

            # Heat Logic
            if error > DEFAULT_TOLERANCE:
                await self._async_set_heaters(True)
                await self._async_set_coolers(False)

            # Cool Logic (if supported, not fully impl in AUTO yet, simplistic)
            elif error < -DEFAULT_TOLERANCE:
                await self._async_set_heaters(False)
                await self._async_set_coolers(True)

            # Deadband
            else:
                # Maintain current state? For MVP, turn off when within band to save energy
                await self._async_set_heaters(False)
                await self._async_set_coolers(False)

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
                # Pass-through logic for Climate Actuators
                if enable:
                    await self.hass.services.async_call(
                        "climate",
                        "set_temperature",
                        {
                            "entity_id": entity_id,
                            "temperature": self._attr_target_temperature,
                            "hvac_mode": HVACMode.HEAT,
                        },
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
                    await self.hass.services.async_call(
                        "climate",
                        "set_temperature",
                        {
                            "entity_id": entity_id,
                            "temperature": self._attr_target_temperature,
                            "hvac_mode": HVACMode.COOL,
                        },  # Cool mode
                        blocking=True,
                    )
                else:
                    await self.hass.services.async_call(
                        "climate", "set_hvac_mode", {"entity_id": entity_id, "hvac_mode": HVACMode.OFF}
                    )
