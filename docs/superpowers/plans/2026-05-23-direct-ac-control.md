# Direct AC Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the generic thermostat/automation/script indirection layer by having the climate dashboard control AC units (LocalTuya switches and selects) directly.

**Architecture:** Add `ac_units` as a new zone config field — a list of `{power, mode, fan_speed}` entity ID dicts. A new `reconcile_ac_unit` method on `Reconciler` handles the Pro Breeze control logic (power, COOL/FAN mode, fan speed based on distance from target). The zone calls this method alongside existing cooler reconciliation.

**Tech Stack:** Python, Home Assistant custom component, pytest with pytest-homeassistant-custom-component

---

### Task 1: Add `ac_units` to storage data model

**Files:**
- Modify: `custom_components/climate_dashboard/storage.py:55-68`

- [ ] **Step 1: Add `ac_units` field to `ClimateZoneConfig`**

In `storage.py`, add the field to the TypedDict. Use `NotRequired` since existing zones won't have it:

```python
from typing import NotRequired, TypedDict

class ClimateZoneConfig(TypedDict):
    """Typed dictionary for zone configuration."""

    unique_id: str
    name: str
    temperature_sensor: str
    heaters: list[str]
    thermostats: list[str]
    coolers: list[str]
    window_sensors: list[str]
    presence_sensors: list[str]
    occupancy_timeout_minutes: int
    occupancy_setback_temp: float
    schedule: list[ScheduleBlock]
    ac_units: NotRequired[list[dict[str, str]]]
```

- [ ] **Step 2: Commit**

```bash
git add custom_components/climate_dashboard/storage.py
git commit -m "feat: add ac_units field to ClimateZoneConfig"
```

---

### Task 2: Add `reconcile_ac_unit` method to Reconciler

**Files:**
- Modify: `custom_components/climate_dashboard/reconciler.py`
- Test: `tests/test_reconciler.py` (create)

- [ ] **Step 1: Write failing tests**

Create `tests/test_reconciler.py`:

```python
"""Test the Reconciler AC unit control."""

from unittest.mock import AsyncMock, MagicMock, patch

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


async def test_ac_unit_should_cool_false_powers_off(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When should_cool is False, AC should be off, FAN mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=False, current_temp=20.0, target_temp=22.0
        )

        calls = {(c[0], c[1], tuple(sorted(c[2].items()))) for c in mock_call.call_args_list}
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_hot_room_cool_high_fan(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When current > target + 1, AC should be on, COOL mode, high fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=True, current_temp=26.0, target_temp=22.0
        )

        calls = {(c[0], c[1], tuple(sorted(c[2].items()))) for c in mock_call.call_args_list}
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "high"))) in calls


async def test_ac_unit_warm_room_cool_low_fan(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When target < current <= target + 1, AC should be on, COOL mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=True, current_temp=22.5, target_temp=22.0
        )

        calls = {(c[0], c[1], tuple(sorted(c[2].items()))) for c in mock_call.call_args_list}
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "COOL"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_at_target_fan_only(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When target - 1 < current <= target, AC should be on, FAN mode, low fan."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=True, current_temp=21.5, target_temp=22.0
        )

        calls = {(c[0], c[1], tuple(sorted(c[2].items()))) for c in mock_call.call_args_list}
        assert ("switch", "turn_on", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_cool_enough_powers_off(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When current <= target - 1, AC should be off."""
    _set_state(hass, "switch.test_ac_power", "on")
    _set_state(hass, "select.test_ac_mode", "COOL")
    _set_state(hass, "select.test_ac_fan_speed", "high")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=True, current_temp=20.5, target_temp=22.0
        )

        calls = {(c[0], c[1], tuple(sorted(c[2].items()))) for c in mock_call.call_args_list}
        assert ("switch", "turn_off", (("entity_id", "switch.test_ac_power"),)) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_mode"), ("option", "FAN"))) in calls
        assert ("select", "select_option", (("entity_id", "select.test_ac_fan_speed"), ("option", "low"))) in calls


async def test_ac_unit_skips_redundant_calls(
    hass: HomeAssistant, reconciler: Reconciler, ac_config: dict
) -> None:
    """When state already matches desired, no service calls should be made."""
    _set_state(hass, "switch.test_ac_power", "off")
    _set_state(hass, "select.test_ac_mode", "FAN")
    _set_state(hass, "select.test_ac_fan_speed", "low")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            ac_config, should_cool=False, current_temp=20.0, target_temp=22.0
        )

        mock_call.assert_not_called()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pytest tests/test_reconciler.py -v`
