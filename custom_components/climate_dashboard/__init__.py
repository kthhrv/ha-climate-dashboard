"""The Climate Dashboard integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .coordinator import ClimateDashboardCoordinator
from .panel import async_register_panel
from .storage import ClimateDashboardStorage
from .websocket import async_register_api

PLATFORMS = ["climate"]
DOMAIN = "climate_dashboard"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Climate Dashboard component."""
    # With config flow, we don't do much here unless we want to support YAML config too (which we don't for now)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Climate Dashboard from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Init Storage
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()
    hass.data[DOMAIN]["storage"] = storage

    # Init Coordinator (Manages Home/Away logic)
    coordinator = ClimateDashboardCoordinator(hass, storage)
    hass.data[DOMAIN]["coordinator"] = coordinator

    # Register the panel
    await async_register_panel(hass)

    # Register WebSocket API
    async_register_api(hass)

    # Init Circuits
    from .circuit import HeatingCircuit

    circuits: list[HeatingCircuit] = []

    for circuit_conf in storage.circuits:
        c = HeatingCircuit(hass, storage, circuit_conf)
        await c.async_initialize()
        circuits.append(c)

    hass.data[DOMAIN]["circuits"] = circuits

    # Forward setup to platform (Climate entities)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def _async_shutdown(event: Any) -> None:
        """Shutdown the coordinator and circuits."""
        coordinator.shutdown()
        for c in circuits:
            await c.async_shutdown()

    # We should probably register this on unload, but for now global stop is ok.
    # Actually, proper way is entry.async_on_unload
    entry.async_on_unload(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _async_shutdown))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        # We could cleanup hass.data etc, but technically not strictly required for MVP reload
        # but good practice
        pass

    return bool(unload_ok)
