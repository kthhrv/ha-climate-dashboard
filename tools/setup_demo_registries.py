import json
import os
import uuid

CONFIG_DIR = "/home/keith/ws/ha-climate-dashboard/config"
STORAGE_DIR = os.path.join(CONFIG_DIR, ".storage")

AREA_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.area_registry")
ENTITY_REGISTRY_PATH = os.path.join(STORAGE_DIR, "core.entity_registry")
CLIMATE_DASHBOARD_PATH = os.path.join(STORAGE_DIR, "climate_dashboard")

# Define Areas
AREAS = [
    {"name": "Living Room", "id": "living_room"},
    {"name": "Kitchen", "id": "kitchen"},
    {"name": "Master Bedroom", "id": "master_bedroom"},
    {"name": "Bedroom 2", "id": "bedroom_2"},
    {"name": "Bedroom 3", "id": "bedroom_3"},
    {"name": "Office", "id": "office"},
    {"name": "Bathroom", "id": "bathroom"},
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
    "climate_bathroom": "bathroom",
}

INPUT_BOOLEAN_PATH = os.path.join(STORAGE_DIR, "input_boolean")
INPUT_NUMBER_PATH = os.path.join(STORAGE_DIR, "input_number")

# Define Entities (simulated hardware)
# structure: key -> { name, icon, area_id }
# key will be part of entity_id: input_boolean.[key]
INPUT_BOOLEANS = {
    "heater_living_room": {"name": "Living Room Heater", "icon": "mdi:radiator", "area_id": "living_room"},
    "heater_kitchen": {"name": "Kitchen Heater", "icon": "mdi:radiator", "area_id": "kitchen"},
    "heater_master_bedroom": {"name": "Master Bedroom Heater", "icon": "mdi:radiator", "area_id": "master_bedroom"},
    "heater_bedroom_2": {"name": "Bedroom 2 Heater", "icon": "mdi:radiator", "area_id": "bedroom_2"},
    "heater_bedroom_3": {"name": "Bedroom 3 Heater", "icon": "mdi:radiator", "area_id": "bedroom_3"},
    "heater_office": {"name": "Office Heater", "icon": "mdi:radiator", "area_id": "office"},
    "heater_bathroom": {"name": "Bathroom Heater", "icon": "mdi:radiator", "area_id": "bathroom"},
    "window_master_bedroom": {
        "name": "Master Bedroom Window",
        "icon": "mdi:window-closed",
        "area_id": "master_bedroom",
    },
}

INPUT_NUMBERS = {
    "temp_living_room": {
        "name": "Living Room Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "living_room",
    },
    "temp_kitchen": {
        "name": "Kitchen Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "kitchen",
    },
    "temp_master_bedroom": {
        "name": "Master Bedroom Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "master_bedroom",
    },
    "temp_bedroom_2": {
        "name": "Bedroom 2 Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bedroom_2",
    },
    "temp_bedroom_3": {
        "name": "Bedroom 3 Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bedroom_3",
    },
    "temp_office": {
        "name": "Office Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "office",
    },
    "temp_bathroom": {
        "name": "Bathroom Temp",
        "min": 10,
        "max": 40,
        "step": 0.1,
        "unit": "°C",
        "icon": "mdi:thermometer",
        "initial": 19.0,
        "area_id": "bathroom",
    },
}


def load_json(path: str) -> dict:
    if not os.path.exists(path):
        return {"version": 1, "minor_version": 1, "key": path.split("/")[-1], "data": {"areas": [], "entities": []}}
    with open(path, "r") as f:
        return json.load(f)


def save_json(path: str, data: dict):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


def setup_areas():
    data = load_json(AREA_REGISTRY_PATH)
    if not isinstance(data.get("data"), dict):
        pass

    if not os.path.exists(AREA_REGISTRY_PATH):
        data = {"version": 1, "minor_version": 1, "key": "core.area_registry", "data": {"areas": []}}

    current_areas = data["data"]["areas"]
    existing_ids = {a["id"] for a in current_areas}

    for area in AREAS:
        if area["id"] not in existing_ids:
            current_areas.append(
                {
                    "aliases": [],
                    "icon": None,
                    "id": area["id"],
                    "name": area["name"],
                    "picture": None,
                    "floor_id": None,
                    "labels": [],
                    "humidity_entity_id": None,
                    "temperature_entity_id": None,
                }
            )
            print(f"Created Area: {area['name']}")

    save_json(AREA_REGISTRY_PATH, data)


def setup_input_helpers():
    # Input Booleans
    data_bool = {"version": 1, "minor_version": 1, "key": "input_boolean", "data": {"items": []}}

    # Input Numbers
    data_num = {"version": 1, "minor_version": 1, "key": "input_number", "data": {"items": []}}

    # We need a stable map of key -> unique_id to use in entity registry
    # In storage, the ID *is* the uuid.
    # But checking HA source, input_boolean storage items have "id" (uuid) and "name".
    # The entity_id is derived from name.
    # To Ensure "input_boolean.heater_living_room", we must ensure name slugs to that.
    # But wait, storage items have an "id" which uses UUID.

    # Let's generate stable UUIDs based on names so we can map them in registry

    # Helper for UUID generation
    def get_uuid(key):
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

    for key, info in INPUT_NUMBERS.items():
        uid = get_uuid(key)
        item = {
            "name": info["name"],
            "min": info["min"],
            "max": info["max"],
            "step": info["step"],
            "mode": "box",
            "unit_of_measurement": info["unit"],
            "icon": info["icon"],
            "initial": info["initial"],
            "id": uid,
        }
        data_num["data"]["items"].append(item)
        ENTITY_AREA_MAP[uid] = info["area_id"]

    save_json(INPUT_BOOLEAN_PATH, data_bool)
    save_json(INPUT_NUMBER_PATH, data_num)
    print("Created Input Helpers in Storage")