Expected: FAIL — `reconcile_ac_unit` method does not exist.

- [ ] **Step 3: Implement `reconcile_ac_unit`**

Add to `reconciler.py`, after the `reconcile_climate_actuator` method:

```python
    async def reconcile_ac_unit(
        self,
        ac_config: dict[str, str],
        should_cool: bool,
        current_temp: float,
        target_temp: float,
    ) -> None:
        """Control a portable AC unit via its LocalTuya switch and select entities.

        Args:
            ac_config: Dict with keys 'power', 'mode', 'fan_speed' (entity IDs).
            should_cool: Whether the zone wants active cooling.
            current_temp: Current room temperature from zone sensor.
            target_temp: Zone cooling target (target_temp_high).
        """
        power_eid = ac_config["power"]
        mode_eid = ac_config["mode"]
        fan_eid = ac_config["fan_speed"]

        power_state = self.hass.states.get(power_eid)
        mode_state = self.hass.states.get(mode_eid)
        fan_state = self.hass.states.get(fan_eid)

        if not power_state or not mode_state or not fan_state:
            _LOGGER.warning("AC unit entity missing: %s", ac_config)
            return

        if should_cool:
            if current_temp > target_temp - 1:
                desired_power = "on"
            else:
                desired_power = "off"

            if current_temp > target_temp + 1:
                desired_fan = "high"
            else:
                desired_fan = "low"

            if current_temp > target_temp:
                desired_mode = "COOL"
            else:
                desired_mode = "FAN"
        else:
            desired_power = "off"
            desired_mode = "FAN"
            desired_fan = "low"

        if power_state.state != desired_power:
            service = f"turn_{desired_power}"
            _LOGGER.debug("Reconciler: AC power %s -> %s", power_eid, service)
            await self.hass.services.async_call(
                "switch", service, {ATTR_ENTITY_ID: power_eid}
            )

        if mode_state.state != desired_mode:
            _LOGGER.debug("Reconciler: AC mode %s -> %s", mode_eid, desired_mode)
            await self.hass.services.async_call(
                "select", "select_option",
                {ATTR_ENTITY_ID: mode_eid, "option": desired_mode},
            )

        if fan_state.state != desired_fan:
            _LOGGER.debug("Reconciler: AC fan %s -> %s", fan_eid, desired_fan)
            await self.hass.services.async_call(
                "select", "select_option",
                {ATTR_ENTITY_ID: fan_eid, "option": desired_fan},
            )
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pytest tests/test_reconciler.py -v`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add custom_components/climate_dashboard/reconciler.py tests/test_reconciler.py
git commit -m "feat: add reconcile_ac_unit method for direct AC control"
```

---

### Task 3: Wire `ac_units` into `ClimateZone`

**Files:**
- Modify: `custom_components/climate_dashboard/climate_zone.py:61-140` (constructor)
- Modify: `custom_components/climate_dashboard/climate_zone.py:191-250` (`async_update_config`)
- Modify: `custom_components/climate_dashboard/climate_zone.py:291-294` (`_has_cooling_capability`)
- Modify: `custom_components/climate_dashboard/climate_zone.py:727-752` (`_async_reconcile` actuator loop)

- [ ] **Step 1: Add `ac_units` parameter to constructor**

In `climate_zone.py`, add the parameter to `__init__`:

```python
    def __init__(
        self,
        hass: HomeAssistant,
        storage: ClimateDashboardStorage,
        unique_id: str,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        thermostats: list[str],
        coolers: list[str],
        window_sensors: list[str],
        presence_sensors: list[str],
        occupancy_timeout_minutes: int,
        occupancy_setback_temp: float,
        schedule: list[ScheduleBlock] | None = None,
        ac_units: list[dict[str, str]] | None = None,
    ) -> None:
```

Store it after `self._coolers = coolers` (line 135):

```python
        self._coolers = coolers
        self._ac_units = ac_units or []
```

- [ ] **Step 2: Add `ac_units` to `async_update_config`**

Add the parameter and store it:

```python
    async def async_update_config(
        self,
        name: str,
        temperature_sensor: str,
        heaters: list[str],
        thermostats: list[str],
        coolers: list[str],
        window_sensors: list[str],
        presence_sensors: list[str],
        occupancy_timeout_minutes: int,
        occupancy_setback_temp: float,
        schedule: list[ScheduleBlock] | None = None,
        ac_units: list[dict[str, str]] | None = None,
    ) -> None:
```

After `self._coolers = coolers` (line 244):

```python
        self._coolers = coolers
        self._ac_units = ac_units or []
