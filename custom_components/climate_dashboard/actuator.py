"""Actuator abstractions for Climate Dashboard."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from enum import IntEnum
from typing import Any

from homeassistant.components.climate import (
    ATTR_TARGET_TEMP_HIGH,
    ATTR_TARGET_TEMP_LOW,
    ClimateEntityFeature,
    HVACMode,
)
from homeassistant.const import ATTR_ENTITY_ID, ATTR_TEMPERATURE
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


class ActuatorType(IntEnum):
    """Type of actuator."""

    HEATER = 1
    COOLER = 2


class Actuator(ABC):
    """Base class for all actuators."""

    def __init__(self, hass: HomeAssistant, entity_id: str) -> None:
        """Initialize the actuator."""
        self.hass = hass
        self.entity_id = entity_id

    @abstractmethod
    async def async_control(
        self,
        enable: bool,
        target_temp: float | None = None,
        target_low: float | None = None,
        target_high: float | None = None,
        force_off: bool = False,
        force_target: bool = False,
    ) -> None:
        """Control the actuator."""


class SwitchActuator(Actuator):
    """Actuator for switch entities."""

    async def async_control(
        self,
        enable: bool,
        target_temp: float | None = None,
        target_low: float | None = None,
        target_high: float | None = None,
        force_off: bool = False,
        force_target: bool = False,
    ) -> None:
        """Control the switch."""
        is_on = enable and not force_off
        service = "turn_on" if is_on else "turn_off"
        await self.hass.services.async_call("switch", service, {ATTR_ENTITY_ID: self.entity_id})


class ClimateActuator(Actuator):
    """Actuator for climate entities."""

    def __init__(
        self,
        hass: HomeAssistant,
        entity_id: str,
        actuator_type: ActuatorType,
        is_internal_sensor: bool,
    ) -> None:
        """Initialize the climate actuator."""
        super().__init__(hass, entity_id)
        self.type = actuator_type
        self.is_internal_sensor = is_internal_sensor

    async def async_control(
        self,
        enable: bool,
        target_temp: float | None = None,
        target_low: float | None = None,
        target_high: float | None = None,
        force_off: bool = False,
        force_target: bool = False,
    ) -> None:
        """Control the climate entity."""
        state = self.hass.states.get(self.entity_id)
        if not state:
            return

        features = state.attributes.get("supported_features", 0)
        valid_modes = state.attributes.get("hvac_modes", [])
        service_data: dict[str, Any] = {ATTR_ENTITY_ID: self.entity_id}

        # 1. Resolve Target Mode
        target_mode = None
        if self.type == ActuatorType.HEATER:
            if HVACMode.HEAT_COOL in valid_modes:
                target_mode = HVACMode.HEAT_COOL
            elif HVACMode.AUTO in valid_modes:
                target_mode = HVACMode.AUTO
            elif HVACMode.HEAT in valid_modes:
                target_mode = HVACMode.HEAT
        else:  # COOLER
            if HVACMode.COOL in valid_modes:
                target_mode = HVACMode.COOL
            elif HVACMode.HEAT_COOL in valid_modes:
                target_mode = HVACMode.HEAT_COOL
            elif HVACMode.AUTO in valid_modes:
                target_mode = HVACMode.AUTO

        # 2. Target Temperature Logic
        actuator_target: float | None = None
        actuator_low: float | None = None
        actuator_high: float | None = None

        if self.is_internal_sensor or force_target:
            # NORMAL LOGIC: Follow provided targets
            actuator_target = target_temp
            actuator_low = target_low
            actuator_high = target_high
        else:
            # EXTERNAL SENSOR LOGIC: Binary Valve Behavior
            if force_off:
                actuator_target = 7.0 if self.type == ActuatorType.HEATER else 30.0
            elif enable:
                actuator_target = 30.0 if self.type == ActuatorType.HEATER else 16.0
            else:
                actuator_target = 7.0 if self.type == ActuatorType.HEATER else 30.0

        # Clamp to Device Limits
        if actuator_target is not None:
            min_temp = state.attributes.get("min_temp")
            max_temp = state.attributes.get("max_temp")
            if min_temp is not None:
                actuator_target = max(actuator_target, float(min_temp))
            if max_temp is not None:
                actuator_target = min(actuator_target, float(max_temp))

        # 3. Build Service Data
        if features & ClimateEntityFeature.TARGET_TEMPERATURE and actuator_target is not None:
            service_data[ATTR_TEMPERATURE] = actuator_target
        elif features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE:
            if actuator_low is not None and actuator_high is not None:
                service_data[ATTR_TARGET_TEMP_LOW] = actuator_low
                service_data[ATTR_TARGET_TEMP_HIGH] = actuator_high
            elif actuator_target is not None:
                # Fabricate range based on type
                if self.type == ActuatorType.HEATER:
                    service_data[ATTR_TARGET_TEMP_LOW] = actuator_target
                    service_data[ATTR_TARGET_TEMP_HIGH] = actuator_target + 5.0
                else:
                    service_data[ATTR_TARGET_TEMP_HIGH] = actuator_target
                    service_data[ATTR_TARGET_TEMP_LOW] = actuator_target - 5.0

        # 4. Event Flood Prevention: Check if update is actually needed
        needs_temp_update = False
        for attr, val in [
            (ATTR_TEMPERATURE, ATTR_TEMPERATURE),
            (ATTR_TARGET_TEMP_LOW, ATTR_TARGET_TEMP_LOW),
            (ATTR_TARGET_TEMP_HIGH, ATTR_TARGET_TEMP_HIGH),
        ]:
            if attr in service_data:
                current_val = state.attributes.get(val)
                _LOGGER.debug(
                    "Actuator %s check %s: current=%s target=%s",
                    self.entity_id,
                    attr,
                    current_val,
                    service_data[attr],
                )
                if current_val is None or abs(float(current_val) - float(service_data[attr])) > 0.1:
                    needs_temp_update = True
                else:
                    del service_data[attr]

        if needs_temp_update:
            if target_mode and not force_off:
                service_data["hvac_mode"] = target_mode
            await self.hass.services.async_call("climate", "set_temperature", service_data, blocking=True)

        # 5. Mode Enforcement
        if force_off:
            if state.state != HVACMode.OFF:
                await self.hass.services.async_call(
                    "climate", "set_hvac_mode", {ATTR_ENTITY_ID: self.entity_id, "hvac_mode": HVACMode.OFF}
                )
        elif target_mode and state.state != target_mode:
            await self.hass.services.async_call(
                "climate", "set_hvac_mode", {ATTR_ENTITY_ID: self.entity_id, "hvac_mode": target_mode}, blocking=True
            )


class ThermostatSync:
    """Helper to sync target temperature to physical dials."""

    def __init__(self, hass: HomeAssistant, entity_id: str) -> None:
        """Initialize."""
        self.hass = hass
        self.entity_id = entity_id

    async def async_sync(
        self,
        target_temp: float | None,
        target_low: float | None,
        target_high: float | None,
        zone_hvac_mode: HVACMode,
    ) -> None:
        """Sync state to device."""
        state = self.hass.states.get(self.entity_id)
        if not state:
            return

        features = state.attributes.get("supported_features", 0)
        valid_modes = state.attributes.get("hvac_modes", [])
        service_data: dict[str, Any] = {ATTR_ENTITY_ID: self.entity_id}

        # 1. Temperature Sync
        if features & ClimateEntityFeature.TARGET_TEMPERATURE:
            if target_temp is not None:
                service_data[ATTR_TEMPERATURE] = target_temp
            elif target_low is not None:
                service_data[ATTR_TEMPERATURE] = target_low
        elif features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE:
            if target_low is not None and target_high is not None:
                service_data[ATTR_TARGET_TEMP_LOW] = target_low
                service_data[ATTR_TARGET_TEMP_HIGH] = target_high
            elif target_temp is not None:
                service_data[ATTR_TARGET_TEMP_LOW] = target_temp
                service_data[ATTR_TARGET_TEMP_HIGH] = target_temp + 5.0

        if ATTR_TEMPERATURE in service_data or ATTR_TARGET_TEMP_LOW in service_data:
            # Check if sync is needed
            needs_sync = False
            if ATTR_TEMPERATURE in service_data:
                curr = state.attributes.get(ATTR_TEMPERATURE)
                if curr is None or abs(float(curr) - float(service_data[ATTR_TEMPERATURE])) > 0.1:
                    needs_sync = True
            elif ATTR_TARGET_TEMP_LOW in service_data:
                curr_low = state.attributes.get(ATTR_TARGET_TEMP_LOW)
                if curr_low is None or abs(float(curr_low) - float(service_data[ATTR_TARGET_TEMP_LOW])) > 0.1:
                    needs_sync = True

            if needs_sync:
                await self.hass.services.async_call("climate", "set_temperature", service_data, blocking=False)

        # 2. Mode Sync
        target_mode = None
        if zone_hvac_mode == HVACMode.OFF:
            target_mode = HVACMode.OFF
        elif zone_hvac_mode == HVACMode.HEAT:
            target_mode = HVACMode.HEAT if HVACMode.HEAT in valid_modes else HVACMode.AUTO
        elif zone_hvac_mode == HVACMode.COOL:
            target_mode = HVACMode.COOL if HVACMode.COOL in valid_modes else HVACMode.AUTO
        elif zone_hvac_mode == HVACMode.AUTO:
            target_mode = HVACMode.AUTO if HVACMode.AUTO in valid_modes else HVACMode.HEAT_COOL

        if target_mode and state.state != target_mode and target_mode in valid_modes:
            await self.hass.services.async_call(
                "climate", "set_hvac_mode", {ATTR_ENTITY_ID: self.entity_id, "hvac_mode": target_mode}, blocking=False
            )
