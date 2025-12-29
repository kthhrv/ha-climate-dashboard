# Climate Dashboard for Home Assistant

![GitHub Release](https://img.shields.io/github/v/release/kthhrv/ha-climate-dashboard?style=flat-square)
![License](https://img.shields.io/github/license/kthhrv/ha-climate-dashboard?style=flat-square)
![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)

**Climate Dashboard** is an advanced climate management system for Home Assistant. It acts as a **"Climate Reconciliation Engine"** that orchestrates multiple physical devices (TRVs, AC units, window sensors, presence sensors) into cohesive "Climate Zones".

It solves synchronization issues, prevents "fighting" between devices, and adds intelligent features like global scheduling, aggregated control, and occupancy-based energy saving—all without a single line of YAML automation.

---

## 🚀 Why Use This?

If you've ever tried to group a wall thermostat with a smart radiator valve (TRV), handle "window open" logic, or set up a complex heating schedule using only standard Home Assistant automations, you know the pain:
*   **Device Fighting:** The wall thermostat says 21°C, the TRV says 19°C, and they fight each other.
*   **Echo Loops:** Turning a dial updates Home Assistant, which updates the dial, creating a feedback loop.
*   **Complexity:** Managing schedules, presence detection, and "Away Mode" requires dozens of automations per room.

**Climate Dashboard solves this by introducing a "Source of Truth" engine.** You define the goal (Zone Settings), and the engine handles the dirty work of syncing that state to your hardware reliably.

## ✨ Key Features

1.  **Reconciliation Engine:** A robust backend that calculates the "Desired State" based on a strict priority hierarchy. It ensures safety and user intent always win over background schedules.
2.  **Climate Zones:** Logically group multiple devices (e.g., "Living Room" = 1x TRV + 1x AC + 2x Window Sensors + 1x Motion Sensor) into a single, standard thermostat entity (`climate.zone_living_room`).
3.  **Occupancy Setback (New):** Automatically lowers the target temperature to save energy when a room is empty for a configurable time (e.g., 30 mins). It restores the previous target instantly upon return.
4.  **Hardware Latch:** Intelligent "Windowing" logic prevents echo loops when syncing physical thermostat dials, making interaction feel instant and natural.
5.  **Modern Dashboard:** A dedicated Lovelace panel built with Lit/TypeScript featuring:
    *   **Visual Timeline Editor:** Drag-and-drop scheduling.
    *   **Zone Management:** Create, edit, and adopt devices via UI.
    *   **Clear Status:** Instantly see *why* a room is heating (e.g., "Manual Override", "Occupancy Setback", "Schedule").
6.  **"Adopt" Workflow:** Easily onboard your existing Home Assistant entities into managed zones.

## 🏗 Architecture & Priority Logic

The core of the system is the **Reconciliation Engine**. Every time a sensor changes or time passes, the engine evaluates all active "Intents" and picks a winner based on this priority:

| Priority | Intent Source | Description |
| :--- | :--- | :--- |
| **0 (Highest)** | **Safety / Window** | Force OFF if a window is open or a sensor fails. |
| **1** | **Away Mode** | Global "Away" switch overrides everything else. |
| **2** | **Occupancy Setback** | Drops temperature if room is empty (Energy Saver). |
| **3** | **Manual Override** | User adjusted the dial or app (Highest user intent). |
| **4 (Lowest)** | **Schedule** | The default background plan. |

*Note: Occupancy Setback (2) intentionally overrides Manual (3) to prevent wasting energy if you manually boost the heat and then leave the house.*

## 📦 Installation

### HACS (Recommended)
1.  Open HACS in Home Assistant.
2.  Go to **Integrations** > **Custom Repositories**.
3.  Add `https://github.com/kthhrv/ha-climate-dashboard` as an **Integration**.
4.  Click **Install**.
5.  Restart Home Assistant.

### Manual
1.  Download the latest release.
2.  Copy the `custom_components/climate_dashboard` folder to your HA `config/custom_components/` directory.
3.  Restart Home Assistant.

## ⚙️ Configuration

1.  **Add Integration:** Go to **Settings** > **Devices & Services** > **Add Integration** > **Climate Dashboard**.
2.  **Open Dashboard:** Click the new **Climate Dashboard** item in your sidebar.
3.  **Create a Zone:**
    *   Click **"Adopt Zone"** or the **+** button.
    *   **Name:** Give it a name (e.g., "Kitchen").
    *   **Sensors:** Select your temperature sensor, heaters (switches or climates), and window sensors.
    *   **Occupancy:** (Optional) Select a motion sensor and set a timeout (e.g., 15 min) and setback temp (e.g., 18°C).
4.  **Set Schedule:** Click on the zone card to open the Timeline Editor. Drag to create blocks for "Morning", "Day", "Evening", etc.

## 🛠 Development

This project uses a modern Python & TypeScript stack.

### Prerequisites
*   [uv](https://github.com/astral-sh/uv) (Fast Python package manager)
*   Node.js & npm (for Frontend)
*   Docker (for running a local HA dev instance)

### Setup
```bash
# 1. Install Python dependencies
uv sync

# 2. Build Frontend
cd frontend
npm install
npm run build
cd ..

# 3. Run Development Instance (with pre-configured demo data)
# This sets up a local Home Assistant instance with MQTT and simulated devices.
uv run tasks.py run
```

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
