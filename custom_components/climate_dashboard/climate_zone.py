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

from .storage import ScheduleBlock

_LOGGER = logging.getLogger(__name__)

# Default settings
DEFAULT_TOLERANCE = 0.3
DEFAULT_TARGET_TEMP = 20.0


class ClimateZone(ClimateEntity, RestoreEntity):
    """Representation of a Climate Zone."""

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
        sensor_entity_id: str,
        actuator_entity_id: str,
        schedule: list[ScheduleBlock] | None = None,
    ) -> None:
        """Initialize the climate zone."""
        self.hass = hass
        self._attr_unique_id = unique_id
        # Internal name for the entity naming, but _attr_name=None uses device name which we don't have yet,
        # so let's set a friendly name via the entity logic if needed, or rely on entity registry.
        # For this custom component, explicitly setting name is okay for now.
        self._attr_name = name

        self._sensor_entity_id = sensor_entity_id
        self._actuator_entity_id = actuator_entity_id
        self._schedule = schedule or []

        self._attr_current_temperature: float | None = None
        self._attr_target_temperature = DEFAULT_TARGET_TEMP
        self._attr_hvac_mode = HVACMode.OFF

        # State tracking
        self._actuator_domain = actuator_entity_id.split(".")[0]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the extra state attributes."""
        return {
            "schedule": self._schedule,
            "sensor_entity_id": self._sensor_entity_id,
            "actuator_entity_id": self._actuator_entity_id,
        }

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added."""
        await super().async_added_to_hass()

        # Restore state
        if (last_state := await self.async_get_last_state()) is not None:
            # simple restore
            if last_state.state in self._attr_hvac_modes:
                self._attr_hvac_mode = HVACMode(last_state.state)
            else:
                self._attr_hvac_mode = HVACMode.OFF

            if last_state.attributes.get(ATTR_TEMPERATURE):
                self._attr_target_temperature = float(last_state.attributes[ATTR_TEMPERATURE])

        # Track sensor changes
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._sensor_entity_id], self._async_sensor_changed)
        )

        # Track actuator changes
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._actuator_entity_id], self._async_actuator_changed)
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
        day_name = now.strftime("%a").lower()  # mon, tue
        current_time_str = now.strftime("%H:%M")

        active_block = None

        # Filter for today
        todays_blocks = [b for b in self._schedule if day_name in b["days"]]

        # Sort by time
        todays_blocks.sort(key=lambda b: b["start_time"])

        # Find latest block that has started
        for block in todays_blocks:
            if block["start_time"] <= current_time_str:
                active_block = block
            else:
                break

        if active_block:
            if active_block["hvac_mode"] == "heat":
                self._attr_target_temperature = active_block["target_temp"]

        # Trigger update (write state and control actuator)
        self.async_write_ha_state()
        self.hass.async_create_task(self._async_control_actuator())

    @callback
    def _async_sensor_changed(self, event: Any) -> None:
        """Handle sensor state changes."""
        self._async_update_temp()
        self.hass.async_create_task(self._async_control_actuator())
        self.async_write_ha_state()

    @callback
    def _async_actuator_changed(self, event: Any) -> None:
        """Handle actuator state changes."""
        pass

    @callback
    def _async_update_temp(self) -> None:
        """Update sensor temperature."""
        state = self.hass.states.get(self._sensor_entity_id)
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
        # If we set temp manually, we essentially enter a "hold" or stay in current mode?
        # Standard: If in AUTO, manual temp changes might be temporary holds or stay until next block?
        # For simple MVP: Manual change does NOT stick if next minute tick re-applies schedule.
        # To fix this, we'd need "hold" logic.
        # ALLOWING OVERRIDE: We will NOT switch off AUTO.
        # The user stays in AUTO, but next minute tick will revert it.
        # This is expected behavior for "Simple" schedule.
        # User wants permanent change -> switch to HEAT.

        await self._async_control_actuator()
        self.async_write_ha_state()

    async def _async_control_actuator(self) -> None:
        """Control the actuator based on state."""
        if self._attr_hvac_mode == HVACMode.OFF:
            await self._async_turn_off_actuator()
            return

        # HEAT and AUTO (when active) Logic
        # In AUTO, we have set target_temp via schedule. So logic is same as HEAT.

        if self._attr_hvac_mode in (HVACMode.HEAT, HVACMode.AUTO):
            if self._attr_current_temperature is None:
                await self._async_turn_off_actuator()
                return

            target = self._attr_target_temperature
            current = self._attr_current_temperature

            # Simple Bang-Bang with Deadband
            if self._actuator_domain == "switch":
                if current < (target - DEFAULT_TOLERANCE):
                    await self._async_turn_on_actuator()
                elif current > (target + DEFAULT_TOLERANCE):
                    await self._async_turn_off_actuator()

            # If Climate (Pass-through)
            elif self._actuator_domain == "climate":
                await self.hass.services.async_call(
                    "climate",
                    "set_temperature",
                    {"entity_id": self._actuator_entity_id, "temperature": target, "hvac_mode": HVACMode.HEAT},
                    blocking=True,
                )

    async def _async_turn_on_actuator(self) -> None:
        """Turn on the actuator."""
        if self._actuator_domain == "switch":
            await self.hass.services.async_call("switch", "turn_on", {"entity_id": self._actuator_entity_id})

    async def _async_turn_off_actuator(self) -> None:
        """Turn off the actuator."""
        if self._actuator_domain == "switch":
            await self.hass.services.async_call("switch", "turn_off", {"entity_id": self._actuator_entity_id})
        elif self._actuator_domain == "climate":
            await self.hass.services.async_call(
                "climate", "set_hvac_mode", {"entity_id": self._actuator_entity_id, "hvac_mode": HVACMode.OFF}
            )
