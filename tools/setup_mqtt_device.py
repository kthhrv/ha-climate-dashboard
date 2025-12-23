import json
from typing import Any

import paho.mqtt.client as mqtt

# Configuration
BROKER = "localhost"
PORT = 1883
TOPIC_BASE = "homeassistant/climate/guest_room_trv"

# Payload for MQTT Discovery
# https://www.home-assistant.io/integrations/climate.mqtt/#configuration
payload = {
    "name": "Dial Heat",
    "default_entity_id": "climate.dial_heat_mqtt",
    "unique_id": "climate_dial_heat_mqtt",  # Renamed to avoid confuse with generic? No, Guest Room TRV was here.
    # Actually, let's keep Guest Room TRV as is if useful, or replace it?
    # User asked for "Dual Mode Dial". Let's ADD it as a second device.
    "device": {
        "identifiers": ["guest_room_trv_device_id"],
        "name": "Guest Room TRV Device",
        "model": "SmartTRV 9000",
        "manufacturer": "ACME",
        "sw_version": "2023.1.1",
        "suggested_area": "Guest Room",
    },
    "temperature_command_topic": f"{TOPIC_BASE}/target_temp/set",
    "temperature_state_topic": f"{TOPIC_BASE}/target_temp/state",
    "mode_command_topic": f"{TOPIC_BASE}/mode/set",
    "mode_state_topic": f"{TOPIC_BASE}/mode/state",
    "current_temperature_topic": f"{TOPIC_BASE}/current_temp/state",
    "min_temp": 10,
    "max_temp": 30,
    "temp_step": 0.5,
    "modes": ["off", "heat", "auto"],
    "availability_topic": f"{TOPIC_BASE}/availability",
    "payload_available": "online",
    "payload_not_available": "offline",
}

TOPIC_DUAL = "homeassistant/climate/guest_room_dial"
payload_dual = {
    "name": "Guest Room Dial",
    "default_entity_id": "climate.guest_room_dial",
    "unique_id": "mqtt_guest_room_dial",
    "device": {
        "identifiers": ["guest_room_dial_device_id"],
        "name": "Guest Room Dial",
        "model": "Mode Dial 3000",
        "manufacturer": "ACME",
        "sw_version": "1.0",
        "suggested_area": "Guest Room",
    },
    "temperature_command_topic": f"{TOPIC_DUAL}/target_temp/set",
    "temperature_state_topic": f"{TOPIC_DUAL}/target_temp/state",
    "mode_command_topic": f"{TOPIC_DUAL}/mode/set",
    "mode_state_topic": f"{TOPIC_DUAL}/mode/state",
    "current_temperature_topic": f"{TOPIC_DUAL}/current_temp/state",
    "min_temp": 10,
    "max_temp": 30,
    "temp_step": 0.5,
    "modes": ["off", "heat", "cool", "auto"],
    "availability_topic": f"{TOPIC_DUAL}/availability",
    "optimistic": True,
    "payload_available": "online",
    "payload_not_available": "offline",
}

TOPIC_AC = "homeassistant/climate/guest_room_ac"
payload_ac = {
    "name": "Guest Room AC",
    "default_entity_id": "climate.guest_room_ac",
    "unique_id": "mqtt_guest_room_ac",
    "device": {
        "identifiers": ["guest_room_ac_device_id"],
        "name": "Guest Room AC",
        "model": "CoolCloud 9",
        "manufacturer": "ACME",
        "suggested_area": "Guest Room",
    },
    "temperature_command_topic": f"{TOPIC_AC}/target_temp/set",
    "temperature_state_topic": f"{TOPIC_AC}/target_temp/state",
    "mode_command_topic": f"{TOPIC_AC}/mode/set",
    "mode_state_topic": f"{TOPIC_AC}/mode/state",
    "current_temperature_topic": f"{TOPIC_AC}/current_temp/state",
    "min_temp": 16,
    "max_temp": 30,
    "modes": ["off", "cool"],
    "availability_topic": f"{TOPIC_AC}/availability",
}

TOPIC_WIN = "homeassistant/binary_sensor/guest_room_window"
payload_win = {
    "name": "Guest Room Window",
    "unique_id": "mqtt_guest_room_window",
    "device_class": "window",
    "state_topic": f"{TOPIC_WIN}/state",
    "availability_topic": f"{TOPIC_WIN}/availability",
    "device": {
        "identifiers": ["guest_room_window_device_id"],
        "name": "Guest Room Window",
        "suggested_area": "Guest Room",
    },
}


def on_connect(client: mqtt.Client, userdata: Any, flags: dict[str, Any], rc: int) -> None:  # Cleaned up flags type
    print(f"Connected with result code {rc}")
    if rc == 0:
        # Publish Discovery Configs
        client.publish(f"{TOPIC_BASE}/config", json.dumps(payload), retain=True)
        client.publish(f"{TOPIC_DUAL}/config", json.dumps(payload_dual), retain=True)
        client.publish(f"{TOPIC_AC}/config", json.dumps(payload_ac), retain=True)
        client.publish(f"{TOPIC_WIN}/config", json.dumps(payload_win), retain=True)

        # Publish Initial States
        print("Publishing Initial States...")
        client.publish(payload["current_temperature_topic"], "21.5", retain=True)
        client.publish(payload["temperature_state_topic"], "22.0", retain=True)
        client.publish(payload["mode_state_topic"], "heat", retain=True)
        client.publish(payload["availability_topic"], "online", retain=True)

        client.publish(payload_dual["current_temperature_topic"], "21.5", retain=True)
        client.publish(payload_dual["temperature_state_topic"], "21.0", retain=True)
        client.publish(payload_dual["mode_state_topic"], "auto", retain=True)
        client.publish(payload_dual["availability_topic"], "online", retain=True)

        client.publish(payload_ac["current_temperature_topic"], "21.5", retain=True)
        client.publish(payload_ac["temperature_state_topic"], "24.0", retain=True)
        client.publish(payload_ac["mode_state_topic"], "off", retain=True)
        client.publish(payload_ac["availability_topic"], "online", retain=True)

        client.publish(payload_win["state_topic"], "OFF", retain=True)
        client.publish(payload_win["availability_topic"], "online", retain=True)

        print("Done! Check HA.")
        client.disconnect()
    else:
        print("Failed to connect")


client = mqtt.Client()
client.on_connect = on_connect

print(f"Connecting to {BROKER}:{PORT}...")
try:
    client.connect(BROKER, PORT, 60)
    client.loop_forever()
except Exception as e:
    print(f"Error: {e}")
    print("Ensure you have an MQTT Broker running (e.g., 'mosquitto').")
