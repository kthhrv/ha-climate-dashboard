"""Climate platform for Climate Dashboard."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .climate_zone import ClimateZone

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Climate Dashboard platform."""

    # In a real implementation we would load these from storage
    # For MVP verification, we create a TEST ZONE

    # We will assume a 'sensor.test_temp' and 'switch.test_heater' exist
    # (or users can create helpers)
    # The user logic in GEMINI.md says "Adoption", but for 'The Engine' verification
    # we need an entity to act on.

    test_zone = ClimateZone(
        hass,
        unique_id="zone_test_office",
        name="Test Office",
        sensor_entity_id="sensor.test_temperature",
        actuator_entity_id="switch.test_heater",
    )

    async_add_entities([test_zone])
