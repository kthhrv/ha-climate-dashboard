# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Assistant custom component (`climate_dashboard`) that orchestrates multiple physical climate devices (TRVs, AC units, sensors) into unified "Climate Zones" using a priority-based intent reconciliation engine.

## Commands

### Python (backend)
```bash
uv run pytest                    # Run all tests
uv run pytest tests/test_foo.py  # Run single test file
uv run pytest -k "test_name"    # Run test by name
uv run ruff check .             # Lint
uv run ruff format .            # Format
uv run mypy custom_components   # Type check
```

### Frontend
```bash
cd frontend && npm run build     # Build (outputs to custom_components/climate_dashboard/www/)
cd frontend && npm run test      # Run vitest
cd frontend && npm run test:watch # Watch mode
```

### Development
```bash
uv run invoke dev               # Build frontend + start MQTT + run HA
uv run invoke run               # Run HA only
uv run invoke setup_demo        # Initialize demo data (areas, entities, MQTT devices)
```

## Architecture

### Intent Reconciliation Pipeline

The core pattern: **Intent → Engine → DesiredState → Reconciler → Hardware**

1. **IntentSources** (priority order): SAFETY > AWAY_MODE > MANUAL_DIAL > MANUAL_APP > OCCUPANCY_SETBACK > SCHEDULE
2. **ReconciliationEngine** (`engine.py`): Pure calculation — takes intents, returns `DesiredState` (target temp + HVAC action). Implements hysteresis logic. No side effects.
3. **Reconciler** (`reconciler.py`): Translates `DesiredState` into HA service calls. Uses a **hardware latch** to prevent echo loops (remembers last-sent command, ignores state updates matching it). For single-capability zones in AUTO mode, maps to the matching single mode (HEAT or COOL) when syncing to wall dials.

### Key Components

- **ClimateZone** (`climate_zone.py`): Central entity per zone — ties together engine, reconciler, safety, schedules, and presence tracking. Registers as an HA climate entity.
- **HeatingCircuit** (`circuit.py`): Groups shared actuators (pumps, boilers) across zones. Monitors zone demand to control shared equipment.
- **SafetyMonitor** (`safety.py`): Window-open detection (with configurable delay) and temperature sensor failover. Forces OFF on safety events.
- **Coordinator** (`coordinator.py`): Global Home/Away logic with presence detection delay.
- **Storage** (`storage.py`): TypedDict-based config persisted via HA Store. Listener pattern propagates changes.
- **ScheduleManager** (`schedule_manager.py`): Time-based schedule blocks for zone temperature targets.

### Frontend

TypeScript/Lit web components. `DataEngine` (`data-engine.ts`) transforms raw HA state into view-friendly structures. Main views: zones list, zone editor, timeline/schedule editor, history.

### Event Flow

Storage changes propagate via listeners → ClimateZone recalculates intent → Engine produces DesiredState → Reconciler syncs to hardware. State updates from hardware flow back through HA state machine, filtered by the hardware latch.

## Code Style

- Python: ruff (line-length 120), mypy strict mode, Python 3.13
- Frontend: TypeScript strict, Prettier
- Async/await throughout (HA framework requirement)
- `asyncio_mode = auto` in pytest (no need for `@pytest.mark.asyncio`)
