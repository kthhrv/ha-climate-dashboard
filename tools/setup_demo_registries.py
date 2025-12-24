import json
import os
import time
import uuid
from typing import Any, cast

CONFIG_DIR = "/home/keith/ws/ha-climate-dashboard/config"
STORAGE_DIR = os.path.join(CONFIG_DIR, ".storage")

AREA_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.area_registry")
DEVICE_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.device_registry")  # Added
ENTITY_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.entity_registry")
FLOOR_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.floor_registry")
CLIMATE_DASHBOARD_PATH = os.path.join(STORAGE_DIR, "climate_dashboard")
CONFIG_ENTRIES_PATH = os.path.join(STORAGE_DIR, "core.config_entries")
CONFIGURATION_YAML_PATH = os.path.join(CONFIG_DIR, "configuration.yaml")

# Define Floors
FLOORS = [
    {"name": "Ground Floor", "id": "ground_floor", "icon": "mdi:home-floor-0", "level": 0},
    {"name": "First Floor", "id": "first_floor", "icon": "mdi:home-floor-1", "level": 1},
    {"name": "Second Floor", "id": "second_floor", "icon": "mdi:home-floor-2", "level": 2},
]

# Define Areas
AREAS = [
    {"name": "Living Room", "id": "living_room", "floor_id": "ground_floor"},
    {"name": "Kitchen", "id": "kitchen", "floor_id": "ground_floor"},
    {"name": "Master Bedroom", "id": "master_bedroom", "floor_id": "second_floor"},
    {"name": "Bedroom 2", "id": "bedroom_2", "floor_id": "first_floor"},
    {"name": "Bedroom 3", "id": "bedroom_3", "floor_id": "first_floor"},
    {"name": "Office", "id": "office", "floor_id": "ground_floor"},
    {"name": "Bathroom", "id": "bathroom", "floor_id": "first_floor"},
    {"name": "Guest Room", "id": "guest_room", "floor_id": "ground_floor"},  # Added Area
]

# Define Entity links (unique_id -> area_id)
# This map handles generic_thermostats (manually defined in YAML with unique_id)
ENTITY_AREA_MAP = {
    "climate_living_room": "living_room",
    "climate_kitchen": "kitchen",
    "climate_master_bedroom": "master_bedroom",
    "climate_bedroom_2": "bedroom_2",
    "climate_bedroom_3": "bedroom_3",
    "climate_office": "office",
    "climate_office_ac": "office",
    "climate_bathroom": "bathroom",
    "climate_guest_room_dial": "guest_room",  # Wall Thermostat
    "climate_guest_room_ac": "guest_room",  # AC Unit
    "climate_guest_room_trv": "guest_room",  # TRV
    # Climate Dashboard Zones (Logical)
    "zone_living_room": "living_room",
    "zone_kitchen": "kitchen",
    "zone_office_ac": "office",
    "zone_office_dual": "office",
    "zone_guest_room": "guest_room",
    "zone_fallback": "bedroom_2",
    "zone_safety": "bedroom_3",
    "zone_master_bedroom": "master_bedroom",
    # Binary Sensors (Templates)
    "binary_sensor_kitchen_door": "kitchen",
    "binary_sensor_master_bedroom_window": "master_bedroom",
    "binary_sensor_guest_room_window": "guest_room",
    # Standalone Sensors (Templates)
    "sensor_living_room_standalone_temp": "living_room",
    "sensor_bedroom_2_standalone_temp": "bedroom_2",
    "sensor_broken_fallback": "bedroom_2",
    "sensor_broken_safety": "bedroom_3",
}

INPUT_BOOLEAN_PATH = os.path.join(STORAGE_DIR, "input_boolean")
INPUT_NUMBER_PATH = os.path.join(STORAGE_DIR, "input_number")

# Define Entities (simulated hardware)
# structure: key -> { name, icon, area_id }
# key will be part of entity_id: input_boolean.[key]
INPUT_BOOLEANS: dict[str, dict[str, str]] = {
    "heater_living_room": {"name": "Living Room Heater", "icon": "mdi:radiator", "area_id": "living_room"},
    "heater_kitchen": {"name": "Kitchen Heater", "icon": "mdi:radiator", "area_id": "kitchen"},
    "heater_master_bedroom": {"name": "Master Bedroom Heater", "icon": "mdi:radiator", "area_id": "master_bedroom"},
    "heater_bedroom_2": {"name": "Bedroom 2 Heater", "icon": "mdi:radiator", "area_id": "bedroom_2"},
    "heater_bedroom_3": {"name": "Bedroom 3 Heater", "icon": "mdi:radiator", "area_id": "bedroom_3"},
    "heater_office": {"name": "Office Heater", "icon": "mdi:radiator", "area_id": "office"},
    "heater_bathroom": {"name": "Bathroom Heater", "icon": "mdi:radiator", "area_id": "bathroom"},
    "heater_guest_room": {"name": "Guest Room Heater", "icon": "mdi:radiator", "area_id": "guest_room"},  # Added Helper
    "ac_guest_room": {"name": "Guest Room AC", "icon": "mdi:air-conditioner", "area_id": "guest_room"},
    "ac_office": {"name": "Office AC", "icon": "mdi:air-conditioner", "area_id": "office"},
    # We create input_booleans for these, but we map the BINARY_SENSOR wrapper to the area below
    "door_kitchen": {
        "name": "Kitchen Door Boolean",
        "icon": "mdi:door",
        "area_id": "__SKIP__",  # Don't map boolean to area, map the template instead
    },
    "window_guest_room": {
        "name": "Guest Room Window Boolean",
        "icon": "mdi:window-closed",
        "area_id": "__SKIP__",
    },
    "window_master_bedroom": {
        "name": "Master Bedroom Window Boolean",
        "icon": "mdi:window-closed",
        "area_id": "__SKIP__",
    },
    "family_home": {
        "name": "Family Home",
        "icon": "mdi:home-account",
        "area_id": "__SKIP__",
    },
    "boiler": {
        "name": "Boiler",
        "icon": "mdi:fire",
        "area_id": "__SKIP__",
    },
}

