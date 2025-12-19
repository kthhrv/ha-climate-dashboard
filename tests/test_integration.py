"""Integration tests for Climate Dashboard."""

import logging
from typing import Any

import pytest
from homeassistant.components.climate import SERVICE_SET_TEMPERATURE, HVACMode
from homeassistant.const import (
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
    STATE_OFF,
    STATE_ON,
)
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.setup import async_setup_component

_LOGGER = logging.getLogger(__name__)


@pytest.fixture(autouse=True)
async def setup_integration(hass: HomeAssistant) -> None:
    """Set up the integration."""
    assert await async_setup_component(hass, "climate_dashboard", {})


async def test_zone_heating_cycle(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test full heating cycle via WebSocket API."""
    client = await hass_ws_client(hass)

    # 1. Setup Mock Entities & Service
    SENSOR_ID = "sensor.living_room_temp"
    HEATER_ID = "switch.living_room_heater"

    hass.states.async_set(SENSOR_ID, "18.0")
    hass.states.async_set(HEATER_ID, STATE_OFF)

    # Register mock switch services to simulate hardware response
    async def async_mock_switch_service(call: ServiceCall) -> None:
        entity_id = call.data["entity_id"]
        if call.service == "turn_on":
            hass.states.async_set(entity_id, STATE_ON)
        elif call.service == "turn_off":
            hass.states.async_set(entity_id, STATE_OFF)

    hass.services.async_register("switch", SERVICE_TURN_ON, async_mock_switch_service)
    hass.services.async_register("switch", SERVICE_TURN_OFF, async_mock_switch_service)

    # 2. Adopt Zone
    await client.send_json(
        {
            "id": 1,
            "type": "climate_dashboard/adopt",
            "name": "Living Room",
            "temperature_sensor": SENSOR_ID,
            "heaters": [HEATER_ID],
            "coolers": [],
            "window_sensors": [],
        }
    )
    response = await client.receive_json()
    assert response["success"]
    assert response["success"]
    # unique_id = response["result"]["unique_id"]
    await hass.async_block_till_done()

    # Verify Entity Created
    # Name slugification: Living Room -> living_room
    zone_entity_id = "climate.zone_living_room"
    state = hass.states.get(zone_entity_id)
    assert state is not None
    assert state.state == HVACMode.OFF  # Default is OFF

    # 3. Turn On Heat (Goal: 22C, Current: 18C)
    await hass.services.async_call(
        "climate",
        SERVICE_SET_TEMPERATURE,
        {"entity_id": zone_entity_id, "temperature": 22.0, "hvac_mode": HVACMode.HEAT},
        blocking=True,
    )
    await hass.async_block_till_done()

    # 4. Verify Heater Turns ON
    heater_state = hass.states.get(HEATER_ID)
    assert heater_state is not None
    assert heater_state.state == STATE_ON

    # 5. Satisfy Request (Current: 23C)
    hass.states.async_set(SENSOR_ID, "23.0")
    await hass.async_block_till_done()  # Wait for event bus

    # 6. Verify Heater Turns OFF
    heater_state = hass.states.get(HEATER_ID)
    assert heater_state is not None
    assert heater_state.state == STATE_OFF


async def test_delete_zone_via_api(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test deleting a zone via API removes the entity."""
    client = await hass_ws_client(hass)

    # 1. Adopt
    await client.send_json(
        {
            "id": 1,
            "type": "climate_dashboard/adopt",
            "name": "To Delete",
            "temperature_sensor": "sensor.temp",
            "heaters": [],
            "coolers": [],
            "window_sensors": [],
        }
    )
    msg = await client.receive_json()
    uid = msg["result"]["unique_id"]

    # Ensure mock sensor exists to avoid 10s retry loop
    hass.states.async_set("sensor.temp", "20.0")

    # Ensure entity is created
    await hass.async_block_till_done()

    entity_id = "climate.zone_to_delete"
    assert hass.states.get(entity_id) is not None

    # 2. Delete
    await client.send_json({"id": 2, "type": "climate_dashboard/delete", "unique_id": uid})
    del_response = await client.receive_json()
    assert del_response["success"]

    # 3. Verify Entity Gone
    await hass.async_block_till_done()
    assert hass.states.get(entity_id) is None
