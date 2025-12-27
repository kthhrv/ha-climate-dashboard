import json
import os
import time
import uuid
from typing import Any, Dict, List, cast

# Import shared data
from demo_data import AREAS, FLOORS, SYSTEM_DEVICES
from teardown import wipe_storage

CONFIG_DIR = "/home/keith/ws/ha-climate-dashboard/config"
STORAGE_DIR = os.path.join(CONFIG_DIR, ".storage")

AREA_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.area_registry")
DEVICE_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.device_registry")
ENTITY_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.entity_registry")
FLOOR_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.floor_registry")
CLIMATE_DASHBOARD_PATH = os.path.join(STORAGE_DIR, "climate_dashboard")
CONFIG_ENTRIES_PATH = os.path.join(STORAGE_DIR, "core.config_entries")
CONFIGURATION_YAML_PATH = os.path.join(CONFIG_DIR, "configuration.yaml")
INPUT_BOOLEAN_PATH = os.path.join(STORAGE_DIR, "input_boolean")
INPUT_NUMBER_PATH = os.path.join(STORAGE_DIR, "input_number")
RESTORE_STATE_PATH = os.path.join(STORAGE_DIR, "core.restore_state")
LOVELACE_DASHBOARDS_PATH = os.path.join(STORAGE_DIR, "lovelace_dashboards")
LOVELACE_CONFIG_PATH = os.path.join(STORAGE_DIR, "lovelace.climate_demo")


def load_json(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        return {
            "version": 1,
            "minor_version": 1,
            "key": path.split("/")[-1],
            "data": {"areas": [], "entities": []},
        }
    with open(path, "r") as f:
        return cast(dict[str, Any], json.load(f))


def save_json(path: str, data: dict[str, Any]) -> None:
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


def setup_lovelace() -> None:
    """Generate a Lovelace dashboard with views for each area."""

    # 1. Register the Dashboard
    dash_data = {
        "version": 1,
        "minor_version": 1,
        "key": "lovelace_dashboards",
        "data": {
            "items": [
                {
                    "id": "climate_demo",
                    "mode": "storage",
                    "require_admin": False,
                    "show_in_sidebar": True,
                    "title": "Climate Demo",
                    "icon": "mdi:thermostat",
                    "url_path": "climate-demo",
                }
            ]
        },
    }
    save_json(LOVELACE_DASHBOARDS_PATH, dash_data)

    # 2. Generate Dashboard Config
    views = []

    # Map Area ID to Logical Zone Entity ID(s)
    # Based on seed_dashboard_storage
    area_zone_map = {
        "living_room": ["climate.zone_living_room"],
        "kitchen": ["climate.zone_kitchen"],
        "master_bedroom": ["climate.zone_master_bedroom"],
        "guest_room": ["climate.zone_guest_room"],
        "office": ["climate.zone_office_dual"],
        "server_room": ["climate.zone_server_room"],
        "bedroom_2": ["climate.zone_fallback"],
        "bedroom_3": ["climate.zone_safety"],
    }

    # Home View
    views.append(
        {
            "title": "Home",
            "icon": "mdi:home",
            "cards": [
                {
                    "type": "entities",
                    "title": "System Control",
                    "entities": [d.entity_id for d in SYSTEM_DEVICES],
                },
                {
                    "type": "vertical-stack",
                    "title": "Climate Zones",
                    "cards": [
                        {
                            "type": "tile",
                            "entity": zone,
                            "vertical": False,
                            "features": [{"type": "climate-hvac-modes"}, {"type": "target-temperature"}],
                            "features_position": "bottom",
                        }
                        for zone in [
                            "climate.zone_living_room",
                            "climate.zone_kitchen",
                            "climate.zone_master_bedroom",
                            "climate.zone_guest_room",
                        ]
                    ],
                },
            ],
        }
    )

    for area in AREAS:
        cards: List[Dict[str, Any]] = []
        other_entities = []

        # 1. Add Logical Zones (Tile Cards)
        if area.id in area_zone_map:
            for zone_id in area_zone_map[area.id]:
                cards.append(
                    {
                        "type": "tile",
                        "entity": zone_id,
                        "vertical": False,
                        "features": [{"type": "climate-hvac-modes"}, {"type": "target-temperature"}],
                        "features_position": "bottom",
                    }
                )

        # 2. Process Physical Devices
        for dev in area.devices:
            if dev.entity_id.startswith("climate."):
                cards.append(
                    {
                        "type": "tile",
                        "entity": dev.entity_id,
                        "vertical": False,
                        "features": [{"type": "climate-hvac-modes"}, {"type": "target-temperature"}],
                        "features_position": "bottom",
                    }
                )
            else:
                other_entities.append(dev.entity_id)

        # 3. Add Entities Card for others
        if other_entities:
            cards.append({"type": "entities", "title": "Other Devices", "entities": other_entities})

        views.append(
            {
                "title": area.name,
                "path": area.id,
                "icon": "mdi:view-dashboard-outline",
                "cards": [{"type": "vertical-stack", "cards": cards}],
            }
        )

    data = {
        "version": 1,
        "minor_version": 1,
        "key": "lovelace.climate_demo",
        "data": {"config": {"title": "Climate Demo", "views": views}},
    }
    save_json(LOVELACE_CONFIG_PATH, data)
    print("Created Lovelace Dashboard: Climate Demo")


def setup_floors() -> None:
    data: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "core.floor_registry", "data": {"floors": []}}
    for floor in FLOORS:
        data["data"]["floors"].append(
            {
                "aliases": [],
                "floor_id": floor.id,
                "icon": floor.icon,
                "level": floor.level,
                "name": floor.name,
                "created_at": "2023-01-01T00:00:00+00:00",
                "modified_at": "2023-01-01T00:00:00+00:00",
            }
        )
        print(f"Created Floor: {floor.name}")
    save_json(FLOOR_REGISTRY_PATH, data)


