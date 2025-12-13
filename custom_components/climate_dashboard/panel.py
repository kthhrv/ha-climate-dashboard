"""Panel registration for Climate Dashboard."""

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel as hass_async_register_panel
from homeassistant.core import HomeAssistant

from .const import PANEL_ICON, PANEL_TITLE, PANEL_URL


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the Cool Dashboard panel."""
    # Ensure the URL is registered to serve the static file

    # We must first register the static path
    # We must first register the static path
    import os

    # Check if HTTP component is loaded (it might not be in tests)
    if hasattr(hass, "http") and hass.http:
        current_dir = os.path.dirname(__file__)
        js_path = os.path.join(current_dir, "www", "climate-dashboard.mjs")

        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    PANEL_URL,
                    js_path,
                    cache_headers=False,
                )
            ]
        )

    await hass_async_register_panel(
        hass,
        webcomponent_name="climate-dashboard",
        frontend_url_path="climate-dashboard",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=PANEL_URL,
        embed_iframe=False,
        require_admin=False,
    )
