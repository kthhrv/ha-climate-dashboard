import sys
from typing import Dict

import paho.mqtt.client as mqtt

# Add the tools directory to path to import demo_data
sys.path.append("tools")
from demo_data import AREAS, DemoDevice

BROKER = "localhost"
PORT = 1883
TOPIC_BASE_PREFIX = "homeassistant"


def get_mqtt_devices() -> Dict[str, DemoDevice]:
    """Return a map of slug -> device for all MQTT climate devices."""
    devices = {}
    for area in AREAS:
        for dev in area.devices:
            if dev.device_type.startswith("mqtt_") and "climate" in dev.entity_id:
                # Use topic_slug if available, else unique_id
                slug = dev.params.get("topic_slug", dev.unique_id)
                devices[slug] = dev
    return devices


def print_usage(devices: Dict[str, DemoDevice]) -> None:
    print("Usage: python tools/update_mqtt_temp.py <device_slug> <temperature>")
    print("\nAvailable device slugs:")
    for slug, dev in devices.items():
        print(f"  - {slug} ({dev.name})")


if __name__ == "__main__":
    devices = get_mqtt_devices()

    if len(sys.argv) < 3:
        print_usage(devices)
        sys.exit(1)

    target_slug = sys.argv[1]

    try:
        temp = float(sys.argv[2])
    except ValueError:
        print("Error: Temperature must be a number.")
        sys.exit(1)

    if target_slug not in devices:
        print(f"Error: Unknown device slug '{target_slug}'.")
        print_usage(devices)
        sys.exit(1)

    topic = f"{TOPIC_BASE_PREFIX}/climate/{target_slug}/current_temp/state"

    try:
        client = mqtt.Client()
        client.connect(BROKER, PORT, 60)
        client.publish(topic, str(temp), retain=True)
        client.disconnect()
        print(f"Updated {target_slug} ({devices[target_slug].name}) current temperature to {temp}°C")
    except Exception as e:
        print(f"Failed to publish to MQTT: {e}")
        sys.exit(1)