def setup_areas() -> None:
    data: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "core.area_registry", "data": {"areas": []}}
    for area in AREAS:
        data["data"]["areas"].append(
            {
                "aliases": [],
                "icon": None,
                "id": area.id,
                "name": area.name,
                "picture": None,
                "floor_id": area.floor_id,
                "labels": [],
                "created_at": "2023-01-01T00:00:00+00:00",
                "modified_at": "2023-01-01T00:00:00+00:00",
                "humidity_entity_id": None,
                "temperature_entity_id": None,
            }
        )
        print(f"Created Area: {area.name}")
    save_json(AREA_REGISTRY_PATH, data)


def get_helper_uuid(unique_id: str) -> str:
    """Generate a stable UUID for helpers based on unique_id."""
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_id))


def setup_input_helpers() -> None:
    data_bool: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "input_boolean", "data": {"items": []}}
    data_num: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "input_number", "data": {"items": []}}

    all_devices = [d for area in AREAS for d in area.devices] + SYSTEM_DEVICES

    for dev in all_devices:
        uid = get_helper_uuid(dev.unique_id)
        if dev.device_type == "input_boolean":
            data_bool["data"]["items"].append({"name": dev.name, "icon": dev.params.get("icon"), "id": uid})
        elif dev.device_type == "input_number":
            data_num["data"]["items"].append(
                {
                    "name": dev.name,
                    "min": dev.params.get("min"),
                    "max": dev.params.get("max"),
                    "step": dev.params.get("step"),
                    "mode": "box",
                    "unit_of_measurement": dev.params.get("unit"),
                    "icon": dev.params.get("icon"),
                    "initial": dev.params.get("initial"),
                    "id": uid,
                }
            )

    save_json(INPUT_BOOLEAN_PATH, data_bool)
    save_json(INPUT_NUMBER_PATH, data_num)
    print("Created Input Helpers in Storage")


