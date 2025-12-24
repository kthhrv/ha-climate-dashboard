"""Test Actuator logic."""

from unittest.mock import AsyncMock

from homeassistant.components.climate import ClimateEntityFeature, HVACMode
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.actuator import ActuatorType, ClimateActuator


async def test_climate_actuator_auto_priority(hass: HomeAssistant) -> None:
    """Test that ClimateActuator prioritizes AUTO over HEAT."""

    # 1. Setup Mock Entity with HEAT and AUTO
    ENTITY_ID = "climate.trv_smart"
    hass.states.async_set(
        ENTITY_ID,
        HVACMode.OFF,
        {
            "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO],
            "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE,
        },
    )

    # 2. Initialize Actuator
    actuator = ClimateActuator(hass, ENTITY_ID, ActuatorType.HEATER, is_internal_sensor=True)

    # 3. Mock Service Call
    mock_service = AsyncMock()
    hass.services.async_register("climate", "set_temperature", mock_service)
    hass.services.async_register("climate", "set_hvac_mode", mock_service)

    # 4. Control (Heat ON)
    await actuator.async_control(enable=True, target_temp=21.0)

    # 5. Verify it chose AUTO mode
    assert mock_service.called

    # Check all calls to find set_temperature
    found_temp_call = False
    for call in mock_service.call_args_list:
        service_call = call[0][0]
        if service_call.service == "set_temperature":
            data = service_call.data
            if data["entity_id"] == ENTITY_ID:
                assert data["hvac_mode"] == HVACMode.AUTO
                assert data["temperature"] == 21.0
                found_temp_call = True
                break

    assert found_temp_call, "Did not find set_temperature call with correct parameters"


async def test_climate_actuator_fallback_to_heat(hass: HomeAssistant) -> None:
    """Test that ClimateActuator falls back to HEAT if AUTO is missing."""

    # 1. Setup Mock Entity with HEAT ONLY
    ENTITY_ID = "climate.trv_dumb"
    hass.states.async_set(
        ENTITY_ID,
        HVACMode.OFF,
        {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT], "supported_features": ClimateEntityFeature.TARGET_TEMPERATURE},
    )

    # 2. Initialize Actuator
    actuator = ClimateActuator(hass, ENTITY_ID, ActuatorType.HEATER, is_internal_sensor=True)

    # 3. Mock Service Call
    mock_service = AsyncMock()
    hass.services.async_register("climate", "set_temperature", mock_service)
    hass.services.async_register("climate", "set_hvac_mode", mock_service)

    # 4. Control (Heat ON)
    await actuator.async_control(enable=True, target_temp=21.0)

    # 5. Verify it chose HEAT mode
    assert mock_service.called
    call = mock_service.call_args[0][0]
    data = call.data

    assert data["entity_id"] == ENTITY_ID
    assert data["hvac_mode"] == HVACMode.HEAT
