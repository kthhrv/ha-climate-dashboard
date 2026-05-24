"""Test end-to-end AC unit control via zone reconciliation."""

from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.reconciler import Reconciler


@pytest.fixture
def reconciler(hass: HomeAssistant) -> Reconciler:
    return Reconciler(hass)


def _set_state(hass: HomeAssistant, entity_id: str, state: str) -> None:
    hass.states.async_set(entity_id, state)


def _extract_calls(mock_call: AsyncMock) -> set[tuple]:
    """Extract (domain, service) pairs from call_args_list."""
    return {(c.args[0], c.args[1]) for c in mock_call.call_args_list}


def _extract_full_calls(mock_call: AsyncMock) -> set[tuple]:
    """Extract (domain, service, sorted_data_items) tuples from call_args_list."""
    return {(c.args[0], c.args[1], tuple(sorted(c.args[2].items()))) for c in mock_call.call_args_list}


AC_CONFIG = {
    "power": "switch.pb5000_power",
    "mode": "select.pb5000_mode",
    "fan_speed": "select.pb5000_fan_speed",
}


async def test_cooling_ramp_down_sequence(hass: HomeAssistant, reconciler: Reconciler) -> None:
    """Simulate a room cooling from 27C to 20C with target 22C (should_cool=True).

    Verify the AC transitions through the expected states:
    27C -> COOL/high, 22.5C -> COOL/low, 21.5C -> FAN/low, 20.5C -> off
    """
    _set_state(hass, "switch.pb5000_power", "off")
    _set_state(hass, "select.pb5000_mode", "FAN")
    _set_state(hass, "select.pb5000_fan_speed", "low")

    temps_and_expected = [
        (27.0, "on", "COOL", "high"),
        (22.5, "on", "COOL", "low"),
        (21.5, "on", "FAN", "low"),
        (20.5, "off", "FAN", "low"),
    ]

    for temp, exp_power, exp_mode, exp_fan in temps_and_expected:
        with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock):
            await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0)

        _set_state(hass, "switch.pb5000_power", exp_power)
        _set_state(hass, "select.pb5000_mode", exp_mode)
        _set_state(hass, "select.pb5000_fan_speed", exp_fan)

        with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
            await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0)
            mock_call.assert_not_called()


async def test_fan_circulation_without_should_cool(hass: HomeAssistant, reconciler: Reconciler) -> None:
    """When should_cool=False but temp near target, FAN circulation runs (no compressor)."""
    _set_state(hass, "switch.pb5000_power", "off")
    _set_state(hass, "select.pb5000_mode", "COOL")
    _set_state(hass, "select.pb5000_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=False, current_temp=24.5, target_temp=25.0)

        calls = _extract_full_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.pb5000_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.pb5000_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.pb5000_fan_speed"), ("option", "low"))) in calls


async def test_power_off_when_well_below_target(hass: HomeAssistant, reconciler: Reconciler) -> None:
    """When temp is well below target (> 1C below), AC powers off completely."""
    _set_state(hass, "switch.pb5000_power", "on")
    _set_state(hass, "select.pb5000_mode", "FAN")
    _set_state(hass, "select.pb5000_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=False, current_temp=20.0, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off") in calls
