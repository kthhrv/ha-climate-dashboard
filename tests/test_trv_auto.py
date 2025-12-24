from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import ClimateEntityFeature, HVACMode
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone


@pytest.mark.asyncio
async def test_heater_auto_mode_priority(hass: HomeAssistant) -> None:
    """Test that heaters prioritize AUTO mode over HEAT if available."""

    # Mock Storage
    mock_storage = AsyncMock()
    mock_storage.settings = {}

    # Mock Zone Config (removed unused variable)

    # Setup Mocks for Heaters
    # 1. TRV supporting AUTO and HEAT
    hass.states.async_set(
        "climate.trv_auto",
        HVACMode.OFF,
        {
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "current_temperature": 18,
        },
    )

    # 2. Generic Thermostat supporting only HEAT
    hass.states.async_set(
        "climate.generic_heat",
        HVACMode.OFF,
        {
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
            "current_temperature": 18,
        },
    )

    # Mock Temp Sensor
    hass.states.async_set("sensor.temp", "20.0", {"unit_of_measurement": "°C"})

    # Create a full mock for hass to avoid read-only issues
    mock_hass = MagicMock(spec=HomeAssistant)
    mock_hass.states = hass.states
    mock_hass.config = MagicMock()
    mock_hass.config.units.temperature_unit = "°C"
    mock_hass.services = MagicMock()
    mock_hass.services.async_call = AsyncMock()
    mock_hass.async_create_task = hass.async_create_task

    # Initialize Zone with mock_hass
    zone = ClimateZone(
        mock_hass,
        mock_storage,
        "zone_test",
        "Test Zone",
        "sensor.temp",
        ["climate.trv_auto", "climate.generic_heat"],
        [],
        [],
        [],
        [],
    )
    zone.entity_id = "climate.zone_test"

    # Set targets
    zone._attr_target_temperature = 22.0

    # Trigger Heating Demand
    # Current temp 20, Target 22 -> HEATING
    await zone._async_set_heaters(enable=True)

    # Checks
    mock_service = mock_hass.services.async_call

    # Filter calls for our specific entities
    # Helper to extract entity_id from call
    def get_eid(c: Any) -> str | None:
        data = c.kwargs.get("service_data")
        if data is None and len(c.args) > 2:
            data = c.args[2]
        return cast(str | None, data.get("entity_id") if data else None)

    trv_calls = [c for c in mock_service.call_args_list if get_eid(c) == "climate.trv_auto"]
    generic_calls = [c for c in mock_service.call_args_list if get_eid(c) == "climate.generic_heat"]

    # Verify TRV got AUTO
    trv_modes = []
    for call in trv_calls:
        # Check kwargs first
        data = call.kwargs.get("service_data")
        # If not there, check positional arg 2 (domain, service, service_data)
        if data is None and len(call.args) > 2:
            data = call.args[2]

        if data and "hvac_mode" in data:
            trv_modes.append(data["hvac_mode"])

    # It might be in set_temperature call or set_hvac_mode call
    assert HVACMode.AUTO in trv_modes, f"TRV should use AUTO mode for manual control. Got: {trv_modes}"
    # assert HVACMode.HEAT not in trv_modes, "TRV should NOT use HEAT mode if AUTO is available"

    # Verify Generic got HEAT
    generic_modes = []
    for call in generic_calls:
        data = call.kwargs.get("service_data")
        if data is None and len(call.args) > 2:
            data = call.args[2]

        if data and "hvac_mode" in data:
            generic_modes.append(data["hvac_mode"])

    assert HVACMode.HEAT in generic_modes, f"Generic should use HEAT mode. Got: {generic_modes}"
