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


class ZoneConfig(TypedDict):
    """Typed dictionary for zone configuration."""

    unique_id: str
    name: str
    actuator: str
    sensor: str


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
    def zones(self) -> list[ZoneConfig]:
        """Return list of zones."""
        if self._data is None:
            return []
        return cast(list[ZoneConfig], self._data.get("zones", []))

    async def async_add_zone(self, zone: ZoneConfig) -> None:
        """Add a new zone."""
        if self._data is None:
            self._data = {"zones": []}

        # Check for duplicates? For now assume unique_id is unique
        self._data["zones"].append(zone)
        await self._store.async_save(self._data)

        # Notify listeners
        for listener in self._listeners:
            listener()

    def async_add_listener(self, callback: Any) -> None:
        """Add a listener for data changes."""
        self._listeners.append(callback)