def inject_dashboard_config_entry(entries: list[dict[str, Any]]) -> str:
    entry_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "climate_dashboard_main"))
    entries.append(
        {
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
    )
    return entry_id


def setup_config_entries() -> dict[str, str]:
    if not os.path.exists(CONFIG_ENTRIES_PATH):
        data: dict[str, Any] = {"version": 1, "minor_version": 5, "key": "core.config_entries", "data": {"entries": []}}
    else:
        data = load_json(CONFIG_ENTRIES_PATH)

    current_entries = data["data"]["entries"]

    # Dashboard
    dash_id = inject_dashboard_config_entry(current_entries)
    id_map = {"climate_dashboard_main": dash_id}

    # MQTT
    mqtt_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "mqtt_main"))
    current_entries.append(
        {
            "entry_id": mqtt_id,
            "version": 1,
            "minor_version": 1,
            "domain": "mqtt",
            "title": "MQTT",
            "data": {"broker": "localhost", "port": 1883},
            "options": {},
            "source": "user",
            "pref_disable_new_entities": False,
            "pref_disable_polling": False,
            "unique_id": mqtt_id,
            "disabled_by": None,
            "created_at": "2023-01-01T00:00:00+00:00",
            "modified_at": "2023-01-01T00:00:00+00:00",
            "discovery_keys": {},
            "subentries": [],
        }
    )
    id_map["mqtt_main"] = mqtt_id

    # Devices
    all_devices = [d for area in AREAS for d in area.devices] + SYSTEM_DEVICES

    for dev in all_devices:
        entry_id = uuid.uuid4().hex
        new_entry: Dict[str, Any] = {}

        if dev.device_type == "generic_thermostat":
            new_entry = {
                "domain": "generic_thermostat",
                "title": dev.name,
                "data": {},
                "options": {
                    "name": dev.name,
                    "heater": dev.params["heater"],
                    "target_sensor": dev.params["target_sensor"],
                    "min_temp": dev.params["min_temp"],
                    "max_temp": dev.params["max_temp"],
                    "ac_mode": dev.params.get("ac_mode", False),
                    "target_temp": dev.params["target_temp"],
                    "cold_tolerance": 0.3,
                    "hot_tolerance": 0.3,
                    "away_temp": 16,
                    "precision": 0.1,
                },
            }
        elif dev.device_type.startswith("template_"):
            tmpl_type = dev.device_type.replace("template_", "")
            conf: Dict[str, Any] = {"template_type": tmpl_type}
            if tmpl_type == "binary_sensor":
                conf.update(
                    {
                        "name": dev.name,
                        "state": dev.params["source"],
                        "device_class": dev.params.get("device_class"),
                    }
                )
            elif tmpl_type == "sensor":
                state_expr = "{{ states('" + dev.params["source"] + "') }}"
                if dev.params["source"] == "none":
                    state_expr = "{{ none }}"
                conf.update(
                    {
                        "name": dev.name,
                        "state": state_expr,
                        "unit_of_measurement": "°C",
                        "device_class": "temperature",
                    }
                )
            elif tmpl_type == "switch":
                conf.update(
                    {
                        "name": dev.name,
                        "value_template": "{{ states('" + dev.params["source"] + "') }}",
                        "turn_on": [
                            {
                                "service": "input_boolean.turn_on",
                                "target": {"entity_id": dev.params["source"]},
                            }
                        ],
                        "turn_off": [
                            {
                                "service": "input_boolean.turn_off",
                                "target": {"entity_id": dev.params["source"]},
                            }
                        ],
                    }
                )

            new_entry = {"domain": "template", "title": dev.name, "data": {}, "options": conf}

        if new_entry:
            new_entry.update(
                {
                    "entry_id": entry_id,
                    "version": 1,
                    "minor_version": 1,
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
            )
            current_entries.append(new_entry)
            id_map[dev.unique_id] = entry_id
            print(f"Created Config Entry: {dev.name} ({dev.device_type})")

    save_json(CONFIG_ENTRIES_PATH, data)
    return id_map


def setup_entities(config_entry_map: dict[str, str]) -> None:
    data: dict[str, Any] = {"version": 1, "minor_version": 7, "key": "core.entity_registry", "data": {"entities": []}}
    default_time = "1970-01-01T00:00:00+00:00"

    # Helper to add entity
    def add_entity(
        entity_id: str,
        unique_id: str,
        platform: str,
        area_id: str | None,
        config_entry_id: str | None,
        device_id: str | None,
    ) -> None:
        data["data"]["entities"].append(
            {
                "aliases": [],
                "area_id": area_id,
                "capabilities": {},
                "categories": {},
                "config_entry_id": config_entry_id,
                "config_subentry_id": None,
                "created_at": default_time,
                "modified_at": default_time,
                "device_class": None,
                "device_id": device_id,
                "disabled_by": None,
                "entity_category": None,
                "entity_id": entity_id,
                "has_entity_name": False,
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
        )
        print(f"Created Registry Entry: {entity_id} -> {area_id}")

    # Process Areas
    for area in AREAS:
        for dev in area.devices:
            # Determine platform/config entry
            entry_id = config_entry_map.get(dev.unique_id)
            platform = "unknown"

            if dev.device_type == "input_boolean":
                # For storage helpers, Config Entry is None, but unique_id is the UUID from helper
                entry_id = None
                platform = "input_boolean"
                unique_id = get_helper_uuid(dev.unique_id)
            elif dev.device_type == "input_number":
                entry_id = None
                platform = "input_number"
                unique_id = get_helper_uuid(dev.unique_id)
            elif dev.device_type == "generic_thermostat":
                platform = "generic_thermostat"
                unique_id = cast(str, entry_id)  # For helpers, unique_id IS the entry_id
            elif dev.device_type.startswith("template"):
                platform = "template"
                unique_id = cast(str, entry_id)
            elif dev.device_type.startswith("mqtt"):
                platform = "mqtt"
                unique_id = dev.unique_id
                # When MQTT integration creates entities, it links them to the MQTT config entry.
                entry_id = config_entry_map.get("mqtt_main")

            add_entity(dev.entity_id, unique_id, platform, area.id, entry_id, None)

    # Dashboard Zones (Logical)
    zone_map = {
        "climate.zone_living_room": "living_room",
        "climate.zone_kitchen": "kitchen",
        "climate.zone_office_dual": "office",
        "climate.zone_guest_room": "guest_room",
        "climate.zone_server_room": "server_room",
        "climate.zone_fallback": "bedroom_2",
        "climate.zone_safety": "bedroom_3",
        "climate.zone_master_bedroom": "master_bedroom",
    }
    for eid, target_area_id in zone_map.items():
        add_entity(eid, eid.replace("climate.", ""), "climate_dashboard", target_area_id, None, None)

    save_json(ENTITY_REGISTRY_PATH, data)


def seed_restore_state() -> None:
    data: dict[str, Any] = {"version": 1, "minor_version": 1, "key": "core.restore_state", "data": []}
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.000000+00:00", time.gmtime())

    all_devices = [d for area in AREAS for d in area.devices] + SYSTEM_DEVICES

    for dev in all_devices:
        if dev.device_type in ["input_number", "input_boolean"]:
            state = "19.0" if dev.device_type == "input_number" else "off"
            data["data"].append(
                {
                    "state": {
                        "entity_id": dev.entity_id,
                        "state": state,
                        "attributes": {
                            "initial": dev.params.get("initial"),
                            "friendly_name": dev.name,
                            "min": dev.params.get("min"),
                            "max": dev.params.get("max"),
                            "step": dev.params.get("step"),
                            "mode": "box",
                        },
                        "last_changed": timestamp,
                        "last_updated": timestamp,
                    },
                    "last_seen": timestamp,
                }
            )
    save_json(RESTORE_STATE_PATH, data)
    print("Seeded Restore State")


def seed_dashboard_storage() -> None:
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

    # Logical Zones Configuration (Updated to use MQTT TRVs)
    zones = [
        {
            "unique_id": "zone_living_room",
            "name": "Living Room",
            "temperature_sensor": "input_number.living_room_temp",
            "heaters": ["climate.trv_living_room"],  # MQTT TRV
            "thermostats": [],
            "coolers": [],
            "window_sensors": [],
            "schedule": default_schedule,
        },
        {
            "unique_id": "zone_kitchen",
            "name": "Kitchen",
            "temperature_sensor": "input_number.kitchen_temp",
            "heaters": ["climate.kitchen"],  # MQTT TRV
            "thermostats": [],
            "coolers": [],
            "window_sensors": ["binary_sensor.kitchen_door"],
            "schedule": default_schedule,
        },
        {
            "unique_id": "zone_master_bedroom",
            "name": "Master Bedroom",
            "temperature_sensor": "input_number.master_bedroom_temp",
            "heaters": ["climate.master_bedroom"],  # MQTT TRV
            "thermostats": [],
            "coolers": [],
            "window_sensors": ["binary_sensor.master_bedroom_window"],
            "schedule": default_schedule,
        },
        {
            "unique_id": "zone_guest_room",
            "name": "Guest Room",
            "temperature_sensor": "climate.guest_room_dial",
            "heaters": ["climate.guest_room_trv"],
            "thermostats": ["climate.guest_room_dial"],
            "coolers": ["climate.guest_room_ac"],
            "window_sensors": ["binary_sensor.guest_room_window"],
            "schedule": default_schedule,
        },
        {
            "unique_id": "zone_office_dual",
            "name": "Office (Dual)",
            "temperature_sensor": "input_number.office_temp",
            "heaters": ["switch.office_heater"],
            "thermostats": [],
            "coolers": ["climate.office_ac"],
            "window_sensors": [],
            "schedule": default_schedule,
        },
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
        {
            "unique_id": "zone_server_room",
            "name": "Server Room",
            "temperature_sensor": "input_number.server_room_temp",
            "heaters": [],
            "thermostats": [],
            "coolers": ["climate.server_room_ac"],
            "window_sensors": [],
            "schedule": default_schedule,
        },
    ]

    data = {
        "zones": zones,
        "circuits": [
            {
                "id": "circuit_central_heating",
                "name": "Central Heating",
                "heaters": ["input_boolean.boiler"],
                "member_zones": ["zone_living_room", "zone_kitchen", "zone_guest_room", "zone_master_bedroom"],
            }
        ],
        "settings": {
            "default_override_type": "disabled",
            "default_timer_minutes": 60,
            "window_open_delay_seconds": 30,
            "home_away_entity_id": "input_boolean.family_home",
            "away_delay_minutes": 10,
            "away_temperature": 16.0,
            "away_temperature_cool": 30.0,
            "is_away_mode_on": False,
        },
    }
    save_json(CLIMATE_DASHBOARD_PATH, {"version": 1, "minor_version": 1, "key": "climate_dashboard", "data": data})
    print("Seeded Climate Dashboard Storage")


def clean_configuration_yaml() -> None:
    if not os.path.exists(CONFIGURATION_YAML_PATH):
        return
    with open(CONFIGURATION_YAML_PATH, "r") as f:
        lines = f.readlines()
    new_lines = []
    skip = False
    for line in lines:
        s = line.strip()
        if s.startswith("climate:") or s.startswith("template:"):
            skip = True
        elif (
            s.startswith("logger:")
            or s.startswith("frontend:")
            or s.startswith("http:")
            or s.startswith("climate_dashboard:")
        ):
            if skip:
                skip = False
        if skip and line and not line.startswith(" ") and not line.startswith("#") and s != "":
            if not (s.startswith("climate:") or s.startswith("template:")):
                skip = False
        if not skip:
            new_lines.append(line)
    with open(CONFIGURATION_YAML_PATH, "w") as f:
        f.writelines(new_lines)
    print("Cleaned configuration.yaml")


if __name__ == "__main__":
    wipe_storage()
    seed_dashboard_storage()
    setup_floors()
    setup_areas()
    setup_input_helpers()
    seed_restore_state()
    id_map = setup_config_entries()
    setup_entities(id_map)
    setup_lovelace()
    clean_configuration_yaml()
