"""Test Heating Circuit logic."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.const import ATTR_ENTITY_ID, SERVICE_TURN_OFF, SERVICE_TURN_ON
from homeassistant.core import HomeAssistant
from homeassistant.util import slugify

from custom_components.climate_dashboard.circuit import HeatingCircuit
from custom_components.climate_dashboard.storage import CircuitConfig

CIRCUIT_NAME = "Upstairs"
BOILER_ID = "switch.boiler"
ZONE_A_NAME = "Bedroom"
ZONE_B_NAME = "Office"
ZONE_A_ID = "zone_bedroom"
ZONE_B_ID = "zone_office"


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    # Mock Zones configuration
    storage.zones = [
        {"unique_id": ZONE_A_ID, "name": ZONE_A_NAME},
        {"unique_id": ZONE_B_ID, "name": ZONE_B_NAME},
    ]
    return storage


async def test_circuit_demand_logic(hass: HomeAssistant, mock_storage: MagicMock) -> None:
    """Test that circuit aggregates demand correctly."""

    # Setup Mocks for generic turn_on/turn_off
    mock_turn_on = AsyncMock()
    mock_turn_off = AsyncMock()
    hass.services.async_register("homeassistant", SERVICE_TURN_ON, mock_turn_on)
    hass.services.async_register("homeassistant", SERVICE_TURN_OFF, mock_turn_off)

    # 1. Setup Circuit
    config: CircuitConfig = {
        "id": "circuit_1",
        "name": CIRCUIT_NAME,
        "heaters": [BOILER_ID],
        "member_zones": [ZONE_A_ID, ZONE_B_ID],
    }
    circuit = HeatingCircuit(hass, mock_storage, config)
    # Mock listeners since we don't have real entities
    circuit._async_setup_listeners = AsyncMock()  # type: ignore[method-assign]

    await circuit.async_initialize()

    # Stub state checking inside the class is hard without real entities in HA state machine.
    # We should populate HA states.

    # Helper to set zone state
    def set_zone_state(name: str, hvac_action: str) -> None:
        entity_id = f"climate.zone_{slugify(name)}"
        hass.states.async_set(entity_id, "heat", {"hvac_action": hvac_action})

    # SCENARIO 1: Both Idle -> Boiler OFF
    set_zone_state(ZONE_A_NAME, "idle")
    set_zone_state(ZONE_B_NAME, "idle")

    await circuit._async_check_demand()

    # Verify OFF call
    # Logic optimization: It won't call OFF if it wasn't active before
    assert not mock_turn_off.called

    mock_turn_off.reset_mock()
    mock_turn_on.reset_mock()

    # SCENARIO 2: Zone A Heating -> Boiler ON
    set_zone_state(ZONE_A_NAME, "heating")
    # Zone B still idle

    await circuit._async_check_demand()

    # Verify ON call
    assert mock_turn_on.called
    # call_args[0][0] is the ServiceCall object
    service_call = mock_turn_on.call_args[0][0]
    assert service_call.data[ATTR_ENTITY_ID] == BOILER_ID

    mock_turn_on.reset_mock()

    # SCENARIO 3: Zone B enters Heating (Both Heating) -> Boiler Stays ON
    # Circuit checks _is_active, so no new call expected.

    set_zone_state(ZONE_B_NAME, "heating")
    await circuit._async_check_demand()

    assert not mock_turn_on.called, "Should not call ON again if already active"

    # SCENARIO 4: Zone A finishes (Idle), Zone B still Heating -> Boiler Stays ON
    set_zone_state(ZONE_A_NAME, "idle")
    await circuit._async_check_demand()

    assert not mock_turn_on.called, "Should stay active as Zone B is heating"
    assert not mock_turn_off.called

    # SCENARIO 5: Zone B finishes (All Idle) -> Boiler Turn OFF
    set_zone_state(ZONE_B_NAME, "idle")
    await circuit._async_check_demand()

    assert mock_turn_off.called
    service_call = mock_turn_off.call_args[0][0]
    assert service_call.data[ATTR_ENTITY_ID] == BOILER_ID
