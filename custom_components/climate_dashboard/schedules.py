"""Default schedule templates for Climate Dashboard."""

from __future__ import annotations

from .storage import ScheduleBlock

ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
WEEKDAYS = ["mon", "tue", "wed", "thu", "fri"]
WEEKEND = ["sat", "sun"]


def get_default_schedule(room_type: str) -> list[ScheduleBlock]:
    """Get default schedule for a room type."""
    if room_type == "bedroom":
        return [
            {
                "name": "Wake Up",
                "days": ALL_DAYS,
                "start_time": "07:00",
                "temp_heat": 20.0,
                "temp_cool": 24.0,
            },
            {
                "name": "Day",
                "days": ALL_DAYS,
                "start_time": "09:00",
                "temp_heat": 18.0,
                "temp_cool": 22.0,
            },
            {
                "name": "Evening",
                "days": ALL_DAYS,
                "start_time": "17:00",
                "temp_heat": 20.0,
                "temp_cool": 24.0,
            },
            {
                "name": "Sleep",
                "days": ALL_DAYS,
                "start_time": "22:00",
                "temp_heat": 18.0,
                "temp_cool": 22.0,
            },
        ]
    elif room_type == "living_room":
        return [
            {
                "name": "Morning",
                "days": ALL_DAYS,
                "start_time": "07:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            },
            {
                "name": "Night",
                "days": ALL_DAYS,
                "start_time": "23:00",
                "temp_heat": 17.0,
                "temp_cool": 21.0,
            },
        ]
    elif room_type == "office":
        return [
            {
                "name": "Work Start",
                "days": WEEKDAYS,
                "start_time": "08:00",
                "temp_heat": 21.0,
                "temp_cool": 25.0,
            },
            {
                "name": "Work End",
                "days": WEEKDAYS,
                "start_time": "18:00",
                "temp_heat": 16.0,
                "temp_cool": 20.0,
            },
            # Weekend? Maybe generic setback
            {
                "name": "Weekend",
                "days": WEEKEND,
                "start_time": "00:00",
                "temp_heat": 16.0,
                "temp_cool": 20.0,
            },
        ]
    else:
        # Generic
        return [
            {
                "name": "Day",
                "days": ALL_DAYS,
                "start_time": "08:00",
                "temp_heat": 20.0,
                "temp_cool": 24.0,
            },
            {
                "name": "Night",
                "days": ALL_DAYS,
                "start_time": "22:00",
                "temp_heat": 18.0,
                "temp_cool": 22.0,
            },
        ]
