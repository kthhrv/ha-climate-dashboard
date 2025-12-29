import { fixture, html } from "@open-wc/testing-helpers";
import { describe, it, expect, vi } from "vitest";
import "./history-view";
import { HistoryView } from "./history-view";

describe("HistoryView", () => {
  it("should render and show fallback if chart component is missing", async () => {
    const mockHass = {
      states: {
        "climate.zone_1": {
          entity_id: "climate.zone_1",
          attributes: { is_climate_dashboard_zone: true },
        },
      },
      callApi: vi
        .fn()
        .mockResolvedValue([
          [
            {
              entity_id: "climate.zone_1",
              state: "heat",
              last_changed: "2023-01-01T00:00:00Z",
            },
          ],
        ]),
    };

    const element = await fixture<HistoryView>(
      html`<history-view .hass=${mockHass}></history-view>`,
    );

    // Wait for async fetch
    await new Promise((r) => setTimeout(r, 0));
    await element.updateComplete;

    expect(mockHass.callApi).toHaveBeenCalled();

    // Check for custom timeline rendering
    const timeline = element.shadowRoot?.querySelector(".timeline-track");
    expect(timeline).to.exist;

    // Check if segments are rendered
    const segments = timeline?.querySelectorAll(".segment");
    expect(segments?.length).toBeGreaterThan(0);
  });
});
