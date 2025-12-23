import { LitElement, html, css, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { DataEngine } from "./data-engine";

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
      z-index: 1; /* Create stacking context for ::before */
    }
    .schedule-block:hover {
      opacity: 0.9;
      z-index: 2;
    }
    /* Colors - Applied to ::before to allow independent opacity */
    .schedule-block::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 4px;
      z-index: -1;
      opacity: var(--block-opacity, 1);
      transition: opacity 0.2s;
    }

    .mode-heat::before {
      background-color: var(--deep-orange-color, #ff5722);
    }
    .mode-cool::before {
      background-color: var(--blue-color, #2196f3);
    }
    .mode-off::before {
      background-color: var(--grey-color, #9e9e9e);
    }
    .mode-auto::before {
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
    .floor-header {
      margin-top: 24px;
      margin-bottom: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .floor-header:first-of-type {
      margin-top: 0;
    }
  `;

  protected render(): TemplateResult {
    try {
      if (!this.hass) return html``;

      // Use DataEngine for grouping logic
      const groupedZones = DataEngine.getGroupedZones(
        this.hass,
        this.focusZoneId,
      );

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

          ${groupedZones.length === 0
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
                  ${groupedZones.map((group) => {
                    return html`
                      ${group.floorName
                        ? html`
                            <div class="floor-header">
                              <ha-icon
                                icon="${group.floorIcon || "mdi:home-floor-1"}"
                              ></ha-icon>
                              ${group.floorName}
                            </div>
                          `
                        : html``}
                      ${group.zones.map((zone: any) =>
                        this._renderZoneRow(zone, this._selectedDay),
                      )}
                    `;
                  })}

                  <!-- Current Time Indicator (Only show if viewing today) -->
                  ${this._selectedDay === todayStr
                    ? this._renderCurrentTimeLine()
                    : ""}
                </div>
              `}
        </div>
      `;
    } catch (e) {
      console.error("Error rendering TimelineView:", e);
      return html`<div class="error">Error loading timeline</div>`;
    }
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
    // Use DataEngine for calculation logic
    const blocks = DataEngine.getTimelineBlocks(zone, day);

    return blocks.map((block) => {
      return html`
        <div
          class="schedule-block ${block.colorClass}"
          style="left: ${block.left}%; width: ${block.width}%; --block-opacity: ${block.opacity.toFixed(
            2,
          )};"
          title="${block.tooltip}"
        >
          ${block.label}
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

if (!customElements.get("timeline-view")) {
  customElements.define("timeline-view", TimelineView);
}