INPUT_NUMBERS: dict[str, dict[str, Any]] = {
    "temp_living_room": {
        "name": "Living Room Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "living_room",
    },
    # ... (other entries implicitly typed)
    "temp_kitchen": {
        "name": "Kitchen Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "kitchen",
    },
    "temp_master_bedroom": {
        "name": "Master Bedroom Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "master_bedroom",
    },
    "temp_bedroom_2": {
        "name": "Bedroom 2 Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bedroom_2",
    },
    "temp_bedroom_3": {
        "name": "Bedroom 3 Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bedroom_3",
    },
    "temp_office": {
        "name": "Office Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "office",
    },
    "temp_bathroom": {
        "name": "Bathroom Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bathroom",
    },
    "temp_guest_room": {
        "name": "Guest Room Temp",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "guest_room",
    },
    # Standalone Sensors (Input Numbers acting as the hardware)
    "temp_living_room_standalone": {
        "name": "Living Room Standalone Temp Source",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 21.0,
        "area_id": "__SKIP__",  # Wrapped by template sensor
    },
    "temp_bedroom_2_standalone": {
        "name": "Bedroom 2 Standalone Temp Source",
        "min": 0,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 20.0,
        "area_id": "__SKIP__",  # Wrapped by template sensor
    },
}

GENERIC_THERMOSTATS = [
    {
        "name": "TRV Living Room",
        "unique_id": "trv_living_room",
        "heater": "input_boolean.living_room_heater",
        "target_sensor": "input_number.living_room_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 21,
    },
    {
        "name": "Kitchen",
        "unique_id": "climate_kitchen",
        "heater": "input_boolean.kitchen_heater",
        "target_sensor": "input_number.kitchen_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 21,
    },
    {
        "name": "Master Bedroom",
        "unique_id": "climate_master_bedroom",
        "heater": "input_boolean.master_bedroom_heater",
        "target_sensor": "input_number.master_bedroom_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 19,
    },
    {
        "name": "Bedroom 2",
        "unique_id": "climate_bedroom_2",
        "heater": "input_boolean.bedroom_2_heater",
        "target_sensor": "input_number.bedroom_2_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 20,
    },
    {
        "name": "Bedroom 3",
        "unique_id": "climate_bedroom_3",
        "heater": "input_boolean.bedroom_3_heater",
        "target_sensor": "input_number.bedroom_3_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 20,
    },
    {
        "name": "Office",
        "unique_id": "climate_office",
        "heater": "input_boolean.office_heater",
        "target_sensor": "input_number.office_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 21,
    },
    {
        "name": "Office AC",
        "unique_id": "climate_office_ac",
        "heater": "input_boolean.office_ac",
        "target_sensor": "input_number.office_temp",
        "min_temp": 10,
        "max_temp": 30,
        "ac_mode": True,
        "target_temp": 24,
    },
    {
        "name": "Bathroom",
        "unique_id": "climate_bathroom",
        "heater": "input_boolean.bathroom_heater",
        "target_sensor": "input_number.bathroom_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 22,
    },
    # Triple Threat: Dial + TRV + AC
    {
        "name": "Guest Room Dial",
        "unique_id": "climate_guest_room_dial",
        "heater": "input_boolean.guest_room_heater",  # Dummy link, logic handled by Zone
        "target_sensor": "input_number.guest_room_temp",
        "min_temp": 10,
        "max_temp": 30,
        "ac_mode": False,  # Just a dial
        "target_temp": 21,
    },
    {
        "name": "Guest Room TRV",
        "unique_id": "climate_guest_room_trv",
        "heater": "input_boolean.guest_room_heater",
        "target_sensor": "input_number.guest_room_temp",
        "min_temp": 5,
        "max_temp": 30,
        "ac_mode": False,
        "target_temp": 21,
    },
    {
        "name": "Guest Room AC",
        "unique_id": "climate_guest_room_ac",
        "heater": "input_boolean.guest_room_ac",
        "target_sensor": "input_number.guest_room_temp",
        "min_temp": 16,
        "max_temp": 30,
        "ac_mode": True,
        "target_temp": 24,
    },
]

