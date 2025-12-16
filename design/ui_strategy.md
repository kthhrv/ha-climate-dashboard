# UX Strategy: Complexity Isolation

To manage the 8+ control patterns without overwhelming the user, we strictly use **Progressive Disclosure**. The main dashboard must remain simple; complexity is hidden inside the "Adoption" flow.

## 1. The "What is this?" Question
When adopting a device/zone, the first question is **"Zone Type"**:
*   **Simple Room:** (Heater + Sensor). The default.
*   **Radiator:** (TRV + Optional Sensor).
*   **AC:** (Split Unit).
*   **Group:** (For the Boiler Interlock).

## 2. Dynamic Zone Editor
The Editor UI changes based on Type.
*   *If "Simple Room":* "Min Temp", "Max Temp" fields are hidden (defaults used).
*   *If "Group":* "Sensor" field is hidden (it aggregates children). "Heater" becomes "Valve/Relay".
*   *If "AC":* "Fan Mode" options appear.

## 3. "Smart Defaults" (The 80/20 Rule)
*   We pre-fill settings based on what we scan.
*   If we see a `climate.trv_kitchen`, we default to **Radiator** type.
*   If we see `switch.heater`, we default to **Simple Room** type.
*   Advanced tuning (PID values, offsets) is tucked behind an "Advanced Settings" accordion.

## 4. Visual Hierarchy in the Inbox
*   We don't show "Boiler Interlock" technical terms.
*   We show: **"Living Room (3 Radiators)"**.
*   The "Group" is just a container. It feels natural, not technical.

## 5. The "No YAML" Promise
Complexity must never leak into text config. If a setup is too complex for a clean UI (e.g., highly custom heat pump modulation curves), we should consider *not* supporting it in the core MVP rather than breaking the UX.
