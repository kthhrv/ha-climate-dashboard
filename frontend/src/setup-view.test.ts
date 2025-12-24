import { describe, it, expect, beforeEach, vi } from "vitest";
import { fixture, html } from "@open-wc/testing-helpers";
import "./setup-view";
import { SetupView } from "./setup-view";
import "./test-setup";
import { createMockHass } from "./test-setup";

describe("SetupView", () => {
  let element: SetupView;
  let mockHass: any;

  beforeEach(async () => {
    // Mock window methods
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.stubGlobal("alert", vi.fn());

    mockHass = createMockHass();
    mockHass.callWS.mockImplementation((msg: any) => {
      if (msg.type === "climate_dashboard/scan") {
        return Promise.resolve([
          {
            entity_id: "climate.trv1",
            name: "TRV 1",
            domain: "climate",
            state: "off",
          },
        ]);
      }
      if (msg.type === "climate_dashboard/settings/get") {
        return Promise.resolve({
          default_override_type: "next_block",
          default_timer_minutes: 60,
          window_open_delay_seconds: 30,
          home_away_entity_id: null,
          away_delay_minutes: 10,
          away_temperature: 16.0,
          away_temperature_cool: 30.0,
          is_away_mode_on: false,
        });
      }
      if (msg.type === "climate_dashboard/circuit/list") {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    element = await fixture(html`<setup-view .hass=${mockHass}></setup-view>`);
  });

  it("should load settings and devices", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const elAny = element as any;
    expect(elAny._devices.length).toBe(1);
    expect(elAny._settings.away_temperature).toBe(16.0);
  });

  it("should update settings", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Find the away temperature input
    const inputs = element.shadowRoot?.querySelectorAll("input[type='number']");
    // away_temperature is one of the inputs.
    // Let's just find the one with value 16.
    const awayTempInput = Array.from(inputs || []).find(
      (i) => (i as any).value === "16",
    ) as HTMLInputElement;

    if (awayTempInput) {
      awayTempInput.value = "17";
      awayTempInput.dispatchEvent(new Event("change"));
    }

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/settings/update",
        away_temperature: 17,
      }),
    );
  });

  it("should open and save circuit dialog", async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Click Create button for circuit
    const createBtn = Array.from(
      element.shadowRoot?.querySelectorAll("button.adopt-btn") || [],
    ).find((b) => b.textContent?.includes("Create")) as HTMLElement;
    createBtn.click();
    await element.updateComplete;

    const elAny = element as any;
    expect(elAny._circuitDialogOpen).toBe(true);

    // Fill name - use a more specific selector to avoid the search input
    const dialog = element.shadowRoot?.querySelector(
      "div[style*='position:fixed']",
    );
    const nameInput = dialog?.querySelector(
      "input[type='text']",
    ) as HTMLInputElement;
    nameInput.value = "New Circuit";
    nameInput.dispatchEvent(new Event("input"));

    // Save
    const saveBtn = Array.from(
      element.shadowRoot?.querySelectorAll("button.adopt-btn") || [],
    ).find((b) => b.textContent?.includes("Save")) as HTMLElement;
    saveBtn.click();

    expect(mockHass.callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "climate_dashboard/circuit/create",
        name: "New Circuit",
      }),
    );
  });
});
