import base64
import json

mermaid_code = """erDiagram
    %% Core Storage
    ClimateDashboardStorage ||--o{ ZoneConfig : persists

    %% Config & Runtime
    ZoneConfig ||--o{ ScheduleBlock : contains
    ClimateZone ||--o{ ScheduleBlock : uses
    ClimateZone ||..|| ZoneConfig : from

    %% External Entities
    ClimateZone ||..o{ SensorEntity : reads
    ClimateZone ||..o{ ActuatorEntity : controls

    class ClimateDashboardStorage {
        int version
        string key "climate_dashboard"
        list listeners
    }

    class ZoneConfig {
        string unique_id
        string name
        string actuator
        string sensor
        list schedule
    }

    class ClimateZone {
        string unique_id
        string name
        string entity_id
        float current_temp
        float target_temp
        string hvac_mode
    }

    class ScheduleBlock {
        string id
        string name
        list days
        string start_time
        float target_temp
        string hvac_mode
    }

    class SensorEntity {
        string entity_id
        string state
    }

    class ActuatorEntity {
        string entity_id
        string domain
        string state
    }
"""

state = {"code": mermaid_code, "mermaid": {"theme": "default"}, "autoSync": True, "updateDiagram": True}

json_str = json.dumps(state)
base64_str = base64.urlsafe_b64encode(json_str.encode("utf-8")).decode("utf-8")

print(f"https://mermaid.live/edit#pbase64:{base64_str}")
