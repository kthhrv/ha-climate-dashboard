"""Test varied zone configurations."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import HVACMode
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import OverrideType

# Constants
SENSOR_ID = "sensor.temp"
SWITCH_ID = "switch.heater"
CLIMATE_HEATER_ID = "climate.heater"
CLIMATE_COOLER_ID = "climate.ac"


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}
    return storage


@pytest.mark.parametrize(
    "config",
    [
        # 1. Heater Only (Switch)
        {
            "name": "Switch Heater",
            "heaters": [SWITCH_ID],
            "coolers": [],
            "mock_states": {
                SWITCH_ID: ("off", {}),
            },
            "expected_hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO],
        },
        # 2. Heater Only (Climate/TRV)
        {
            "name": "TRV Heater",
            "heaters": [CLIMATE_HEATER_ID],
            "coolers": [],
            "mock_states": {
                CLIMATE_HEATER_ID: (
                    HVACMode.OFF,
                    {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT], "supported_features": 1},
                ),
            },
            "expected_hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO],
        },
        # 3. Cooler Only
        {
            "name": "AC Only",
            "heaters": [],
            "coolers": [CLIMATE_COOLER_ID],
            "mock_states": {
                CLIMATE_COOLER_ID: (
                    HVACMode.OFF,
                    {
                        "hvac_modes": [HVACMode.OFF, HVACMode.COOL],
                        "supported_features": 1,
                        "min_temp": 16,
                        "max_temp": 30,
                    },
                ),
            },
            "expected_hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO, HVACMode.COOL],
        },
        # 4. Dual Mode (Heater + Cooler)
        {
            "name": "Dual Mode",
            "heaters": [SWITCH_ID],
            "coolers": [CLIMATE_COOLER_ID],
            "mock_states": {
                SWITCH_ID: ("off", {}),
                CLIMATE_COOLER_ID: (
                    HVACMode.OFF,
                    {
                        "hvac_modes": [HVACMode.OFF, HVACMode.COOL],
                        "supported_features": 1,
                        "min_temp": 16,
                        "max_temp": 30,
                    },
                ),
            },
            "expected_hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO, HVACMode.COOL],
        },
        # 5. Triple Threat: Dial + TRV + AC
        {
            "name": "Triple Threat",
            "heaters": [CLIMATE_HEATER_ID],
            "coolers": [CLIMATE_COOLER_ID],
            "thermostats": ["climate.dial"],
            "mock_states": {
                CLIMATE_HEATER_ID: (
                    HVACMode.HEAT,
                    {"hvac_modes": [HVACMode.OFF, HVACMode.HEAT], "supported_features": 1},
                ),
                CLIMATE_COOLER_ID: (
                    HVACMode.OFF,
                    {
                        "hvac_modes": [HVACMode.OFF, HVACMode.COOL],
                        "supported_features": 1,
                        "min_temp": 16,
                        "max_temp": 30,
                    },
                ),
                "climate.dial": (
                    HVACMode.AUTO,
                    {
                        "hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL, HVACMode.AUTO],
                        "supported_features": 1,
                    },
                ),
            },
            "expected_hvac_modes": [HVACMode.OFF, HVACMode.HEAT, HVACMode.AUTO, HVACMode.COOL],
        },
    ],
)
async def test_zone_configuration_factory(hass: HomeAssistant, mock_storage: MagicMock, config: dict) -> None:
    """Test a zone configuration from the factory."""
    # 1. Setup Mocks
    hass.states.async_set(SENSOR_ID, "20.0")
    for entity_id, (state, attrs) in config["mock_states"].items():
        hass.states.async_set(entity_id, state, attrs)

    # 2. Create Zone
    zone = ClimateZone(
        hass,
        mock_storage,
        "test_zone",
        config["name"],
        SENSOR_ID,
        heaters=config["heaters"],
        thermostats=config.get("thermostats", []),
        coolers=config["coolers"],
        window_sensors=[],
    )

    # 3. Verify HVAC Modes
    assert zone.hvac_modes == config["expected_hvac_modes"]

    # 4. Verify Basic Control (Heat Mode)
    mock_service = AsyncMock()
    hass.services.async_register("switch", "turn_on", mock_service)
    hass.services.async_register("switch", "turn_off", mock_service)
    hass.services.async_register("climate", "set_temperature", mock_service)
    hass.services.async_register("climate", "set_hvac_mode", mock_service)

    # Activate Heat
    await zone.async_set_hvac_mode(HVACMode.HEAT)
    zone._attr_target_temperature = 25.0  # Demand Heat
    await zone._async_control_actuator()

    # Check if correct devices called
    if config["heaters"]:
        assert mock_service.called

        # 5. Verify Cooling Control (if supported)

        if config["coolers"]:
            mock_service.reset_mock()

            await zone.async_set_hvac_mode(HVACMode.COOL)

            zone._attr_target_temperature = 18.0  # Demand Cool (Current is 20.0)

            await zone._async_control_actuator()

            # Should call set_temp or set_hvac_mode on coolers

            if not mock_service.called:
                print(f"DEBUG: mock_service NOT CALLED for {config['name']}")

                print(f"Zone HVAC Mode: {zone.hvac_mode}, Action: {zone.hvac_action}")

                print(f"Target: {zone.target_temperature}, Current: {zone.current_temperature}")

                # Force another update to see if it triggers

                await zone._async_control_actuator(force=True)

                print(f"After Force - Called: {mock_service.called}")

            assert mock_service.called

            # Check that it tried to set the cooler

            found_cooler_call = False

            for call in mock_service.call_args_list:
                sc = call[0][0]

                # print(f"DEBUG: Service Call {sc.service} on {sc.data.get('entity_id')} with {sc.data}")

                if sc.data.get("entity_id") in config["coolers"]:
                    if sc.service == "set_temperature" and sc.data.get("temperature") == 16.0:
                        found_cooler_call = True

                        break

                    if sc.service == "set_hvac_mode" and sc.data.get("hvac_mode") == HVACMode.COOL:
                        found_cooler_call = True

                        break

            if not found_cooler_call:
                print(f"FAILED to find cooler call for {config['name']}")

                print(f"Actual calls: {[(c[0][0].service, c[0][0].data) for c in mock_service.call_args_list]}")

            assert found_cooler_call
