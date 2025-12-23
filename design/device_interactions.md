# Device Interactions & Feature Capability

This document details how the Climate Dashboard's core engine (`ClimateZone`) interacts with various hardware types. It serves as a reference for expected behavior, synchronization logic, and capability mapping.

## 1. Smart TRVs (Radiator Valves)
**Device Type:** `climate` entities (e.g., Shelly TRV, Tado, Zigbee Tuya).

### Feature Mapping
-   **Target Temperature:**
    -   **Downstream (Zone -> Device):** Zone Schedule Target is sent to `climate.set_temperature`.
    -   **Upstream (Device -> Zone):** Manual changes on the physical knob override the Zone Target (triggers Manual Hold).
-   **HVAC Mode:**
    -   **Management:** The TRV is generally kept in `HEAT` mode to allow the valve to open.
    -   **Idle State:** If the Zone is `OFF`, the TRV is set to `OFF` (or a very low frost-protect temperature if the hardware is slow to wake).
    -   **Stubborn Devices:** Some TRVs aggressively revert to internal schedules. The Engine uses a "Retry Budget" (Token Bucket) to enforce the Dashboard's state up to 5 times before throttling.

### Known Constraints
-   **Battery Save:** TRVs report check-ins infrequently. Updates from Dashboard to Device are usually instant (Zigbee/WiFi), but updates *from* Device to Dashboard may lag.

---

## 2. Smart Switches (Bang-Bang Control)
**Device Type:** `switch` or `input_boolean` entities controlling electric heaters or boiler relays.

### Feature Mapping
-   **Control Logic:** The Zone Engine acts as a software thermostat.
    -   **ON:** `Current Temp < Target Temp`
    -   **OFF:** `Current Temp >= Target Temp + Hysteresis`
-   **HVAC Mode:**
    -   **Zone `HEAT`:** Switch toggles based on temp.
    -   **Zone `OFF`:** Switch is forced `OFF`.

### Safety
-   **Failsafe:** Usage of `smart_switch` requires a valid Temperature Sensor. If the sensor becomes `unavailable` for >1 hour, the switch defaults to `OFF` (Safety Precaution).

---

## 3. Wall Thermostats (Dials)
**Device Type:** `climate` entities with screen & controls (e.g., Nest, Ecobee, physical wall dial).

### Bi-Directional Synchronization
Unlike TRVs which are just actuators, Wall Thermostats are UI peers.

#### Downstream (Dashboard -> Wall Dial)
-   **Target Sync:** Changing the schedule or slider on the Dashboard updates the Wall Dial's target.
-   **Mode Sync:**
    -   Dashboard `OFF` -> Wall Dial `OFF`.
    -   Dashboard `HEAT` -> Wall Dial `HEAT`.
    -   Dashboard `COOL` -> Wall Dial `COOL`.
    -   Dashboard `AUTO` -> Wall Dial `AUTO` (or `HEAT_COOL` / `HEAT` depending on capabilities).

#### Upstream (Wall Dial -> Dashboard)
-   **Target Override:** Turning the physical dial triggers a **Manual Hold** on the Dashboard for the current block.
-   **Mode Change:**
    -   Turning the Dial to "Off" switches the Dashboard Zone to `OFF` (Global or Zone-specific).
    -   Switching from "Heat" to "Cool" on the wall updates the Dashboard Zone Mode.

### "Heat+Cool" Support
-   If a Zone contains a thermostat supporting cooling, the Zone promotes itself to support `HVACMode.COOL` and `HVACMode.AUTO`.
-   **Auto Mode:** Uses `target_temp_high` and `target_temp_low` (Deadband) logic.

---

## 4. Air Conditioners (AC)
**Device Type:** `climate` entities (Mini-splits, Window units).

### Feature Mapping
-   **Behaves like a Wall Thermostat** regarding Mode/Target sync.
-   **Fan Modes:** Currently passed through if available (Future: Unified Fan Control).
-   **Swing:** Passthrough (Future).

### Special Handling
-   **Dry Mode:** Currently mapped to `COOL` or ignored (treated as Off/Idle).
-   **Power State:** Some AC IR integrations have stateless power. We assume "Optimistic" state tracking.

---

## 5. Hybrid Zone: Wall Dial + AC + TRV
**Scenario:** A room containing:
1.  **Wall Dial:** Single setpoint interface (e.g., Nest E, or basic Zigbee dial), supports `HEAT` and `COOL` modes. **Serves as the Zone's main Temperature Sensor.**
2.  **AC Unit:** Cooling source (primary). Internal sensor ignored.
3.  **TRV:** Heating source (primary). Internal sensor ignored.

### Interaction Logic

#### 1. Mode Arbitration
The Wall Dial often acts as the "Master Mode Switch" for the user.
-   **User sets Dial to `HEAT`:**
    -   **Zone:** Switches to `HVACMode.HEAT`.
    -   **AC:** Forced `OFF` (to prevent fighting).
    -   **TRV:** Active, follows Target Temp.
-   **User sets Dial to `COOL`:**
    -   **Zone:** Switches to `HVACMode.COOL`.
    -   **TRV:** Forced `OFF` (Valve closed).
    -   **AC:** Active, follows Target Temp.
-   **User sets Dial to `OFF`:**
    -   **Zone:** Switches to `HVACMode.OFF`.
    -   **AC & TRV:** Verified `OFF`.

#### 2. Single Setpoint vs. Dual Requirements
The Dashboard might handle a Range (Auto 20°C - 24°C), but the Dial only supports one number.
-   **Sync Strategy (Active Mode Follower):**
    -   If Zone is Heating -> Dial receives `target_temp_low` (20°C) and is set to `HEAT`.
    -   If Zone is Cooling -> Dial receives `target_temp_high` (24°C) and is set to `COOL`.
    -   *Result:* The physical dial always shows the "Active" target.

#### 3. Conflict Prevention
-   **Deadband Enforcement:** The Zone Logic ensures `target_cool` is always >= `target_heat` + threshold.
-   **Anti-Flapping:** When switching between AC and Heating, a **hysteresis delay** (default 5 mins) prevents rapid cycling if temperature hovers near the switching point.

#### 4. The "Manual Override" Flow
If the user walks up to the Dial and turns it:
1.  **Dial sends `set_temperature`** (e.g., user turns 20->22).
2.  **Zone detects change:**
    -   Determines the active mode (Heat).
    -   Creates a **Manual Overlay** for `HEAT` target = 22°C.
3.  **Propagation:**
    -   Zone sends 22°C to the TRV immediately.
    -   Zone updates Dashboard UI to show "Hold until next block".
