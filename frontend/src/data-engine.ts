import { html } from "lit";

export interface ZoneGroup {
  floorName: string | null;
  floorIcon: string | null;
  zones: any[];
}

export interface TimelineBlock {
  left: number; // Percentage 0-100
  width: number; // Percentage 0-100
  colorClass: string;
  opacity: number;
  label: string;
  tooltip: string;
}

export class DataEngine {
  /**
   * Groups zones by Floor -> Area.
   * Logic: Entity -> Area -> Floor.
   */
  static getGroupedZones(hass: any, focusZoneId?: string): ZoneGroup[] {
    if (!hass) return [];

    let zones = Object.values(hass.states).filter(
      (s: any) => s.attributes.is_climate_dashboard_zone,
    );

    // Filter if focusZoneId is present
    if (focusZoneId) {
      zones = zones.filter((s: any) => s.entity_id === focusZoneId);
      // If focused, just return flat list effectively (one group, null header)
      return [{ floorName: null, floorIcon: null, zones }];
    }

    // Identify Floors
    // Note: hass.floors is a dictionary { floor_id: FloorObject }
    if (!hass.floors || Object.keys(hass.floors).length === 0) {
      if (zones.length === 0) return [];
      return [{ floorName: null, floorIcon: null, zones }];
    }

    // Map: Floor ID -> Zones
    const floorMap: Record<
      string,
      {
        floorName: string;
        floorIcon: string | null;
        level: number | null;
        zones: any[];
      }
    > = {};

    const unassignedZones: any[] = [];

    zones.forEach((zone: any) => {
      // Find area of this zone entity
      const entityReg = hass.entities?.[zone.entity_id];
      const areaId = entityReg?.area_id;
      const area = areaId ? hass.areas?.[areaId] : null;
      const floorId = area?.floor_id;

      if (floorId && hass.floors?.[floorId]) {
        const floor = hass.floors[floorId];
        if (!floorMap[floorId]) {
          floorMap[floorId] = {
            floorName: floor.name,
            floorIcon: floor.icon,
            level: floor.level,
            zones: [],
          };
        }
        floorMap[floorId].zones.push(zone);
      } else {
        unassignedZones.push(zone);
      }
    });

    // Sort floors by level DESC (b - a)
    const sortedFloors = Object.values(floorMap).sort((a, b) => {
      if (a.level !== null && b.level !== null) return b.level - a.level;
      return a.floorName.localeCompare(b.floorName);
    });

    // Build final result
    const result: ZoneGroup[] = sortedFloors.map((f) => ({
      floorName: f.floorName,
      floorIcon: f.floorIcon,
      zones: f.zones,
    }));

    if (unassignedZones.length > 0) {
      result.push({
        floorName: "Other Devices",
        floorIcon: "mdi:devices",
        zones: unassignedZones,
      });
    }

    return result;
  }

