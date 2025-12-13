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
    name = msg["name"]
    temperature_sensor = msg["temperature_sensor"]
    heaters = msg["heaters"]
    coolers = msg["coolers"]
    window_sensors = msg["window_sensors"]

    # Create Zone Config
    unique_id = f"zone_{uuid.uuid4().hex[:8]}"

    zone_config = {
        "unique_id": unique_id,
        "name": name,
        "temperature_sensor": temperature_sensor,
        "heaters": heaters,
        "coolers": coolers,
        "window_sensors": window_sensors,
        "schedule": [],  # Empty schedule initially
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
def websocket_update_zone(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle update zone command."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    unique_id = msg["unique_id"]

    # We need to preserve the schedule if it's not passed (which it isn't here)
    # So we'll fetch the existing zone first.
    # storage.zones returns a list.
    zones = storage.zones
    existing_zone = next((z for z in zones if z["unique_id"] == unique_id), None)

    if not existing_zone:
        connection.send_error(msg["id"], "not_found", f"Zone {unique_id} not found")
        return

    # Update fields
    updated_config = existing_zone.copy()
    updated_config.update(
        {
            "name": msg["name"],
            "temperature_sensor": msg["temperature_sensor"],
            "heaters": msg["heaters"],
            "coolers": msg["coolers"],
            "window_sensors": msg["window_sensors"],
        }
    )

    # Save
    hass.async_create_task(storage.async_update_zone(updated_config))

    connection.send_result(msg["id"], {"unique_id": unique_id})


@callback
def async_register_api(hass: HomeAssistant) -> None:
    """Register the Climate Dashboard WebSocket API."""
    async_register_command(hass, ws_scan_unmanaged)
    async_register_command(
        hass,
        "climate_dashboard/adopt",
        websocket_adopt_zone,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/adopt",
                vol.Required("name"): str,
                vol.Required("temperature_sensor"): str,
                vol.Optional("window_sensors", default=[]): [str],
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/update",
        websocket_update_zone,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/update",
                vol.Required("unique_id"): str,
                vol.Required("name"): str,
                vol.Required("temperature_sensor"): str,
                vol.Optional("heaters", default=[]): [str],
                vol.Optional("coolers", default=[]): [str],
                vol.Optional("window_sensors", default=[]): [str],
                # Schedule is optional? If not present, we should probably keep existing.
                # But storage update replaces.
                # For MVP, let's assume this handles Refactoring/Hardware config.
                # We'll need to fetch the existing schedule in the handler if we want to preserve it.
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

    Returns a list of potential entities to use.
    """
    # We scan for: climate (for heaters/coolers), switch (for heaters), binary_sensor (for windows), sensor (for temp)
    domains = ["climate", "switch", "binary_sensor", "sensor"]
    candidates = []

    # Get list of used entities to optionally filter or mark them?
    # For now, just return everything valid, frontend can filter.

    from homeassistant.helpers import (
        area_registry as ar,
    )
    from homeassistant.helpers import (
        device_registry as dr,
    )
    from homeassistant.helpers import (
        entity_registry as er,
    )

    # Get registries
    er_instance = er.async_get(hass)
    ar_instance = ar.async_get(hass)
    dr_instance = dr.async_get(hass)

    # Get list of already used entities
    used_entities = set()
    if DOMAIN in hass.data:
        storage = hass.data[DOMAIN]["storage"]
        for zone in storage.zones:
            if zone.get("temperature_sensor"):
                used_entities.add(zone["temperature_sensor"])
            for h in zone.get("heaters", []):
                used_entities.add(h)
            for c in zone.get("coolers", []):
                used_entities.add(c)
            for w in zone.get("window_sensors", []):
                used_entities.add(w)

    for domain in domains:
        states = hass.states.async_all(domain)
        for state in states:
            # simple filter to strict lists?
            # For sensors, maybe only device_class temperature?
            attributes = state.attributes
            device_class = attributes.get("device_class")

            if domain == "sensor" and device_class != "temperature" and state.entity_id != "sensor.weather_temperature":
                # rudimentary filter, maybe too strict for MVP?
                # Let's be lenient for MVP: return all sensors with unit of measurement
                if not attributes.get("unit_of_measurement"):
                    continue

            if domain == "binary_sensor" and device_class not in ("window", "door", "opening"):
                # again, maybe lenient?
                pass

            # Exclude our own zones
            if state.entity_id.startswith("climate.zone_"):
                continue

            # Exclude already adopted entities
            if state.entity_id in used_entities:
                continue

            # Resolve Area
            area_name = None
            entity_entry = er_instance.async_get(state.entity_id)
            if entity_entry:
                area_id = entity_entry.area_id
                # Fallback to device area if entity has no area
                if not area_id and entity_entry.device_id:
                    device = dr_instance.async_get(entity_entry.device_id)
                    if device:
                        area_id = device.area_id

                if area_id:
                    area = ar_instance.async_get_area(area_id)
                    if area:
                        area_name = area.name

            candidates.append(
                {
                    "entity_id": state.entity_id,
                    "domain": domain,
                    "name": state.name,
                    "device_class": device_class,
                    "area_name": area_name,
                }
            )

    connection.send_result(msg["id"], candidates)
