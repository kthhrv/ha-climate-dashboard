"""Test Heating Circuit Home/Away Interaction."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.const import SERVICE_TURN_OFF, SERVICE_TURN_ON
from homeassistant.core import HomeAssistant
from homeassistant.util import slugify

from custom_components.climate_dashboard.circuit import HeatingCircuit
from custom_components.climate_dashboard.storage import CircuitConfig

DOMAIN = "climate_dashboard"
ZONE_NAME = "Living Room"
ZONE_ID = "zone_living"
CIRCUIT_ID = "circuit_main"
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
    # Mock settings for Home/Away? circuit doesn't read settings directly, it reacts to zone state.
    return storage


async def test_circuit_home_away_response(hass: HomeAssistant, mock_storage: MagicMock) -> None:
    """Test that circuit reacts to Zone state changes caused by Home/Away."""

    # 1. Setup Mocks
    mock_turn_on = AsyncMock()
    mock_turn_off = AsyncMock()
    hass.services.async_register("homeassistant", SERVICE_TURN_ON, mock_turn_on)
    hass.services.async_register("homeassistant", SERVICE_TURN_OFF, mock_turn_off)

    # 2. Setup Circuit
    config: CircuitConfig = {
        "id": CIRCUIT_ID,
        "name": "Main Circuit",
        "heaters": [BOILER_ID],
        "member_zones": [ZONE_ID],
    }
    circuit = HeatingCircuit(hass, mock_storage, config)

    # Manually initialize listeners (bypassing the race condition since that's verified)
    # But we want to ensure async_track_state_change_event works.
    await circuit.async_initialize()

    entity_id = f"climate.zone_{slugify(ZONE_NAME)}"

    # 3. Scenario: Zone enters Heating (e.g. Home Mode)
    # We must fire the event or manually trigger the callback
    # Using hass.states.async_set fires the event automatically in real HA,
    # but in tests usually async_track_state_change_event needs the state machine to fire.

    hass.states.async_set(entity_id, "heat", {"hvac_action": "heating"})
    await hass.async_block_till_done()

    # The circuit's listener should have fired -> triggering check_demand

    # Since we can't easily wait for the internal task without exposing it or mocking,
    # let's invoke _async_check_demand directly IF the event mechanism is flaky in tests?
    # Ideally we trust the HA event bus in integration tests.
    # But for unit tests with MagicMocks, async_track_state_change_event behavior depends on implementation.
    # Let's verify if 'circuit._async_on_state_change' is called.

    # Wait... I haven't mocked async_track_state_change_event here, so it uses the real HA helper.
    # This requires the event bus loop to run.

    await hass.async_block_till_done()

    # Check Result: Boiler ON
    assert mock_turn_on.called
    assert circuit._is_active is True

    mock_turn_on.reset_mock()

    # 4. Scenario: Zone goes Idle (e.g. Away Mode activates)
    hass.states.async_set(entity_id, "heat", {"hvac_action": "idle"})
    await hass.async_block_till_done()

    # Check Result: Boiler OFF
    assert mock_turn_off.called
    assert circuit._is_active is False

    mock_turn_off.reset_mock()

    # 5. Scenario: Zone goes Heating again (Home Mode)
    hass.states.async_set(entity_id, "heat", {"hvac_action": "heating"})
    await hass.async_block_till_done()

    assert mock_turn_on.called
    assert circuit._is_active is True
