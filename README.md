# Home Assistant Climate Dashboard

**The missing management layer for Home Assistant Climate.**

Climate Dashboard is a custom integration and sidebar panel that acts as an "Operating System" for your home's heating and cooling. It replaces the fragmented experience of managing individual thermostat cards with a unified, timeline-based management interface.

<img width="900" height="989" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/68a2d9fd-6a89-40fe-a1e4-070fec80d01b" />


## 🌟 Why Climate Dashboard?

- **Manager, not just a Controller:** Don't just adjust temperature; organize your entire home's climate strategy.
- **Logic over YAML:** advanced scheduling, grouping, and rules are handled via the UI. No `configuration.yaml` editing required.
- **Hardware Agnostic:** "Adopt" any existing `climate.*` entity (TRVs, ACs) or even simple `switch.*` entities (electric heaters) into smart Zones.
- **Native Behavior:** The zones created (`climate.zone_kitchen`) behave exactly like native thermostats, compatible with Alexa, HomeKit, and Google Home.

## ✨ Key Features

### 📅 Timeline Scheduler
Visualize your heating and cooling schedule like a calendar. See exactly when your home will warm up or cool down.
- **Smart Transitions:** The dashboard calculates the perfect time to start heating to hit your target by the scheduled time.
- **Dual-Mode Blocks:** Schedule both a Heat and Cool target for the same time block, and the system will automatically maintain the comfort zone.

### ❄️ Cooling & Dual-Mode
Full support for Air Conditioning and Heat Pumps.
- **Dedicated Coolers:** Assign AC units or fans as "Coolers" for a zone.
- **Auto-Deadband Logic:** In `AUTO` mode, the zone maintains a temperature range (e.g., 20°C - 24°C), switching between heating and cooling as needed.
- **Away Cool:** Protect your home from overheating while you're away with a global "Away Cool" override.

### 🔗 Heating Circuits (Actuator Groups)
Manage shared hardware like boilers, heat pumps, or manifold pumps.
- **Demand-Based Control:** Create a "Circuit" that groups multiple Zones. The shared boiler only turns on if at least one zone actually needs heat.
- **Efficiency:** Prevents "short cycling" and ensures the heat source is only active when there is real demand.

### 🏠 Zone Management (Adoption)
Stop dealing with entity IDs.
- **Scan & Adopt:** The dashboard finds your unmanaged devices.
- **Smart Zones:** Group a TRV, a Window Sensor, and a Room Sensor into a single logical "Zone".
- **Safety First:** If a sensor goes offline, the Zone automatically enters **Safety Mode**, setting TRVs to a safe 5°C or turning off switches to prevent overheating.

### 🛡️ Robust Failsafes
Your heating is critical. The dashboard treats it that way.
- **Area Fallback:** If a room sensor dies, the system automatically hunts for another sensor in the same Area to keep the heating running.
- **Delegated Safety:** If all sensors fail, smart valves are set to their internal frost-protection mode.
- **Self-Healing:** The moment a sensor comes back online, normal operation resumes instantly.

## 🚀 Getting Started

### 1. Installation
*Currently in Private Beta / Development Mode*

1. Copy the `custom_components/climate_dashboard` folder to your Home Assistant `custom_components` directory.
2. Restart Home Assistant.

### 2. Setup
1. Go to **Settings > Devices & Services**.
2. Add Integration > Search for **"Climate Dashboard"**.
3. A new **"Climate"** item will appear in your sidebar.

### 3. Adopt Your First Zone
1. Open the Climate Sidebar.
2. You will see an "Inbox" of unmanaged devices.
3. Click **"Adopt"** on a heater or AC unit.
4. Assign it to an Area (e.g., Living Room) and choose a thermometer.
5. Done! You now have a smart `climate.zone_living_room`.

## 🛠️ Configuration

All configuration is done via the Dashboard UI. 

**Tips:**
- **Window Sensors:** Add window sensors to a Zone to automatically turn off heating when the window opens.
- **Away Mode:** Enable global overrides to instantly set all zones to energy-saving temperatures when you leave the house.

## 📄 License
MIT License
