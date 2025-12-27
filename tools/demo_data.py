from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class DemoDevice:
    unique_id: str
    name: str
    # "mqtt_trv", "mqtt_ac", "mqtt_dial", "mqtt_window", "generic_thermostat",
    # "input_boolean", "input_number", "template_binary_sensor", "template_sensor",
    # "template_switch"
    device_type: str
    params: Dict[str, Any] = field(default_factory=dict)

    @property
    def entity_id(self) -> str:
        """Estimate entity_id. Actual ID depends on HA registry."""
        if "default_entity_id" in self.params:
            return str(self.params["default_entity_id"])

        # Fallbacks
        # Sanitize name to create a valid slug (alphanumeric, underscores)
        safe_name = "".join(c if c.isalnum() or c in " -_" else "" for c in self.name).strip()
        slug = safe_name.lower().replace(" ", "_").replace("-", "_")
        # Remove repeated underscores
        while "__" in slug:
            slug = slug.replace("__", "_")

        if self.device_type.startswith("mqtt_") and "trv" in self.device_type:
            return f"climate.{slug}"
        if self.device_type == "input_boolean":
            return f"input_boolean.{slug}"
        if self.device_type == "input_number":
            return f"input_number.{slug}"
        if self.device_type == "generic_thermostat":
            return f"climate.{slug}"
        if self.device_type == "template_sensor":
            return f"sensor.{slug}"
        if self.device_type == "template_binary_sensor":
            return f"binary_sensor.{slug}"
        if self.device_type == "template_switch":
            return f"switch.{slug}"
        return f"unknown.{slug}"


@dataclass
class DemoArea:
    id: str
    name: str
    floor_id: str
    devices: List[DemoDevice] = field(default_factory=list)


@dataclass
class DemoFloor:
    id: str
    name: str
    level: int
    icon: str


# --- DATA DEFINITIONS ---

FLOORS = [
    DemoFloor(id="ground_floor", name="Ground Floor", level=0, icon="mdi:home-floor-0"),
    DemoFloor(id="first_floor", name="First Floor", level=1, icon="mdi:home-floor-1"),
    DemoFloor(id="second_floor", name="Second Floor", level=2, icon="mdi:home-floor-2"),
]

