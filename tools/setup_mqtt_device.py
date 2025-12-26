import json
from typing import Any, Dict, List

import paho.mqtt.client as mqtt
from demo_data import AREAS, DemoDevice

# Configuration
BROKER = "localhost"
PORT = 1883
TOPIC_BASE_PREFIX = "homeassistant"


def get_initial_mode(modes: List[str]) -> str:
    if "auto" in modes:
        return "auto"
    if "heat" in modes:
        return "heat"
    if "cool" in modes:
        return "cool"
    return "off"


def get_mqtt_payload(dev: DemoDevice, area_name: str) -> Dict[str, Any]:
    """Generate MQTT discovery payload based on device type."""
    slug = dev.params.get("topic_slug", dev.unique_id)

    if dev.device_type == "mqtt_trv":
        topic_base = f"{TOPIC_BASE_PREFIX}/climate/{slug}"
        modes = dev.params.get("modes", ["off", "heat"])
        return {
            "topic": f"{topic_base}/config",
            "payload": {
                "name": dev.name,
                "unique_id": dev.unique_id,
                "device": {
                    "identifiers": [f"device_{dev.unique_id}"],
                    "name": dev.name,
                    "model": "SmartTRV",
                    "manufacturer": "ACME",
                    "suggested_area": area_name,
                },
                "temperature_command_topic": f"{topic_base}/target_temp/set",
                "temperature_state_topic": f"{topic_base}/target_temp/state",
                "mode_command_topic": f"{topic_base}/mode/set",
                "mode_state_topic": f"{topic_base}/mode/state",
                "current_temperature_topic": f"{topic_base}/current_temp/state",
                "min_temp": 5,
                "max_temp": 30,
                "temp_step": 0.5,
                "modes": modes,
                "availability_topic": f"{topic_base}/availability",
                "optimistic": dev.params.get("optimistic", False),
            },
            "initial_state": {
                "current_temp": "20.0",
                "target_temp": "21.0",
                "mode": get_initial_mode(modes),
                "availability": "online",
            },
        }
    if dev.device_type == "mqtt_ac":
        topic_base = f"{TOPIC_BASE_PREFIX}/climate/{slug}"
        modes = dev.params.get("modes", ["off", "cool"])
        return {
            "topic": f"{topic_base}/config",
            "payload": {
                "name": dev.name,
                "unique_id": dev.unique_id,
                "device": {
                    "identifiers": [f"device_{dev.unique_id}"],
                    "name": dev.name,
                    "model": "CoolCloud 9",
                    "manufacturer": "ACME",
                    "suggested_area": area_name,
                },
                "temperature_command_topic": f"{topic_base}/target_temp/set",
                "temperature_state_topic": f"{topic_base}/target_temp/state",
                "mode_command_topic": f"{topic_base}/mode/set",
                "mode_state_topic": f"{topic_base}/mode/state",
                "current_temperature_topic": f"{topic_base}/current_temp/state",
                "min_temp": 16,
                "max_temp": 30,
                "modes": modes,
                "availability_topic": f"{topic_base}/availability",
                "optimistic": dev.params.get("optimistic", False),
            },
            "initial_state": {
                "current_temp": "22.0",
                "target_temp": "24.0",
                "mode": get_initial_mode(modes),
                "availability": "online",
            },
        }
    if dev.device_type == "mqtt_dial":
        topic_base = f"{TOPIC_BASE_PREFIX}/climate/{slug}"
        modes = dev.params.get("modes", ["off", "heat", "cool", "auto"])
        return {
            "topic": f"{topic_base}/config",
            "payload": {
                "name": dev.name,
                "unique_id": dev.unique_id,
                "device": {
                    "identifiers": [f"device_{dev.unique_id}"],
                    "name": dev.name,
                    "model": "Mode Dial 3000",
                    "manufacturer": "ACME",
                    "suggested_area": area_name,
                },
                "temperature_command_topic": f"{topic_base}/target_temp/set",
                "temperature_state_topic": f"{topic_base}/target_temp/state",
                "mode_command_topic": f"{topic_base}/mode/set",
                "mode_state_topic": f"{topic_base}/mode/state",
                "current_temperature_topic": f"{topic_base}/current_temp/state",
                "min_temp": 10,
                "max_temp": 30,
                "temp_step": 0.5,
                "modes": modes,
                "availability_topic": f"{topic_base}/availability",
                "optimistic": True,
            },
            "initial_state": {
                "current_temp": "21.5",
                "target_temp": "21.0",
                "mode": get_initial_mode(modes),
                "availability": "online",
            },
        }
    if dev.device_type == "mqtt_window":
        topic_base = f"{TOPIC_BASE_PREFIX}/binary_sensor/{slug}"
        return {
            "topic": f"{topic_base}/config",
            "payload": {
                "name": dev.name,
                "unique_id": dev.unique_id,
                "device_class": "window",
                "state_topic": f"{topic_base}/state",
                "availability_topic": f"{topic_base}/availability",
                "device": {
                    "identifiers": [f"device_{dev.unique_id}"],
                    "name": dev.name,
                    "suggested_area": area_name,
                },
            },
            "initial_state": {"state": "OFF", "availability": "online"},
        }
    # Return a default empty dict for unsupported types to satisfy type hint
    return {"topic": "", "payload": {}, "initial_state": {}}


def on_connect(client: mqtt.Client, userdata: Any, flags: Dict[str, Any], rc: int) -> None:
    print(f"Connected with result code {rc}")
    if rc == 0:
        print("Publishing Discovery Configs and Initial States...")

        for area in AREAS:
            for dev in area.devices:
                if dev.device_type.startswith("mqtt_"):
                    data = get_mqtt_payload(dev, area.name)
                    if data and data["topic"]:
                        # Publish Config
                        client.publish(data["topic"], json.dumps(data["payload"]), retain=True)
                        print(f"Published Config for {dev.name}")

                        # Publish Initial State
                        config = data["payload"]
                        state = data["initial_state"]

                        if "current_temperature_topic" in config:
                            client.publish(config["current_temperature_topic"], state["current_temp"], retain=True)
                        if "temperature_state_topic" in config:
                            client.publish(config["temperature_state_topic"], state["target_temp"], retain=True)
                        if "mode_state_topic" in config:
                            client.publish(config["mode_state_topic"], state["mode"], retain=True)
                        if "state_topic" in config:  # Binary Sensor
                            client.publish(config["state_topic"], state["state"], retain=True)
                        if "availability_topic" in config:
                            client.publish(config["availability_topic"], state["availability"], retain=True)

        print("Done! Check HA.")
        client.disconnect()
    else:
        print("Failed to connect")


if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect

    print(f"Connecting to {BROKER}:{PORT}...")
    try:
        client.connect(BROKER, PORT, 60)
        client.loop_forever()
    except Exception as e:
        print(f"Error: {e}")
        print("Ensure you have an MQTT Broker running (e.g., 'mosquitto').")
