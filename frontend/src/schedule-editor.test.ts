import { describe, it, expect, beforeEach } from "vitest";
import { fixture, html } from "@open-wc/testing-helpers";
import "./schedule-editor";
import { ScheduleEditor } from "./schedule-editor";
import "./test-setup";
import { createMockHass } from "./test-setup";

describe("ScheduleEditor", () => {
  let element: ScheduleEditor;
  let mockHass: any;

  beforeEach(async () => {
    mockHass = createMockHass();
    mockHass.states = {
      "climate.zone_office": {
        entity_id: "climate.zone_office",
        attributes: {
          friendly_name: "Office",
          temperature_sensor: "sensor.office_temp",
          heaters: ["climate.office_trv"],
          coolers: [],
          schedule: [
            {
              name: "Day",
              start_time: "08:00",
              temp_heat: 21.0,
              days: ["mon", "tue", "wed", "thu", "fri"],
            },
          ],
        },
      },
    };

    mockHass.callWS.mockImplementation((msg: any) => {
      if (msg.type === "config/entity_registry/get") {
        return Promise.resolve({ unique_id: "office_unique_id" });
      }
      return Promise.resolve([]);
    });

    element = await fixture(html`
      <schedule-editor
        .hass=${mockHass}
        .zoneId=${"climate.zone_office"}
      ></schedule-editor>
    `);
  });

  it("should load schedule", async () => {
    // Wait for firstUpdated and loadConfig
    await new Promise((resolve) => setTimeout(resolve, 50));

    const elAny = element as any;
    expect(elAny._schedule.length).toBe(1);
    expect(elAny._schedule[0].name).toBe("Day");
    expect(elAny._schedule[0].temp_heat).toBe(21.0);
  });

  it("should add a block", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const addBtn = element.shadowRoot?.querySelector(".add-btn") as HTMLElement;
    addBtn.click();

    const elAny = element as any;
    expect(elAny._schedule.length).toBe(2);
    expect(elAny._schedule[1].name).toBe("New Block");
  });

  it("should call update API on save", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const saveBtn = element.shadowRoot?.querySelector(
      "button.save",
    ) as HTMLElement;
    saveBtn.click();

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/update",
        unique_id: "office_unique_id",
        schedule: expect.any(Array),
      }),
    );
  });
});
