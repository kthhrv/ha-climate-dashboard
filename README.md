# Climate Dashboard for Home Assistant

Groups your climate devices into zones and manages them so you don't have to.

If you've got multiple rooms with TRVs, temp sensors, motion sensors, window sensors, and AC units, you end up with a lot of repeated boilerplate automations that are hard to maintain. This replaces all of that with a single UI.

## What it does

- Groups devices into zones (e.g. "Kitchen" = TRV + temp sensor + window sensor)
- Turns heating/cooling off when a window opens
- Drops temperature when a room is empty
- Away mode when the house is empty
- Handles rooms with both heating and cooling
- Visual schedule editor, no YAML
- Adopt your existing HA entities through the UI

Been running it in my own home for 3 months across 7 rooms.

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant.
2. Go to **Integrations** > **Custom Repositories**.
3. Add `https://github.com/kthhrv/ha-climate-dashboard` as an **Integration**.
4. Click **Install**.
5. Restart Home Assistant.

### Manual

1. Download the latest release.
2. Copy the `custom_components/climate_dashboard` folder to your HA `config/custom_components/` directory.
3. Restart Home Assistant.

## Setup

1. Go to **Settings** > **Devices & Services** > **Add Integration** > **Climate Dashboard**.
2. Open **Climate Dashboard** from the sidebar.
3. Create a zone — give it a name, select your sensors, heaters, and AC units.
4. Set a schedule using the visual editor if you want one.

## Development

### Prerequisites

- [uv](https://github.com/astral-sh/uv)
- Node.js & npm
- Docker (for local HA dev instance)

### Setup

```
# Install Python dependencies
uv sync

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Run local dev instance
uv run tasks.py run
```
