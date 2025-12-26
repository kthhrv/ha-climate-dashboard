"""Core logic engine for Climate Dashboard."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from homeassistant.components.climate import HVACAction, HVACMode


class IntentSource(Enum):
    """Source of a user intent."""

    SCHEDULE = "schedule"
    MANUAL_APP = "manual_app"
    MANUAL_DIAL = "manual_dial"
    SAFETY = "safety"
    AWAY_MODE = "away_mode"


@dataclass(frozen=True)
class TargetSetpoints:
    """Target temperatures for a zone."""

    target: float | None = None
    low: float | None = None
    high: float | None = None

    def matches(self, other: TargetSetpoints, epsilon: float = 0.1) -> bool:
        """Check if setpoints match within tolerance."""

        def val_match(v1: float | None, v2: float | None) -> bool:
            if v1 is None and v2 is None:
                return True
            if v1 is None or v2 is None:
                return False
            return abs(v1 - v2) < epsilon

        return (
            val_match(self.target, other.target) and val_match(self.low, other.low) and val_match(self.high, other.high)
        )


@dataclass
class ClimateIntent:
    """Represents a user or system intent to achieve a state."""

    source: IntentSource
    mode: HVACMode
    setpoints: TargetSetpoints
    expires_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.now)


@dataclass
class DesiredState:
    """The calculated goal for the hardware."""

    mode: HVACMode
    setpoints: TargetSetpoints
    action: HVACAction = HVACAction.OFF
    reason: str = ""


class ReconciliationEngine:
    """Calculates the desired state based on current intents and environmental factors."""

    def __init__(self, tolerance: float = 0.3):
        self.tolerance = tolerance

    def calculate_desired_state(
        self,
        intents: list[ClimateIntent],
        current_temp: float | None,
        now: datetime,
        is_window_open: bool = False,
    ) -> DesiredState:
        """
        Determine what the HVAC system should be doing.

        Priority:
        1. Safety/Window (Force OFF)
        2. Manual Overrides (Most recent first)
        3. Global Away Mode
        4. Schedule (Default)
        """

        # 1. Hard Constraints
        if is_window_open:
            return DesiredState(
                mode=HVACMode.OFF, setpoints=TargetSetpoints(), action=HVACAction.OFF, reason="Window Open"
            )

        # Filter Expired Intents
        active_intents = [i for i in intents if i.expires_at is None or i.expires_at > now]

        if not active_intents:
            return DesiredState(
                mode=HVACMode.OFF, setpoints=TargetSetpoints(), action=HVACAction.OFF, reason="No Active Intents"
            )

        # 2. Find Winning Intent (highest priority source, then newest)
        # Sort by IntentSource priority and then age
        priority_map = {
            IntentSource.SAFETY: 0,
            IntentSource.MANUAL_APP: 1,
            IntentSource.MANUAL_DIAL: 1,
            IntentSource.AWAY_MODE: 2,
            IntentSource.SCHEDULE: 3,
        }

        sorted_intents = sorted(
            active_intents, key=lambda i: (priority_map.get(i.source, 99), -i.created_at.timestamp())
        )
        winner = sorted_intents[0]

        # 3. Calculate Action based on Current Temp
        action = HVACAction.IDLE
        if current_temp is not None:
            if winner.mode == HVACMode.HEAT:
                if winner.setpoints.target and current_temp < (winner.setpoints.target - self.tolerance):
                    action = HVACAction.HEATING
            elif winner.mode == HVACMode.COOL:
                if winner.setpoints.target and current_temp > (winner.setpoints.target + self.tolerance):
                    action = HVACAction.COOLING
            elif winner.mode == HVACMode.AUTO:
                low = winner.setpoints.low
                high = winner.setpoints.high
                if low is not None and current_temp < (low - self.tolerance):
                    action = HVACAction.HEATING
                elif high is not None and current_temp > (high + self.tolerance):
                    action = HVACAction.COOLING

        return DesiredState(
            mode=winner.mode, setpoints=winner.setpoints, action=action, reason=f"Intent: {winner.source.value}"
        )
