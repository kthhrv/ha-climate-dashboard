"""WebSocket API for Climate Dashboard."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

SCAN_COMMAND = f"{DOMAIN}/scan"


@callback
def async_register_api(hass: HomeAssistant) -> None:
    """Register the Climate Dashboard WebSocket API."""
    websocket_api.async_register_command(hass, ws_scan_unmanaged)


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
