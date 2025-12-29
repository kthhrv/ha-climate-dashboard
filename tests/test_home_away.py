"""Test Home/Away Logic."""

from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import ClimateEntityFeature, HVACMode
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import ClimateDashboardStorage

SENSOR_ID = "sensor.temp"
SWITCH_ID = "switch.heater"
COOLER_ID = "climate.ac"


@pytest.mark.asyncio
async def test_home_away_manual_toggle(hass: HomeAssistant) -> None:
    """Test manual toggling of Home/Away mode affects zones."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    # Initialize Settings
    await storage.async_update_settings({"away_temperature": 15.0, "is_away_mode_on": False})

    zone = ClimateZone(
        hass,
        storage,
        "zone_away",
        "Away Zone",
        SENSOR_ID,
        heaters=[SWITCH_ID],
        thermostats=[],
        coolers=[],
        window_sensors=[],
        presence_sensors=[],
        occupancy_timeout_minutes=30,
        occupancy_setback_temp=18.0,
    )

    # Mock services correctly
    # We patch the hass attached to the zone
    zone.hass.services = MagicMock()
    zone.hass.services.async_call = AsyncMock()

    # Setup Sensor to avoid startup delay
    hass.states.async_set(SENSOR_ID, "20.0")

    # Setup Zone
    zone._attr_hvac_mode = HVACMode.HEAT
    # We don't set _attr_target_temperature manually as it bypasses the engine.
    # Instead we assume Schedule is empty -> OFF.
    # Or we set a manual intent if we wanted to test priority.
    # But here we just want to see Away Mode take effect.

    # Init
    await zone.async_added_to_hass()

    # 1. Enable Away Mode via Storage
    await storage.async_update_settings({"is_away_mode_on": True})

    # Verify Zone picked it up
    await hass.async_block_till_done()

    # Should be 15.0
    assert zone.target_temperature == 15.0

    # 2. Disable Away Mode
    await storage.async_update_settings({"is_away_mode_on": False})
    await hass.async_block_till_done()

    # Should revert to Schedule (None/Off since no schedule)
    # Or if HEAT mode and no target -> None?
    assert zone.target_temperature is None


@pytest.mark.asyncio
async def test_home_away_dual_mode(hass: Any) -> None:
    """Test automatic handling of Away Cool in Dual Mode."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    # Initialize Settings
    await storage.async_update_settings(
        {"away_temperature": 16.0, "away_temperature_cool": 30.0, "is_away_mode_on": False}
    )

    zone = ClimateZone(
        hass,
        storage,
        "zone_dual",
        "Dual Zone",
        SENSOR_ID,
        heaters=[SWITCH_ID],
        thermostats=[],
        coolers=[COOLER_ID],  # Has coolers -> Dual Mode
        window_sensors=[],
        presence_sensors=[],
        occupancy_timeout_minutes=30,
        occupancy_setback_temp=18.0,
    )

    # Mock Sensor State
    hass.states.async_set(SENSOR_ID, "22.0")
    hass.states.async_set(SWITCH_ID, "off")
    hass.states.async_set(COOLER_ID, "off", {"supported_features": 1, "hvac_modes": ["cool", "off"]})

    # Setup Zone
    zone._attr_hvac_mode = HVACMode.AUTO

    # Mock Services
    zone.hass.services = MagicMock()
    zone.hass.services.async_call = AsyncMock()

    await zone.async_added_to_hass()

    # 1. Enable Away Mode
    await storage.async_update_settings({"is_away_mode_on": True})
    await hass.async_block_till_done()

    # Verify Zone Attributes
    assert zone.target_temperature is None
    assert zone.target_temperature_low == 16.0
    assert zone.target_temperature_high == 30.0

    # Verify Supported Features
    assert zone.supported_features & ClimateEntityFeature.TARGET_TEMPERATURE_RANGE