```

- [ ] **Step 3: Update `_has_cooling_capability`**

```python
    def _has_cooling_capability(self) -> bool:
        """Check if this zone has any cooling capability."""
        return bool(self._coolers) or bool(self._ac_units)
```

- [ ] **Step 4: Add AC unit reconciliation in `_async_reconcile`**

After the existing cooler loop (after line 752), add:

```python
        # AC Units (direct control)
        for ac_config in self._ac_units:
            await self._reconciler.reconcile_ac_unit(
                ac_config,
                should_cool=should_cool,
                current_temp=self._attr_current_temperature,
                target_temp=device_setpoint,
            )
```

- [ ] **Step 5: Expose `ac_units` in zone state attributes**

Find the `extra_state_attributes` property (search for `"coolers"` in the attributes dict) and add `ac_units` after `coolers`:

```python
            "coolers": self._coolers,
            "ac_units": self._ac_units,
```

- [ ] **Step 6: Commit**

```bash
git add custom_components/climate_dashboard/climate_zone.py
git commit -m "feat: wire ac_units into ClimateZone constructor, reconcile, and capabilities"
```

---

### Task 4: Wire `ac_units` through `climate.py` entity creation

**Files:**
- Modify: `custom_components/climate_dashboard/climate.py:60-92`

- [ ] **Step 1: Pass `ac_units` in both creation and update paths**

In the update path (line 62-74), add `ac_units` to the `async_update_config` call:

```python
                hass.async_create_task(
                    entity.async_update_config(
                        name=zone_config["name"],
                        temperature_sensor=zone_config["temperature_sensor"],
                        heaters=zone_config["heaters"],
                        thermostats=zone_config.get("thermostats", []),
                        coolers=zone_config["coolers"],
                        window_sensors=zone_config["window_sensors"],
                        presence_sensors=zone_config.get("presence_sensors", []),
                        occupancy_timeout_minutes=zone_config.get("occupancy_timeout_minutes", 30),
                        occupancy_setback_temp=zone_config.get("occupancy_setback_temp", 2.0),
                        schedule=zone_config.get("schedule"),
                        ac_units=zone_config.get("ac_units", []),
                    )
                )
```

In the creation path (line 77-91), add `ac_units` to the `ClimateZone` constructor:

```python
                entity = ClimateZone(
                    hass,
                    storage,
                    unique_id=uid,
                    name=zone_config["name"],
                    temperature_sensor=zone_config["temperature_sensor"],
                    heaters=zone_config["heaters"],
                    thermostats=zone_config.get("thermostats", []),
                    coolers=zone_config["coolers"],
                    window_sensors=zone_config["window_sensors"],
                    presence_sensors=zone_config.get("presence_sensors", []),
                    occupancy_timeout_minutes=zone_config.get("occupancy_timeout_minutes", 30),
                    occupancy_setback_temp=zone_config.get("occupancy_setback_temp", 2.0),
                    schedule=zone_config.get("schedule"),
                    ac_units=zone_config.get("ac_units", []),
                )
```

- [ ] **Step 2: Commit**

```bash
git add custom_components/climate_dashboard/climate.py
git commit -m "feat: pass ac_units through entity creation and update paths"
```

---

### Task 5: Add `ac_units` to websocket API

**Files:**
- Modify: `custom_components/climate_dashboard/websocket.py`

- [ ] **Step 1: Add `ac_units` to adopt schema (line 439-455)**

Add after the `coolers` line:

```python
                vol.Optional("ac_units", default=[]): [
                    {
                        vol.Required("power"): str,
                        vol.Required("mode"): str,
                        vol.Required("fan_speed"): str,
                    }
                ],
```

- [ ] **Step 2: Add `ac_units` to the zone config dict in `_async_adopt_zone`**

Find the zone_config dict construction (around line 70-82) and add:

```python
        "ac_units": msg.get("ac_units", []),
```

- [ ] **Step 3: Add `ac_units` to update schema (line 461-477)**

Add after the `coolers` line:

```python
                vol.Optional("ac_units"): [
                    {
                        vol.Required("power"): str,
                        vol.Required("mode"): str,
                        vol.Required("fan_speed"): str,
                    }
                ],
```

- [ ] **Step 4: Add `ac_units` merge in `_async_update_zone`**

After the `schedule` merge block (around line 204-205), add:

```python
    if "ac_units" in msg:
        updated_config["ac_units"] = msg["ac_units"]
