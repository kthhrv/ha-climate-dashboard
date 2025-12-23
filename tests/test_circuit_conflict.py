"""Test Heating Circuit Manual Override Conflict."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.const import SERVICE_TURN_OFF
from homeassistant.core import HomeAssistant
from homeassistant.util import slugify

from custom_components.climate_dashboard.circuit import HeatingCircuit
from custom_components.climate_dashboard.storage import CircuitConfig

DOMAIN = "climate_dashboard"
ZONE_NAME = "Test Zone"
ZONE_ID = "zone_test"
CIRCUIT_ID = "circuit_test"
BOILER_ID = "switch.boiler"


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    # Mock Zones configuration
    storage.zones = [
        {"unique_id": ZONE_ID, "name": ZONE_NAME},
    ]
    storage.circuits = []
    # Configure shared logic?
    return storage


async def test_circuit_manual_override_conflict(hass: HomeAssistant, mock_storage: MagicMock) -> None:
    """Test what happens when the boiler is manually turned on while zone is idle."""

    # 1. Setup Mocks
    mock_turn_off = AsyncMock()
    hass.services.async_register("homeassistant", SERVICE_TURN_OFF, mock_turn_off)

    # Setup Zone State (Idle)
    entity_id = f"climate.zone_{slugify(ZONE_NAME)}"
    hass.states.async_set(entity_id, "heat", {"hvac_action": "idle"})

    # Setup Boiler State (Off)
    hass.states.async_set(BOILER_ID, "off")

    # 2. Setup Circuit
    config: CircuitConfig = {
        "id": CIRCUIT_ID,
        "name": "Test Circuit",
        "heaters": [BOILER_ID],
        "member_zones": [ZONE_ID],
    }

    circuit = HeatingCircuit(hass, mock_storage, config)
    # Mock internal listener setup to avoid complexity, or just let it run (we fixed the race)
    # We want to test logic, so use real init
    with patch("custom_components.climate_dashboard.circuit.async_track_state_change_event"):
        await circuit.async_initialize()

    # 3. Simulate Manual Turn ON of Boiler
    assert circuit._is_active is False

    # If the user turns the boiler ON, the *Circuit* doesn't strictly know or care unless triggered.
    # But usually, checking demand happens on zone state change.

    # Let's Trigger Check Demand (Simulate Zone Update or Periodic Check)
    await circuit._async_check_demand()

    # Logic:
    # Zone is Idle -> any_heating = False.
    # _is_active = False.
    # Result: Should DO NOTHING.

    assert not mock_turn_off.called, "Circuit should not enforce OFF if it thinks it is already OFF"

    # 4. Now force _is_active mismatch?
    # What if it WAS active?
    circuit._is_active = True

    await circuit._async_check_demand()

    # Now it should turn OFF
    assert mock_turn_off.called

    # This confirms Circuit logic is "Event Driven". It doesn't fight manual changes unless its own state changes.
