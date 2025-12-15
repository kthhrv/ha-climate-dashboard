import json
import os

CONFIG_ENTRIES_PATH = "/home/keith/ws/ha-climate-dashboard/config/.storage/core.config_entries"


def clean_entries() -> None:
    if not os.path.exists(CONFIG_ENTRIES_PATH):
        return

    with open(CONFIG_ENTRIES_PATH, "r") as f:
        data = json.load(f)

    entries = data["data"]["entries"]
    new_entries = [e for e in entries if e["domain"] not in ("demo", "generic_thermostat")]

    data["data"]["entries"] = new_entries

    with open(CONFIG_ENTRIES_PATH, "w") as f:
        json.dump(data, f, indent=4)

    print(f"Removed {len(entries) - len(new_entries)} entries.")


if __name__ == "__main__":
    clean_entries()
