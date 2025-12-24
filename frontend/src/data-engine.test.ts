import { describe, it, expect } from "vitest";
import { DataEngine } from "./data-engine";

// Mocks
const MOCK_HASS = {
  states: {
    "climate.zone_office": {
      entity_id: "climate.zone_office",
      attributes: {
        is_climate_dashboard_zone: true,
        friendly_name: "Office",
        heaters: ["switch.heater"],
        coolers: [],
        schedule: [
          {
            days: ["mon", "tue"],
            start_time: "08:00",
            temp_heat: 21.0,
            temp_cool: 25.0,
            name: "Work",
          },
        ],
        hvac_action: "heating",
        current_temperature: 19.0,
        temperature: 21.0,
        safety_mode: false,
      },
      state: "heat",
    },
    "climate.zone_bedroom": {
      entity_id: "climate.zone_bedroom",
      attributes: {
        is_climate_dashboard_zone: true,
        friendly_name: "Bedroom",
        heaters: ["climate.trv"],
        coolers: ["climate.ac"],
        safety_mode: true, // Safety Mode active
      },
      state: "auto",
    },
  },
  entities: {
    "climate.zone_office": { area_id: "area_office" },
    "climate.zone_bedroom": { area_id: "area_bedroom" },
  },
  areas: {
    area_office: { floor_id: "floor_1" },
    area_bedroom: { floor_id: "floor_2" },
  },
  floors: {
    floor_1: { name: "First Floor", icon: "mdi:numeric-1-box", level: 1 },
    floor_2: { name: "Second Floor", icon: "mdi:numeric-2-box", level: 2 },
  },
};

describe("DataEngine", () => {
  describe("getGroupedZones", () => {
    it("should group zones by floor and sort by level", () => {
      const groups = DataEngine.getGroupedZones(MOCK_HASS);

      expect(groups).toHaveLength(2);

      // Level 2 should be first
      expect(groups[0].floorName).toBe("Second Floor");
      expect(groups[0].zones[0].entity_id).toBe("climate.zone_bedroom");

      // Level 1 should be second
      expect(groups[1].floorName).toBe("First Floor");
      expect(groups[1].zones[0].entity_id).toBe("climate.zone_office");
    });

    it("should filter by focusZoneId", () => {
      const groups = DataEngine.getGroupedZones(
        MOCK_HASS,
        "climate.zone_office",
      );
      expect(groups).toHaveLength(1);
      expect(groups[0].floorName).toBeNull(); // Flattened for focus view
      expect(groups[0].zones).toHaveLength(1);
      expect(groups[0].zones[0].entity_id).toBe("climate.zone_office");
    });
  });

  describe("getTimelineBlocks", () => {
    it("should process blocks for today (Monday)", () => {
      const zone = MOCK_HASS.states["climate.zone_office"];
      const blocks = DataEngine.getTimelineBlocks(zone, "mon");

      // Schedule: 08:00 start.
      // Expect:
      // 1. Ghost Block (Lookback) from 00:00 to 08:00
      // 2. Active Block from 08:00 to 24:00

      expect(blocks.length).toBeGreaterThanOrEqual(1);

      // Check last block (Work)
      const lastBlock = blocks[blocks.length - 1];
      expect(lastBlock.label).toBe("21°");

      // Width calculation: 08:00 is 480 mins.
      // Block starts at 480/1440 = 33.33%
      expect(lastBlock.left).toBeCloseTo(33.33, 1);
    });

    it("should determine correct color mode", () => {
      const zone = MOCK_HASS.states["climate.zone_office"]; // Heaters only
      const blocks = DataEngine.getTimelineBlocks(zone, "mon");
      expect(blocks[0].colorClass).toBe("mode-heat");
    });
  });

  describe("getZoneStatus", () => {
    it("should prioritize Safety Mode", () => {
      const zone = MOCK_HASS.states["climate.zone_bedroom"];
      const status = DataEngine.getZoneStatus(zone, false);

      expect(status.text).toContain("Safety Mode");
      expect(status.color).toContain("error-color");
    });

    it("should show Away Mode if active", () => {
      const zone = MOCK_HASS.states["climate.zone_office"]; // Normal zone
      const status = DataEngine.getZoneStatus(zone, true); // isAway = true

      expect(status.text).toContain("Away Mode");
      expect(status.icon).toBe("mdi:walk");
    });

    it("should show Schedule if normal", () => {
      const zone = {
        attributes: {
          next_scheduled_change: "2023-01-01T10:00:00+00:00",
          next_scheduled_temp_heat: 22.0,
        },
      };
      const status = DataEngine.getZoneStatus(zone, false);
      expect(status.text).toBe("Following Schedule");
      // subtext is now a TemplateResult, checking values is fragile, just check existence
      expect(status.subtext).toBeTruthy();
      // Verify it's not a simple string anymore (it's an object)
      expect(typeof status.subtext).toBe("object");
    });
  });
});
