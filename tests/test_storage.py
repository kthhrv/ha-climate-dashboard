"""Test the Climate Dashboard storage."""

from typing import Any, cast
from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.storage import ClimateDashboardStorage, ZoneConfig


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
    data = {"zones": [{"unique_id": "z1", "name": "Zone 1", "actuator": "switch.s1", "sensor": "sensor.s1"}]}
    mock_store.async_load.return_value = data

    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    assert len(storage.zones) == 1
    assert storage.zones[0]["unique_id"] == "z1"


async def test_add_zone(hass: HomeAssistant, mock_store: Any) -> None:
    """Test adding a zone."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    zone = cast(ZoneConfig, {"unique_id": "z2", "name": "Zone 2", "actuator": "climate.c1", "sensor": "climate.c1"})

    await storage.async_add_zone(zone)

    assert len(storage.zones) == 1
    assert storage.zones[0] == zone
    mock_store.async_save.assert_called_once()
