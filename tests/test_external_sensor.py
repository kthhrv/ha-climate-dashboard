"""Test External Sensor Logic for Actuators."""

from typing import Any
from unittest.mock import MagicMock

import pytest
from homeassistant.components.climate import (
    SERVICE_SET_HVAC_MODE,
    SERVICE_SET_TEMPERATURE,
    HVACMode,
)
from homeassistant.components.climate.const import ClimateEntityFeature
from homeassistant.const import SERVICE_TURN_OFF, SERVICE_TURN_ON
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import OverrideType

# Constants

mock_service_calls = []


async def async_mock_service(call: Any) -> None:
    mock_service_calls.append(call)


@pytest.fixture(autouse=True)
async def setup_integration(hass: HomeAssistant) -> None:
    """Mock necessary services."""
    mock_service_calls.clear()
    hass.services.async_register("climate", SERVICE_SET_TEMPERATURE, async_mock_service)
    hass.services.async_register("climate", SERVICE_SET_HVAC_MODE, async_mock_service)
    hass.services.async_register("switch", SERVICE_TURN_ON, async_mock_service)
    hass.services.async_register("switch", SERVICE_TURN_OFF, async_mock_service)


async def test_external_sensor_forces_max_min_heat(hass: HomeAssistant) -> None:
    """Test that heating actuator gets Max/Min temp when using external sensor."""
    # 1. Setup Mock TRV
    hass.states.async_set(
        "climate.trv",
        HVACMode.HEAT,
        {
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "hvac_modes": [HVACMode.HEAT, HVACMode.OFF],
            "current_temperature": 22,  # TRV thinks it's warm
            "min_temp": 7,
            "max_temp": 30,
        },
    )

    # 2. Setup External Sensor
    hass.states.async_set("sensor.wall", "15", {"unit_of_measurement": "°C"})  # Cold

    # Mock storage
    mock_storage = MagicMock()
    mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}

    # 3. Create Zone
    zone = ClimateZone(
        hass,
        mock_storage,
        unique_id="test_zone",
        name="Test Zone",
        temperature_sensor="sensor.wall",
        heaters=["climate.trv"],
        thermostats=[],
        coolers=[],
        window_sensors=[],
    )

    # Initialize
    zone.hass = hass
    await zone.async_added_to_hass()

    # Set Target to 20 (Heat Mode)
    # Zone Temp (15) < Target (20) => Demand = True.
    # We expect FORCE MAX (30).

    mock_service_calls.clear()
    await zone.async_set_hvac_mode(HVACMode.HEAT)
    await zone.async_set_temperature(temperature=20)
    await hass.async_block_till_done()

    # Check calls in mock_service_calls
    found = False
    for call in mock_service_calls:
        if call.domain == "climate" and call.service == SERVICE_SET_TEMPERATURE:
            data = call.data
            if data.get("entity_id") == "climate.trv" and data.get("temperature") == 30:
                found = True
                break
    assert found, "Did not find call to set TRV to Max Temp (30)"

    # Now make specific demand check (IDLE)
    # Set Wall Temp to 25 (Hot)
    hass.states.async_set("sensor.wall", "25")

    mock_service_calls.clear()
    # Trigger update of temp
    zone._async_update_temp()
    # Trigger control loop
    await zone._async_control_actuator()
    await hass.async_block_till_done()

    # Demand = False (25 > 20).
    # We expect FORCE MIN (7).
    found = False
    for call in mock_service_calls:
        if call.domain == "climate" and call.service == SERVICE_SET_TEMPERATURE:
            data = call.data
            if data.get("entity_id") == "climate.trv" and data.get("temperature") == 7:
                found = True
                break
    assert found, "Did not find call to set TRV to Min Temp (7)"


async def test_internal_sensor_behaves_normally(hass: HomeAssistant) -> None:
    """Test that using internal sensor sends actual target."""
    hass.states.async_set(
        "climate.trv_smart",
        HVACMode.HEAT,
        {
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "hvac_modes": [HVACMode.HEAT, HVACMode.OFF],
            "current_temperature": 19,
        },
    )

    # Zone uses the TRV as sensor
    mock_storage = MagicMock()
    mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}

    zone = ClimateZone(
        hass,
        mock_storage,
        unique_id="test_smart_zone",
        name="Smart Zone",
        temperature_sensor="climate.trv_smart",
        heaters=["climate.trv_smart"],
        thermostats=[],
        coolers=[],
        window_sensors=[],
    )
    zone.hass = hass
    await zone.async_added_to_hass()

    mock_service_calls.clear()
    await zone.async_set_hvac_mode(HVACMode.HEAT)
    await zone.async_set_temperature(temperature=21)
    await hass.async_block_till_done()

    # We expect set_temperature(21) - exact target
    found = False
    for call in mock_service_calls:
        if call.domain == "climate" and call.service == SERVICE_SET_TEMPERATURE:
            data = call.data
            if data.get("entity_id") == "climate.trv_smart" and data.get("temperature") == 21:
                found = True
                break
    assert found, "Should send exact target (21) when using internal sensor"
