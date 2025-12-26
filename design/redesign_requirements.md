# Redesign Requirements: The Climate State Engine

## 1. Problem Statement
The current implementation relies on a web of event listeners and "Actuator/Sync" helper classes that directly manipulate the Zone entity. This "Interrupt-Driven" approach has led to:
*   **Feedback Loops:** Distinguishing "User turned the dial" from "We updated the dial" is fragile (requires latching).
*   **Race Conditions:** Multiple listeners (Schedule, Sensor, Thermostat) firing simultaneously can lead to inconsistent states.
*   **State Ambiguity:** It is unclear whether `target_temperature` reflects the *Schedule*, the *Manual Override*, or the *Physical Device's current (possibly wrong) state*.
*   **Capability Mismatches:** Mapping a Dual-Setpoint Zone (Heat/Cool range) to a Single-Setpoint Dial (Target Temp) is ad-hoc.

## 2. Core Philosophy (The "Blue Sky" Vision)
The new system should function like a **Reconciliation Engine** (similar to React or Kubernetes).
1.  **Unidirectional Data Flow:** `Inputs -> State Machine -> Desired State -> Reconciler -> Hardware`.
2.  **Explicit Intent:** We must track *why* a state exists (e.g., "User Override" vs "Schedule Default").
3.  **The "Single Source of Truth":** The Zone Entity is the master. Hardware devices are merely *projections* of the Zone's state and *inputs* for user requests.

## 3. Functional Requirements

### 3.1. Zone Logic
*   **Modes:** The Zone must support `OFF`, `HEAT`, `COOL`, and `AUTO` (Dual-Mode).
*   **Setpoints:**
    *   **Single-Point:** Target Temp (for Heat OR Cool).
    *   **Dual-Point:** Low/High Range (for Auto).
*   **Scheduling:** The Zone must ingest a Schedule Profile and determine the "Base Desired State" for the current time.
*   **Overrides:**
    *   User inputs (App or Wall Dial) must be treated as **Overrides** with a specific `Type` (Next Block, Duration, Permanent) and `Expiration`.
    *   Overrides must layer *on top* of the Schedule.

### 3.2. Hardware Abstraction
The system must support three distinct roles for hardware, which may be combined in a single device:
*   **Sensor (Input):** Reports `current_temperature`, `humidity`, `presence`.
*   **Actuator (Output):** Controls `valve_position`, `relay_state`, `ac_mode`.
*   **Human Interface (HMI):**
    *   **Display:** Needs to show the Zone's *Target* and *Mode*.
    *   **Control:** Allows user to change *Target* and *Mode*.

### 3.3. Synchronization (The Core Challenge)
*   **Downstream (Zone -> Device):**
    *   When Zone state changes, all HMI devices must be updated to match.
    *   Actuators must be commanded to satisfy the demand.
*   **Upstream (Device -> Zone):**
    *   When a User interacts with an HMI (Dial), the Zone must interpret this as an **Intent to Override**.
    *   **Crucial:** The system must distinguish between a *Device State Report* (acknowledging our command) and a *User Input*.

## 4. Detailed Edge Cases & Constraints

### 4.1. The "Echo" Chamber (Feedback Loops)
*   **Scenario:** Zone sets Dial to 21°C. Dial reports state is now 21°C.
*   **Requirement:** The system must strictly ignore the report if it matches the last sent command.
*   **Edge Case:** User turns dial to 21°C *at the exact moment* the Schedule changes to 21°C. (Benign race, but logic must handle it).
*   **Edge Case:** User turns dial to 21.5°C immediately after we sent 21.0°C. We must accept the 21.5°C as a new override.

### 4.2. Mode Mismatches (Capability Mapping)
*   **Scenario:** Zone is `AUTO` (maintaining 20°C - 24°C). Wall Dial only supports `HEAT` or `COOL`.
*   **Requirement:**
    *   **Display:** If Zone is Heating, set Dial to `HEAT` and display 20°C. If Cooling, set Dial to `COOL` and display 24°C.
    *   **Input:** If User switches Dial to `COOL`, the **Zone remains in `AUTO` mode**. The system interprets this as a request to view/edit the **Cooling Setpoint**. The Dial's display is updated to match the Zone's current `target_temp_high`.
    *   **Constraint:** Switching modes on a physical dial should never force a Zone out of `AUTO` unless the Dial specifically supports a mapping to a different logical state (e.g. a "Manual" toggle).

### 4.3. The "Stubborn" Device
*   **Scenario:** We send "OFF" to a TRV. Its internal scheduler wakes it up 10 mins later and sets it to 21°C.
*   **Requirement:** The Reconciler must detect that the Device State (`21°C`) disagrees with Desired State (`OFF`) and **re-issue the command**.
*   **Constraint:** Must avoid "Command Spamming" (need a retry backoff or budget).

### 4.4. Latency & partial Updates
*   **Scenario:** Cloud-based AC. We send `Mode=COOL, Temp=22`.
*   **Sequence:**
    1.  AC reports `Mode=COOL` (Temp still old).
    2.  2 seconds later... AC reports `Temp=22`.
*   **Requirement:** The Input Processor must wait for a "Settled State" or be smart enough to partial-match inputs. We cannot treat the intermediate state as a user override.

### 4.5. The "Duel" (Concurrent Inputs)
*   **Scenario:** User A adjusts App (to 22°C). User B adjusts Wall Dial (to 24°C) simultaneously.
*   **Requirement:** Last Write Wins. Both are valid user intents. The System must process them sequentially.

### 4.6. Offline / Unavailable Hardware
*   **Scenario:** The Wall Dial (Sensor) runs out of battery.
*   **Requirement:**
    *   **Failsafe:** Zone enters `Safety Mode` (Default 5°C or maintain last known safe output?).
    *   **UI:** User must be alerted.
    *   **Recovery:** When device returns, it should receive the *current* Zone state (not push its stale state to the Zone).

### 4.7. Setpoint Resolution (Float Math)
*   **Scenario:** Dial sends `20.0` C. Zone stores `20.0`. Internal logic compares `20.00001`.
*   **Requirement:** All comparisons must use a defined tolerance (e.g., `epsilon = 0.1`).

## 5. Architectural Proposal (Draft)

```mermaid
graph TD
    User[User (App)] -->|Intent| IntentBus
    Device[Physical Device] -->|State Change| InputLayer
    
    subgraph Core Logic
        InputLayer -->|Filter Echoes| IntentBus
        IntentBus -->|Apply Override| StateMachine
        Schedule -->|Base Config| StateMachine
        StateMachine -->|Calculate| DesiredState
    end
    
    subgraph Reconciliation
        DesiredState --> DifferenceEngine
        CurrentDeviceState --> DifferenceEngine
        DifferenceEngine -->|Commands| DeviceDriver
    end
    
    DeviceDriver --> Device
```
