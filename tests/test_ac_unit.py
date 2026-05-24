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


AC_CONFIG = {
    "power": "switch.pb5000_power",
    "mode": "select.pb5000_mode",
    "fan_speed": "select.pb5000_fan_speed",
}


async def test_cooling_ramp_down_sequence(hass: HomeAssistant, reconciler: Reconciler) -> None:
    """Simulate a room cooling from 27C to 20C with target 22C.

    Verify the AC transitions through the expected states:
    27C -> COOL/high, 23C -> COOL/high, 22.5C -> COOL/low,
    21.5C -> FAN/low, 20.5C -> off
    """
    _set_state(hass, "switch.pb5000_power", "off")
    _set_state(hass, "select.pb5000_mode", "FAN")
    _set_state(hass, "select.pb5000_fan_speed", "low")

    # Reconciler thresholds (target=22.0):
    #   power on  when current_temp > target - 1   (> 21.0)
    #   mode COOL when current_temp > target        (> 22.0)
    #   fan high  when current_temp > target + 1.2  (> 23.2)
    #   fan low   when current_temp < target + 0.8  (< 22.8)
    #   fan hold  when 22.8 <= current_temp <= 23.2 (deadband)
    temps_and_expected = [
        (27.0, "on", "COOL", "high"),
        (22.5, "on", "COOL", "low"),  # 22.5 < 22.8 → low
        (21.5, "on", "FAN", "low"),
        (20.5, "off", "FAN", "low"),
    ]

    for temp, exp_power, exp_mode, exp_fan in temps_and_expected:
        with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock):
            await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0)

        # Update mock states to reflect what was commanded
        _set_state(hass, "switch.pb5000_power", exp_power)
        _set_state(hass, "select.pb5000_mode", exp_mode)
        _set_state(hass, "select.pb5000_fan_speed", exp_fan)

        # Verify no redundant calls on next cycle with same state
        with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
            await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0)
            mock_call.assert_not_called()


async def test_should_cool_toggle(hass: HomeAssistant, reconciler: Reconciler) -> None:
    """When zone stops requesting cooling, AC turns off regardless of temp."""
    _set_state(hass, "switch.pb5000_power", "on")
    _set_state(hass, "select.pb5000_mode", "COOL")
    _set_state(hass, "select.pb5000_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(AC_CONFIG, should_cool=False, current_temp=27.0, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off") in calls
