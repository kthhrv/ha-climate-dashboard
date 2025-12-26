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
    HVACAction,
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
        state = self.hass.states.get(self.entity_id)
        if not state or state.state in ("unavailable", "unknown"):
            _LOGGER.debug("Entity %s is unavailable, skipping control.", self.entity_id)
            return

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
        if not state or state.state in ("unavailable", "unknown"):
            _LOGGER.debug("Entity %s is unavailable, skipping control.", self.entity_id)
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
        self._last_sent_target: float | None = None
        self._last_sent_mode: str | None = None

    def check_is_external_change(self, new_state: Any) -> bool:
        """Check if the state change is external (user) or our own echo."""
        is_echo = False

        # 1. Mode Check
        if self._last_sent_mode is not None:
            if new_state.state == self._last_sent_mode:
                _LOGGER.debug("ThermostatSync %s: Ignoring Mode Echo (%s)", self.entity_id, self._last_sent_mode)
                self._last_sent_mode = None
                is_echo = True
            else:
                # Mismatch implies external change or failed sync
                pass

        # 2. Temp Check
        if self._last_sent_target is not None:
            new_temp = new_state.attributes.get(ATTR_TEMPERATURE)
            if new_temp is not None:
                try:
                    diff = abs(float(new_temp) - self._last_sent_target)
                    if diff < 0.1:
                        _LOGGER.debug(
                            "ThermostatSync %s: Ignoring Temp Echo (%.1f)", self.entity_id, self._last_sent_target
                        )
                        self._last_sent_target = None  # Consume latch
                        is_echo = True
                except (ValueError, TypeError):
                    pass

        # If any latch matched, we consider this an echo event and ignore it entirely
        # (Assuming mode+temp changes come in one state update event often)
        return not is_echo

    async def async_sync(
        self,
        target_temp: float | None,
        target_low: float | None,
        target_high: float | None,
        zone_hvac_mode: HVACMode,
        zone_hvac_action: HVACAction,
    ) -> None:
        """Sync state to device."""
        _LOGGER.debug("ThermostatSync %s: Checking sync...", self.entity_id)
        state = self.hass.states.get(self.entity_id)
        if not state or state.state in ("unavailable", "unknown"):
            _LOGGER.debug("Entity %s is unavailable, skipping sync.", self.entity_id)
            return

        features = state.attributes.get("supported_features", 0)
        valid_modes = state.attributes.get("hvac_modes", [])
        service_data: dict[str, Any] = {ATTR_ENTITY_ID: self.entity_id}

        _LOGGER.debug(
            "ThermostatSync %s: State=%s, Modes=%s, Action=%s",
            self.entity_id,
            state.state,
            valid_modes,
            zone_hvac_action,
        )

        # 1. Temperature Sync
        if features & ClimateEntityFeature.TARGET_TEMPERATURE:
            if target_temp is not None:
                service_data[ATTR_TEMPERATURE] = target_temp
            elif target_low is not None:
                # For single-point dials in dual zones, determine which setpoint to sync
                use_high = False

                # 1. Prefer Zone Action (if active)
                if zone_hvac_action == HVACAction.COOLING:
                    use_high = True
                # 2. If Idle, look at Dial's current state to match context
                elif state.state == HVACMode.COOL:
                    use_high = True

                if use_high and target_high is not None:
                    service_data[ATTR_TEMPERATURE] = target_high
                else:
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
                target = service_data[ATTR_TEMPERATURE]
                if curr is None or abs(float(curr) - float(target)) > 0.1:
                    needs_sync = True
                    self._last_sent_target = float(target)  # Set Latch
            elif ATTR_TARGET_TEMP_LOW in service_data:
                curr_low = state.attributes.get(ATTR_TARGET_TEMP_LOW)
                if curr_low is None or abs(float(curr_low) - float(service_data[ATTR_TARGET_TEMP_LOW])) > 0.1:
                    needs_sync = True
                    # Range latching not fully implemented yet for dual-point dials,
                    # but simple dials use ATTR_TEMPERATURE path.

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
            # If Zone is AUTO, we can reflect the active action on the Dial
            if zone_hvac_action == HVACAction.HEATING and HVACMode.HEAT in valid_modes:
                target_mode = HVACMode.HEAT
            elif zone_hvac_action == HVACAction.COOLING and HVACMode.COOL in valid_modes:
                target_mode = HVACMode.COOL
            elif HVACMode.AUTO in valid_modes:
                target_mode = HVACMode.AUTO
            elif HVACMode.HEAT_COOL in valid_modes:
                target_mode = HVACMode.HEAT_COOL
            # Fallback if device doesn't support AUTO/HEAT_COOL (e.g. dumb dial)
            # Default to HEAT (Winter) or COOL (Summer) based on available modes
            # STICKY LOGIC: If IDLE, prefer keeping current mode if it is HEAT or COOL
            elif state.state in (HVACMode.HEAT, HVACMode.COOL) and state.state in valid_modes:
                target_mode = HVACMode(state.state)
            # If current is OFF or something else, default to HEAT then COOL
            elif HVACMode.HEAT in valid_modes:
                target_mode = HVACMode.HEAT
            elif HVACMode.COOL in valid_modes:
                target_mode = HVACMode.COOL
            else:
                # Last resort, if device supports nothing else
                target_mode = HVACMode.OFF

        if target_mode:
            _LOGGER.debug(
                "Syncing %s: ZoneMode=%s Action=%s -> TargetMode=%s (Current=%s)",
                self.entity_id,
                zone_hvac_mode,
                zone_hvac_action,
                target_mode,
                state.state,
            )

        if target_mode and state.state != target_mode and target_mode in valid_modes:
            self._last_sent_mode = target_mode  # Set Latch
            await self.hass.services.async_call(
                "climate", "set_hvac_mode", {ATTR_ENTITY_ID: self.entity_id, "hvac_mode": target_mode}, blocking=False
            )