# Defines Template Entries to be created via Config Entries (Helpers)
# Note: The data structure for template helpers in config entries is complex.
# We will use valid config entry data for "template" domain.
TEMPLATE_ENTRIES: list[dict[str, Any]] = [
    # Binary Sensors
    {
        "name": "Kitchen Door",
        "unique_id": "binary_sensor_kitchen_door",  # used for lookup, not always in data
        "type": "binary_sensor",
        "state": "{{ is_state('input_boolean.kitchen_door_boolean', 'on') }}",
        "device_class": "door",
    },
    {
        "name": "Master Bedroom Window",
        "unique_id": "binary_sensor_master_bedroom_window",
        "type": "binary_sensor",
        "state": "{{ is_state('input_boolean.master_bedroom_window_boolean', 'on') }}",
        "device_class": "window",
    },
    {
        "name": "Guest Room Window",
        "unique_id": "binary_sensor_guest_room_window",
        "type": "binary_sensor",
        "state": "{{ is_state('input_boolean.guest_room_window_boolean', 'on') }}",
        "device_class": "window",
    },
    # Sensors
    {
        "name": "Living Room Standalone Temp",
        "unique_id": "sensor_living_room_standalone_temp",
        "type": "sensor",
        "state": "{{ states('input_number.living_room_standalone_temp_source') }}",
        "unit_of_measurement": "°C",
        "device_class": "temperature",
    },
    {
        "name": "Bedroom 2 Standalone Temp",
        "unique_id": "sensor_bedroom_2_standalone_temp",
        "type": "sensor",
        "state": "{{ states('input_number.bedroom_2_standalone_temp_source') }}",
        "unit_of_measurement": "°C",
        "device_class": "temperature",
    },
    {
        "name": "Broken Sensor (Fallback)",
        "unique_id": "sensor_broken_fallback",
        "type": "sensor",
        "state": "{{ none }}",
        "unit_of_measurement": "°C",
        "device_class": "temperature",
    },
    {
        "name": "Broken Sensor (Safety)",
        "unique_id": "sensor_broken_safety",
        "type": "sensor",
        "state": "{{ none }}",
        "unit_of_measurement": "°C",
        "device_class": "temperature",
    },
    # Switches
    {
        "name": "Boiler",
        "unique_id": "switch_boiler",
        "type": "switch",
        "state": "{{ states('input_boolean.boiler') }}",
        "turn_on": [{"service": "input_boolean.turn_on", "target": {"entity_id": "input_boolean.boiler"}}],
        "turn_off": [{"service": "input_boolean.turn_off", "target": {"entity_id": "input_boolean.boiler"}}],
    },
]


def load_json(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        return {"version": 1, "minor_version": 1, "key": path.split("/")[-1], "data": {"areas": [], "entities": []}}
    with open(path, "r") as f:
        return cast(dict[str, Any], json.load(f))


def save_json(path: str, data: dict[str, Any]) -> None:
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


def setup_floors() -> None:
    """Create floors in the registry."""
    data: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "core.floor_registry", "data": {"floors": []}}

    current_floors = data["data"]["floors"]

    for floor in FLOORS:
        current_floors.append(
            {
                "aliases": [],
                "floor_id": floor["id"],
                "icon": floor["icon"],
                "level": floor["level"],
                "name": floor["name"],
                "created_at": "2023-01-01T00:00:00+00:00",
                "modified_at": "2023-01-01T00:00:00+00:00",
            }
        )
        print(f"Created Floor: {floor['name']}")

    save_json(FLOOR_REGISTRY_PATH, data)


def setup_areas() -> None:
    data = load_json(AREA_REGISTRY_PATH)
    if not isinstance(data.get("data"), dict):
        pass

    if not os.path.exists(AREA_REGISTRY_PATH):
        data = {"version": 1, "minor_version": 7, "key": "core.area_registry", "data": {"areas": []}}

    current_areas = data["data"]["areas"]
    # existing_ids = {a["id"] for a in current_areas}

    for area in AREAS:
        floor_id = area.get("floor_id")

        # Check if area already exists
        found = False
        for ex_area in current_areas:
            if ex_area["id"] == area["id"]:
                # Update existing area
                ex_area["floor_id"] = floor_id
                found = True
                print(f"Updated Area: {area['name']} (Floor: {floor_id})")
                break

        if not found:
            current_areas.append(
                {
                    "aliases": [],
                    "icon": None,
                    "id": area["id"],
                    "name": area["name"],
                    "picture": None,
                    "floor_id": floor_id,
                    "labels": [],
                    "created_at": "2023-01-01T00:00:00+00:00",
                    "modified_at": "2023-01-01T00:00:00+00:00",
                    "humidity_entity_id": None,
                    "temperature_entity_id": None,
                }
            )
            print(f"Created Area: {area['name']} (Floor: {floor_id})")

    save_json(AREA_REGISTRY_PATH, data)