def setup_entities():
    if not os.path.exists(ENTITY_REGISTRY_PATH):
        data = {"version": 1, "minor_version": 1, "key": "core.entity_registry", "data": {"entities": []}}
    else:
        data = load_json(ENTITY_REGISTRY_PATH)

    current_entities = data["data"]["entities"]

    for unique_id, area_id in ENTITY_AREA_MAP.items():
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
            entity_id = unique_id.replace("_", ".", 1)  # climate_living_room -> climate.living_room

            if len(unique_id) == 36:  # UUID length check for Helpers
                # Guess Entity ID from INPUT_BOOLEANS / NUMBERS reverse lookup?
                # Or just iterate our dicts to find the matching UUID

                # Reverse lookup
                info = None
                domain = None

                # Check Booleans
                for key, val in INPUT_BOOLEANS.items():
                    # We need to re-generate UUID to check?
                    # Or better, store UUID in the dict above?
                    # The script runs sequentially, so we can re-gen.
                    if str(uuid.uuid5(uuid.NAMESPACE_DNS, key)) == unique_id:
                        info = val
                        domain = "input_boolean"
                        break

                if not info:
                    for key, val in INPUT_NUMBERS.items():
                        if str(uuid.uuid5(uuid.NAMESPACE_DNS, key)) == unique_id:
                            info = val
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
                    # If we name it "Heater Living Room", HA makes "heater_living_room" ONLY IF we change the name string
                    # or if slugify happens to match.

                    # Let's change the defined NAME in `setup_input_helpers` to ensure we get the desired slug.
                    # Actually, let's just use the desired slug as the NAME for simplicity in ID generation?
                    # No, that looks ugly in UI.

                    # Better plan: Update `configuration.yaml` to use the new "Clean" entity IDs.
                    # input_boolean.living_room_heater

                    sanitized_name = info["name"].lower().replace(" ", "_").replace("-", "_")
                    entity_id = f"{domain}.{sanitized_name}"
                    platform = domain  # sort of

            # Common Registry creation
            new_ent = {
                "area_id": area_id,
                "capabilities": {},
                "config_entry_id": None,
                "device_class": None,
                "device_id": None,
                "disabled_by": None,
                "entity_category": None,
                "entity_id": entity_id,
                "hidden_by": None,
                "icon": None,
                "id": uuid.uuid4().hex,
                "name": None,
                "options": {},
                "original_device_class": None,
                "original_icon": None,
                "original_name": None,
                "platform": platform,
                "supported_features": 0,
                "unique_id": unique_id,
                "unit_of_measurement": None,
            }
            if len(unique_id) == 36:
                # Helpers don't have "platform", they are domain-based or helper-based?
                # Actually registry uses "domain" for platform sometimes?
                # entry.platform is the integration. For input_boolean it IS input_boolean.
                new_ent["platform"] = domain

            current_entities.append(new_ent)
            print(f"Created Entity Registry Entry: {entity_id} -> {area_id}")

    save_json(ENTITY_REGISTRY_PATH, data)


RESTORE_STATE_PATH = os.path.join(STORAGE_DIR, "core.restore_state")
import time


def wipe_dashboard_storage():
    """Delete storage files to force a factory reset."""
    for path in [CLIMATE_DASHBOARD_PATH, RESTORE_STATE_PATH]:
        if os.path.exists(path):
            try:
                os.remove(path)
                print(f"Deleted {path} (Factory Reset)")
            except OSError as e:
                print(f"Error wiping storage {path}: {e}")


def seed_restore_state():
    """Seed the restore_state file with desired default values (19.0)."""
    data = {"version": 1, "minor_version": 1, "key": "core.restore_state", "data": []}

    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.000000+00:00", time.gmtime())

    for key, info in INPUT_NUMBERS.items():
        # Re-derive entity_id and unique_id
        # Note: We must match the logic in setup_entities/setup_input_helpers exactly
        # In setup_input_helpers we generate UUID from name key
        uid = str(uuid.uuid5(uuid.NAMESPACE_DNS, key))
        # Logic from setup_entities to guess entity_id
        sanitized_name = info["name"].lower().replace(" ", "_").replace("-", "_")
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

    save_json(RESTORE_STATE_PATH, data)
    print(f"Seeded {RESTORE_STATE_PATH} with default values (19.0)")


if __name__ == "__main__":
    wipe_dashboard_storage()  # Factory Reset first
    setup_areas()
    setup_input_helpers()
    seed_restore_state()  # Seed history so they wake up at 19.0
    setup_entities()  # Updated to handle new items? (Actually skipped helpers for now)

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
