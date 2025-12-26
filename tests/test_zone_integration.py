"""Integration tests for ClimateZone + Reconciler."""

from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from homeassistant.components.climate import ATTR_TEMPERATURE, HVACAction, HVACMode

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import ClimateDashboardStorage, OverrideType

SENSOR_ID = "sensor.temp"
CLIMATE_ID = "climate.ac"


@pytest.fixture
def mock_storage() -> MagicMock:
    storage = MagicMock(spec=ClimateDashboardStorage)
    storage.circuits = []
    storage.settings = {"default_override_type": OverrideType.DURATION}
    storage.async_add_listener = MagicMock()
    return storage


@pytest.fixture
def zone(hass: Any, mock_storage: MagicMock) -> ClimateZone:
    return ClimateZone(
        hass,
        mock_storage,
        "test_zone",
        "Test Zone",
        SENSOR_ID,
        heaters=[],
        thermostats=[],
        coolers=[CLIMATE_ID],
        window_sensors=[],
        schedule=[],
    )


@pytest.mark.asyncio
async def test_manual_override_cool(hass: Any, zone: ClimateZone) -> None:
    """Test setting cooling manually triggers correct reconciliation."""

    # Patch async_call
    with patch("homeassistant.core.ServiceRegistry.async_call") as call_mock:
        # Setup States
        hass.states.async_set(SENSOR_ID, "25.0")
        hass.states.async_set(CLIMATE_ID, HVACMode.OFF, {"hvac_modes": [HVACMode.OFF, HVACMode.COOL]})

        # Init
        await zone.async_added_to_hass()

        # Action: Set Cool Mode
        await zone.async_set_hvac_mode(HVACMode.COOL)
        await zone.async_set_temperature(temperature=22.0)

        # Wait for loop
        await hass.async_block_till_done()

        # Assert Zone State
        assert zone.hvac_mode == HVACMode.COOL
        assert zone.target_temperature == 22.0

        # Assert Reconciler Actions
        assert zone.hvac_action == HVACAction.COOLING

        # Verify calls
        calls = call_mock.call_args_list
        assert len(calls) >= 1

        # Check for Mode Set
        mode_calls = [c for c in calls if c.args[0] == "climate" and c.args[1] == "set_hvac_mode"]
        assert len(mode_calls) > 0
        assert mode_calls[-1].args[2]["hvac_mode"] == HVACMode.COOL

        # Check for Temp Set
        temp_calls = [c for c in calls if c.args[0] == "climate" and c.args[1] == "set_temperature"]
        assert len(temp_calls) > 0
        assert temp_calls[-1].args[2][ATTR_TEMPERATURE] == 16.0


@pytest.mark.asyncio
async def test_window_safety(hass: Any, mock_storage: MagicMock) -> None:
    """Test window open forces OFF."""
    # Set Delay to 0
    mock_storage.settings = {"window_open_delay_seconds": 0}

    WINDOW_ID = "binary_sensor.window"
    zone = ClimateZone(
        hass,
        mock_storage,
        "win",
        "Win",
        SENSOR_ID,
        heaters=[CLIMATE_ID],
        thermostats=[],
        coolers=[],
        window_sensors=[WINDOW_ID],
    )
    zone._startup_grace_period = False

    # Patch async_call
    with patch("homeassistant.core.ServiceRegistry.async_call"):
        # Setup
        hass.states.async_set(SENSOR_ID, "20.0")
        hass.states.async_set(CLIMATE_ID, HVACMode.HEAT, {"hvac_modes": [HVACMode.HEAT, HVACMode.OFF]})
        hass.states.async_set(WINDOW_ID, "off")  # Closed

        await zone.async_added_to_hass()
        await zone.async_set_hvac_mode(HVACMode.HEAT)
        await zone.async_set_temperature(temperature=25.0)
        await hass.async_block_till_done()

        # Should be heating
        assert zone.hvac_action == HVACAction.HEATING

        # OPEN WINDOW
        hass.states.async_set(WINDOW_ID, "on")
        await hass.async_block_till_done()

        # Should be OFF
        assert zone.hvac_action == HVACAction.OFF