def setup_input_helpers() -> None:
    # Input Booleans
    data_bool: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "input_boolean", "data": {"items": []}}

    # Input Numbers
    data_num: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "input_number", "data": {"items": []}}

    # We need a stable map of key -> unique_id to use in entity registry
    # In storage, the ID *is* the uuid.
    # But checking HA source, input_boolean storage items have "id" (uuid) and "name".
    # The entity_id is derived from name.
    # To Ensure "input_boolean.heater_living_room", we must ensure name slugs to that.
    # But wait, storage items have an "id" which uses UUID.

    # Let's generate stable UUIDs based on names so we can map them in registry

    # Helper for UUID generation
    def get_uuid(key: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, key))

    for key, info in INPUT_BOOLEANS.items():
        uid = get_uuid(key)
        item = {"name": info["name"], "icon": info["icon"], "id": uid}
        data_bool["data"]["items"].append(item)

        # Add to global ENTITY_AREA_MAP logic?
        # We need to add to entity registry to link Area.
        # Entity ID? If created via storage, HA generates it.
        # "Living Room Heater" -> "input_boolean.living_room_heater" usually.
        # BUT our YAML used "heater_living_room".
        # We should Name it "Heater Living Room" to match? Or just accept the new name
        # and update configuration.yaml later?
        # Let's update configuration.yaml to match whatever HA generates.
        # Actually simplest: "Heater Living Room" -> input_boolean.heater_living_room

        # We'll map the UUID to the Area in the registry
        ENTITY_AREA_MAP[uid] = info["area_id"]

    for key, info_num in INPUT_NUMBERS.items():
        uid = get_uuid(key)
        item_num = {
            "name": info_num["name"],
            "min": info_num["min"],
            "max": info_num["max"],
            "step": info_num["step"],
            "mode": "box",
            "unit_of_measurement": info_num["unit"],
            "icon": info_num["icon"],
            "initial": info_num["initial"],
            "id": uid,
        }
        data_num["data"]["items"].append(item_num)
        ENTITY_AREA_MAP[uid] = info_num["area_id"]

    save_json(INPUT_BOOLEAN_PATH, data_bool)
    save_json(INPUT_NUMBER_PATH, data_num)
    print("Created Input Helpers in Storage")


def setup_entities(config_entry_map: dict[str, str] | None = None) -> None:
    if config_entry_map is None:
        config_entry_map = {}
    default_time = "1970-01-01T00:00:00+00:00"
    if not os.path.exists(ENTITY_REGISTRY_PATH):
        data: dict[str, Any] = {
            "version": 1,
            "minor_version": 7,
            "key": "core.entity_registry",
            "data": {"entities": []},
        }
    else:
        data = load_json(ENTITY_REGISTRY_PATH)

    current_entities = data["data"]["entities"]

    for logical_unique_id, area_id in ENTITY_AREA_MAP.items():
        domain = None
        # Resolve Config Entry ID if available
        entry_id = config_entry_map.get(logical_unique_id)

        # Determine unique_id for registry
        # If it's a Config Entry entity (Helper), its unique_id IS the entry_id.
        if entry_id:
            unique_id = entry_id
        else:
            unique_id = logical_unique_id

        found = False
        for ent in current_entities:
            if ent["unique_id"] == unique_id:
                ent["area_id"] = area_id
                ent["disabled_by"] = None
                found = True
                print(f"Updated Entity Area: {unique_id} -> {area_id}")
                break

        if not found:
            platform = "generic_thermostat"
            # Default naive split using logic ID
            entity_id = logical_unique_id.replace("_", ".", 1)

            # Fix for binary_sensor (which has an underscore in the domain)
            if logical_unique_id.startswith("binary_sensor_"):
                # binary_sensor_kitchen_door -> binary_sensor.kitchen_door
                entity_id = "binary_sensor." + logical_unique_id[14:]
                platform = "template"
            elif logical_unique_id.startswith("climate_"):
                entity_id = "climate." + logical_unique_id[8:]
            elif logical_unique_id.startswith("zone_"):
                # Climate Dashboard Zone
                # logical_id: zone_living_room -> entity: climate.zone_living_room
                entity_id = "climate." + logical_unique_id
                platform = "climate_dashboard"
            elif logical_unique_id.startswith("sensor_"):
                # sensor_living_room_standalone_temp -> sensor.living_room_standalone_temp
                entity_id = "sensor." + logical_unique_id[7:]
                platform = "template"

            if len(logical_unique_id) == 36:
                # Guess Entity ID from INPUT_BOOLEANS / NUMBERS reverse lookup?
                # Or just iterate our dicts to find the matching UUID

                # Reverse lookup
                info = None
                domain = None

                # Check Booleans
                for key_bool, val_bool in INPUT_BOOLEANS.items():
                    # We need to re-generate UUID to check?
                    # Or better, store UUID in the dict above?
                    # The script runs sequentially, so we can re-gen.
                    if str(uuid.uuid5(uuid.NAMESPACE_DNS, key_bool)) == logical_unique_id:
                        info = val_bool
                        domain = "input_boolean"
                        break

                if not info:
                    for key_num, val_num in INPUT_NUMBERS.items():
                        if str(uuid.uuid5(uuid.NAMESPACE_DNS, key_num)) == logical_unique_id:
                            info = val_num
                            domain = "input_number"
                            break

                if info and domain:
                    # Guess entity_id: domain.slugify(name)
                    # "Living Room Heater" -> "living_room_heater"
                    # "Heater Living Room" -> "heater_living_room"

                    # We named them "Living Room Heater" in the code above?
                    # "heater_living_room": {"name": "Living Room Heater"...}

                    # Wait, we want to match `configuration.yaml` usage?
                    # In YAML we used "heater_living_room".
                    # If we name it "Heater Living Room", HA makes "living_room_heater".
                    # If we name it "Heater Living Room", HA makes "heater_living_room" ONLY IF we change the name
                    # string or if slugify happens to match.

                    # Let's change the defined NAME in `setup_input_helpers` to ensure we get the desired slug.
                    # Actually, let's just use the desired slug as the NAME for simplicity in ID generation?
                    # No, that looks ugly in UI.

                    # Better plan: Update `configuration.yaml` to use the new "Clean" entity IDs.
                    # input_boolean.living_room_heater

                    sanitized_name = str(info["name"]).lower().replace(" ", "_").replace("-", "_")
                    entity_id = f"{domain}.{sanitized_name}"
                    platform = domain  # sort of

            # Determine Device ID if this is our Guest Room TRV
            device_id = None
            if logical_unique_id == "climate_guest_room_trv":
                device_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "device_guest_room_trv"))
                # Also link config entry
                dash_entry = config_entry_map.get("climate_dashboard_main")
                if dash_entry:
                    entry_id = dash_entry

            # Common Registry creation
            new_ent: dict[str, Any] = {
                "aliases": [],
                "area_id": area_id,
                "capabilities": {},
                "categories": {},
                "config_entry_id": entry_id,
                "config_subentry_id": None,
                "created_at": default_time,
                "modified_at": default_time,
                "device_class": None,
                "device_id": device_id,
                "disabled_by": None,
                "entity_category": None,
                "entity_id": entity_id,
                "has_entity_name": False,  # Important: for Generic Thermostat, if True it might double-name?
                "hidden_by": None,
                "icon": None,
                "id": uuid.uuid4().hex,
                "labels": [],
                "name": None,
                "options": {},
                "original_device_class": None,
                "original_icon": None,
                "original_name": None,
                "platform": platform,
                "supported_features": 0,
                "translation_key": None,
                "unique_id": unique_id,
                "unit_of_measurement": None,
            }
            if len(unique_id) == 36 and domain:
                new_ent["platform"] = domain

            current_entities.append(new_ent)
            print(f"Created Entity Registry Entry: {entity_id} -> {area_id} (ConfigEntry: {entry_id})")

    save_json(ENTITY_REGISTRY_PATH, data)


