"""Unit tests for the Reconciliation Engine."""

from datetime import datetime, timedelta

import pytest
from homeassistant.components.climate import HVACAction, HVACMode

from custom_components.climate_dashboard.engine import (
    ClimateIntent,
    IntentSource,
    ReconciliationEngine,
    TargetSetpoints,
)


@pytest.fixture
def engine() -> ReconciliationEngine:
    return ReconciliationEngine(tolerance=0.5)


@pytest.fixture
def now() -> datetime:
    return datetime(2023, 1, 1, 12, 0, 0)


def test_empty_intents(engine: ReconciliationEngine, now: datetime) -> None:
    desired = engine.calculate_desired_state([], 20.0, now)
    assert desired.mode == HVACMode.OFF
    assert desired.action == HVACAction.OFF
    assert desired.reason == "No Active Intents"


def test_window_open_priority(engine: ReconciliationEngine, now: datetime) -> None:
    intents = [ClimateIntent(IntentSource.MANUAL_APP, HVACMode.HEAT, TargetSetpoints(target=25.0))]
    desired = engine.calculate_desired_state(intents, 20.0, now, is_window_open=True)
    assert desired.mode == HVACMode.OFF
    assert desired.reason == "Window Open"


def test_heating_logic(engine: ReconciliationEngine, now: datetime) -> None:
    intents = [ClimateIntent(IntentSource.SCHEDULE, HVACMode.HEAT, TargetSetpoints(target=21.0))]
    # Current < Target - Tolerance (20 < 20.5) -> HEAT
    desired = engine.calculate_desired_state(intents, 20.0, now)
    assert desired.action == HVACAction.HEATING

    # Current > Target - Tolerance (20.6 > 20.5) -> IDLE
    desired = engine.calculate_desired_state(intents, 20.6, now)
    assert desired.action == HVACAction.IDLE


def test_intent_priority(engine: ReconciliationEngine, now: datetime) -> None:
    intents = [
        ClimateIntent(IntentSource.SCHEDULE, HVACMode.HEAT, TargetSetpoints(target=20.0)),
        ClimateIntent(IntentSource.MANUAL_APP, HVACMode.HEAT, TargetSetpoints(target=25.0)),
    ]
    # Manual should win
    desired = engine.calculate_desired_state(intents, 20.0, now)
    assert desired.setpoints.target == 25.0
    assert "manual_app" in desired.reason


def test_expiration(engine: ReconciliationEngine, now: datetime) -> None:
    expired = now - timedelta(hours=1)

    intents = [
        ClimateIntent(IntentSource.SCHEDULE, HVACMode.HEAT, TargetSetpoints(target=20.0)),
        ClimateIntent(IntentSource.MANUAL_APP, HVACMode.HEAT, TargetSetpoints(target=25.0), expires_at=expired),
    ]

    # Manual expired, Schedule should win
    desired = engine.calculate_desired_state(intents, 20.0, now)
    assert desired.setpoints.target == 20.0
