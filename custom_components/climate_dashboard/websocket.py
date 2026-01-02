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
from .schedules import get_default_schedule
from .storage import CircuitConfig

SCAN_COMMAND = "climate_dashboard/scan"
_LOGGER = logging.getLogger(__name__)


@callback
def websocket_adopt_zone(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle adopt zone command.

    Args:
        hass: HomeAssistant instance.
        connection: WebSocket connection.
        msg: Message dictionary.
    """
    # We need to run this async, but since this is a callback, we spawn a task.
    # However, to properly handle errors/result, we should use async handler.
    # Refactoring to async handler requires removing @callback and changing to async def.
    # But wait, async_register_command expects a handler.
    hass.async_create_task(_async_adopt_zone(hass, connection, msg))


# ...


async def _async_adopt_zone(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Implement adoption logic.

    Create a new Zone configuration from the message payload, find the
    correct Area based on the entities, and save it to storage.
    """
    name = msg["name"]
    temperature_sensor = msg["temperature_sensor"]
    heaters = msg["heaters"]
    coolers = msg["coolers"]
    window_sensors = msg["window_sensors"]
    room_type = msg.get("room_type", "generic")

    # Create Zone Config
    unique_id = f"zone_{uuid.uuid4().hex[:8]}"

    zone_config = {
        "unique_id": unique_id,
        "name": name,
        "temperature_sensor": temperature_sensor,
        "heaters": heaters,
        "thermostats": msg["thermostats"],
        "coolers": coolers,
        "window_sensors": window_sensors,
        "presence_sensors": msg.get("presence_sensors", []),
        "occupancy_timeout_minutes": msg.get("occupancy_timeout_minutes", 30),
        "occupancy_setback_temp": msg.get("occupancy_setback_temp", 2.0),
        "schedule": get_default_schedule(room_type),
        "restore_delay_minutes": msg.get("restore_delay_minutes", 0),
    }

    # Detect Area from adopted entities
    from homeassistant.helpers import (
        device_registry as dr,
    )
    from homeassistant.helpers import (
        entity_registry as er,
    )
    from homeassistant.util import slugify

    er_instance = er.async_get(hass)
    dr_instance = dr.async_get(hass)

    found_area_id = None

    # Check all related entities for an area
    # Check all related entities for an area
    for entity_id in [temperature_sensor, *heaters, *coolers, *window_sensors]:
        if not entity_id:
            continue
        entry = er_instance.async_get(entity_id)
        if entry:
            if entry.area_id:
                found_area_id = entry.area_id
                break
            if entry.device_id:
                device = dr_instance.async_get(entry.device_id)
                if device and device.area_id:
                    found_area_id = device.area_id
                    break

    if found_area_id:
        # Pre-create registry entry to bind the Area
        # We also suggest a nice entity_id: climate.zone_name
        suggested_id = f"zone_{slugify(name)}"
        entry = er_instance.async_get_or_create(
            "climate",
            DOMAIN,
            unique_id,
            suggested_object_id=suggested_id,
        )
        # Update with Area ID (async_get_or_create doesn't support area_id arg directly in all versions)
        er_instance.async_update_entity(entry.entity_id, area_id=found_area_id)

    # Save to storage
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]

    await storage.async_add_zone(zone_config)

    if "circuit_ids" in msg:
        await storage.async_update_zone_circuits(unique_id, msg["circuit_ids"])

    connection.send_result(msg["id"], {"unique_id": unique_id})


