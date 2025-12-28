"""Safety and Failsafe logic for Climate Dashboard."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import TYPE_CHECKING

from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

if TYPE_CHECKING:
    from .storage import ClimateDashboardStorage

_LOGGER = logging.getLogger(__name__)

SAFETY_TARGET_TEMP = 5.0


class SafetyMonitor:
    """Handles window safety and sensor failsafes."""

    def __init__(
        self,
        hass: HomeAssistant,
        storage: ClimateDashboardStorage,
        unique_id: str,
        window_sensors: list[str],
        temperature_sensor: str,
    ) -> None:
        """Initialize."""
        self.hass = hass
        self._storage = storage
        self._unique_id = unique_id
        self._window_sensors = window_sensors
        self._temperature_sensor = temperature_sensor

        self.open_window_sensor: str | None = None
        self.safety_mode: bool = False
        self.using_fallback_sensor: str | None = None
        self.window_open_timestamp: datetime | None = None

    def get_open_window(self) -> str | None:
        """Check if any window is open and return its name."""
        for window in self._window_sensors:
            state = self.hass.states.get(window)
            if state and state.state == "on":
                return state.attributes.get("friendly_name") or window
        return None

    def check_window_timeout(self, now: datetime) -> bool:
        """Check if windows have been open long enough to trigger safety off.

        Returns: True if safety off should be active.
        """
        open_sensor = self.get_open_window()
        self.open_window_sensor = open_sensor

        if not open_sensor:
            self.window_open_timestamp = None
            return False

        if self.window_open_timestamp is None:
            self.window_open_timestamp = now
            _LOGGER.debug("Zone %s: Window open detected. Starting delay.", self._unique_id)

        delay = self._storage.settings.get("window_open_delay_seconds", 30)
        time_open = (now - self.window_open_timestamp).total_seconds()

        if time_open >= delay:
            return True

        return False

    def get_fallback_temperature(self) -> tuple[float, str] | None:
        """Attempt to find a fallback sensor in the same Area."""
        ent_reg = er.async_get(self.hass)

        # Look up entity_id from unique_id to ensure we match the registry
        # regardless of runtime entity_id mismatches.
        entity_id = ent_reg.async_get_entity_id("climate", "climate_dashboard", self._unique_id)

        if not entity_id:
            return None

        my_entry = ent_reg.async_get(entity_id)

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

            uom = state.attributes.get("unit_of_measurement")
            d_class = state.attributes.get("device_class")

            if d_class == "temperature" or uom in (UnitOfTemperature.CELSIUS, UnitOfTemperature.FAHRENHEIT):
                try:
                    val = float(state.state)
                    _LOGGER.info("SafetyMonitor: Falling back to %s (Value: %f)", cand.entity_id, val)
                    return (val, cand.entity_id)
                except ValueError:
                    continue

        return None
