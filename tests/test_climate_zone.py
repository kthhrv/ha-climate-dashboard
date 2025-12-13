"""Test the ClimateZone entity."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import HVACMode
from homeassistant.const import (
    ATTR_ENTITY_ID,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
)
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone

# Constants
SWITCH_ID = "switch.heater"
SENSOR_ID = "sensor.temp"
ZONE_ID = "zone_test"
ZONE_NAME = "Test Zone"


@pytest.fixture
def mock_climate_zone(hass: HomeAssistant) -> ClimateZone:
    """Create a mock ClimateZone."""
    return ClimateZone(
        hass,
        unique_id=ZONE_ID,
        name=ZONE_NAME,
        temperature_sensor=SENSOR_ID,
        heaters=[SWITCH_ID],
        coolers=[],
        window_sensors=[],
    )


async def test_initial_state(mock_climate_zone: ClimateZone, hass: HomeAssistant) -> None:
    """Test initial state."""
    # Add to hass to trigger async_added_to_hass (if we were doing full entity setup)
    # For unit test of the class logic, we can just check attributes
    assert mock_climate_zone.name == ZONE_NAME
    assert mock_climate_zone.hvac_mode == HVACMode.OFF
    assert mock_climate_zone.target_temperature == 20.0  # Default


async def test_heating_logic_switch_turn_on(mock_climate_zone: ClimateZone, hass: HomeAssistant) -> None:
    """Test that heater turns ON when cold."""
    # Setup state
    mock_climate_zone._attr_hvac_mode = HVACMode.HEAT
    mock_climate_zone._attr_target_temperature = 21.0
    mock_climate_zone._attr_current_temperature = 19.0  # Cold

    # Mock services
    mock_services = MagicMock()
    mock_climate_zone.hass.services = mock_services
    mock_services.async_call = AsyncMock()

    await mock_climate_zone._async_control_actuator()

    mock_services.async_call.assert_called_once_with(
        "switch",
        SERVICE_TURN_ON,
        {ATTR_ENTITY_ID: SWITCH_ID},
    )


async def test_heating_logic_switch_turn_off(mock_climate_zone: ClimateZone, hass: HomeAssistant) -> None:
    """Test that heater turns OFF when hot."""
    # Setup state
    mock_climate_zone._attr_hvac_mode = HVACMode.HEAT
    mock_climate_zone._attr_target_temperature = 21.0
    mock_climate_zone._attr_current_temperature = 22.0  # Hot

    # Mock services
    mock_services = MagicMock()
    mock_climate_zone.hass.services = mock_services
    mock_services.async_call = AsyncMock()

    await mock_climate_zone._async_control_actuator()

    mock_services.async_call.assert_called_once_with(
        "switch",
        SERVICE_TURN_OFF,
        {ATTR_ENTITY_ID: SWITCH_ID},
    )


async def test_off_mode_ensures_actuator_off(mock_climate_zone: ClimateZone, hass: HomeAssistant) -> None:
    """Test that OFF mode turns actuator OFF."""
    mock_climate_zone._attr_hvac_mode = HVACMode.OFF
    # Even if temp is freezing
    mock_climate_zone._attr_target_temperature = 21.0
    mock_climate_zone._attr_current_temperature = 10.0

    # Mock services
    mock_services = MagicMock()
    mock_climate_zone.hass.services = mock_services
    mock_services.async_call = AsyncMock()

    await mock_climate_zone._async_control_actuator()

    mock_services.async_call.assert_called_once_with(
        "switch",
        SERVICE_TURN_OFF,
        {ATTR_ENTITY_ID: SWITCH_ID},
    )
