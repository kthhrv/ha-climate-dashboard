# AC Fan Circulation Fix

## Problem

The `reconcile_ac_unit` method only acts when `should_cool=True`. But the desired behavior (matching the old `aircon_ctl.py` script) is that FAN circulation runs whenever the room temperature is within 1°C below the cooling target, regardless of whether the engine has triggered active cooling.

In the old system, the generic thermostat was always in "cool" mode (toggling between target 16°C and 30°C), so the script's `if climate_state == 'cool'` was always true and the FAN circulation logic ran continuously. The new `reconcile_ac_unit` only runs its logic when `should_cool=True`, breaking FAN circulation.

Two bugs:

1. **`reconcile_ac_unit` ignores temp-based FAN logic when `should_cool=False`** — it just powers off. Should run FAN when `current > target - 1`.

2. **Zone doesn't pass `target_temp` when `should_cool=False`** — `device_setpoint` is `None` in the idle state (AUTO mode with no active heating/cooling), so the `device_setpoint is not None` guard skips the AC unit loop entirely.

## Solution

### Reconciler changes (`reconciler.py`)

`should_cool` controls whether the compressor (COOL mode) is allowed. FAN circulation is based purely on temperature vs target.

**Revised control logic:**

| Condition | Power | Mode | Fan Speed |
|-----------|-------|------|-----------|
| `should_cool` AND `current > target + 1.2` | on | COOL | high |
| `should_cool` AND `target < current` AND `current <= target + 0.8` | on | COOL | low |
| `should_cool` AND `target < current` AND `0.8 <= (current - target) <= 1.2` | on | COOL | hold |
| `current > target - 1` AND `current <= target` | on | FAN | low |
| `current <= target - 1` | off | — | — |
| NOT `should_cool` AND `current > target` | on | FAN | low |

Simplified: `should_cool` gates COOL mode. FAN mode runs when `current > target - 1` regardless. Power off when `current <= target - 1` and not actively cooling.

When powering off, don't send mode/fan commands (Tuya off-state safety, unchanged from current).

### Zone changes (`climate_zone.py`)

The AC unit loop needs the zone's cooling target even when `should_cool=False`. Change the AC unit section to always resolve the cooling setpoint:

```python
# AC Units need cooling target even when idle (for FAN circulation)
if self._ac_units and self._attr_current_temperature is not None:
    cooling_setpoint = desired.setpoints.high
    if cooling_setpoint is None:
        cooling_setpoint = desired.setpoints.target
    if cooling_setpoint is not None:
        for ac_config in self._ac_units:
            await self._reconciler.reconcile_ac_unit(
                ac_config,
                should_cool=should_cool,
                current_temp=self._attr_current_temperature,
                target_temp=cooling_setpoint,
            )
```

This uses `desired.setpoints.high` (the cooling target in AUTO mode) instead of `device_setpoint` (which is None when idle).

### Test changes

Update existing tests and add new cases:
- FAN circulation when `should_cool=False` and `current > target - 1`
- Power off when `should_cool=False` and `current <= target - 1`
- COOL mode blocked when `should_cool=False` even if `current > target`
