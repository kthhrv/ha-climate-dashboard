"""Test Thermostat Sync Logic."""

from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from homeassistant.components.climate import (
    ClimateEntityFeature,
    HVACMode,
)
from homeassistant.core import State

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import ClimateDashboardStorage, OverrideType


@pytest.fixture
def mock_storage(hass: Any) -> MagicMock:
    """Mock storage."""
    storage = MagicMock(spec=ClimateDashboardStorage)
    storage.circuits = []
    storage.settings = {"default_override_type": OverrideType.DURATION}
    storage.async_add_listener = MagicMock()
    return storage


@pytest.fixture
def mock_zone(hass: Any, mock_storage: MagicMock) -> ClimateZone:
    """Create a test zone with a thermostat."""
    return ClimateZone(
        hass,
        mock_storage,
        "unique_id_123",
        "Test Zone",
        "sensor.temp",
        [],  # Heaters
        ["climate.wall_thermostat"],  # Thermostats
        [],  # Coolers
        [],  # Windows
        [],  # Schedule
    )


@pytest.mark.asyncio
async def test_downstream_sync(hass: Any, mock_zone: ClimateZone) -> None:
    """Test Zone -> Thermostat sync."""
    # Setup
    mock_zone._attr_hvac_mode = HVACMode.HEAT

    # Mock States
    thermostat_state = State(
        "climate.wall_thermostat",
        HVACMode.HEAT,
        attributes={
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "hvac_modes": [HVACMode.HEAT, HVACMode.OFF],
            "current_temperature": 20.0,  # Needed if used as sensor
        },
    )
    sensor_state = State("sensor.temp", "21.0")

    def get_state(entity_id: str) -> State | None:
        if entity_id == "climate.wall_thermostat":
            return thermostat_state
        if entity_id == "sensor.temp":
            return sensor_state
        return None

    # Use patch.object to mock states.get
    with (
        patch("homeassistant.core.StateMachine.get", side_effect=get_state),
        patch("homeassistant.core.ServiceRegistry.async_call") as mock_service_call,
    ):
        # Init
        await mock_zone.async_added_to_hass()

        # Action: Set Zone Temperature
        await mock_zone.async_set_temperature(temperature=22.0)

        # Assert: Service called on thermostat
        mock_service_call.assert_called_with(
            "climate", "set_temperature", {"entity_id": "climate.wall_thermostat", "temperature": 22.0}, blocking=False
        )


@pytest.mark.asyncio
async def test_upstream_sync(hass: Any, mock_zone: ClimateZone) -> None:
    """Test Thermostat -> Zone sync (Override)."""
    # Setup
    mock_zone._attr_hvac_mode = HVACMode.HEAT
    mock_zone._attr_target_temperature = 20.0

    # Mock sensor state (20C)
    def side_effect(entity_id: str) -> State | None:
        if entity_id == "sensor.temp":
            return State(entity_id, "20.0")
        return None

    # Use patch for states.get
    with patch("homeassistant.core.StateMachine.get", side_effect=side_effect):
        # Init - attach listeners
        await mock_zone.async_added_to_hass()

        # Action: Simulate Thermostat Change event
        event = MagicMock()
        event.data = {
            "new_state": State(
                "climate.wall_thermostat",
                HVACMode.HEAT,
                attributes={"temperature": 25.0},  # User turned dial to 25
            )
        }

        mock_zone._async_thermostat_changed(event)
        await hass.async_block_till_done()

        # Assert: Zone Target updated
        assert mock_zone.target_temperature == 25.0

        # Assert: Override Created
        assert mock_zone._active_override is not None


@pytest.mark.asyncio
async def test_loop_prevention(hass: Any, mock_zone: ClimateZone) -> None:
    """Test successful sync interaction without infinite loops."""
    # Setup
    mock_zone._attr_hvac_mode = HVACMode.HEAT
    mock_zone._attr_target_temperature = 20.0

    # Init

    # Mock States to prevent startup hang
    thermostat_state = State(
        "climate.wall_thermostat",
        HVACMode.HEAT,
        attributes={"temperature": 20.0, "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE},
    )
    sensor_state = State("sensor.temp", "20.0")

    def get_state(entity_id: str) -> State | None:
        if entity_id == "climate.wall_thermostat":
            return thermostat_state
        if entity_id == "sensor.temp":
            return sensor_state
        return None

    with (
        patch("homeassistant.core.StateMachine.get", side_effect=get_state),
        patch("homeassistant.core.ServiceRegistry.async_call") as mock_service_call,
    ):
        await mock_zone.async_added_to_hass()

        # 1. Upstream Event (20 -> 21)
        event = MagicMock()
        event.data = {"new_state": State("climate.wall_thermostat", HVACMode.HEAT, attributes={"temperature": 21.0})}

        # Trigger Upstream
        mock_zone._async_thermostat_changed(event)
        await hass.async_block_till_done()

        # Assert calls
        # 1. Zone sets its own temp to 21
        # 2. Zone control logic runs
        # 3. Zone Syncs downstream to 21

        # Check Zone State
        assert mock_zone.target_temperature == 21.0

        # Check Downstream Sync Call
        mock_service_call.assert_called()

        # Now verify Loop prevention:

        event_echo = MagicMock()
        event_echo.data = {
            "new_state": State("climate.wall_thermostat", HVACMode.HEAT, attributes={"temperature": 21.0})
        }

        # Reset mocks
        mock_zone.async_set_temperature = MagicMock(wraps=mock_zone.async_set_temperature)  # type: ignore[method-assign]

        # Trigger Echo
        mock_zone._async_thermostat_changed(event_echo)
        await hass.async_block_till_done()

        # Assert NO set_temperature call on Zone (Loop Broken)
        mock_zone.async_set_temperature.assert_not_called()
