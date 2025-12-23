"""Schedule management logic for Climate Dashboard."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from .storage import ScheduleBlock


@dataclass
class NextChange:
    """Representation of the next scheduled change."""

    time: datetime
    temp_heat: float | None
    temp_cool: float | None


@dataclass
class ScheduleSetting:
    """Active settings from the schedule."""

    temp_heat: float
    temp_cool: float


class ScheduleManager:
    """Manages schedule lookups and continuity logic."""

    def __init__(self, schedule: list[ScheduleBlock]) -> None:
        """Initialize."""
        self.schedule = schedule

    def get_active_setting(self, now: datetime) -> ScheduleSetting | None:
        """Get the currently active setting based on time and lookback logic."""
        if not self.schedule:
            return None

        day_name = now.strftime("%a").lower()
        current_time_str = now.strftime("%H:%M")

        active_block = None

        # 1. Check today
        todays_blocks = [b for b in self.schedule if day_name in b["days"]]
        todays_blocks.sort(key=lambda b: b["start_time"])

        for block in todays_blocks:
            if block["start_time"] <= current_time_str:
                active_block = block
            else:
                break

        if not active_block:
            # 2. Lookback Logic: Check previous days
            days_map = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
            current_day_idx = now.weekday()

            for i in range(1, 8):
                prev_day_idx = (current_day_idx - i) % 7
                prev_day_name = days_map[prev_day_idx]

                prev_day_blocks = [b for b in self.schedule if prev_day_name in b["days"]]
                if prev_day_blocks:
                    # Sort by start time and take the LAST block of that day
                    prev_day_blocks.sort(key=lambda b: b["start_time"])
                    active_block = prev_day_blocks[-1]
                    break

        if active_block:
            return ScheduleSetting(
                temp_heat=active_block.get("temp_heat", 20.0),
                temp_cool=active_block.get("temp_cool", 24.0),
            )

        return None

    def get_next_change(self, now: datetime) -> NextChange | None:
        """Calculate the next upcoming schedule change."""
        if not self.schedule:
            return None

        days_map = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
        current_day_idx = now.weekday()
        current_time_str = now.strftime("%H:%M")

        # 1. Search remaining blocks today
        day_name = days_map[current_day_idx]
        todays_blocks = [b for b in self.schedule if day_name in b["days"]]
        todays_blocks.sort(key=lambda b: b["start_time"])

        for block in todays_blocks:
            if block["start_time"] > current_time_str:
                next_dt = now.replace(
                    hour=int(block["start_time"][:2]),
                    minute=int(block["start_time"][3:]),
                    second=0,
                    microsecond=0,
                )
                return NextChange(
                    time=next_dt,
                    temp_heat=block.get("temp_heat"),
                    temp_cool=block.get("temp_cool"),
                )

        # 2. Search next days
        for i in range(1, 8):
            next_day_idx = (current_day_idx + i) % 7
            next_day_name = days_map[next_day_idx]

            next_day_blocks = [b for b in self.schedule if next_day_name in b["days"]]
            if next_day_blocks:
                next_day_blocks.sort(key=lambda b: b["start_time"])
                first_block = next_day_blocks[0]

                next_dt = now + timedelta(days=i)
                next_dt = next_dt.replace(
                    hour=int(first_block["start_time"][:2]),
                    minute=int(first_block["start_time"][3:]),
                    second=0,
                    microsecond=0,
                )
                return NextChange(
                    time=next_dt,
                    temp_heat=first_block.get("temp_heat"),
                    temp_cool=first_block.get("temp_cool"),
                )

        return None
