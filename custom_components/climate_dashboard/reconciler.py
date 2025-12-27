"""Hardware reconciliation logic for Climate Dashboard."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components.climate import (
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import ATTR_ENTITY_ID, ATTR_TEMPERATURE
from homeassistant.core import HomeAssistant

from .engine import DesiredState

_LOGGER = logging.getLogger(__name__)


@dataclass
class HardwareLatch:
    """Remembers the last command sent to a device to filter echoes."""

    mode: HVACMode | None = None
    target: float | None = None
    low: float | None = None
    high: float | None = None
    timestamp: datetime | None = None


class Reconciler:
    """Manages the synchronization between DesiredState and HA Entities."""

    def __init__(self, hass: HomeAssistant):
        self.hass = hass
        self._latches: dict[str, HardwareLatch] = {}
        self._retry_count: dict[str, int] = {}
        self._last_command_time: dict[str, datetime] = {}

    def get_latch(self, entity_id: str) -> HardwareLatch:
        """Get or create a latch for an entity."""
        if entity_id not in self._latches:
            self._latches[entity_id] = HardwareLatch()
        return self._latches[entity_id]

    async def reconcile_hmi(self, entity_id: str, desired: DesiredState) -> bool:
        """
        Sync state to a Human Interface (Dial/Display).
        Implements the 'Windowing' logic for AUTO mode.
        """
        state = self.hass.states.get(entity_id)
        if not state:
            return False

        valid_modes = state.attributes.get("hvac_modes", [])
        features = state.attributes.get("supported_features", 0)

        # 1. Determine Target Mode for the HMI
        # A Dial might not support AUTO, so we map AUTO to the active boundary.
        target_mode = desired.mode
        target_temp = desired.setpoints.target

        if desired.mode == HVACMode.AUTO and HVACMode.AUTO not in valid_modes:
            # WINDOWING LOGIC:
            # If the zone is AUTO but dial is single-mode, show the relevant side.
            use_cool = False

            if desired.action == HVACAction.COOLING:
                use_cool = True
            elif desired.action == HVACAction.HEATING:
                use_cool = False
            else:
                # IDLE: Stick to current state if possible
                if state.state == HVACMode.COOL:
                    use_cool = True
                else:
                    use_cool = False

            if use_cool:
                target_mode = HVACMode.COOL
                target_temp = desired.setpoints.high
            else:
                target_mode = HVACMode.HEAT
                target_temp = desired.setpoints.low

        # 2. Build Commands
        commands = []

        # Check Mode
        if state.state != target_mode and target_mode in valid_modes:
            commands.append(("set_hvac_mode", {"hvac_mode": target_mode}))
            self.get_latch(entity_id).mode = target_mode

        # Check Temperature
        if features & ClimateEntityFeature.TARGET_TEMPERATURE and target_temp is not None:
            current_temp = state.attributes.get(ATTR_TEMPERATURE)
            if current_temp is None or abs(float(current_temp) - target_temp) > 0.1:
                commands.append(("set_temperature", {ATTR_TEMPERATURE: target_temp}))
                self.get_latch(entity_id).target = target_temp

        # 3. Execute
        for service, data in commands:
            data[ATTR_ENTITY_ID] = entity_id
            _LOGGER.debug("Reconciler: Syncing HMI %s to %s -> %s", entity_id, service, data)
            self.get_latch(entity_id).timestamp = datetime.now()
            await self.hass.services.async_call("climate", service, data)

        return len(commands) > 0

    async def reconcile_switch(self, entity_id: str, should_be_on: bool) -> None:
        """Control a simple switch actuator."""
        state = self.hass.states.get(entity_id)
        if not state or state.state in ("unavailable", "unknown"):
            return

        is_on = state.state == "on"
        if is_on != should_be_on:
            service = "turn_on" if should_be_on else "turn_off"
            _LOGGER.debug("Reconciler: Switch %s -> %s", entity_id, service)
            await self.hass.services.async_call("switch", service, {ATTR_ENTITY_ID: entity_id})

    async def reconcile_climate_actuator(
        self, entity_id: str, should_heat: bool = False, should_cool: bool = False
    ) -> None:
        """
        Control a climate device acting as a dumb actuator.
        Uses Bang-Bang logic via setpoint manipulation (Max/Min).
        """
        state = self.hass.states.get(entity_id)
        if not state or state.state in ("unavailable", "unknown"):
            return

        # Determine capabilities
        valid_modes = state.attributes.get("hvac_modes", [])

        target_mode = HVACMode.OFF
        target_temp = None

        if should_heat:
            if HVACMode.AUTO in valid_modes:
                target_mode = HVACMode.AUTO
            elif HVACMode.HEAT in valid_modes:
                target_mode = HVACMode.HEAT
            target_temp = 30.0  # Force Open

        elif should_cool:
            if HVACMode.AUTO in valid_modes:
                target_mode = HVACMode.AUTO
            elif HVACMode.COOL in valid_modes:
                target_mode = HVACMode.COOL
            target_temp = 16.0  # Force Open (Cool)

        else:
            # OFF state
            # Preference: Turn OFF if supported.
            if HVACMode.OFF in valid_modes:
                target_mode = HVACMode.OFF
            else:
                # Fallback: Set to "safe" temp to close valve
                # If it was heating, set to min (7C). If cooling, set to max (30C).
                # We assume heating default.
                target_mode = state.state  # Keep current mode?
                target_temp = 7.0

        # Execute
        commands = []
        if state.state != target_mode:
            commands.append(("set_hvac_mode", {"hvac_mode": target_mode}))

        if target_temp is not None:
            # Check bounds
            min_temp = state.attributes.get("min_temp")
            max_temp = state.attributes.get("max_temp")
            if min_temp:
                target_temp = max(target_temp, float(min_temp))
            if max_temp:
                target_temp = min(target_temp, float(max_temp))

            current_temp_setting = state.attributes.get(ATTR_TEMPERATURE)
            if current_temp_setting is None or abs(float(current_temp_setting) - target_temp) > 0.1:
                commands.append(("set_temperature", {ATTR_TEMPERATURE: target_temp}))

        for service, data in commands:
            data[ATTR_ENTITY_ID] = entity_id
            _LOGGER.debug("Reconciler: Actuator %s -> %s %s", entity_id, service, data)
            # We don't latch actuators because we own them exclusively?
            # Actually, we should probably latch if we want to avoid fighting manual overrides?
            # But the premise is we own them.
            await self.hass.services.async_call("climate", service, data)

    def is_echo(self, entity_id: str, new_state: Any) -> bool:
        """
        Detect if an incoming state change is an echo of our last command.
        """
        latch = self._latches.get(entity_id)
        if not latch or not latch.timestamp:
            return False

        # Expiry: If the report is very old, it's not an echo of a recent command
        if datetime.now() - latch.timestamp > timedelta(seconds=10):
            return False

        # Hard Ignore Period (e.g. 5 seconds)
        # If we just sent a command, ignore everything for 5s to allow device to settle/transition.
        if datetime.now() - latch.timestamp < timedelta(seconds=5.0):
            _LOGGER.debug("Reconciler: Ignoring input from %s (Settling Period)", entity_id)
            return True

        # Mode Match
        mode_match = latch.mode is None or new_state.state == latch.mode

        # Temp Match
        temp_match = True
        if latch.target is not None:
            new_temp = new_state.attributes.get(ATTR_TEMPERATURE)
            temp_match = new_temp is not None and abs(float(new_temp) - latch.target) < 0.1

        if mode_match and temp_match:
            _LOGGER.debug("Reconciler: Filtered echo from %s", entity_id)
            # Clear latches as they are 'consumed' by the report
            # latch.mode = None
            # latch.target = None
            return True

        return False
