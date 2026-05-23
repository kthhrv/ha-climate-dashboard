"""Test the Reconciler AC unit control."""

from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant

from custom_components.climate_dashboard.reconciler import Reconciler


@pytest.fixture
def reconciler(hass: HomeAssistant) -> Reconciler:
    """Create a reconciler instance."""
    return Reconciler(hass)


@pytest.fixture
def ac_config() -> dict[str, str]:
    """Return a test AC unit config."""
    return {
        "power": "switch.test_ac_power",
        "mode": "select.test_ac_mode",
        "fan_speed": "select.test_ac_fan_speed",
    }


def _set_state(hass: HomeAssistant, entity_id: str, state: str) -> None:
    """Set a mock entity state."""
    hass.states.async_set(entity_id, state)


def _extract_calls(mock_call: AsyncMock) -> set[tuple]:
    """Extract (domain, service, sorted_data_items) tuples from call_args_list."""
    return {(c.args[0], c.args[1], tuple(sorted(c.args[2].items()))) for c in mock_call.call_args_list}


async def test_ac_unit_should_cool_false_powers_off(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool is False, AC should be off, FAN mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=False, current_temp=20.0, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_hot_room_cool_high_fan(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When current > target + 1, AC should be on, COOL mode, high fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=26.0, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "high"))) in calls


async def test_ac_unit_warm_room_cool_low_fan(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When target < current <= target + 1, AC should be on, COOL mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=22.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_at_target_fan_only(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When target - 1 < current <= target, AC should be on, FAN mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=21.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_cool_enough_powers_off(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When current <= target - 1, AC should be off."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=20.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_skips_redundant_calls(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When state already matches desired, no service calls should be made."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=False, current_temp=20.0, target_temp=22.0)

        mock_call.assert_not_called()
