"""The Climate Dashboard integration."""
from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .panel import async_register_panel

DOMAIN = "climate_dashboard"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Climate Dashboard component."""
    # Register the panel (also works without config entry for simple testing)
    await async_register_panel(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Climate Dashboard from a config entry."""
    await async_register_panel(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return True
