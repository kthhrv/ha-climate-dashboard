"""Test shared actuator logic."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import HVACAction, HVACMode
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import OverrideType

SWITCH_ID = "switch.boiler"
SENSOR_A = "sensor.temp_a"
SENSOR_B = "sensor.temp_b"


@pytest.fixture(autouse=True)
def auto_mock_services(hass: HomeAssistant) -> None:
    """Automatically mock services for all tests."""
    hass.services.async_register("climate", "set_hvac_mode", AsyncMock())
    hass.services.async_register("climate", "set_temperature", AsyncMock())
    hass.services.async_register("switch", "turn_off", AsyncMock())
    hass.services.async_register("switch", "turn_on", AsyncMock())


async def test_shared_actuator_stay_on(hass: HomeAssistant) -> None:
    """Test that actuator stays ON if another zone needs it."""
    # Setup Storage Mock with 2 zones configuration
    mock_storage = MagicMock()
    mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}
    mock_storage.zones = [
        {
            "unique_id": "zone_a",
            "name": "Zone A",
            "heaters": [SWITCH_ID],
            "coolers": [],
            "temperature_sensor": SENSOR_A,
            "window_sensors": [],
            "schedule": [],
        },
        {
            "unique_id": "zone_b",
            "name": "Zone B",
            "heaters": [SWITCH_ID],
            "coolers": [],
            "temperature_sensor": SENSOR_B,
            "window_sensors": [],
            "schedule": [],
        },
    ]

    # Create Zone A Instance
    zone_a = ClimateZone(
        hass, mock_storage, "zone_a", "Zone A", SENSOR_A, heaters=[SWITCH_ID], coolers=[], window_sensors=[]
    )

    # Mock Initial States
    hass.states.async_set(SWITCH_ID, "on")  # Boiler on
    hass.states.async_set(SENSOR_A, "19.0")  # Cold
    hass.states.async_set(SENSOR_B, "19.0")  # Cold

    # Mock Zone B as ACTIVE/HEATING in HA State Machine
    # This simulates Zone B effectively "owning" the boiler too
    hass.states.async_set("climate.zone_zone_b", HVACMode.HEAT, {"hvac_action": HVACAction.HEATING})

    # Zone A: Set to HEAT and Request Off (Satisfied)
    zone_a._attr_hvac_mode = HVACMode.HEAT
    zone_a._attr_target_temperature = 18.0  # Target reached (19 > 18)
    zone_a._attr_current_temperature = 19.0

    # Register mock service to capture call
    turn_off_mock = AsyncMock()
    hass.services.async_register("switch", "turn_off", turn_off_mock)

    # Trigger Control
    await zone_a._async_control_actuator()

    # ASSERTION:
    # Current behavior: Zone A turns it OFF (incorrect)
    # Desired behavior: Zone A sees Zone B is heating, keeps it ON.

    # Since we haven't implemented the fix yet, verify that it currently FAILS (i.e., it turns off)
    # OR assert the Desired Behavior and see it fail.
    # Let's assert Desired Behavior: It should NOT be turned off.
    assert not turn_off_mock.called, "Actuator turned off despite being needed by Zone B!"
