import { describe, it, expect, beforeEach } from "vitest";
import { fixture, html } from "@open-wc/testing-helpers";
import "./zone-editor";
import { ZoneEditor } from "./zone-editor";
import "./test-setup";
import { createMockHass } from "./test-setup";

describe("ZoneEditor", () => {
  let element: ZoneEditor;
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
          thermostats: ["climate.office_wall"],
          unique_id: "office_unique_id",
        },
      },
    };

    mockHass.callWS.mockImplementation((msg: any) => {
      if (msg.type === "climate_dashboard/circuit/list") {
        return Promise.resolve([
          { id: "boiler", name: "Boiler", member_zones: ["office_unique_id"] },
        ]);
      }
      if (msg.type === "config/entity_registry/get") {
        return Promise.resolve({ unique_id: "office_unique_id" });
      }
      return Promise.resolve([]);
    });

    element = await fixture(html`
      <zone-editor
        .hass=${mockHass}
        .zoneId=${"climate.zone_office"}
        .allEntities=${[]}
      ></zone-editor>
    `);
  });

  it("should load zone configuration", async () => {
    // Wait for firstUpdated and loadConfig
    await new Promise((resolve) => setTimeout(resolve, 50));

    const elAny = element as any;
    expect(elAny._name).toBe("Office");
    expect(elAny._temperatureSensor).toBe("sensor.office_temp");
    expect(elAny._heaters.has("climate.office_trv")).toBe(true);
    expect(elAny._selectedCircuitId).toBe("boiler");
  });

  it("should call update API on save", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const elAny = element as any;
    elAny._name = "Updated Office";
    await element.updateComplete;

    const saveBtn = element.shadowRoot?.querySelector(
      "button.save",
    ) as HTMLElement;
    saveBtn.click();

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/update",
        unique_id: "office_unique_id",
        name: "Updated Office",
      }),
    );
  });

  it("should call delete API on confirm", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const deleteBtn = element.shadowRoot?.querySelector(
      "button.delete",
    ) as HTMLElement;
    deleteBtn.click();
    await element.updateComplete;

    const confirmBtn = element.shadowRoot?.querySelector(
      ".delete-confirm",
    ) as HTMLElement;
    confirmBtn.click();

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/delete",
        unique_id: "office_unique_id",
      }),
    );
  });
});
