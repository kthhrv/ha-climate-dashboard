# Climate Dashboard Design (ASCII)

Since Mermaid rendering can be flaky in some environments, here is the text-based representation of the Data Model.

(1-to-N) = ||--o{
(1-to-1) = ||..||
(N-to-1) = }o..||

```
    [ClimateDashboardStorage]
            |
            | (persists)
            v
       [ClimateZoneConfig] <=================( is from )================== [ClimateZone]
            |                                                             |
            | (contains)                                                  | (uses)
            v                                                             v
     [ScheduleBlock]                                               [ScheduleBlock]
                                                                          |
                                                                          | (Supervisor manages)
                                                                          v
                                   +--------------------------------------+--------------------------------------+
                                   |                                                                             |
                                   v                                                                             v
                           [SensorEntity]                                                                  [ActuatorEntity]
                           (reads temp from)                                                               (controls heat/cool)
```

## Entity Details

### 1. ClimateDashboardStorage
*   **Role**: Persistent storage manager.
*   **File**: `.storage/climate_dashboard`
*   **Data**: List of `ClimateZoneConfig`.

### 2. ClimateZoneConfig
*   **Role**: The "Blueprint" or configuration for a zone.
*   **Attributes**: `unique_id`, `name`, `sensor_entity_id`, `actuator_entity_id`.

### 3. ClimateZone (The "Engine")
*   **Role**: The active Home Assistant Entity (`climate.zone_*`).
*   **Relationship**: Created at runtime based on `ClimateZoneConfig`.
*   **Logic**: 
    *   Reads `SensorEntity` (state change triggers update).
    *   Controls `ActuatorEntity` (switch or climate).
    *   Follows `ScheduleBlock` (if Mode=AUTO).

### 4. ScheduleBlock
*   **Role**: A rule for a specific time and day(s).
*   **Attributes**: `start_time`, `target_temp`, `days` (Mon, Tue...), `hvac_mode`.
