"""Test Occupancy Setback Logic (Reduce By)."""

from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.climate import HVACMode
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import ClimateDashboardStorage, ScheduleBlock

SENSOR_ID = "sensor.temp"
SWITCH_ID = "switch.heater"
PRESENCE_ID = "binary_sensor.presence"


@pytest.mark.asyncio
async def test_occupancy_setback_offset(hass: HomeAssistant) -> None:
    """Test that occupancy setback reduces the scheduled temperature."""
    storage = ClimateDashboardStorage(hass)
    await storage.async_load()

    # Define a schedule
    schedule: list[ScheduleBlock] = [
        {
            "name": "All Day",
            "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            "start_time": "00:00",
            "temp_heat": 20.0,
            "temp_cool": 25.0,
        }
    ]

    zone = ClimateZone(
        hass,
        storage,
        "zone_occupancy",
        "Occupancy Zone",
        SENSOR_ID,
        heaters=[SWITCH_ID],
        thermostats=[],
        coolers=[],
        window_sensors=[],
        presence_sensors=[PRESENCE_ID],
        occupancy_timeout_minutes=1,  # 1 minute timeout
        occupancy_setback_temp=2.0,  # Reduce by 2 degrees
        schedule=schedule,
    )

    # Mock Services
    zone.hass.services = MagicMock()
    zone.hass.services.async_call = AsyncMock()

    # Setup Sensor
    hass.states.async_set(SENSOR_ID, "19.0")
    # Setup Presence (Occupied initially)
    hass.states.async_set(PRESENCE_ID, "on")

    # Setup Zone
    zone._attr_hvac_mode = HVACMode.AUTO

    # Init
    await zone.async_added_to_hass()

    # 1. Verify Initial State (Occupied -> Schedule)
    # Schedule says 20.0 Heat. Single mode -> target = low = 20.0.
    assert zone.target_temperature == 20.0

    # 2. Leave Room (Unoccupied)
    hass.states.async_set(PRESENCE_ID, "off")
    await hass.async_block_till_done()

    # Not yet timed out (last presence was NOW)
    assert zone.target_temperature == 20.0

    # 3. Advance Time > 1 minute
    # We need to trigger the time change callback or manual reconcile
    # Simulating time passage involves hacking dt_util or just calling the callback if accessible
    # ClimateZone listens to time changes.
    # Let's mock dt_util.now inside the module?
    # Or just inject a fake timestamp into _last_presence_timestamp?

    # Access private attribute for testing
    zone._last_presence_timestamp = dt_util.now() - timedelta(minutes=2)

    # Trigger reconcile
    await zone._async_reconcile()

    # 4. Verify Setback Applied
    # Heat: 20.0 - 2.0 = 18.0
    assert zone.target_temperature == 18.0

    # Verify Low/High
    assert zone.target_temperature_low == 18.0
    assert zone.target_temperature_high == 27.0  # 25.0 + 2.0

    # 5. Return to Room
    hass.states.async_set(PRESENCE_ID, "on")
    await hass.async_block_till_done()

    # Should revert to Schedule
    assert zone.target_temperature == 20.0
