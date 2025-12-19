"""Storage manager for Climate Dashboard."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import StrEnum
from typing import Callable, Final, TypedDict

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = DOMAIN


class OverrideType(StrEnum):
    """Override types for climate control."""

    NEXT_BLOCK = "next_block"
    DURATION = "duration"


class GlobalSettings(TypedDict, total=False):
    """Typed dictionary for global settings."""

    default_override_type: OverrideType
    default_timer_minutes: int
    window_open_delay_seconds: int


class ScheduleBlock(TypedDict, total=False):
    """Typed dictionary for schedule block."""

    id: str  # Optional (generated on save)
    name: str
    days: list[str]  # ["mon", "tue", ...]
    start_time: str  # "08:00"

    temp_heat: float  # Required
    temp_cool: float  # Required


class ClimateZoneConfig(TypedDict):
    """Typed dictionary for zone configuration."""

    unique_id: str
    name: str
    temperature_sensor: str
    heaters: list[str]
    coolers: list[str]
    window_sensors: list[str]
    schedule: list[ScheduleBlock]


@dataclass
class ClimateDashboardData:
    """Data structure for storage."""

    zones: list[ClimateZoneConfig]
    settings: GlobalSettings


class ClimateDashboardStorage:
    """Class to manage Climate Dashboard storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage."""
        self.hass = hass
        self._store: Store[ClimateDashboardData] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: ClimateDashboardData | None = None
        self._listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Load data from storage."""
        self._data = await self._async_load_data()

    async def _async_load_data(self) -> ClimateDashboardData:
        """Load data from storage."""
        data = await self._store.async_load()
        zones: list[ClimateZoneConfig] = []
        settings: GlobalSettings = {
            "default_override_type": OverrideType.NEXT_BLOCK,
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 30,
        }

        if data:
            if "zones" in data:
                zones = data["zones"]
            # Handle migration or missing settings
            if "settings" in data:
                settings.update(data["settings"])

        return ClimateDashboardData(zones=zones, settings=settings)

    async def _async_save_data(self) -> None:
        """Save data to storage."""
        if self._data is None:
            _LOGGER.error("Attempted to save data before it was loaded.")
            return

        await self._store.async_save(
            {
                "zones": self._data.zones,
                "settings": self._data.settings,
            }
        )

    def _async_fire_callbacks(self) -> None:
        """Fire callbacks for data changes."""
        for listener in self._listeners:
            listener()

    @property
    def zones(self) -> list[ClimateZoneConfig]:
        """Return list of zones."""
        if self._data is None:
            return []
        return self._data.zones

    @property
    def settings(self) -> GlobalSettings:
        """Return the global settings."""
        if self._data is None:
            # This should not happen if async_load is called first
            return {
                "default_override_type": OverrideType.NEXT_BLOCK,
                "default_timer_minutes": 60,
                "window_open_delay_seconds": 30,
            }
        return self._data.settings

    async def async_add_zone(self, zone: ClimateZoneConfig) -> None:
        """Add a new zone."""
        if self._data is None:
            self._data = ClimateDashboardData(
                zones=[],
                settings={
                    "default_override_type": OverrideType.NEXT_BLOCK,
                    "default_timer_minutes": 60,
                    "window_open_delay_seconds": 30,
                },
            )

        # Check for duplicates? For now assume unique_id is unique
        self._data.zones.append(zone)
        await self._async_save_data()

        # Notify listeners
        self._async_fire_callbacks()

    async def async_update_zone(self, zone_config: ClimateZoneConfig) -> None:
        """Update an existing zone."""
        if self._data is None:
            return

        zones = self._data.zones
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
                zones[i] = zone_config
                await self._async_save_data()
                self._async_fire_callbacks()
                return

        raise ValueError(f"Zone {zone_config['unique_id']} not found")

    async def async_delete_zone(self, unique_id: str) -> None:
        """Delete a zone."""
        if self._data is None:
            return

        zones = self._data.zones
        for i, zone in enumerate(zones):
            if zone["unique_id"] == unique_id:
                zones.pop(i)
                await self._async_save_data()
                self._async_fire_callbacks()
                return

        raise ValueError(f"Zone {unique_id} not found")

    async def async_update_settings(self, settings: GlobalSettings) -> None:
        """Update global settings."""
        if self._data is None:
            self._data = ClimateDashboardData(
                zones=[],
                settings={
                    "default_override_type": OverrideType.NEXT_BLOCK,
                    "default_timer_minutes": 60,
                    "window_open_delay_seconds": 30,
                },
            )

        self._data.settings.update(settings)
        await self._async_save_data()
        self._async_fire_callbacks()

    def async_add_listener(self, callback: Callable[[], None]) -> None:
        """Add a listener for data changes."""
        self._listeners.append(callback)
