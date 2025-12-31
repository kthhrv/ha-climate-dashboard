"""Test legacy integer IDs for circuits."""

from typing import Any

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component


@pytest.fixture(autouse=True)
async def setup_integration(hass: HomeAssistant) -> None:
    """Set up the integration."""
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(domain="climate_dashboard")
    entry.add_to_hass(hass)
    assert await async_setup_component(hass, "climate_dashboard", {})
    await hass.async_block_till_done()


async def test_legacy_integer_id(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test that integer IDs (legacy/imported) are handled correctly."""
    client = await hass_ws_client(hass)

    # 1. Create a circuit to initialize storage
    await client.send_json({"id": 1, "type": "climate_dashboard/circuit/create", "name": "Temp Circuit"})
    resp = await client.receive_json()
    assert resp["success"]
    created_id = resp["result"]["id"]

    # 2. Inject Integer ID 47 directly into storage to simulate legacy data
    storage = hass.data["climate_dashboard"]["storage"]
    found = False
    for c in storage.circuits:
        if c["id"] == created_id:
            c["id"] = 47  # Set to int
            found = True
            break
    assert found

    # 3. Update using Integer ID
    await client.send_json(
        {
            "id": 2,
            "type": "climate_dashboard/circuit/update",
            "circuit_id": 47,  # Passing int
            "name": "Updated Name",
        }
    )
    resp = await client.receive_json()
    assert resp["success"], f"Update failed: {resp.get('error')}"
    assert resp["result"]["id"] == 47
    assert resp["result"]["name"] == "Updated Name"

    # Verify in storage
    c = next((x for x in storage.circuits if x["id"] == 47), None)
    assert c is not None
    assert c["name"] == "Updated Name"

    # 4. Delete using Integer ID
    await client.send_json(
        {
            "id": 3,
            "type": "climate_dashboard/circuit/delete",
            "circuit_id": 47,  # Passing int
        }
    )
    resp = await client.receive_json()
    assert resp["success"], f"Delete failed: {resp.get('error')}"

    # Verify removed
    c = next((x for x in storage.circuits if x["id"] == 47), None)
    assert c is None
