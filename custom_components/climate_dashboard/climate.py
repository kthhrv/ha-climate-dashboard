"""Climate platform for Climate Dashboard."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .climate_zone import ClimateZone
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_platform(
    hass: HomeAssistant,
    config: Any,
    async_add_entities: AddEntitiesCallback,
    discovery_info: Any = None,
) -> None:
    """Set up the Climate Dashboard platform."""
    if DOMAIN not in hass.data:
        return

    storage = hass.data[DOMAIN]["storage"]

    # One-time cleanup of orphaned entities in Registry
    # This fixes "Unavailable" entities that were deleted from storage but persist in registry
    from homeassistant.helpers import entity_registry as er

    ent_reg = er.async_get(hass)

    # Get valid unique_ids from storage
    valid_ids = {zone["unique_id"] for zone in storage.zones}

    # Iterate all registry entries for this platform
    # We must iterate a copy since we might modify the registry
    for entry in list(ent_reg.entities.values()):
        if entry.platform == "climate_dashboard":
            # If the unique_id is not in our valid storage list, nuke it
            if entry.unique_id not in valid_ids:
                _LOGGER.warning(
                    "Removing orphaned registry entry: %s (unique_id: %s)", entry.entity_id, entry.unique_id
                )
                ent_reg.async_remove(entry.entity_id)

    # Keep track of added entities
    loaded_entities: dict[str, ClimateZone] = {}

    @callback
    def _add_or_update_entities() -> None:
        """Add new entities or update existing ones."""
        new_entities = []
        for zone_config in storage.zones:
            uid = zone_config["unique_id"]

            if uid in loaded_entities:
                # Update existing
                entity = loaded_entities[uid]
                hass.async_create_task(
                    entity.async_update_config(
                        name=zone_config["name"],
                        temperature_sensor=zone_config["temperature_sensor"],
                        heaters=zone_config["heaters"],
                        coolers=zone_config["coolers"],
                        window_sensors=zone_config["window_sensors"],
                        schedule=zone_config.get("schedule"),
                        restore_delay_minutes=zone_config.get("restore_delay_minutes", 0),
                    )
                )
            else:
                # Create NEW
                entity = ClimateZone(
                    hass,
                    storage,
                    unique_id=uid,
                    name=zone_config["name"],
                    temperature_sensor=zone_config["temperature_sensor"],
                    heaters=zone_config["heaters"],
                    coolers=zone_config["coolers"],
                    window_sensors=zone_config["window_sensors"],
                    schedule=zone_config.get("schedule"),
                    restore_delay_minutes=zone_config.get("restore_delay_minutes", 0),
                )
                loaded_entities[uid] = entity
                new_entities.append(entity)

        # Check for removed entities
        current_ids = {zone["unique_id"] for zone in storage.zones}
        removed_ids = [uid for uid in loaded_entities if uid not in current_ids]

        for uid in removed_ids:
            entity = loaded_entities.pop(uid)
            # We should probably remove the entity from HA here if possible,
            # but for now we just drop our reference. The entity remains in HA registry
            # until restart unless we explicitly remove it.

            # 1. Remove from Registry (to prevent zombie caching)
            from homeassistant.helpers import entity_registry as er

            registry = er.async_get(hass)
            if registry.async_get(entity.entity_id):
                registry.async_remove(entity.entity_id)

            # 2. Remove from State Machine
            hass.async_create_task(entity.async_remove())

        if new_entities:
            async_add_entities(new_entities)

    # Add listener
    storage.async_add_listener(_add_or_update_entities)

    # Initial load
    # Initial load
    _add_or_update_entities()
