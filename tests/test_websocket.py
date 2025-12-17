"""Test Climate Dashboard WebSocket API."""

from typing import Any

import pytest
from homeassistant.const import SERVICE_TURN_OFF, SERVICE_TURN_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component


@pytest.fixture(autouse=True)
async def setup_integration(hass: HomeAssistant) -> None:
    """Set up the integration and mock services."""

    # Mock Switch Services to prevent Zone entity crashes
    async def async_mock_service(call: Any) -> None:
        pass

    hass.services.async_register("switch", SERVICE_TURN_ON, async_mock_service)
    hass.services.async_register("switch", SERVICE_TURN_OFF, async_mock_service)
    hass.services.async_register("climate", "set_temperature", async_mock_service)
    hass.services.async_register("climate", "set_hvac_mode", async_mock_service)

    assert await async_setup_component(hass, "climate_dashboard", {})


async def test_scan_finds_entities(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test that the scan command finds unmanaged entities."""
    client = await hass_ws_client(hass)

    # 1. Setup Mock Entities
    # heater (switch)
    hass.states.async_set("switch.heater_1", "off", {"friendly_name": "Heater 1"})
    # cooler (climate)
    hass.states.async_set("climate.ac_1", "off", {"friendly_name": "AC 1", "hvac_modes": ["cool", "off"]})
    # sensor (temp)
    hass.states.async_set("sensor.temp_1", "20.0", {"device_class": "temperature", "unit_of_measurement": "°C"})
    # unwanted sensor
    hass.states.async_set("sensor.humidity", "50", {"device_class": "humidity"})

    # 2. Call Scan
    await client.send_json({"id": 1, "type": "climate_dashboard/scan"})
    response = await client.receive_json()
    assert response["success"]

    results = response["result"]
    assert len(results) >= 3

    # Verify contents
    ids = [r["entity_id"] for r in results]
    assert "switch.heater_1" in ids
    assert "climate.ac_1" in ids
    assert "sensor.temp_1" in ids
    assert "sensor.humidity" not in ids  # Filtered out


async def test_scan_resolves_areas(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test that scan resolves area names from registry."""
    client = await hass_ws_client(hass)

    # Registries
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)

    # Mock Config Entry
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    config_entry = MockConfigEntry(domain="demo", data={}, entry_id="demo")
    config_entry.add_to_hass(hass)

    # Create Area
    area_living = area_reg.async_create("Living Room")

    # 1. Entity with direct Area
    hass.states.async_set("switch.area_switch", "off")
    entry = ent_reg.async_get_or_create("switch", "demo", "area_switch", suggested_object_id="area_switch")
    ent_reg.async_update_entity(entry.entity_id, area_id=area_living.id)
    hass.states.async_set(entry.entity_id, "off")  # Ensure state exists for the registry ID

    # 2. Entity with Device Area
    device = dev_reg.async_get_or_create(config_entry_id="demo", connections={("mac", "12:34:56:78:90:AB")})
    dev_reg.async_update_device(device.id, area_id=area_living.id)

    hass.states.async_set("sensor.device_temp", "20", {"unit_of_measurement": "C"})
    entry_sensor = ent_reg.async_get_or_create(
        "sensor", "demo", "device_temp", suggested_object_id="device_temp", device_id=device.id
    )
    hass.states.async_set(entry_sensor.entity_id, "20", {"unit_of_measurement": "C"})

    # Call Scan
    await client.send_json({"id": 2, "type": "climate_dashboard/scan"})
    response = await client.receive_json()
    assert response["success"]

    results = response["result"]
    print(f"DEBUG: Scan Results: {results}")

    # Check Area Switch
    switch_res = next((r for r in results if r["entity_id"] == entry.entity_id), None)
    assert switch_res is not None, f"Switch {entry.entity_id} not found in results: {results}"
    assert switch_res["area_name"] == "Living Room"
    assert switch_res["area_id"] == area_living.id

    # Check Device Sensor
    sensor_res = next((r for r in results if r["entity_id"] == entry_sensor.entity_id), None)
    assert sensor_res is not None, f"Sensor {entry_sensor.entity_id} not found in results: {results}"
    assert sensor_res["area_name"] == "Living Room"
    assert sensor_res["area_id"] == area_living.id


async def test_scan_filters_existing_zones(hass: HomeAssistant, hass_ws_client: Any) -> None:
    """Test that entities already in a zone are excluded."""
    client = await hass_ws_client(hass)

    # 1. Create entities
    hass.states.async_set("switch.used_heater", "off")
    hass.states.async_set("sensor.used_temp", "20", {"unit_of_measurement": "C"})
    hass.states.async_set("switch.unused_heater", "off")

    # 2. Adopt Zone (adds to used_entities)
    await client.send_json(
        {
            "id": 1,
            "type": "climate_dashboard/adopt",
            "name": "My Zone",
            "temperature_sensor": "sensor.used_temp",
            "heaters": ["switch.used_heater"],
            "coolers": [],
            "window_sensors": [],
        }
    )
    resp = await client.receive_json()
    assert resp["success"]

    # 3. Call Scan
    await client.send_json({"id": 2, "type": "climate_dashboard/scan"})
    response = await client.receive_json()
    results = response["result"]
    ids = [r["entity_id"] for r in results]

    # Verify filtering
    assert "switch.unused_heater" in ids
    assert "switch.used_heater" not in ids
    # Sensors used in a zone are excluded by default logic
    assert "sensor.used_temp" not in ids

    # Also check the Zone entity itself is excluded
    # Slugified name for "My Zone" is "my_zone"
    # But let's check what the scan code excludes:
    # if state.entity_id.startswith("climate.zone_"): continue

    # We might need to ensure the zone entity exists in state machine
    # The adopt command should have created it.
    assert hass.states.get("climate.zone_my_zone") is not None
    assert "climate.zone_my_zone" not in ids
