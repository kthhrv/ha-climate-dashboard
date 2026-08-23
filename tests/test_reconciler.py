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


def _extract_domains(mock_call: AsyncMock) -> set[tuple]:
    """Extract (domain, service) tuples from call_args_list."""
    return {(c.args[0], c.args[1]) for c in mock_call.call_args_list}


# --- should_cool=True: COOL mode tests ---


async def test_ac_unit_hot_room_cool_high_fan(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When should_cool and current > target + 1.2, COOL mode, high fan."""
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
    """When should_cool and target < current < target + 0.8, COOL mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=22.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_fan_speed_hysteresis_holds_current(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When temp is in the deadband (target+0.8 to target+1.2), fan speed holds current state."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=23.0, target_temp=22.0)

        fan_calls = [c for c in mock_call.call_args_list if c.args[0] == "select" and "fan_speed" in str(c.args[2])]
        assert len(fan_calls) == 0


# --- FAN circulation tests (independent of should_cool) ---


async def test_ac_unit_fan_circulation_with_should_cool(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool and target - 0.8 < current <= target, FAN circulation."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=21.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_fan_circulation_without_should_cool(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool=False but current > target - 0.8, FAN circulation still runs."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=False, current_temp=24.8, target_temp=25.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_no_cool_mode_without_should_cool(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool=False, FAN mode even if current > target (no compressor)."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=False, current_temp=27.0, target_temp=25.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        # Mode stays FAN, no COOL
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) not in calls


# --- Power off tests ---


async def test_ac_unit_powers_off_below_threshold(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When current <= target - 1.2, power off with no mode/fan commands."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=20.5, target_temp=22.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        domains = _extract_domains(mock_call)
        assert ("select", "select_option") not in domains


async def test_ac_unit_powers_off_without_should_cool_below_threshold(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool=False and current <= target - 1.2, power off."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=False, current_temp=23.5, target_temp=25.0)

        calls = _extract_calls(mock_call)
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        domains = _extract_domains(mock_call)
        assert ("select", "select_option") not in domains


# --- Unavailable entity handling ---


async def test_ac_unit_unavailable_power_state_no_commands(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When the power switch is unavailable, no commands are sent (not even turn_off)."""
    _set_state(hass, "switch.test_ac_power", "unavailable")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=21.0, target_temp=22.0)

        mock_call.assert_not_called()


async def test_ac_unit_unavailable_fan_state_no_commands(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When the fan select is unavailable, no commands are sent."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "unavailable")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=26.0, target_temp=22.0)

        mock_call.assert_not_called()


# --- Power deadband holds everything ---


async def test_ac_unit_deadband_holds_all_commands(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """In the power deadband (target - 1.2 < current <= target - 0.8), nothing is commanded."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=21.0, target_temp=22.0)

        mock_call.assert_not_called()


async def test_ac_unit_deadband_holds_off_state(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """In the power deadband with the unit off, it stays off with no commands."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=21.0, target_temp=22.0)

        mock_call.assert_not_called()


# --- Redundant call prevention ---


async def test_ac_unit_skips_redundant_calls(hass: HomeAssistant, reconciler: Reconciler, ac_config: dict) -> None:
    """When state already matches desired, no service calls should be made."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch("homeassistant.core.ServiceRegistry.async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(ac_config, should_cool=True, current_temp=26.0, target_temp=22.0)

        mock_call.assert_not_called()
