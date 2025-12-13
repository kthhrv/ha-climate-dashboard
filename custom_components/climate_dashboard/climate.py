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

    # Keep track of added entities
    added_ids: set[str] = set()

    @callback
    def _add_new_entities() -> None:
        """Add new entities from storage."""
        new_entities = []
        for zone_config in storage.zones:
            # unique_id is guaranteed by ClimateZoneConfig
            uid = zone_config["unique_id"]
            if uid not in added_ids:
                new_entities.append(
                    ClimateZone(
                        hass,
                        unique_id=uid,
                        name=zone_config["name"],
                        temperature_sensor=zone_config["temperature_sensor"],
                        heaters=zone_config["heaters"],
                        coolers=zone_config["coolers"],
                        window_sensors=zone_config["window_sensors"],
                        schedule=zone_config.get("schedule"),
                    )
                )
                added_ids.add(uid)

        if new_entities:
            async_add_entities(new_entities)

    # Add listener
    storage.async_add_listener(_add_new_entities)

    # Initial load
    _add_new_entities()
