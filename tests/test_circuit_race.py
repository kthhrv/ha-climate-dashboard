"""Test Heating Circuit Race Condition."""

from unittest.mock import MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.util import slugify

from custom_components.climate_dashboard.circuit import HeatingCircuit
from custom_components.climate_dashboard.storage import CircuitConfig

DOMAIN = "climate_dashboard"
ZONE_NAME = "Test Zone"
ZONE_ID = "zone_test"
CIRCUIT_ID = "circuit_test"


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    # Mock Zones configuration
    storage.zones = [
        {"unique_id": ZONE_ID, "name": ZONE_NAME},
    ]
    storage.circuits = []
    return storage


async def test_circuit_init_race_condition(hass: HomeAssistant, mock_storage: MagicMock) -> None:
    """Test that circuit attaches listener even if entity does not exist yet."""

    # 1. Setup Registry to return None (Simulate new entity not yet registered)
    mock_registry = MagicMock()
    mock_registry.async_get_entity_id.return_value = None

    with (
        patch("homeassistant.helpers.entity_registry.async_get", return_value=mock_registry),
        patch("custom_components.climate_dashboard.circuit.async_track_state_change_event") as mock_track,
    ):
        # 2. Setup Circuit
        config: CircuitConfig = {
            "id": CIRCUIT_ID,
            "name": "Test Circuit",
            "heaters": ["switch.boiler"],
            "member_zones": [ZONE_ID],
        }

        circuit = HeatingCircuit(hass, mock_storage, config)

        # 3. Initialize
        # IMPORTANT: ensure hass.states.get returns None for the guessed ID
        assert hass.states.get(f"climate.zone_{slugify(ZONE_NAME)}") is None

        await circuit.async_initialize()

        # 4. Verify Listener was attached to the guessed Entity ID
        expected_entity_id = f"climate.zone_{slugify(ZONE_NAME)}"

        if mock_track.called:
            args = mock_track.call_args[0]
            tracked_entities = args[1]  # 2nd arg is entity_ids
            assert expected_entity_id in tracked_entities, "Should track the guessed entity ID even if missing"
        else:
            pytest.fail("Did not call async_track_state_change_event")
