# Direct AC Control from Climate Dashboard

## Problem

The climate dashboard controls portable AC units (Pro Breeze 5000/9000 BTU) through a long indirection chain:

    Zone -> generic_thermostat -> dummy switch -> automation -> python_script -> LocalTuya entities

This was a necessary shim before the dashboard existed, but now causes problems:

1. **Fan speed logic broken**: The generic thermostat target is forced to 16°C (bang-bang force-open), so `aircon_ctl.py`'s fan speed decisions (based on distance from target) always resolve to "high" — the script never sees the real zone cooling target.
2. **FAN circulation mode broken**: The script uses `hvac_action` from the generic thermostat to decide COOL vs FAN mode. Since the generic thermostat target is 16°C, `hvac_action` is always `cooling` — the FAN-only circulation window never activates.
3. **Unnecessary complexity**: 3 generic thermostats, 3 dummy switches, 3 automations, and a python script exist solely to bridge between the dashboard and the physical AC entities.

## Solution

Add direct AC unit control to the climate dashboard. AC units are a separate concept from climate-based coolers — they use discrete switches and selects (power, mode, fan speed) rather than climate entity mode + setpoint.

## Data Model

### Zone Config (`storage.py`)

`ClimateZoneConfig` gains a new field:

```python
ac_units: list[dict]  # default []
```

Each entry describes the LocalTuya entities for one AC unit:

```python
{
    "power": "switch.pb5000_power",           # switch entity
    "mode": "select.pb5000_mode",             # select: COOL / FAN / DRY
    "fan_speed": "select.pb5000_fan_speed"    # select: low / high
}
```

Existing `coolers` field continues to work for PID/climate-based coolers (e.g. `climate.gaspard_bedroom_window_cooling`). Both contribute to `_has_cooling_capability()`.

Zones with no `ac_units` key default to `[]` — fully backwards compatible.

## Reconciler: `reconcile_ac_unit`

New method on `Reconciler`:

```python
async def reconcile_ac_unit(
    self,
    ac_config: dict,       # {power, mode, fan_speed}
    should_cool: bool,
    current_temp: float,
    target_temp: float,     # zone's target_temp_high
) -> None:
```

### Control Logic

**When `should_cool` is True:**

| Condition | Power | Mode | Fan Speed |
|-----------|-------|------|-----------|
| `current > target + 1` (hot) | on | COOL | high |
| `target < current <= target + 1` (warm) | on | COOL | low |
| `target - 1 < current <= target` (at target) | on | FAN | low |
| `current <= target - 1` (cool enough) | off | FAN | low |

**When `should_cool` is False:**

| Power | Mode | Fan Speed |
|-------|------|-----------|
| off | FAN | low |

### Implementation Details

- Calls `switch.turn_on`/`turn_off` and `select.select_option` directly on LocalTuya entities.
- Uses latching (same pattern as existing reconciler) to skip redundant service calls — checks current state before issuing commands.
- No intermediate climate entities involved.

## Zone Integration (`climate_zone.py`)

In `_async_reconcile()`, after the existing cooler loop, add:

```python
for ac_config in self._ac_units:
    await self._reconciler.reconcile_ac_unit(
        ac_config,
        should_cool=should_cool,
        current_temp=current_temp,
        target_temp=device_setpoint,
    )
```

`device_setpoint` is already computed as `desired.setpoints.high` for cooling (line 746-747).

`_has_cooling_capability()` updated to return `True` if either `self._coolers` or `self._ac_units` is non-empty.

## Config Flow / Websocket / Panel

- Websocket API accepts `ac_units` in zone create/update payloads.
- Frontend panel gains UI for adding/removing AC units per zone (power/mode/fan_speed entity pickers).
- Storage round-trips `ac_units` through save/load.

## What Gets Removed After Migration

Once the three zones are reconfigured with `ac_units` and confirmed working:

- 3 generic thermostat config entries (`climate.office_ac`, `climate.master_bedroom_ac`, `climate.gaspard_bedroom_ac`)
- 3 template dummy switches (`switch.*_ac_dummy_switch`)
- 3 automations (`automation.*_ac_ctl`)
- `python_scripts/aircon_ctl.py`

Removal is manual via HA UI after confirming the new path works. Old and new can coexist during testing.

## Scope

This design is Pro Breeze-specific: power is a switch, mode is a select with COOL/FAN/DRY options, fan speed is a select with low/high options. The fan speed thresholds (1°C hysteresis bands) are hardcoded to match the current `aircon_ctl.py` behavior.
