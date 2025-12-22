import sys

import paho.mqtt.client as mqtt

if len(sys.argv) < 2:
    print("Usage: uv run python tools/update_trv_temp.py <temperature>")
    sys.exit(1)

temp = sys.argv[1]
broker = "localhost"
topic = "homeassistant/climate/guest_room_trv/current_temp/state"

client = mqtt.Client()
client.connect(broker, 1883, 60)
client.publish(topic, temp, retain=True)
client.disconnect()
print(f"Updated TRV temp to {temp}")
