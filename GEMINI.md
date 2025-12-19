# GEMINI.md - Project Context & Architecture

## 1. Project Identity
* **Name:** Climate Dashboard
* **Repo:** `ha-climate-dashboard`
* **Tagline:** "The missing management layer for Home Assistant Climate."
* **Vision:** A Sidebar Dashboard that replaces the "List of Cards" with a true management system. It acts as an Operating System for heating/cooling, offering "Setup" based workflows, unified timeline scheduling, and adaptive logic.

## 2. Core Philosophy (The "Why")
1.  **Manager, not just a Controller:** We don't just provide entities; we provide a UI to organize them.
2.  **Logic over YAML:** Users should never write a template or edit a config file. All configuration happens in the Dashboard via WebSocket.
3.  **Adoption, not Creation:** We scan existing hardware ("Unmanaged Devices") and "Adopt" them into smart "Zones."
4.  **Native Feel:** The entities we create (`climate.zone_*`) must behave 100% like native thermostats so they work with Alexa, HomeKit, and standard Lovelace cards.

## 3. Architecture

### Frontend (The Dashboard)
* **Type:** Custom Sidebar Panel (registered via `async_register_panel`).
* **Tech:** Custom Element (Lit/React) talking to Backend via WebSocket.
* **Key Views:**
    * **Setup:** A list of unmanaged `climate.*` and `switch.*` entities.
    * **Timeline:** A Gantt-chart style scheduler for all zones.
    * **Zone Editor:** Visual configuration of the specific zone's schedule and rules.

### Backend (The Integration)
* **Domain:** `climate_dashboard` (Internal technical name).
* **Config Flow:** Minimal. Only exists to register the integration. No per-zone config entries.
* **Storage:** Single JSON file in `.storage/climate_dashboard` managing all zones and schedules.
* **Entity Management:**
    * Entities are spawned dynamically on startup or via WebSocket triggers.
    * We use the `async_add_entities` callback pattern (saved to `hass.data`).
    * **Naming Convention:** `climate.zone_[friendly_name]` (e.g., `climate.zone_office`).

### The "ClimateZone" Engine (Python)
*   **Base Class:** Inherits from `ClimateEntity`.
*   **Zone-Level Mode:** The Zone Entity determines the HVAC Mode (`AUTO`, `HEAT`, `COOL`, `OFF`).
    *   **Schedule Agnostic:** The schedule only dictates the "Target Temperature", not the Mode.
*   **Control Logic:**
    *   **Heat Mode:** Activates heaters if `current < target`.
    *   **Cool Mode:** Activates coolers if `current > target`.
    *   **Auto Mode:** Maintains `target ± tolerance` (Deadband Logic).
    *   **Global Away Mode:**
        *   Overrides local targets with global `away_temperature` (Heat) and `away_temperature_cool` (Cool).
        *   Dual-point zones use wide deadband (e.g., 16°C - 30°C) to stay idle.
        *   Single-point zones use the relevant target for their mode.
        *   **Actuator Sync:** Forces target temperature to devices even if idle/off to ensure display sync.
        *   **Presence Automation:** Monitors `home_away_entity_id`. Presence Loss triggers reconfigurable "Away Delay" before activating.
*   **Hardware Abstraction:** Can control a `switch` (bang-bang) or a `climate` device (passing through setpoints).
*   **Wall Thermostat Sync:** Bi-directional sync with physical Zigbee dials (Screen reflects Schedule; Dial override triggers Manual Hold).

## 4. Data Model Concepts

* **Area (Physical):** The HA Area (e.g., "Kitchen"). Used for grouping suggestions in the Setup list.
* **Zone (Logical):** The `climate.zone_*` entity we create. Contains the Schedule, the Actuator(s), and the Sensor(s).
* **Actuator:** The hardware doing the work (TRV, AC, Boiler Relay).
*   **Sensor:** The truth source (Room Temp, Window Contact, Presence).

## 4a. Control Patterns
See [design/control_patterns.md](design/control_patterns.md) for detailed hardware strategies.
*   **Smart TRV:** Needs external sensor offset.
*   **Smart Switch:** Bang-bang logic.
*   **AC:** Complex modes + fan control.
*   **Wall Thermostat:** Bi-directional sync required.

## 5. Development Guidelines for AI

* **No YAML Config:** Do not suggest `configuration.yaml` solutions. All logic is strictly Python/JS.
* **Safety First:** Logic must include "Failsafes" (e.g., if a sensor goes unavailable for 1 hour, default to a safety temp).
* **Naming:**
    * User-facing entities: `climate.zone_*`
    * Internal variables: `target_temp`, `current_temp`, `actuator_entity`.
## 6. Project Roadmap

### Immediate Next Steps
- [x] **Global Modes:**
    - [x] Implement "Home" vs "Away" logic affecting all zones.
    - [x] Presence detection with automatic "Away Delay".
    - [x] "Away Cool" setting for dual-mode zones.
- [ ] **Timeline Interactivity:**
    - Click-to-Edit schedule blocks.
    - Touch-optimized resize/move (Long-press actions).
- [ ] **Smart Defaults:**
    - Click-to-Edit schedule blocks.
    - Touch-optimized resize/move (Long-press actions).
- [ ] **Global Modes:**
    - Implement "Home" vs "Away" logic affecting all zones.
- [ ] **Smart Defaults:**
    - "Room Type" templates (e.g., "Bedroom", "Office") for instant scheduling.

### Future
- [ ] **Zone Editor:**
    - Advanced rule configuration (e.g., "Window Open" delays).
- [ ] **Hardware Abstraction:**
    - Better support for AC units (fan/swing control).

## 7. Development Tools

* **`tools/setup_demo_registries.py`**: A helper script to verify and populate the development environment.
    *   **Purpose:** Ensures consistent demo data for testing "Adoption" flows.
    *   **Actions:**
        1.  Creates HA Areas (Living Room, Kitchen, etc.).
        2.  Creates `input_boolean` (Heaters) and `input_number` (Temp Sensors) in `.storage`.
        3.  Updates the Entity Registry to assign these new entities to the correct Areas.
    *   **Usage:** Run via `python3 tools/setup_demo_registries.py` (automatically handles ID generation and linking).

* **Console Helpers**
    *   **`window.deepQuery`**: A helper to traverse Shadow DOMs from the console.
        ```javascript
        window.deepQuery = function(selector, root = document) {
            let el = root.querySelector(selector);
            if (el) return el;
            // Walk all shadow roots
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
            while(walker.nextNode()) {
                if (walker.currentNode.shadowRoot) {
                    el = deepQuery(selector, walker.currentNode.shadowRoot);
                    if (el) return el;
                }
            }
            return null;
        }
        ```
        *   **Usage:**
            1.  Open `http://localhost:8123/climate-dashboard`
            2.  Run `deepQuery('ha-icon[icon="mdi:chart-timeline"]').click()`
