"""Test the Climate Dashboard storage."""

from typing import Any, cast
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.storage import ClimateDashboardStorage, ClimateZoneConfig


@pytest.fixture
def mock_store() -> Any:
    """Mock the storage."""
    with patch("custom_components.climate_dashboard.storage.Store") as mock_store_cls:
        mock_instance = mock_store_cls.return_value
        mock_instance.async_load = AsyncMock(return_value=None)
        mock_instance.async_save = AsyncMock()
        yield mock_instance


async def test_load_empty(hass: HomeAssistant, mock_store: Any) -> None:
    """Test loading when storage is empty."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    assert storage.zones == []


async def test_load_existing(hass: HomeAssistant, mock_store: Any) -> None:
    """Test loading existing data."""
    data = {
        "zones": [
            {
                "unique_id": "z1",
                "name": "Zone 1",
                "temperature_sensor": "sensor.s1",
                "heaters": ["switch.h1"],
                "coolers": [],
                "window_sensors": [],
                "presence_sensors": [],
                "occupancy_timeout_minutes": 30,
                "occupancy_setback_temp": 2.0,
            }
        ]
    }
    mock_store.async_load.return_value = data

    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    assert len(storage.zones) == 1
    assert storage.zones[0]["unique_id"] == "z1"
    assert storage.zones[0]["heaters"] == ["switch.h1"]


async def test_add_zone(hass: HomeAssistant, mock_store: Any) -> None:
    """Test adding a zone."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    zone = cast(
        ClimateZoneConfig,
        {
            "unique_id": "z2",
            "name": "Zone 2",
            "temperature_sensor": "sensor.s2",
            "heaters": ["climate.c1"],
            "coolers": ["climate.c1"],
            "window_sensors": ["binary_sensor.w1"],
            "presence_sensors": ["binary_sensor.p1"],
            "occupancy_timeout_minutes": 15,
            "occupancy_setback_temp": 3.0,
        },
    )

    await storage.async_add_zone(zone)

    assert len(storage.zones) == 1
    assert storage.zones[0] == zone
    mock_store.async_save.assert_called_once()


async def test_delete_zone(hass: HomeAssistant, mock_store: Any) -> None:
    """Test deleting a zone."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    # 1. Add Zone
    zone = cast(ClimateZoneConfig, {"unique_id": "z_del", "name": "To Delete", "schedule": []})
    await storage.async_add_zone(zone)
    assert len(storage.zones) == 1

    # 2. Delete Zone
    await storage.async_delete_zone("z_del")
    assert len(storage.zones) == 0

    # 3. Delete Non-Existent
    with pytest.raises(ValueError):
        await storage.async_delete_zone("non_existent")
