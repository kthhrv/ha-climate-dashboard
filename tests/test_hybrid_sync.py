"""Test Hybrid Sync Logic (Dual Zone + Single Dial)."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import HVACMode
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, State

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import OverrideType

# Entities
HEATER_ID = "climate.heater"
COOLER_ID = "climate.cooler"
DIAL_ID = "climate.dial"
SENSOR_ID = "sensor.room_temp"
ZONE_ID = "zone_hybrid"


@pytest.fixture
def mock_storage() -> MagicMock:
    """Mock storage."""
    storage = MagicMock()
    storage.settings = {
        "default_override_type": OverrideType.NEXT_BLOCK,
        "default_timer_minutes": 60,
        "is_away_mode_on": False,
    }
    return storage


@pytest.fixture
def set_temp_mock() -> AsyncMock:
    """Mock for set_temperature service."""
    return AsyncMock()


@pytest.fixture
async def hybrid_zone(hass: HomeAssistant, mock_storage: MagicMock, set_temp_mock: AsyncMock) -> ClimateZone:
    """Create a Hybrid Zone (Heater + Cooler + Dial)."""
    # Register Services
    hass.services.async_register("climate", "set_hvac_mode", AsyncMock())
    # Register our spy mock
    hass.services.async_register("climate", "set_temperature", set_temp_mock)

    # Setup initial states
    hass.states.async_set(HEATER_ID, HVACMode.OFF, {"current_temperature": 20})
    hass.states.async_set(COOLER_ID, HVACMode.OFF, {"current_temperature": 20})
    hass.states.async_set(
        DIAL_ID,
        HVACMode.HEAT,
        {"temperature": 20.0, "current_temperature": 20, "supported_features": 1},
    )  # Target Temp supported
    hass.states.async_set(SENSOR_ID, "20.0")

    zone = ClimateZone(
        hass,
        mock_storage,
        unique_id=ZONE_ID,
        name="Hybrid Room",
        temperature_sensor=SENSOR_ID,
        heaters=[HEATER_ID],
        coolers=[COOLER_ID],
        thermostats=[DIAL_ID],
        window_sensors=[],
        schedule=[],
    )

    # Force Auto Mode (Dual)
    zone._attr_hvac_mode = HVACMode.AUTO
    # Set Initial Range
    zone._attr_target_temperature_low = 20.0
    zone._attr_target_temperature_high = 23.0
    zone._attr_target_temperature = None  # Should be None in Auto/Range mode

    # Fake add to hass
    await zone.async_added_to_hass()
    # End startup grace period to allow upstream sync
    zone._startup_grace_period = False
    return zone


@pytest.mark.asyncio
async def test_upstream_sync_shift_range(
    hybrid_zone: ClimateZone, hass: HomeAssistant, set_temp_mock: AsyncMock
) -> None:
    """Test that changing the Dial shifts the Zone range without fighting."""

    # 1. Verify Initial State
    assert hybrid_zone.target_temperature_low == 20.0
    assert hybrid_zone.target_temperature_high == 23.0

    # 2. Simulate Dial Change (User turns dial to 21.0)
    # This triggers _async_thermostat_changed
    new_state = State(DIAL_ID, HVACMode.HEAT, {"temperature": 21.0, "current_temperature": 20})
    old_state = State(DIAL_ID, HVACMode.HEAT, {"temperature": 20.0, "current_temperature": 20})

    event = MagicMock()
    event.data = {"entity_id": DIAL_ID, "new_state": new_state, "old_state": old_state}

    # Manually trigger the callback
    hybrid_zone._async_thermostat_changed(event)
    await hass.async_block_till_done()

    # 3. Verify Zone Updated
    # Logic should shift range by +1.0 (21.0 - 20.0)
    # Low: 21.0, High: 24.0
    assert hybrid_zone._attr_target_temperature_low == 21.0
    assert hybrid_zone._attr_target_temperature_high == 24.0

    # 4. Verify Downstream Sync (Fighting Check)
    # Trigger control loop (which calls _async_sync_thermostats)
    await hybrid_zone._async_control_actuator()

    # Re-run control
    # Currently: Zone Low=21.0. Dial=21.0.
    # Expectation: NO call to set_temperature on Dial.

    # We must ensure hass.states reflects the 'new' dial state so sync checks against it
    hass.states.async_set(DIAL_ID, HVACMode.HEAT, {"temperature": 21.0, "current_temperature": 20})

    # Clear previous calls
    set_temp_mock.reset_mock()
    await hybrid_zone._async_sync_thermostats()

    # Verify NO calls to set_temperature for DIAL_ID
    # Because Zone Low (21) == Dial (21)
    for call in set_temp_mock.call_args_list:
        service_call = call.args[0]
        data = service_call.data
        if data[ATTR_ENTITY_ID] == DIAL_ID:
            msg = f"Zone fought back! Sent {data} to Dial when Dial was already 21.0"
            raise AssertionError(msg)


@pytest.mark.asyncio
async def test_upstream_sync_fight_scenario(
    hybrid_zone: ClimateZone, hass: HomeAssistant, set_temp_mock: AsyncMock
) -> None:
    """Test the scenario where fighting occurs (if logic is wrong)."""

    # Scenario: Zone thinks Low is 20. Dial turns to 22.
    # If Zone fails to update, it will force Dial back to 20.

    hass.states.async_set(DIAL_ID, HVACMode.HEAT, {"temperature": 22.0})

    # Trigger Change
    new_state = State(DIAL_ID, HVACMode.HEAT, {"temperature": 22.0})
    old_state = State(DIAL_ID, HVACMode.HEAT, {"temperature": 20.0})
    event = MagicMock()
    event.data = {"new_state": new_state, "old_state": old_state}

    hybrid_zone._async_thermostat_changed(event)
    await hass.async_block_till_done()

    # Expect Zone Update
    assert hybrid_zone._attr_target_temperature_low == 22.0
    assert hybrid_zone._attr_target_temperature_high == 25.0  # Shift +2

    # Now check Sync
    set_temp_mock.reset_mock()
    await hybrid_zone._async_sync_thermostats()

    # Should be quiet
    assert set_temp_mock.call_count == 0
