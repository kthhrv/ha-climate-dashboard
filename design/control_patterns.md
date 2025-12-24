# Common HVAC Control Patterns

To build a robust "Operating System" for climate, we must support the diverse hardware configurations found in Home Assistant users' homes.

## 1. The Smart TRV (Radiator Valve)
*   **Examples:** Tado, Shelly TRV, Sonoff, Moes (Zigbee).
*   **HA Entity:** `climate.trv_living_room`
*   **Modes:** `heat`, `off`, `auto` (often proprietary internal schedule).
*   **Challenge:**
    *   The built-in sensor is right next to the hot radiator (inaccurate).
    *   Users want to use a separate room sensor to control the valve.
*   **Strategy:**
    *   **Adoption:** We take control of the Target Temperature.
    *   **Logic:** We set the TRV to `auto` mode (if available) or `heat`. We modulate the `target_temp` based on our external sensor.
    *   **Note:** We prefer `auto` because some TRVs (e.g. Tuya) treat `heat` as "Force Valve Open". We rely on our control loop to overwrite any internal schedule reverts.

## 2. The Smart Switch (Bang-Bang)
*   **Examples:** Electric Space Heater on a Zigbee plug, Mill Wifi Heater (old gen), Boiler Relay.
*   **HA Entity:** `switch.heater_plug`
*   **Modes:** `on`, `off`.
*   **Challenge:** No native concept of temperature. High overshoot risk.
*   **Strategy:**
    *   **Adoption:** Requires selecting a pairing Temperature Sensor.
    *   **Logic:** `Generic Thermostat` logic (Hysteresis).
    *   **Safety:** Critical need for "failsafe off" if sensor dies.

## 3. The Air Conditioner (Split / Window Unit)
*   **Examples:** Daikin, Mitsubishi (via ESPHome/Cloud), IR Blasters (Broadlink).
*   **HA Entity:** `climate.ac_living_room`
*   **Modes:** `cool`, `heat`, `dry`, `fan_only`, `off`.
*   **Challenge:**
    *   Complex state machine (Swing, Fan Speed).
    *   "Beep" noise on every command (user distraction).
*   **Strategy:**
    *   **Adoption:** Pass-through of Fan/Swing controls (future feature).
    *   **Logic:** Often just sending the Target Temp is enough.

## 4. The Wall Thermostat (Physical Interface)
*   **Examples:** Nest, Ecobee, physically wired wall dial.
*   **HA Entity:** `climate.hallway_stat`
*   **Modes:** `heat_cool`, `auto`.
*   **Challenge:** Two-way sync.
    *   User turns dial on wall -> Dashboard must reflect "Manual Override".
    *   Dashboard schedule changes -> Wall unit target must update.
*   **Strategy:**
    *   **Adoption:** "Sync Mode". We don't replace its logic, we just feed it the schedule targets.

## 5. Underfloor Heating (Slow Response)
*   **Examples:** Water-based loops with thermal actuators.
*   **HA Entity:** `switch.*` or `climate.*`
*   **Challenge:** Huge latency (hours to heat up).
*   **Strategy:**
    *   **Logic:** Needs "Predictive Start" (Smart Recovery).
    *   **Schedule:** Users typically set constant temp rather than frequent changes.

## 6. The Central Boiler (Interlock)
*   **Scenario:** 5 Rooms with TRVs. 1 Central Boiler Thermostat.
*   **Status Classification:** Dominant Community Pattern (often called "Zone-Based Heating").
*   **Challenge:** The Boiler needs to fire if *any* TRV is open/calling for heat.
*   **Current State:** Users rely on complex "Better Thermostat" setups or custom Blueprints to aggregate demand.
*   **Strategy:**
    *   **Demand Aggregation:** The Dashboard should expose a global `sensor.climate_heat_demand` (count of zones heating).
    *   **Logic:**
        *   If `demand > 0` -> Call for heat on `climate.main_thermostat` (or close the relay `switch.boiler`).
        *   If `demand == 0` -> Stop boiler.
    *   **Variant: Multi-Zone Valves (Hierarchical):**
        *   *Scenario:* Upstairs vs. Downstairs plumbing zones, each with a Motorized Valve (e.g. wired to a Zigbee Relay).
        *   *Logic:*
            *   Upstairs TRVs Demand -> Open `switch.upstairs_valve`.
            *   Downstairs TRVs Demand -> Open `switch.downstairs_valve`.
            *   If *either* Valve is Open -> Fire `switch.boiler`.
    *   **Optimization:** "Load Balancing" - keep the boiler flow temperature as low as possible while satisfying the demanding zone (OpenTherm/Modulation - Future).

## 7. The IR Blaster (Virtual AC)
*   **Examples:** Broadlink RM4, Tuya IR, SwitchBot Hub.
*   **Challenge:** "One-Way Communication". The Dashboard sends a signal, but doesn't know if the AC received it.
*   **Risk:** User uses the physical remote -> Dashboard State is wrong.
*   **Strategy:**
    *   **"Hide the Remote":** Encourage users to control *only* via Dashboard or Voice.
    *   **State Inference:** Use a power monitoring plug to confirm if the AC is running.
    *   **Integration:** Support "SmartIR" style code libraries (broad database of IR codes).

## 8. The Heat Pump (Low & Slow)
*   **Examples:** Daikin Altherma, Mitsubishi Ecodan (Air-to-Water).
*   **Challenge:** Efficiency kills if you cycle them on/off like a gas boiler. They need to run for hours at low power.
*   **Strategy:**
    *   **Weather Compensation:** Dashboard should adjust Target Flow Temp based on Outside Temp properly.
    *   **Modulation:** Avoid "Bang-Bang" control. Instead of turning off when 21°C is reached, reduce the Flow Temp.
    *   **Schedule:** "Setback" strategies (e.g. 21°C day, 19°C night) work better than turning off completely.
