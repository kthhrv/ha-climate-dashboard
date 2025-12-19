"""The Climate Dashboard integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .coordinator import ClimateDashboardCoordinator
from .panel import async_register_panel
from .storage import ClimateDashboardStorage
from .websocket import async_register_api

PLATFORMS = ["climate"]
DOMAIN = "climate_dashboard"  # Temporary for syntax correctness


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Climate Dashboard component."""
    hass.data.setdefault(DOMAIN, {})

    # Init Storage
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()
    hass.data[DOMAIN]["storage"] = storage

    # Init Coordinator (Manages Home/Away logic)
    coordinator = ClimateDashboardCoordinator(hass, storage)
    hass.data[DOMAIN]["coordinator"] = coordinator

    # Register the panel (also works without config entry for simple testing)
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

    # Use async_forward_entry_setup is for config entries, but we are using async_setup for MVP
    # We need to load platform manually for now as we don't have a config entry yet?
    # Actually, custom components usually use config entries or discovery.
    # For MVP Skeleton we used async_setup.
    # To load the climate platform, we should use discovery or add a config entry.
    # Easiest for MVP: Use helpers.discovery
    from homeassistant.helpers.discovery import async_load_platform

    hass.async_create_task(async_load_platform(hass, "climate", DOMAIN, {}, config))

    async def _async_shutdown(event: Any) -> None:
        """Shutdown the coordinator and circuits."""
        coordinator.shutdown()
        for c in circuits:
            await c.async_shutdown()

    from homeassistant.const import EVENT_HOMEASSISTANT_STOP

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, _async_shutdown)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Climate Dashboard from a config entry."""
    await async_register_panel(hass)
    async_register_api(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return True
