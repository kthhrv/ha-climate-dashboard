import { describe, it, expect, beforeEach } from "vitest";
import { fixture, html } from "@open-wc/testing-helpers";
import "./zones-view";
import { ZonesView } from "./zones-view";
import "./test-setup";
import { createMockHass } from "./test-setup";

describe("ZonesView", () => {
  let element: ZonesView;
  let mockHass: any;

  beforeEach(async () => {
    mockHass = createMockHass();
    mockHass.states = {
      "climate.zone_office": {
        entity_id: "climate.zone_office",
        state: "heat",
        attributes: {
          friendly_name: "Office",
          current_temperature: 20,
          is_climate_dashboard_zone: true,
          safety_mode: true, // Should trigger Red color
        },
      },
    };

    element = await fixture(html`
      <zones-view .hass=${mockHass}></zones-view>
    `);
  });

  it("should render zone card with colored status", async () => {
    const card = element.shadowRoot?.querySelector(".card");
    expect(card).toBeTruthy();

    const statusMsg = element.shadowRoot?.querySelector(".status-msg");
    expect(statusMsg).toBeTruthy();

    // Check if style contains the error color (red)
    // var(--error-color, #f44336)
    const style = statusMsg?.getAttribute("style");
    expect(style).toContain("var(--error-color, #f44336)");
    expect(statusMsg?.textContent).toContain("Safety Mode");
  });

  it("should render colored next temps for schedule", async () => {
    // Re-fixture with schedule data
    mockHass.states["climate.zone_office"].attributes = {
      ...mockHass.states["climate.zone_office"].attributes,
      safety_mode: false,
      next_scheduled_change: "2023-01-01T12:00:00",
      next_scheduled_temp_heat: 22,
    };

    element = await fixture(html`
      <zones-view .hass=${mockHass}></zones-view>
    `);

    // The subtext is in the second status-msg
    const statusMsgs = element.shadowRoot?.querySelectorAll(".status-msg");
    const subtext = statusMsgs?.[1];
    expect(subtext).toBeTruthy();

    // Check for orange span
    const span = subtext?.querySelector("span");
    expect(span?.textContent).toContain("22°");
    expect(span?.getAttribute("style")).toContain("var(--deep-orange-color");
  });
});
