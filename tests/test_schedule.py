"""Test the Climate Dashboard scheduling logic."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.components.climate import HVACMode
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.climate_dashboard.climate_zone import ClimateZone
from custom_components.climate_dashboard.storage import OverrideType, ScheduleBlock


@pytest.fixture
def mock_schedule() -> list[ScheduleBlock]:
    """Return a mock schedule."""
    return [
        {
            "id": "1",
            "name": "Morning",
            "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            "start_time": "08:00",
            "temp_heat": 21.0,
            "temp_cool": 25.0,
        },
        {
            "id": "2",
            "name": "Night",
            "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            "start_time": "22:00",
            "temp_heat": 18.0,
            "temp_cool": 22.0,
        },
    ]


async def test_schedule_init(hass: HomeAssistant, mock_schedule: list[ScheduleBlock]) -> None:
    """Test initializing with schedule."""
    mock_storage = MagicMock()
    mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}
    zone = ClimateZone(
        hass,
        mock_storage,
        "z1",
        "Zone 1",
        temperature_sensor="sensor.temp",
        heaters=["switch.heater"],
        coolers=[],
        window_sensors=[],
        schedule=mock_schedule,
    )
    assert zone._schedule == mock_schedule


async def test_auto_mode_applies_schedule(hass: HomeAssistant, mock_schedule: list[ScheduleBlock]) -> None:
    """Test switching to AUTO applies correct temp."""
    # Mock time: Monday 10:00 (Matches Morning block)
    now = dt_util.parse_datetime("2023-01-02 10:00:00")  # Jan 2 2023 is Monday

    with patch("homeassistant.util.dt.now", return_value=now):
        mock_storage = MagicMock()
        mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}
        zone = ClimateZone(
            hass,
            mock_storage,
            "z1",
            "Zone 1",
            temperature_sensor="sensor.temp",
            heaters=["switch.heater"],
            coolers=[],
            window_sensors=[],
            schedule=mock_schedule,
        )
        zone.hass = hass
        zone.entity_id = "climate.zone_1"

        # Setup mocks
        with (
            patch.object(zone, "_async_control_actuator", new_callable=AsyncMock),
            patch.object(zone, "async_write_ha_state", new_callable=MagicMock),
        ):
            # Set to AUTO
            zone._attr_hvac_mode = HVACMode.AUTO
            zone._apply_schedule()

            assert zone.target_temperature == 21.0


async def test_auto_mode_night_schedule(hass: HomeAssistant, mock_schedule: list[ScheduleBlock]) -> None:
    """Test switching to AUTO applies night temp."""
    # Mock time: Monday 23:00 (Matches Night block)
    now = dt_util.parse_datetime("2023-01-02 23:00:00")

    with patch("homeassistant.util.dt.now", return_value=now):
        mock_storage = MagicMock()
        mock_storage.settings = {"default_override_type": OverrideType.NEXT_BLOCK}
        zone = ClimateZone(
            hass,
            mock_storage,
            "z1",
            "Zone 1",
            temperature_sensor="sensor.temp",
            heaters=["switch.heater"],
            coolers=[],
            window_sensors=[],
            schedule=mock_schedule,
        )
        zone.hass = hass
        zone.entity_id = "climate.zone_1"

        with (
            patch.object(zone, "_async_control_actuator", new_callable=AsyncMock),
            patch.object(zone, "async_write_ha_state", new_callable=MagicMock),
        ):
            zone._attr_hvac_mode = HVACMode.AUTO
            zone._apply_schedule()

            assert zone.target_temperature == 18.0
