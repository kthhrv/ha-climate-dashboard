import os
from typing import Any, List

import paho.mqtt.client as mqtt

CONFIG_DIR = "/home/keith/ws/ha-climate-dashboard/config"
STORAGE_DIR = os.path.join(CONFIG_DIR, ".storage")

# Paths to wipe
PATHS_TO_WIPE = [
    os.path.join(STORAGE_DIR, "climate_dashboard"),
    os.path.join(STORAGE_DIR, "core.restore_state"),
    os.path.join(STORAGE_DIR, "core.floor_registry"),
    os.path.join(STORAGE_DIR, "core.entity_registry"),
    os.path.join(STORAGE_DIR, "core.device_registry"),
    os.path.join(STORAGE_DIR, "core.area_registry"),
    os.path.join(STORAGE_DIR, "input_boolean"),
    os.path.join(STORAGE_DIR, "input_number"),
    os.path.join(STORAGE_DIR, "core.config_entries"),
    os.path.join(STORAGE_DIR, "lovelace"),
    os.path.join(STORAGE_DIR, "lovelace_dashboards"),
    os.path.join(STORAGE_DIR, "lovelace.climate_demo"),
    os.path.join(CONFIG_DIR, "home-assistant_v2.db"),
]

# MQTT Config
BROKER = "localhost"
PORT = 1883
TOPIC_BASE_PREFIX = "homeassistant"


def wipe_storage() -> None:
    print("--- Wiping Storage ---")
    for path in PATHS_TO_WIPE:
        if os.path.exists(path):
            try:
                os.remove(path)
                print(f"Deleted {path}")
            except OSError as e:
                print(f"Error deleting {path}: {e}")
    print("Storage wipe complete.\n")


def clear_mqtt() -> None:
    print("--- Clearing MQTT Retained Messages (Wildcard Sweep) ---")

    # List to track topics to clear
    topics_to_clear: List[str] = []

    def on_message(client: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage) -> None:
        # Identify config topics: homeassistant/<domain>/<id>/config
        if msg.topic.endswith("/config") and msg.payload:
            print(f"Found retained config: {msg.topic}")
            topics_to_clear.append(msg.topic)

    client = mqtt.Client()
    client.on_message = on_message

    try:
        client.connect(BROKER, PORT, 60)

        # Subscribe to all HA discovery topics
        client.subscribe(f"{TOPIC_BASE_PREFIX}/#")

        print("Listening for retained messages (2 seconds)...")
        client.loop_start()
        import time

        time.sleep(2.0)  # Wait for retained messages to flood in
        client.loop_stop()

        if not topics_to_clear:
            print("No retained config topics found.")
        else:
            print(f"Clearing {len(topics_to_clear)} retained topics...")
            for topic in topics_to_clear:
                client.publish(topic, "", retain=True)
                print(f"Cleared: {topic}")

        client.disconnect()

    except Exception as e:
        print(f"MQTT Error: {e}")
    print("MQTT clear complete.\n")


if __name__ == "__main__":
    wipe_storage()
    clear_mqtt()
    print("Teardown finished.")
