"""WebSocket API for Climate Dashboard."""

from __future__ import annotations

import logging
import uuid
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import ActiveConnection, async_register_command
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

SCAN_COMMAND = "climate_dashboard/scan"
_LOGGER = logging.getLogger(__name__)


@callback
def websocket_adopt_zone(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle adopt zone command."""
    actuator_id = msg["actuator_id"]
    name = msg.get("name")

    # Simple logic: If name not provided, use entity name
    if not name:
        state = hass.states.get(actuator_id)
        name = state.name if state else actuator_id.split(".")[-1]

    # Sensor logic: Defaults to actuator itself if climate, else needs arg?
    # For MVP we default sensor = actuator
    sensor_id = actuator_id

    # Create Zone Config
    unique_id = f"zone_{uuid.uuid4().hex[:8]}"

    zone_config = {
        "unique_id": unique_id,
        "name": name,
        "actuator": actuator_id,
        "sensor": sensor_id,
    }

    # Save to storage
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]

    # We need to run this async
    hass.async_create_task(storage.async_add_zone(zone_config))

    connection.send_result(msg["id"], {"unique_id": unique_id})


@callback
def async_register_api(hass: HomeAssistant) -> None:
    """Register the Climate Dashboard WebSocket API."""
    async_register_command(hass, ws_scan_unmanaged)
    async_register_command(
        hass,
        "climate_dashboard/adopt",
        websocket_adopt_zone,
        schema=vol.Schema(
            {
                vol.Required("type"): "climate_dashboard/adopt",
                vol.Required("actuator_id"): str,
                vol.Optional("name"): str,
            }
        ),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): SCAN_COMMAND,
    }
)
@websocket_api.async_response
async def ws_scan_unmanaged(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Handle the scan command.

    Returns a list of all climate entities that NOT managed by Climate Dashboard.
    """
    all_climate_states = hass.states.async_all("climate")
    unmanaged = []

    for state in all_climate_states:
        # Filter out our own entities once we have them (platform check or attribute check)
        # For now, we assume anything starting with "climate.zone_" is ours (per GEMINI.md naming convention)
        if state.entity_id.startswith("climate.zone_"):
            continue

        unmanaged.append(
            {
                "entity_id": state.entity_id,
                "name": state.name,
                "state": state.state,
                "attributes": state.attributes,
            }
        )

    connection.send_result(msg["id"], unmanaged)
