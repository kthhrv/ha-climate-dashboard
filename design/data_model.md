# Climate Dashboard Design

## Entity Relationship Diagram (ERD)

This diagram visualizes the data model for the Climate Dashboard integration.

```mermaid
erDiagram
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
```

### Notes
*   **ClimateDashboardStorage**: Manages persistent state.
*   **ZoneConfig**: JSON configuration.
*   **ClimateZone**: Runtime Entity.
*   `||--o{` denotes One-to-Many.
*   `||..||` denotes One-to-One (Weak/Runtime link).