  /**
   * Processes schedule blocks for visualization.
   * Handles "Carry Over" logic (looking back at previous days to fill 00:00 gap).
   */
  static getTimelineBlocks(zone: any, day: string): TimelineBlock[] {
    const schedule = zone.attributes.schedule || [];

    // Zone Capabilities (Heat/Cool/Auto)
    const hasHeaters = (zone.attributes.heaters || []).length > 0;
    const hasCoolers = (zone.attributes.coolers || []).length > 0;

    let zoneMode = "off";
    if (hasHeaters && hasCoolers) {
      zoneMode = "auto";
    } else if (hasHeaters) {
      zoneMode = "heat";
    } else if (hasCoolers) {
      zoneMode = "cool";
    }

    // Filter for today
    const todaysBlocks = schedule.filter((block: any) =>
      block.days.includes(day),
    );

    // Sort
    todaysBlocks.sort((a: any, b: any) =>
      a.start_time.localeCompare(b.start_time),
    );

    // Lookback Logic: Fill Start-of-Day Gap
    const firstBlockStart =
      todaysBlocks.length > 0 ? todaysBlocks[0].start_time : "24:00";

    if (firstBlockStart > "00:00") {
      const daysMap = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      const currentDayIdx = daysMap.indexOf(day);

      let foundBlock = null;
      // Search backwards up to 7 days
      for (let i = 1; i <= 7; i++) {
        const prevDayIdx = (currentDayIdx - i + 7) % 7;
        const prevDayName = daysMap[prevDayIdx];
        const prevDayBlocks = schedule.filter((b: any) =>
          b.days.includes(prevDayName),
        );

        if (prevDayBlocks.length > 0) {
          // Sort to find last one
          prevDayBlocks.sort((a: any, b: any) =>
            a.start_time.localeCompare(b.start_time),
          );
          foundBlock = prevDayBlocks[prevDayBlocks.length - 1];
          break;
        }
      }

      if (foundBlock) {
        // Create ghost block representing carry-over
        const ghostBlock = {
          ...foundBlock,
          start_time: "00:00",
          name: `Carry-over (${foundBlock.name})`,
        };
        todaysBlocks.unshift(ghostBlock);
      }
    }

    // Transform to Timeline Blocks
    return todaysBlocks.map((block: any, index: number) => {
      // Calculate Position
      const [h, m] = block.start_time.split(":").map(Number);
      const startMinutes = h * 60 + m;

      // Calculate Duration (until next block or end of day)
      let endMinutes = 1440; // End of day
      if (index < todaysBlocks.length - 1) {
        const nextBlock = todaysBlocks[index + 1];
        const [nh, nm] = nextBlock.start_time.split(":").map(Number);
        endMinutes = nh * 60 + nm;
      }

      const duration = endMinutes - startMinutes;
      const left = (startMinutes / 1440) * 100;
      const width = (duration / 1440) * 100;

      // Visualization Logic
      let label = "";
      const tHeat = block.temp_heat ?? 20.0;
      const tCool = block.temp_cool ?? 24.0;

      const minT = 16;
      const maxT = 24;
      let intensity = 1.0;

      if (zoneMode === "heat") {
        label = `${tHeat}°`;
        const pct = (tHeat - minT) / (maxT - minT);
        intensity = 0.4 + 0.6 * Math.min(Math.max(pct, 0), 1);
      } else if (zoneMode === "cool") {
        label = `${tCool}°`;
        const pct = (tCool - minT) / (maxT - minT);
        intensity = 0.4 + 0.6 * Math.min(Math.max(pct, 0), 1);
      } else if (zoneMode === "auto") {
        label = `${tHeat}-${tCool}°`;
        const heatPct = (tHeat - minT) / (maxT - minT);
        const heatIntensity = 0.4 + 0.6 * Math.min(Math.max(heatPct, 0), 1);
        const coolPct = (tCool - minT) / (maxT - minT);
        const coolIntensity = 0.4 + 0.6 * Math.min(Math.max(coolPct, 0), 1);
        intensity = Math.max(heatIntensity, coolIntensity);
      } else {
        label = `${tHeat}°`;
        intensity = 0.5;
      }

      return {
        left,
        width,
        colorClass: `mode-${zoneMode}`,
        opacity: intensity,
        label,
        tooltip: `${block.name}: ${block.start_time} (${label})`,
      };
    });
  }

  /**
   * Generates a rich status object for the Zone List.
   */
  static getZoneStatus(zone: any, isAwayMode: boolean) {
    const attrs = zone.attributes;

    // Priority 1: Safety Mode
    if (attrs.safety_mode) {
      return {
        icon: "mdi:alert-circle",
        color: "var(--error-color, #f44336)",
        text: "Safety Mode (Sensor Lost)",
        subtext: "Heating to 5°C",
      };
    }

    // Priority 2: Window Open
    if (attrs.open_window_sensor) {
      return {
        icon: "mdi:window-open-variant",
        color: "var(--warning-color, #ff9800)",
        text: `Window Open (${attrs.open_window_sensor})`,
        subtext: "Heating Paused",
      };
    }

    // Priority 3: Global Away
    if (isAwayMode) {
      return {
        icon: "mdi:walk",
        color: "var(--warning-color, #ff9800)",
        text: "Away Mode Active",
        subtext: "Global Override",
      };
    }

    // Priority 4: Manual Override
    if (attrs.override_end) {
      const endObj = new Date(attrs.override_end);
      const timeStr = endObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        icon: "mdi:timer-sand",
        color: "var(--primary-color, #03a9f4)",
        text: "Temporary Hold",
        subtext: `Until ${timeStr}`,
      };
    }

    // Priority 5: Normal Schedule
    if (attrs.next_scheduled_change) {
      const nextTime = new Date(attrs.next_scheduled_change).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      let nextTempDisplay;
      if (attrs.next_scheduled_temp_heat && attrs.next_scheduled_temp_cool) {
        nextTempDisplay = html`<span
            style="color: var(--deep-orange-color, #ff5722)"
            >${attrs.next_scheduled_temp_heat}</span
          >-<span style="color: var(--blue-color, #2196f3)"
            >${attrs.next_scheduled_temp_cool}</span
          >°`;
      } else if (attrs.next_scheduled_temp_cool) {
        nextTempDisplay = html`<span style="color: var(--blue-color, #2196f3)"
          >${attrs.next_scheduled_temp_cool}°</span
        >`;
      } else {
        nextTempDisplay = html`<span
          style="color: var(--deep-orange-color, #ff5722)"
          >${attrs.next_scheduled_temp_heat}°</span
        >`;
      }

      return {
        icon: "mdi:calendar-clock",
        color: "var(--secondary-text-color)",
        text: "Following Schedule",
        subtext: html`${nextTempDisplay} at ${nextTime}`,
      };
    }

    return {
      icon: "mdi:help-circle",
      color: "var(--disabled-text-color)",
      text: "Unknown State",
      subtext: "",
    };
  }
}
