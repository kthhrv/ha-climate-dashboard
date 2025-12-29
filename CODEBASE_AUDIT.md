# Codebase Audit & Architectural Analysis
**Date:** 2025-12-29

## Executive Summary
The `ha-climate-dashboard` project implements a custom Home Assistant component for advanced climate control. The architecture is transitioning towards a robust "Reconciliation" pattern but retains some legacy behaviors and structural inconsistencies that need addressing.

## Architectural Patterns

### Backend (Custom Component)
- **Reconciliation Pattern:** The core logic (`engine.py`) uses a `ReconciliationEngine` that calculates a `DesiredState` based on prioritized `ClimateIntent`s (Safety > Away > Manual > Schedule). This is a robust, modern pattern that decouples intent from execution.
- **Hardware Synchronization:** The `Reconciler` (`reconciler.py`) handles the synchronization of `DesiredState` to physical devices. It includes a "Hardware Latch" to prevent echo loops (feedback where a device update triggers a state change which triggers another update).
- **God Object:** `ClimateZone` (`climate_zone.py`) acts as the central hub. It ties together the Engine, Reconciler, Safety logic, and Schedules. It is currently overloaded.
- **Active Legacy:** `HeatingCircuit` (`circuit.py`) is an **active** component (not dead code) that manages shared actuators (e.g., pumps, boilers) for groups of zones.

### Frontend
- **Tech Stack:** Vite + TypeScript + Lit.
- **ViewModel Pattern:** `data-engine.ts` acts as an adapter/ViewModel, transforming raw Home Assistant state into grouped structures (Floors/Areas) for the UI.

## Technical Debt & "Mess"

### 1. Inconsistent Actuator Control (Major)
There is a dangerous split in how hardware is controlled:
- **ClimateZone** uses the `Reconciler`. It benefits from safety checks, latching, and echo prevention.
- **HeatingCircuit** uses direct service calls (`homeassistant.turn_on/off`). It **bypasses** the `Reconciler`'s safety and synchronization logic. This makes shared actuators prone to race conditions or rapid cycling without the protections the rest of the system enjoys.

### 2. Brittle Entity Resolution
In `circuit.py`, the system attempts to resolve Zone entities by ID. If not found in the entity registry, it falls back to a string manipulation guess:
```python
eid_guess = f"climate.zone_{slugify(zone_conf['name'])}"
```
This is fragile. If a user renames an entity without updating the dashboard config, or if Home Assistant's slugification rules change, this link will break silently or unpredictably.

### 3. Overloaded Classes
`ClimateZone` is violating the Single Responsibility Principle. It currently manages:
- HA Entity Lifecycle
- Intent Calculation
- Safety Monitoring
- Schedule Management
- Actuator/Thermostat association
- **Occupancy Monitoring & Setback Logic (New)**

This class is becoming a "God Object" and should be refactored. Consider extracting `PresenceManager` or `IntentManager`.

### 4. Minor Issues
- **TODOs:** Missing implementation in `frontend/src/climate-dashboard.ts`: `// TODO: Pass focusZoneId to timeline`.
- **Naming:** The distinction between "Circuit" (Actuator Group) and "Zone" (Room) is logically sound but implementation details (like file names) don't always make this hierarchy clear.