```

- [ ] **Step 5: Commit**

```bash
git add custom_components/climate_dashboard/websocket.py
git commit -m "feat: add ac_units to websocket adopt and update schemas"
```

---

### Task 6: Integration test — end-to-end AC unit control

**Files:**
- Create: `tests/test_ac_unit.py`

- [ ] **Step 1: Write integration test**

```python
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


AC_CONFIG = {
    "power": "switch.pb5000_power",
    "mode": "select.pb5000_mode",
    "fan_speed": "select.pb5000_fan_speed",
}


async def test_cooling_ramp_down_sequence(
    hass: HomeAssistant, reconciler: Reconciler
) -> None:
    """Simulate a room cooling from 27C to 20C with target 22C.

    Verify the AC transitions through the expected states:
    27C -> COOL/high, 23C -> COOL/high, 22.5C -> COOL/low,
    21.5C -> FAN/low, 20.5C -> off
    """
    _set_state(hass, "switch.pb5000_power", "off")
    _set_state(hass, "select.pb5000_mode", "FAN")
    _set_state(hass, "select.pb5000_fan_speed", "low")

    temps_and_expected = [
        (27.0, "on", "COOL", "high"),
        (23.0, "on", "COOL", "high"),
        (22.5, "on", "COOL", "low"),
        (21.5, "on", "FAN", "low"),
        (20.5, "off", "FAN", "low"),
    ]

    for temp, exp_power, exp_mode, exp_fan in temps_and_expected:
        with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
            await reconciler.reconcile_ac_unit(
                AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0
            )

        # Update mock states to reflect what was commanded
        _set_state(hass, "switch.pb5000_power", exp_power)
        _set_state(hass, "select.pb5000_mode", exp_mode)
        _set_state(hass, "select.pb5000_fan_speed", exp_fan)

        # Verify no redundant calls on next cycle with same state
        with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
            await reconciler.reconcile_ac_unit(
                AC_CONFIG, should_cool=True, current_temp=temp, target_temp=22.0
            )
            mock_call.assert_not_called()


async def test_should_cool_toggle(
    hass: HomeAssistant, reconciler: Reconciler
) -> None:
    """When zone stops requesting cooling, AC turns off regardless of temp."""
    _set_state(hass, "switch.pb5000_power", "on")
    _set_state(hass, "select.pb5000_mode", "COOL")
    _set_state(hass, "select.pb5000_fan_speed", "high")

    with patch.object(hass.services, "async_call", new_callable=AsyncMock) as mock_call:
        await reconciler.reconcile_ac_unit(
            AC_CONFIG, should_cool=False, current_temp=27.0, target_temp=22.0
        )

        calls = {(c[0], c[1]) for c in mock_call.call_args_list}
        assert ("switch", "turn_off") in calls
```

- [ ] **Step 2: Run all tests**

Run: `pytest tests/test_reconciler.py tests/test_ac_unit.py -v`
Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_ac_unit.py
git commit -m "test: add integration tests for AC unit cooling ramp-down and toggle"
```

---

### Task 7: Deploy and configure zones on live HA instance

This task is manual — configure the three zones with `ac_units` via the websocket API, verify operation, then remove the old indirection layer.

- [ ] **Step 1: Deploy updated integration to HA**

Copy the updated `custom_components/climate_dashboard/` to the HA host and restart.

- [ ] **Step 2: Add `ac_units` to each zone via websocket**

Use the HA websocket API or the dashboard panel to add `ac_units` to the three zones:

- Office zone: `{power: "switch.pb5000_power", mode: "select.pb5000_mode", fan_speed: "select.pb5000_fan_speed"}`
- Master Bedroom zone: `{power: "switch.pb9000_power", mode: "select.pb9000_mode", fan_speed: "select.pb9000_fan_speed"}`
- Gaspard Bedroom zone: `{power: "switch.pb5000_gaspard_pb5000_2_power", mode: "select.pb5000_gaspard_pb5000_2_mode", fan_speed: "select.pb5000_gaspard_pb5000_2_fan_speed"}`

- [ ] **Step 3: Verify AC control works**

Check that zone cooling decisions drive the physical AC correctly — test fan speed transitions, FAN circulation mode, and power off.

- [ ] **Step 4: Remove old indirection layer**

Once confirmed working:
- Remove generic thermostat config entries for Office AC, Master Bedroom AC, Gaspard Bedroom AC
- Remove template dummy switches
- Remove the three `*_ac_ctl` automations
- Remove `python_scripts/aircon_ctl.py`
- Remove the AC climate entities from each zone's `coolers` list (they were the generic thermostats)
