import time
from typing import Any

import paho.mqtt.client as mqtt


def on_message(client: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage) -> None:
    print(f"Topic: {msg.topic}")
    print(f"Payload: {msg.payload.decode()[:100]}...")


if __name__ == "__main__":
    client = mqtt.Client()
    client.on_message = on_message
    client.connect("localhost", 1883, 60)
    client.subscribe("homeassistant/#")
    client.loop_start()
    time.sleep(2)
    client.loop_stop()
    client.disconnect()
