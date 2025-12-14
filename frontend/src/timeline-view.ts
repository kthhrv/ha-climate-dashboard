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
    .time-axis {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-left: 120px; /* Space for labels */
      font-size: 0.8em;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
    }
    .time-marker {
      position: relative;
      width: 0;
      display: flex;
      justify-content: center;
    }
    .time-marker::after {
      content: "";
      position: absolute;
      top: 100%;
      height: 4px;
      width: 1px;
      background: var(--divider-color);
    }
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
    .timeline-track {
      flex: 1;
      position: relative;
      height: 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      overflow: hidden;
    }
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
      background-color: var(--green-color, #4caf50);
    }
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
      left: -3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color, #03a9f4);
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

        <div class="timeline-track">
          ${this._renderBlocks(zone.attributes.schedule || [], day)}
        </div>
      </div>
    `;
  }

  private _renderBlocks(schedule: any[], day: string): TemplateResult[] {
    // Filter for today
    const todaysBlocks = schedule.filter((block: any) =>
      block.days.includes(day),
    );

    // Sort
    todaysBlocks.sort((a, b) => a.start_time.localeCompare(b.start_time));

    return todaysBlocks.map((block, index) => {
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

      return html`
        <div
          class="schedule-block mode-${block.hvac_mode}"
          style="left: ${left}%; width: ${width}%;"
          title="${block.name}: ${block.start_time} (${block.target_temp}°C)"
        >
          ${block.target_temp}°
        </div>
      `;
    });
  }

  private _renderCurrentTimeLine(): TemplateResult {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const left = (minutes / 1440) * 100;

    // Need to offset for label width?
    // Actually strictly overlaying on the track area might be cleaner.
    // But tracks are inside individual rows.
    // We want a line across ALL rows.
    // So render it in the container, but position it absolute over rows.
    // We need to account for the padding-left (120px) of the axis if we put it in the same container context.

    return html`
      <div
        class="current-time-line"
        style="left: calc(120px + (100% - 120px) * ${left / 100})"
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
