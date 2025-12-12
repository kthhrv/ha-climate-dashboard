"""Panel registration for Climate Dashboard."""
from homeassistant.core import HomeAssistant

DOMAIN = "climate_dashboard"
PANEL_URL = "/climate_dashboard/climate-dashboard.mjs"
PANEL_TITLE = "Climate"
PANEL_ICON = "mdi:thermostat"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the Cool Dashboard panel."""
    # Ensure the URL is registered to serve the static file
    # In full implementation, we might need a custom view to serve this if not in www
    # But often referencing the file in local folder is enough if we register it as a resource
    # For now, we assume simple panel registration.

    # We must first register the static path
    hass.http.register_static_path(
        PANEL_URL,
        hass.config.path(f"custom_components/{DOMAIN}/www/climate-dashboard.mjs"),
    )

    await hass.components.frontend.async_register_panel(
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path="climate-dashboard",
        config={
            "_panel_custom": {
                "name": "climate-dashboard",
                "embed_iframe": False,
                "trust_external": False,
                "js_url": PANEL_URL,
            }
        },
        require_admin=False,
    )
