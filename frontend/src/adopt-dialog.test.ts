import { describe, it, expect, beforeEach } from "vitest";
import { fixture, html } from "@open-wc/testing-helpers";
import "./adopt-dialog";
import { AdoptDialog } from "./adopt-dialog";
import "./test-setup";
import { createMockHass } from "./test-setup";

describe("AdoptDialog", () => {
  let element: AdoptDialog;
  let mockHass: any;

  beforeEach(async () => {
    mockHass = createMockHass();
    mockHass.callWS.mockResolvedValue([]);

    element = await fixture(html`
      <adopt-dialog
        .hass=${mockHass}
        .allEntities=${[]}
        .allCircuits=${[]}
      ></adopt-dialog>
    `);
  });

  it("should render", () => {
    expect(element).toBeTruthy();
    const title = element.shadowRoot?.querySelector("h2");
    expect(title?.textContent).toBe("Adopt Zone");
  });

  it("should guess configuration from suggested entity", async () => {
    element = await fixture(html`
      <adopt-dialog
        .hass=${mockHass}
        .preselected=${"climate.new_trv"}
        .entities=${[
          { entity_id: "climate.new_trv", domain: "climate", name: "New TRV" },
        ]}
        .open=${true}
      ></adopt-dialog>
    `);

    // Check internal state directly for simplicity in checking logic
    // Using 'any' cast to access private state for testing
    const elAny = element as any;
    expect(elAny._name).toBe("New TRV");
    expect(elAny._temperatureSensor).toBe("climate.new_trv");
    expect(elAny._heaters.has("climate.new_trv")).toBe(true);
  });

  it("should call adopt API on save", async () => {
    // Setup valid state
    const elAny = element as any;
    elAny._name = "Test Zone";
    elAny._temperatureSensor = "sensor.temp";
    await element.updateComplete;

    // Click Save
    const saveBtn = element.shadowRoot?.querySelector(
      "button.save",
    ) as HTMLElement;
    saveBtn.click();

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/adopt",
        name: "Test Zone",
        temperature_sensor: "sensor.temp",
      }),
    );
  });
});
