"""ClimateZone entity for Climate Dashboard."""

from __future__ import annotations

import logging
from typing import Any, ClassVar

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
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.restore_state import RestoreEntity

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
    _attr_hvac_modes: ClassVar[list[HVACMode]] = [HVACMode.OFF, HVACMode.HEAT]

    def __init__(
        self,
        hass: HomeAssistant,
        unique_id: str,
        name: str,
        sensor_entity_id: str,
        actuator_entity_id: str,
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

        self._attr_current_temperature: float | None = None
        self._attr_target_temperature = DEFAULT_TARGET_TEMP
        self._attr_hvac_mode = HVACMode.OFF

        # State tracking
        self._actuator_domain = actuator_entity_id.split(".")[0]

    async def async_added_to_hass(self) -> None:
        """Run when entity about to be added."""
        await super().async_added_to_hass()

        # Restore state
        if (last_state := await self.async_get_last_state()) is not None:
            self._attr_hvac_mode = HVACMode(last_state.state)
            if last_state.attributes.get(ATTR_TEMPERATURE):
                self._attr_target_temperature = float(last_state.attributes[ATTR_TEMPERATURE])

        # Track sensor changes
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._sensor_entity_id], self._async_sensor_changed)
        )

        # Track actuator changes (to reflect state if controlled externally)
        self.async_on_remove(
            async_track_state_change_event(self.hass, [self._actuator_entity_id], self._async_actuator_changed)
        )

        # Initial update
        self._async_update_temp()
        await self._async_control_actuator()

    @callback
    def _async_sensor_changed(self, event: Any) -> None:
        """Handle sensor state changes."""
        self._async_update_temp()
        self.hass.async_create_task(self._async_control_actuator())
        self.async_write_ha_state()

    @callback
    def _async_actuator_changed(self, event: Any) -> None:
        """Handle actuator state changes."""
        # Optional: We could detect if actuator was toggled manually
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
        await self._async_control_actuator()
        self.async_write_ha_state()

    async def async_set_temperature(self, **kwargs: Any) -> None:
        """Set new target temperature."""
        if (temp := kwargs.get(ATTR_TEMPERATURE)) is None:
            return
        self._attr_target_temperature = temp
        await self._async_control_actuator()
        self.async_write_ha_state()

    async def _async_control_actuator(self) -> None:
        """Control the actuator based on state."""
        if self._attr_hvac_mode == HVACMode.OFF:
            await self._async_turn_off_actuator()
            return

        # HEAT Mode Logic
        if self._attr_hvac_mode == HVACMode.HEAT:
            if self._attr_current_temperature is None:
                # Failsafe: No temp, don't run blindly? Or keep previous?
                # For safety, basic logic: OFF if unknown
                await self._async_turn_off_actuator()
                return

            target = self._attr_target_temperature
            current = self._attr_current_temperature

            # Simple Bang-Bang with Deadband
            # If Switch:
            if self._actuator_domain == "switch":
                if current < (target - DEFAULT_TOLERANCE):
                    await self._async_turn_on_actuator()
                elif current > (target + DEFAULT_TOLERANCE):
                    await self._async_turn_off_actuator()

            # If Climate (Pass-through)
            elif self._actuator_domain == "climate":
                # Mirror setpoint
                await self.hass.services.async_call(
                    "climate",
                    "set_temperature",
                    {"entity_id": self._actuator_entity_id, "temperature": target, "hvac_mode": HVACMode.HEAT},
                    blocking=True,  # Optional blocking
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
