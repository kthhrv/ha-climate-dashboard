"""Storage manager for Climate Dashboard."""

from __future__ import annotations

import logging
from typing import Any, Final, TypedDict, cast

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = DOMAIN


class ScheduleBlock(TypedDict):
    """Typed dictionary for schedule block."""

    id: str
    name: str
    days: list[str]  # ["mon", "tue", ...]
    start_time: str  # "08:00"
    target_temp: float
    hvac_mode: str  # "heat", "off"


class ClimateZoneConfig(TypedDict):
    """Typed dictionary for zone configuration."""

    unique_id: str
    name: str
    temperature_sensor: str
    heaters: list[str]
    coolers: list[str]
    window_sensors: list[str]
    schedule: list[ScheduleBlock]


class ClimateDashboardStorage:
    """Class to manage Climate Dashboard storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage."""
        self.hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] | None = None
        self._listeners: list[Any] = []

    async def async_load(self) -> None:
        """Load data from storage."""
        data = await self._store.async_load()
        if data is None:
            data = {"zones": []}
        self._data = data

    @property
    def zones(self) -> list[ClimateZoneConfig]:
        """Return list of zones."""
        if self._data is None:
            return []
        return cast(list[ClimateZoneConfig], self._data.get("zones", []))

    async def async_add_zone(self, zone: ClimateZoneConfig) -> None:
        """Add a new zone."""
        if self._data is None:
            self._data = {"zones": []}

        # Check for duplicates? For now assume unique_id is unique
        self._data["zones"].append(zone)
        await self._store.async_save(self._data)

        # Notify listeners
        for listener in self._listeners:
            listener()

    async def async_update_zone(self, zone_config: ClimateZoneConfig) -> None:
        """Update an existing zone."""
        if self._data is None:
            return

        zones = self._data["zones"]
        for i, zone in enumerate(zones):
            if zone["unique_id"] == zone_config["unique_id"]:
                # Preserve schedule if not provided in update (though TypedDict suggests it might be)
                # For this MVP update, we might be overwriting everything including schedule if passed.
                # Let's assume the API passes the full config back, or we merge?
                # The Plan says "update fields". Let's replace the whole config for simplicity of the API
                # but ensure we don't lose the schedule if the frontend didn't send it.
                # However, the typed dict requires schedule.
                # Let's assume the caller provides the full object or we merge.
                # For safety, let's update the existing object with new values.
                zones[i].update(zone_config)
                await self._store.async_save(self._data)

                # Notify listeners
                for listener in self._listeners:
                    listener()
                return

        raise ValueError(f"Zone {zone_config['unique_id']} not found")

    async def async_delete_zone(self, unique_id: str) -> None:
        """Delete a zone."""
        if self._data is None:
            return

        zones = self._data["zones"]
        for i, zone in enumerate(zones):
            if zone["unique_id"] == unique_id:
                zones.pop(i)
                await self._store.async_save(self._data)

                # Notify listeners
                for listener in self._listeners:
                    listener()
                return

        raise ValueError(f"Zone {unique_id} not found")

    def async_add_listener(self, callback: Any) -> None:
        """Add a listener for data changes."""
        self._listeners.append(callback)