AREAS = [
    DemoArea(
        id="living_room",
        name="Living Room",
        floor_id="ground_floor",
        devices=[
            DemoDevice(
                unique_id="trv_living_room",
                name="Living Room TRV",
                device_type="mqtt_trv",
                params={
                    "modes": ["off", "heat", "auto"],
                    "default_entity_id": "climate.trv_living_room",
                    "topic_slug": "living_room",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="living_room_temp",
                name="Living Room Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="living_room_heater",
                name="Living Room Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            # Standalone sensor for template
            DemoDevice(
                unique_id="living_room_standalone_temp_source",
                name="Living Room Standalone Temp Source",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "initial": 21.0},
            ),
            DemoDevice(
                unique_id="sensor_living_room_standalone_temp",
                name="Living Room Standalone Temp",
                device_type="template_sensor",
                params={"source": "input_number.living_room_standalone_temp_source"},
            ),
        ],
    ),
    DemoArea(
        id="kitchen",
        name="Kitchen",
        floor_id="ground_floor",
        devices=[
            DemoDevice(
                unique_id="climate_kitchen",
                name="Kitchen TRV",
                device_type="mqtt_trv",
                params={
                    "modes": ["off", "heat", "auto"],
                    "default_entity_id": "climate.kitchen",
                    "topic_slug": "kitchen",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="kitchen_temp",
                name="Kitchen Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="kitchen_heater",
                name="Kitchen Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            DemoDevice(
                unique_id="kitchen_door_boolean",
                name="Kitchen Door Boolean",
                device_type="input_boolean",
                params={"icon": "mdi:door"},
            ),
            DemoDevice(
                unique_id="binary_sensor_kitchen_door",
                name="Kitchen Door",
                device_type="template_binary_sensor",
                params={"device_class": "door", "source": "input_boolean.kitchen_door_boolean"},
            ),
        ],
    ),
    DemoArea(
        id="master_bedroom",
        name="Master Bedroom",
        floor_id="second_floor",
        devices=[
            DemoDevice(
                unique_id="climate_master_bedroom",
                name="Master Bedroom TRV",
                device_type="mqtt_trv",
                params={
                    "modes": ["off", "heat", "auto"],
                    "default_entity_id": "climate.master_bedroom",
                    "topic_slug": "master_bedroom",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="master_bedroom_temp",
                name="Master Bedroom Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="master_bedroom_heater",
                name="Master Bedroom Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            DemoDevice(
                unique_id="master_bedroom_window_boolean",
                name="Master Bedroom Window Boolean",
                device_type="input_boolean",
                params={"icon": "mdi:window-closed"},
            ),
            DemoDevice(
                unique_id="binary_sensor_master_bedroom_window",
                name="Master Bedroom Window",
                device_type="template_binary_sensor",
                params={"device_class": "window", "source": "input_boolean.master_bedroom_window_boolean"},
            ),
        ],
    ),
    DemoArea(
        id="bedroom_2",
        name="Bedroom 2",
        floor_id="first_floor",
        devices=[
            DemoDevice(
                unique_id="climate_bedroom_2",
                name="Bedroom 2",
                device_type="generic_thermostat",
                params={
                    "heater": "input_boolean.bedroom_2_heater",
                    "target_sensor": "input_number.bedroom_2_temp",
                    "min_temp": 5,
                    "max_temp": 30,
                    "target_temp": 20,
                },
            ),
            DemoDevice(
                unique_id="bedroom_2_temp",
                name="Bedroom 2 Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="bedroom_2_heater",
                name="Bedroom 2 Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            # Standalone sensor
            DemoDevice(
                unique_id="bedroom_2_standalone_temp_source",
                name="Bedroom 2 Standalone Temp Source",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "initial": 20.0},
            ),
            DemoDevice(
                unique_id="sensor_bedroom_2_standalone_temp",
                name="Bedroom 2 Standalone Temp",
                device_type="template_sensor",
                params={"source": "input_number.bedroom_2_standalone_temp_source"},
            ),
            # Broken Sensor placeholders (assigned here but used logically elsewhere)
            DemoDevice(
                unique_id="sensor_broken_fallback",
                name="Broken Sensor (Fallback)",
                device_type="template_sensor",
                params={"source": "none"},
            ),
        ],
    ),
    DemoArea(
        id="bedroom_3",
        name="Bedroom 3",
        floor_id="first_floor",
        devices=[
            DemoDevice(
                unique_id="climate_bedroom_3",
                name="Bedroom 3",
                device_type="generic_thermostat",
                params={
                    "heater": "input_boolean.bedroom_3_heater",
                    "target_sensor": "input_number.bedroom_3_temp",
                    "min_temp": 5,
                    "max_temp": 30,
                    "target_temp": 20,
                },
            ),
            DemoDevice(
                unique_id="bedroom_3_temp",
                name="Bedroom 3 Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="bedroom_3_heater",
                name="Bedroom 3 Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            # Broken Sensor
            DemoDevice(
                unique_id="sensor_broken_safety",
                name="Broken Sensor (Safety)",
                device_type="template_sensor",
                params={"source": "none"},
            ),
        ],
    ),
    DemoArea(
        id="office",
        name="Office",
        floor_id="ground_floor",
        devices=[
            DemoDevice(
                unique_id="climate_office",
                name="Office",
                device_type="generic_thermostat",
                params={
                    "heater": "input_boolean.office_heater",
                    "target_sensor": "input_number.office_temp",
                    "min_temp": 5,
                    "max_temp": 30,
                    "target_temp": 21,
                },
            ),
            DemoDevice(
                unique_id="climate_office_ac",
                name="Office AC",
                device_type="generic_thermostat",
                params={
                    "heater": "input_boolean.office_ac",
                    "target_sensor": "input_number.office_temp",
                    "min_temp": 10,
                    "max_temp": 30,
                    "target_temp": 24,
                    "ac_mode": True,
                },
            ),
            DemoDevice(
                unique_id="office_temp",
                name="Office Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="office_heater",
                name="Office Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            DemoDevice(
                unique_id="office_ac",
                name="Office AC",
                device_type="input_boolean",
                params={"icon": "mdi:air-conditioner"},
            ),
            DemoDevice(
                unique_id="switch_office_heater",
                name="Office Heater",
                device_type="template_switch",
                params={"source": "input_boolean.office_heater"},
            ),
        ],
    ),
    DemoArea(
        id="bathroom",
        name="Bathroom",
        floor_id="first_floor",
        devices=[
            DemoDevice(
                unique_id="climate_bathroom",
                name="Bathroom",
                device_type="generic_thermostat",
                params={
                    "heater": "input_boolean.bathroom_heater",
                    "target_sensor": "input_number.bathroom_temp",
                    "min_temp": 5,
                    "max_temp": 30,
                    "target_temp": 22,
                },
            ),
            DemoDevice(
                unique_id="bathroom_temp",
                name="Bathroom Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="bathroom_heater",
                name="Bathroom Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
        ],
    ),
    DemoArea(
        id="guest_room",
        name="Guest Room",
        floor_id="ground_floor",
        devices=[
            DemoDevice(
                unique_id="climate_guest_room_trv",
                name="Guest Room TRV",
                device_type="mqtt_trv",
                params={
                    "modes": ["off", "heat", "auto"],
                    "default_entity_id": "climate.guest_room_trv",
                    "topic_slug": "guest_room_trv",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="climate_guest_room_ac",
                name="Guest Room AC",
                device_type="mqtt_ac",
                params={
                    "modes": ["off", "cool"],
                    "default_entity_id": "climate.guest_room_ac",
                    "topic_slug": "guest_room_ac",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="mqtt_guest_room_dial",
                name="Guest Room Dial",
                device_type="mqtt_dial",
                params={
                    "modes": ["off", "heat", "cool"],
                    "default_entity_id": "climate.guest_room_dial",
                    "topic_slug": "guest_room_dial",
                    "optimistic": True,
                },
            ),
            DemoDevice(
                unique_id="mqtt_guest_room_window",
                name="Guest Room Window",
                device_type="mqtt_window",
                params={"topic_slug": "guest_room_window", "default_entity_id": "binary_sensor.guest_room_window"},
            ),
            DemoDevice(
                unique_id="guest_room_temp",
                name="Guest Room Temp",
                device_type="input_number",
                params={"min": 0, "max": 40, "step": 0.1, "unit": "°C", "icon": "mdi:thermometer", "initial": 19.0},
            ),
            DemoDevice(
                unique_id="guest_room_heater",
                name="Guest Room Heater",
                device_type="input_boolean",
                params={"icon": "mdi:radiator"},
            ),
            DemoDevice(
                unique_id="guest_room_ac",
                name="Guest Room AC",
                device_type="input_boolean",
                params={"icon": "mdi:air-conditioner"},
            ),
            DemoDevice(
                unique_id="guest_room_window_boolean",
                name="Guest Room Window Boolean",
                device_type="input_boolean",
                params={"icon": "mdi:window-closed"},
            ),
            DemoDevice(
                unique_id="binary_sensor_guest_room_window",
                name="Guest Room Window",
                device_type="template_binary_sensor",
                params={"device_class": "window", "source": "input_boolean.guest_room_window_boolean"},
            ),
        ],
    ),
]

# Global/System Devices not attached to specific area in same way
SYSTEM_DEVICES = [
    DemoDevice(
        unique_id="family_home", name="Family Home", device_type="input_boolean", params={"icon": "mdi:home-account"}
    ),
    DemoDevice(unique_id="boiler", name="Boiler", device_type="input_boolean", params={"icon": "mdi:fire"}),
    DemoDevice(
        unique_id="switch_boiler",
        name="Boiler",
        device_type="template_switch",
        params={"source": "input_boolean.boiler"},
    ),
]