@callback
def websocket_update_zone(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    hass.async_create_task(_async_update_zone(hass, connection, msg))


async def _async_update_zone(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Handle update zone command.

    Updates the configuration of an existing zone.
    Merges provided fields with existing configuration.
    """
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
            "thermostats": msg["thermostats"],
            "coolers": msg["coolers"],
            "window_sensors": msg["window_sensors"],
        }
    )

    if "presence_sensors" in msg:
        updated_config["presence_sensors"] = msg["presence_sensors"]
    if "occupancy_timeout_minutes" in msg:
        updated_config["occupancy_timeout_minutes"] = msg["occupancy_timeout_minutes"]
    if "occupancy_setback_temp" in msg:
        updated_config["occupancy_setback_temp"] = msg["occupancy_setback_temp"]

    if "schedule" in msg:
        updated_config["schedule"] = msg["schedule"]

    if "restore_delay_minutes" in msg:
        updated_config["restore_delay_minutes"] = msg["restore_delay_minutes"]

    # Save
    await storage.async_update_zone(updated_config)

    if "circuit_ids" in msg:
        await storage.async_update_zone_circuits(unique_id, msg["circuit_ids"])

    connection.send_result(msg["id"], {"unique_id": unique_id})


@callback
def websocket_delete_zone(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    hass.async_create_task(_async_delete_zone(hass, connection, msg))


async def _async_delete_zone(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Handle delete zone command.

    Removes a zone from storage by its unique_id.
    """
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    unique_id = msg["unique_id"]

    try:
        await storage.async_delete_zone(unique_id)
        connection.send_result(msg["id"], {"success": True})
    except ValueError as e:
        connection.send_error(msg["id"], "not_found", str(e))


@callback
def websocket_get_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle get settings command."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    connection.send_result(msg["id"], storage.settings)


@callback
def websocket_update_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle update settings command."""
    hass.async_create_task(_async_update_settings(hass, connection, msg))


async def _async_update_settings(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Handle update settings command."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]

    updates = {}
    if "default_override_type" in msg:
        updates["default_override_type"] = msg["default_override_type"]
    if "default_timer_minutes" in msg:
        updates["default_timer_minutes"] = msg["default_timer_minutes"]
    if "window_open_delay_seconds" in msg:
        updates["window_open_delay_seconds"] = msg["window_open_delay_seconds"]
    if "home_away_entity_id" in msg:
        updates["home_away_entity_id"] = msg["home_away_entity_id"]
    if "away_delay_minutes" in msg:
        updates["away_delay_minutes"] = msg["away_delay_minutes"]
    if "away_temperature" in msg:
        updates["away_temperature"] = msg["away_temperature"]
    if "away_temperature_cool" in msg:
        updates["away_temperature_cool"] = msg["away_temperature_cool"]
    if "is_away_mode_on" in msg:
        updates["is_away_mode_on"] = msg["is_away_mode_on"]

    await storage.async_update_settings(updates)
    connection.send_result(msg["id"], storage.settings)


@callback
def websocket_create_circuit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle create circuit command."""
    hass.async_create_task(_async_create_circuit(hass, connection, msg))


async def _async_create_circuit(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Async create circuit."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]

    unique_id = f"circuit_{uuid.uuid4().hex[:8]}"
    circuit: CircuitConfig = {
        "id": unique_id,
        "name": msg["name"],
        "heaters": msg.get("heaters", []),
        "member_zones": msg.get("member_zones", []),
    }

    await storage.async_add_circuit(circuit)
    connection.send_result(msg["id"], circuit)


@callback
def websocket_update_circuit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle update circuit command."""
    hass.async_create_task(_async_update_circuit(hass, connection, msg))


async def _async_update_circuit(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Async update circuit."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    circuit_id = msg["circuit_id"]

    existing = next((c for c in storage.circuits if c["id"] == circuit_id), None)
    if not existing:
        connection.send_error(msg["id"], "not_found", "Circuit not found")
        return

    updates = existing.copy()
    if "name" in msg:
        updates["name"] = msg["name"]
    if "heaters" in msg:
        updates["heaters"] = msg["heaters"]
    if "member_zones" in msg:
        updates["member_zones"] = msg["member_zones"]

    try:
        await storage.async_update_circuit(updates)
        connection.send_result(msg["id"], updates)
    except ValueError as e:
        connection.send_error(msg["id"], "update_failed", str(e))


@callback
def websocket_delete_circuit(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle delete circuit command."""
    hass.async_create_task(_async_delete_circuit(hass, connection, msg))


async def _async_delete_circuit(hass: HomeAssistant, connection: ActiveConnection, msg: dict[str, Any]) -> None:
    """Async delete circuit."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    try:
        await storage.async_delete_circuit(msg["circuit_id"])
        connection.send_result(msg["id"], {"success": True})
    except ValueError as e:
        connection.send_error(msg["id"], "not_found", str(e))


@callback
def websocket_list_circuits(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle list circuits command."""
    if DOMAIN not in hass.data:
        connection.send_error(msg["id"], "internal_error", "Integration not initialized")
        return

    storage = hass.data[DOMAIN]["storage"]
    active_circuits = hass.data[DOMAIN].get("circuits", [])

    # Enhance circuit data with runtime state
    response = []
    for circuit_conf in storage.circuits:
        data = circuit_conf.copy()

        # Find active instance
        active = next((c for c in active_circuits if c.id == data["id"]), None)
        data["is_active"] = active.is_active if active else False

        # Resolve Member Zone Names
        zone_names = []
        for z_id in data.get("member_zones", []):
            z = next((z for z in storage.zones if z["unique_id"] == z_id), None)
            if z:
                zone_names.append(z["name"])

        data["member_zone_names"] = zone_names
        response.append(data)

    connection.send_result(msg["id"], response)


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
                vol.Optional("heaters", default=[]): [str],
                vol.Optional("thermostats", default=[]): [str],
                vol.Optional("coolers", default=[]): [str],
                vol.Optional("window_sensors", default=[]): [str],
                vol.Optional("presence_sensors", default=[]): [str],
                vol.Optional("occupancy_timeout_minutes", default=30): int,
                vol.Optional("occupancy_setback_temp", default=2.0): vol.Coerce(float),
                vol.Optional("restore_delay_minutes", default=0): int,
                vol.Optional("room_type", default="generic"): str,
                vol.Optional("circuit_ids", default=[]): [str],
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
                vol.Optional("thermostats", default=[]): [str],
                vol.Optional("coolers", default=[]): [str],
                vol.Optional("window_sensors", default=[]): [str],
                vol.Optional("presence_sensors"): [str],
                vol.Optional("occupancy_timeout_minutes"): int,
                vol.Optional("occupancy_setback_temp"): vol.Coerce(float),
                vol.Optional("schedule"): list,
                vol.Optional("restore_delay_minutes"): int,
                vol.Optional("circuit_ids"): [str],
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/delete",
        websocket_delete_zone,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/delete",
                vol.Required("unique_id"): str,
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/circuit/list",
        websocket_list_circuits,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/circuit/list",
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/settings/get",
        websocket_get_settings,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/settings/get",
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/settings/update",
        websocket_update_settings,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/settings/update",
                vol.Optional("default_override_type"): str,
                vol.Optional("default_timer_minutes"): int,
                vol.Optional("window_open_delay_seconds"): int,
                vol.Optional("home_away_entity_id"): vol.Any(str, None),
                vol.Optional("away_delay_minutes"): int,
                vol.Optional("away_temperature"): vol.Coerce(float),
                vol.Optional("away_temperature_cool"): vol.Coerce(float),
                vol.Optional("is_away_mode_on"): bool,
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/circuit/create",
        websocket_create_circuit,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/circuit/create",
                vol.Required("name"): str,
                vol.Optional("heaters", default=[]): [str],
                vol.Optional("member_zones", default=[]): [str],
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/circuit/update",
        websocket_update_circuit,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/circuit/update",
                vol.Required("circuit_id"): vol.Any(str, int),
                vol.Optional("name"): str,
                vol.Optional("heaters"): [str],
                vol.Optional("member_zones"): [str],
            }
        ),
    )
    async_register_command(
        hass,
        "climate_dashboard/circuit/delete",
        websocket_delete_circuit,
        schema=websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "climate_dashboard/circuit/delete",
                vol.Required("circuit_id"): vol.Any(str, int),
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
            for t in zone.get("thermostats", []):
                used_entities.add(t)
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
            area_id = None
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
                    "area_id": area_id,
                }
            )

    connection.send_result(msg["id"], candidates)
