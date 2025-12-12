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

    entities = []
    for zone_config in storage.zones:
        entities.append(
            ClimateZone(
                hass,
                unique_id=zone_config["unique_id"],
                name=zone_config["name"],
                sensor_entity_id=zone_config["sensor"],
                actuator_entity_id=zone_config["actuator"],
                schedule=zone_config.get("schedule"),
            )
        )

    async_add_entities(entities)

    # Listen for updates
    @callback
    def _storage_update() -> None:
        """Handle storage update."""
        # This is tricky: We need to know WHICH items are new.
        # For simple MVP: We only support adding NEW items on restart?
        # OR: We keep track of added IDs.
        pass

    # For MVP 4: We'll require a reload/restart OR we can implement dynamic adding here
    # Dynamic adding requires us to verify what is already added.

    # Better: The 'adopt' command should probably trigger config entry reload if we used config entries.
    # Since we are using legacy platform setup...

    async def _async_add_new_zone(unique_id: str) -> None:
        # Find the zone config
        for zone in storage.zones:
            if zone["unique_id"] == unique_id:
                async_add_entities(
                    [
                        ClimateZone(
                            hass,
                            unique_id=zone["unique_id"],
                            name=zone["name"],
                            sensor_entity_id=zone["sensor"],
                            actuator_entity_id=zone["actuator"],
                        )
                    ]
                )
                return

    # To hook this up, storage needs to emit event or we pass this callback to storage
    # Let's keep it simple: WEBSOCKET command response triggers frontend to reload?
    # Backend-side: Use a callback registry on storage.

    @callback
    def on_storage_change() -> None:
        # Ideally diff and add.
        # Simplified: Just check for items not in our known list?
        # We don't have a persistent known list here easily accessible.
        pass

    # storage.async_add_listener(on_storage_change)