RESTORE_STATE_PATH = os.path.join(STORAGE_DIR, "core.restore_state")


def wipe_dashboard_storage() -> None:
    """Delete storage files to force a factory reset."""
    paths = [
        CLIMATE_DASHBOARD_PATH,
        RESTORE_STATE_PATH,
        FLOOR_REGISTRY_PATH,
        FLOOR_REGISTRY_PATH,
        ENTITY_REGISTRY_PATH,
        DEVICE_REGISTRY_PATH,  # Added
        AREA_REGISTRY_PATH,
        INPUT_BOOLEAN_PATH,
        INPUT_NUMBER_PATH,
        CONFIG_ENTRIES_PATH,  # Full wipe of config entries
        os.path.join(CONFIG_DIR, "home-assistant_v2.db"),  # Wipe Database
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                os.remove(path)
                print(f"Deleted {path} (Factory Reset)")
            except OSError as e:
                print(f"Error wiping storage {path}: {e}")


def seed_dashboard_storage() -> None:
    """Seed the climate dashboard storage with a test circuit and demo zones."""

    # Common Schedule
    default_schedule = [
        {
            "name": "Morning",
            "days": ["mon", "tue", "wed", "thu", "fri"],
            "start_time": "07:00",
            "temp_heat": 21.0,
            "temp_cool": 24.0,
        },
        {
            "name": "Day",
            "days": ["mon", "tue", "wed", "thu", "fri"],
            "start_time": "09:00",
            "temp_heat": 19.0,
            "temp_cool": 26.0,
        },
        {
            "name": "Evening",
            "days": ["mon", "tue", "wed", "thu", "fri"],
            "start_time": "17:00",
            "temp_heat": 21.0,
            "temp_cool": 24.0,
        },
        {
            "name": "Night",
            "days": ["mon", "tue", "wed", "thu", "fri"],
            "start_time": "22:00",
            "temp_heat": 18.0,
            "temp_cool": 25.0,
        },
        {"name": "Weekend", "days": ["sat", "sun"], "start_time": "08:00", "temp_heat": 21.0, "temp_cool": 24.0},
    ]

    zones = [
        # 1. Simple Heater (Switch)
        {
            "unique_id": "zone_living_room",
            "name": "Living Room",
            "temperature_sensor": "input_number.living_room_temp",
            "heaters": ["input_boolean.living_room_heater"],  # Direct switch control
            "thermostats": [],
            "coolers": [],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        # 2. Smart TRV (Climate)
        {
            "unique_id": "zone_kitchen",
            "name": "Kitchen",
            "temperature_sensor": "input_number.kitchen_temp",
            "heaters": ["climate.kitchen"],  # TRV
            "thermostats": [],
            "coolers": [],
            "window_sensors": ["binary_sensor.kitchen_door"],
            "schedule": default_schedule,
        },
        # 3. AC Unit (Cool Only)
        {
            "unique_id": "zone_office_ac",
            "name": "Office (Cool)",
            "temperature_sensor": "input_number.office_temp",
            "heaters": [],
            "thermostats": [],
            "coolers": ["climate.office_ac"],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        # 4. Dual Mode (Heater + AC)
        {
            "unique_id": "zone_office_dual",
            "name": "Office (Dual)",
            "temperature_sensor": "input_number.office_temp",
            "heaters": ["input_boolean.office_heater"],
            "thermostats": [],
            "coolers": ["climate.office_ac"],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        # 5. Triple Threat (Dial + TRV + AC)
        {
            "unique_id": "zone_guest_room",
            "name": "Guest Room",
            "temperature_sensor": "climate.guest_room_dial",  # MQTT sensor
            "heaters": ["climate.guest_room_trv"],  # MQTT TRV
            "thermostats": ["climate.guest_room_dial"],  # MQTT Dial
            "coolers": ["climate.guest_room_ac"],  # MQTT AC
            "window_sensors": ["binary_sensor.guest_room_window"],  # MQTT Window
            "schedule": default_schedule,
        },
        # 6. Fallback Zone (Broken Sensor -> Area Fallback)
        {
            "unique_id": "zone_fallback",
            "name": "Fallback Room",
            "temperature_sensor": "sensor.broken_fallback",
            "heaters": ["climate.bedroom_2"],
            "thermostats": [],
            "coolers": [],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        # 7. Safety Zone (Broken Sensor -> No Fallback -> Safety Mode)
        {
            "unique_id": "zone_safety",
            "name": "Safety Room",
            "temperature_sensor": "sensor.broken_safety",
            "heaters": ["climate.bedroom_3"],
            "thermostats": [],
            "coolers": [],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        # 8. Window Zone (Open)
        {
            "unique_id": "zone_master_bedroom",
            "name": "Master Bedroom",
            "temperature_sensor": "input_number.master_bedroom_temp",
            "heaters": ["climate.master_bedroom"],
            "thermostats": [],
            "coolers": [],
            "window_sensors": ["binary_sensor.master_bedroom_window"],
            "schedule": default_schedule,
        },
    ]

    data = {
        "zones": zones,
        "circuits": [
            {
                "id": "circuit_central_heating",
                "name": "Central Heating",
                "heaters": ["input_boolean.boiler"],  # Fixed name
                "member_zones": ["zone_living_room", "zone_kitchen", "zone_guest_room", "zone_master_bedroom"],
            }
        ],
        "settings": {
            "default_override_type": "next_block",
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 30,
            "home_away_entity_id": "input_boolean.family_home",
            "away_delay_minutes": 10,
            "away_temperature": 16.0,
            "away_temperature_cool": 30.0,
            "is_away_mode_on": False,
        },
    }
    full_data = {"version": 1, "minor_version": 1, "key": "climate_dashboard", "data": data}
    save_json(CLIMATE_DASHBOARD_PATH, full_data)
    print("Seeded Climate Dashboard Storage with 8 Demo Zones and 'Central Heating' circuit")


def seed_restore_state() -> None:
    """Seed the restore_state file with desired default values (19.0)."""
    data: dict[str, Any] = {"version": 1, "minor_version": 1, "key": "core.restore_state", "data": []}

    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.000000+00:00", time.gmtime())

    for _key, info in INPUT_NUMBERS.items():
        # Re-derive entity_id and unique_id
        # Note: We must match the logic in setup_entities/setup_input_helpers exactly
        # In setup_input_helpers we generate UUID from name key
        # uid = str(uuid.uuid5(uuid.NAMESPACE_DNS, key))
        # Logic from setup_entities to guess entity_id
        sanitized_name = str(info["name"]).lower().replace(" ", "_").replace("-", "_")
        entity_id = f"input_number.{sanitized_name}"

        entry = {
            "state": {
                "entity_id": entity_id,
                "state": "19.0",
                "attributes": {
                    "initial": info["initial"],
                    "editable": True,
                    "min": info["min"],
                    "max": info["max"],
                    "step": info["step"],
                    "mode": "box",
                    "unit_of_measurement": info["unit"],
                    "icon": info["icon"],
                    "friendly_name": info["name"],
                },
                "last_changed": timestamp,
                "last_updated": timestamp,
            },
            "last_seen": timestamp,
        }
        data["data"].append(entry)

    for _key_b, info_b in INPUT_BOOLEANS.items():
        sanitized_name_b = str(info_b["name"]).lower().replace(" ", "_").replace("-", "_")
        entity_id_b = f"input_boolean.{sanitized_name_b}"

        entry_b = {
            "state": {
                "entity_id": entity_id_b,
                "state": "off",
                "attributes": {
                    "editable": True,
                    "icon": info_b["icon"],
                    "friendly_name": info_b["name"],
                },
                "last_changed": timestamp,
                "last_updated": timestamp,
            },
            "last_seen": timestamp,
        }
        data["data"].append(entry_b)

    save_json(RESTORE_STATE_PATH, data)
    print(f"Seeded {RESTORE_STATE_PATH} with default values (19.0)")


def inject_dashboard_config_entry(entries: list[dict[str, Any]]) -> str:
    """Ensure a climate_dashboard config entry exists and return its ID."""
    # check existing
    for e in entries:
        if e["domain"] == "climate_dashboard":
            return cast(str, e["entry_id"])

    # Create new
    entry_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "climate_dashboard_main"))
    new_entry = {
        "entry_id": entry_id,
        "version": 1,
        "minor_version": 1,
        "domain": "climate_dashboard",
        "title": "Climate Dashboard",
        "data": {},
        "options": {},
        "source": "user",
        "pref_disable_new_entities": False,
        "pref_disable_polling": False,
        "unique_id": entry_id,
        "disabled_by": None,
        "created_at": "2023-01-01T00:00:00+00:00",
        "modified_at": "2023-01-01T00:00:00+00:00",
        "discovery_keys": {},
        "subentries": [],
    }
    entries.append(new_entry)
    print("Created Config Entry: Climate Dashboard (Device Owner)")
    return entry_id


def setup_config_entries() -> dict[str, str]:
    """Inject generic_thermostat and template config entries."""
    if not os.path.exists(CONFIG_ENTRIES_PATH):
        data: dict[str, Any] = {"version": 1, "minor_version": 5, "key": "core.config_entries", "data": {"entries": []}}
    else:
        data = load_json(CONFIG_ENTRIES_PATH)

    current_entries = data["data"]["entries"]

    # Inject Dashboard Entry for Device Ownership
    dashboard_entry_id = inject_dashboard_config_entry(current_entries)

    id_map: dict[str, str] = {}
    id_map["climate_dashboard_main"] = dashboard_entry_id

    # --- Generic Thermostats ---
    # Purge ALL generic_thermostat entries to ensure clean slate
    current_entries[:] = [e for e in current_entries if e["domain"] != "generic_thermostat"]

    for thermo in GENERIC_THERMOSTATS:
        entry_id = uuid.uuid4().hex
        new_entry = {
            "entry_id": entry_id,
            "version": 1,
            "minor_version": 1,
            "domain": "generic_thermostat",
            "title": thermo["name"],
            "data": {},
            "options": {
                "name": thermo["name"],  # Redundant but safe
                "heater": thermo["heater"],
                "target_sensor": thermo["target_sensor"],
                "min_temp": thermo["min_temp"],
                "max_temp": thermo["max_temp"],
                "ac_mode": thermo["ac_mode"],
                "target_temp": thermo["target_temp"],
                "cold_tolerance": 0.3,
                "hot_tolerance": 0.3,
                # "initial_hvac_mode": "off",  # Allow restore state to avoid startup warnings
                "away_temp": 16,
                "precision": 0.1,
            },
            "source": "user",
            "pref_disable_new_entities": False,
            "pref_disable_polling": False,
            "unique_id": entry_id,  # Use entry_id as unique_id for helper entities
            "disabled_by": None,
            "created_at": "2023-01-01T00:00:00+00:00",
            "modified_at": "2023-01-01T00:00:00+00:00",
            "discovery_keys": {},
            "subentries": [],
        }
        current_entries.append(new_entry)
        # Map logical unique_id (e.g. climate_living_room) to entry_id
        id_map[cast(str, thermo["unique_id"])] = entry_id
        print(f"Created Config Entry: {thermo['name']} (Generic Thermostat)")

    # --- Template Helpers ---
    # Purge ALL template entries to ensure clean slate
    current_entries[:] = [e for e in current_entries if e["domain"] != "template"]

    # WARNING: The JSON structure for template helpers is inferred.
    for tmpl in TEMPLATE_ENTRIES:
        entry_id = uuid.uuid4().hex

        # Logic for distinguishing binary_sensor/sensor in data
        # Based on observation, "template" config entries contain `template_type`
        # and fields matching the UI options.

        config_data: dict[str, Any] = {}
        if tmpl["type"] == "binary_sensor":
            config_data = {
                "name": tmpl["name"],
                "state": tmpl["state"],
                "device_class": tmpl["device_class"],
                "template_type": "binary_sensor",
            }
        elif tmpl["type"] == "sensor":
            config_data = {
                "name": tmpl["name"],
                "state": tmpl["state"],
                "unit_of_measurement": tmpl["unit_of_measurement"],
                "device_class": tmpl["device_class"],
                # "state_class": None, # Removed to avoid validation error
                "template_type": "sensor",
            }
        elif tmpl["type"] == "switch":
            config_data = {
                "name": tmpl["name"],
                "value_template": tmpl["state"],  # Current HA Template Switch logic uses value_template
                "turn_on": tmpl["turn_on"],
                "turn_off": tmpl["turn_off"],
                "template_type": "switch",
            }
            # if tmpl.get("device_class"):
            #    config_data["device_class"] = tmpl["device_class"]
            # Only add value_template if provided (non-optimistic)
            # if tmpl.get("state"): # This is now handled above
            #     config_data["value_template"] = tmpl["state"]

        new_entry = {
            "entry_id": entry_id,
            "version": 1,
            "minor_version": 1,
            "domain": "template",
            "title": tmpl["name"],
            "data": {},
            "options": config_data,
            "source": "user",
            "pref_disable_new_entities": False,
            "pref_disable_polling": False,
            "unique_id": entry_id,  # Use entry_id as unique_id for helper entities
            "disabled_by": None,
            "created_at": "2023-01-01T00:00:00+00:00",
            "modified_at": "2023-01-01T00:00:00+00:00",
            "discovery_keys": {},
            "subentries": [],
        }
        current_entries.append(new_entry)
        # Map logical unique_id to entry_id
        id_map[cast(str, tmpl["unique_id"])] = entry_id
        print(f"Created Config Entry: {tmpl['name']} (Template: {tmpl['type']})")

    # --- Inject MQTT Config Entry (Automated Setup) ---
    # Purge existing MQTT entries to ensure clean slate
    current_entries[:] = [e for e in current_entries if e["domain"] != "mqtt"]

    mqtt_entry_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "mqtt_main"))
    mqtt_entry = {
        "entry_id": mqtt_entry_id,
        "version": 1,
        "minor_version": 1,
        "domain": "mqtt",
        "title": "MQTT",
        "data": {
            "broker": "localhost",
            "port": 1883,
        },
        "options": {},
        "source": "user",
        "pref_disable_new_entities": False,
        "pref_disable_polling": False,
        "unique_id": mqtt_entry_id,
        "disabled_by": None,
        "created_at": "2023-01-01T00:00:00+00:00",
        "modified_at": "2023-01-01T00:00:00+00:00",
        "discovery_keys": {},
        "subentries": [],
    }
    current_entries.append(mqtt_entry)
    print("Created Config Entry: MQTT (Localhost)")

    # ==========================================
    # Guest Room TRV is now handled via YAML + Manual Registry Linking
    # to avoid Generic Thermostat stripping the device link.
    # ==========================================

    save_json(CONFIG_ENTRIES_PATH, data)

    return id_map


def setup_devices(config_entry_map: dict[str, str]) -> None:
    """Create a fake device and link it to the Guest Room area."""
    pass

    # Note: Link Entity to Device is handled in setup_entities logic IF we implement it there.
    # Currently setup_entities does NOT link device_id. We need to update setup_entities to handle this special case.


def clean_configuration_yaml() -> None:
    """Remove climate and template sections from configuration.yaml."""
    if not os.path.exists(CONFIGURATION_YAML_PATH):
        return

    with open(CONFIGURATION_YAML_PATH, "r") as f:
        lines = f.readlines()

    new_lines = []
    skip = False

    # Simple block parser
    for line in lines:
        stripped = line.strip()
        # Detect start of blocks
        if stripped.startswith("climate:"):
            skip = True
            print("Stripping 'climate:' block from configuration.yaml")
        elif stripped.startswith("template:"):
            skip = True
            print("Stripping 'template:' block from configuration.yaml")
        elif (
            stripped.startswith("logger:")
            or stripped.startswith("frontend:")
            or stripped.startswith("http:")
            or stripped.startswith("climate_dashboard:")
        ):
            # Detect start of OTHER blocks to stop skipping
            if skip:
                skip = False

        # Heuristic: if we hit a root-level key (no indentation) and it's not a comment/empty, stop skipping
        if skip and line and not line.startswith(" ") and not line.startswith("#") and line.strip() != "":
            # Check if it was one of the triggers above, otherwise stop skipping
            if not (stripped.startswith("climate:") or stripped.startswith("template:")):
                skip = False

        if not skip:
            new_lines.append(line)

    with open(CONFIGURATION_YAML_PATH, "w") as f:
        f.writelines(new_lines)
    print("Cleaned configuration.yaml")


if __name__ == "__main__":
    wipe_dashboard_storage()  # Factory Reset first
    seed_dashboard_storage()  # Seed Dashboard with Circuit
    setup_floors()  # Create Floors
    setup_areas()  # Create Areas (linked to floors)
    setup_input_helpers()
    seed_restore_state()  # Seed history so they wake up at 19.0
    id_map = setup_config_entries()  # Inject Config Entries and get Map
    setup_devices(id_map)  # Create Devices (Linked to Config Entries)
    setup_entities(id_map)  # Create Registry Entries with config_entry_id
    clean_configuration_yaml()  # Cleanup YAML

    # We need a 2-pass approach or smart guessing for helpers.
    # Let's try 2-pass:
    # 1. Create Storage (Inputs) + Config (Areas).
    # 2. Start HA -> HA creates Registry Entries for Inputs.
    # 3. Stop HA.
    # 4. Run Script Part 2 -> Update Areas for known UUIDs.

    # OR: just guess the entity_id.
    # "Living Room Heater" -> input_boolean.living_room_heater.
    # We used "heater_living_room" in YAML.
    # Let's name them "Heater Living Room" in storage to get "heater_living_room"?
    # slugify("Heater Living Room") -> "heater_living_room".
    # Yes.
