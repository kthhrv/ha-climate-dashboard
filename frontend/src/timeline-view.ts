import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("timeline-view")
export class TimelineView extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property() public focusZoneId?: string;

  @state() private _selectedDay: string = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();

  static styles = css`
    /* ... existing styles ... */
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    /* Rest of CSS same as before, omitted for brevity if replace works right */
    h2 {
      margin-top: 0;
      margin-bottom: 24px;
    }
    .day-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .day-tab {
      padding: 8px 16px;
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      background: transparent;
      cursor: pointer;
      font-weight: 500;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }
    .day-tab:hover {
      background: var(--secondary-background-color);
    }
    .day-tab.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .timeline-container {
      position: relative;
      margin-top: 20px;
    }
    /* Time Axis */
    .time-axis {
      display: flex;
      align-items: flex-end; /* Align labels to bottom */
      height: 24px;
      margin-bottom: 8px;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .time-axis-spacer {
      width: 136px; /* 120px label + 16px padding */
      flex-shrink: 0;
    }
    .time-axis-track {
      flex: 1;
      position: relative;
      height: 100%;
    }
    .time-marker {
      position: absolute;
      bottom: 0;
      transform: translateX(-50%);
      white-space: nowrap;
    }
    .time-marker::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      height: 4px;
      width: 1px;
      background: var(--divider-color);
    }

    /* Zone Rows */
    .zone-row {
      display: flex;
      align-items: center;
      height: 48px;
      border-bottom: 1px solid var(--divider-color, #eee);
      position: relative;
      cursor: pointer;
    }
    .zone-row:hover {
      background-color: var(--secondary-background-color, #f5f5f5);
    }
    .zone-label {
      width: 120px;
      padding-right: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .zone-label .temp {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      font-weight: normal;
    }

    /* Track Area */
    .timeline-track {
      flex: 1;
      position: relative;
      height: 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      overflow: hidden;
    }

    /* Blocks */
    .schedule-block {
      position: absolute;
      top: 0;
      bottom: 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75em;
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      white-space: nowrap;
      transition: opacity 0.2s;
    }
    .schedule-block:hover {
      opacity: 0.9;
      z-index: 2;
    }
    /* Colors */
    .mode-heat {
      background-color: var(--deep-orange-color, #ff5722);
    }
    .mode-cool {
      background-color: var(--blue-color, #2196f3);
    }
    .mode-off {
      background-color: var(--grey-color, #9e9e9e);
    }
    .mode-auto {
      background: linear-gradient(
        to bottom,
        var(--blue-color, #2196f3) 50%,
        var(--deep-orange-color, #ff5722) 50%
      );
    }

    /* Current Time Indicator */
    .current-time-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: var(--primary-color, #03a9f4);
      z-index: 10;
      pointer-events: none;
    }
    .current-time-line::before {
      content: "";
      position: absolute;
      top: -4px;
      left: -1px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--primary-color, #03a9f4);
      box-shadow: 0 0 0 2px rgba(3, 169, 244, 0.3);
    }
  `;

  protected render(): TemplateResult {
    if (!this.hass) return html``;

    let zones = Object.values(this.hass.states).filter(
      (s: any) => s.attributes.is_climate_dashboard_zone,
    );

    // Filter if focusZoneId is present
    if (this.focusZoneId) {
      zones = zones.filter((s: any) => s.entity_id === this.focusZoneId);
    }

    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const todayStr = new Date()
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase();

    return html`
      <div class="card">
        <h2>Timeline</h2>

        <div class="day-selector">
          ${days.map(
            (day) => html`
              <button
                class="day-tab ${this._selectedDay === day ? "active" : ""}"
                @click=${() => (this._selectedDay = day)}
              >
                ${day.toUpperCase()}
              </button>
            `,
          )}
        </div>

        ${zones.length === 0
          ? html`<p>No zones adopted yet.</p>`
          : html`
              <div class="timeline-container">
                <!-- Time Axis -->
                <div class="time-axis">
                  <div class="time-axis-spacer"></div>
                  <div class="time-axis-track">
                    ${[0, 4, 8, 12, 16, 20, 24].map(
                      (hour) => html`
                        <div
                          class="time-marker"
                          style="left: ${(hour / 24) * 100}%"
                        >
                          ${hour.toString().padStart(2, "0")}:00
                        </div>
                      `,
                    )}
                  </div>
                </div>

                <!-- Zones -->
                ${zones.map((zone: any) =>
                  this._renderZoneRow(zone, this._selectedDay),
                )}

                <!-- Current Time Indicator (Only show if viewing today) -->
                ${this._selectedDay === todayStr
                  ? this._renderCurrentTimeLine()
                  : ""}
              </div>
            `}
      </div>
    `;
  }

  private _renderZoneRow(zone: any, day: string): TemplateResult {
    return html`
      <div class="zone-row" @click=${() => this._editSchedule(zone.entity_id)}>
        <div class="zone-label">
          <div>${zone.attributes.friendly_name || zone.entity_id}</div>
          <div class="temp">
            ${zone.attributes.current_temperature ?? "--"}°C ->
            ${zone.attributes.temperature}°C
          </div>
        </div>

        <div class="timeline-track">${this._renderBlocks(zone, day)}</div>
      </div>
    `;
  }

  private _renderBlocks(zone: any, day: string): TemplateResult[] {
    const schedule = zone.attributes.schedule || [];

    // Timeline Block Color Logic
    // The color should reflect the *capabilities* of the zone, not its current state.
    // - Heat Only -> Orange
    // - Cool Only -> Blue
    // - Both -> Auto (Gradient)
    // - Neither -> Gray
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

    // Fix: Fill Start-of-Day Gap (Lookback Logic)
    // If the first block starts after 00:00, we need to show what's happening before it.
    // Logic: Look back at previous days to find the last active block.
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
          // We render this block effectively from 00:00 to the start of the next block
        };
        todaysBlocks.unshift(ghostBlock);
      }
    }

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

      // Label based on Zone Capabilities
      let label = "";
      const tHeat = block.temp_heat ?? block.target_temp;
      const tCool = block.temp_cool ?? block.target_temp;

      // Calculate Intensity (Opacity) based on Temp
      // Range: 16C (Low) to 24C (High)
      // Heat: Higher = More Intense
      // Cool: Lower = More Intense
      const minT = 16;
      const maxT = 24;
      let intensity = 1.0;

      if (zoneMode === "heat") {
        label = `${tHeat}°`;
        const pct = (tHeat - minT) / (maxT - minT);
        intensity = 0.4 + 0.6 * Math.min(Math.max(pct, 0), 1); // 0.4 to 1.0
      } else if (zoneMode === "cool") {
        label = `${tCool}°`;
        const pct = (maxT - tCool) / (maxT - minT); // Inverted
        intensity = 0.4 + 0.6 * Math.min(Math.max(pct, 0), 1);
      } else if (zoneMode === "auto") {
        label = `${tHeat}-${tCool}°`;
        intensity = 0.9; // Fixed high intensity for Auto
      } else {
        label = `${tHeat}°`;
        intensity = 0.5; // Off/Dim
      }

      return html`
        <div
          class="schedule-block mode-${zoneMode}"
          style="left: ${left}%; width: ${width}%; opacity: ${intensity.toFixed(
            2,
          )};"
          title="${block.name}: ${block.start_time} (${label})"
        >
          ${label}
        </div>
      `;
    });
  }

  private _renderCurrentTimeLine(): TemplateResult {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const pct = (minutes / 1440) * 100;

    // Offset is 120px (label) + 16px (padding) = 136px
    return html`
      <div
        class="current-time-line"
        style="left: calc(136px + (100% - 136px) * ${pct / 100})"
      ></div>
    `;
  }

  private _editSchedule(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("schedule-selected", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
