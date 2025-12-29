import { LitElement, html, css, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

interface HistorySegment {
  state: string;
  tooltip: string;
  start: number; // timestamp ms
  end: number; // timestamp ms
  width: number; // percentage
  color: string;
}

interface TempPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100 (inverted for SVG)
  val: number; // raw value
}

interface ZoneHistory {
  name: string;
  segments: HistorySegment[];
  tempPoints: TempPoint[];
  minTemp: number;
  maxTemp: number;
}

export class HistoryView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  @state() private _zonesHistory: ZoneHistory[] = [];
  @state() private _isLoading = false;
  @state() private _error: string | null = null;
  @state() private _duration = 3; // hours (default 3 hours)

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      height: 100%;
      box-sizing: border-box;
    }
    .card {
      background: var(--card-background-color, white);
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-shrink: 0;
      gap: 16px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .header {
      font-size: 20px;
      font-weight: 500;
      flex: 1;
    }
    .refresh-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
    }
    .refresh-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .duration-selector {
      display: flex;
      background: #f5f5f5;
      border-radius: 18px;
      padding: 4px;
      gap: 4px;
    }
    .duration-btn {
      border: none;
      background: none;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 0.85rem;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s;
      font-weight: 500;
    }
    .duration-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .duration-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    .content {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px;
    }
    .zone-row {
      margin-bottom: 32px;
    }
    .zone-name {
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
    }
    .timeline-track {
      height: 40px;
      background: #f5f5f5;
      border-radius: 6px;
      position: relative;
      display: flex;
      width: 100%;
    }
    .segment {
      height: 100%;
      transition: opacity 0.2s;
    }
    .segment:hover {
      opacity: 0.8;
    }
    .temp-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
    }
    .temp-overlay path {
      stroke: #000;
      stroke-width: 2px;
      fill: none;
      stroke-opacity: 1;
      vector-effect: non-scaling-stroke;
    }
    .temp-labels {
      position: absolute;
      right: -30px;
      top: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 0.7rem;
      color: var(--secondary-text-color);
      pointer-events: none;
    }
    .legend {
      display: flex;
      gap: 16px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color, #eee);
      justify-content: center;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--secondary-text-color);
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .loading,
    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color, red);
    }
    /* State Colors */
    .color-heat {
      background-color: rgba(255, 87, 34, 0.6);
    }
    .color-cool {
      background-color: rgba(33, 150, 243, 0.6);
    }
    .color-off {
      background-color: rgba(158, 158, 158, 0.6);
    }
    .color-auto {
      background-color: rgba(76, 175, 80, 0.6);
    }
    .color-idle {
      background-color: rgba(224, 224, 224, 0.6);
    }
    .color-unknown {
      background-color: rgba(189, 189, 189, 0.6);
    }
    /* Override Colors */
    .color-safety {
      background-color: rgba(244, 67, 54, 0.8);
    } /* Red */
    .color-window {
      background-color: rgba(255, 152, 0, 0.8);
    } /* Orange */
    .color-occupancy {
      background-color: rgba(139, 195, 74, 0.6);
    } /* Light Green */
    .color-away {
      background-color: rgba(156, 39, 176, 0.6);
    } /* Purple */
  `;

  protected firstUpdated() {
    this._fetchHistory();
  }

  private _setDuration(hours: number) {
    if (this._duration !== hours) {
      this._duration = hours;
      this._fetchHistory();
    }
  }

  private async _fetchHistory() {
    this._isLoading = true;
    this._error = null;
    try {
      const zones = Object.values(this.hass.states).filter(
        (s: any) => s.attributes.is_climate_dashboard_zone,
      );

      if (zones.length === 0) {
        this._isLoading = false;
        return;
      }

      const entityIds = zones.map((z: any) => z.entity_id);
      const end = new Date();
      const endTime = end.getTime();
      const start = new Date(endTime - this._duration * 60 * 60 * 1000);
      const startTime = start.getTime();
      const totalDuration = endTime - startTime;

      const data = await this.hass.callApi(
        "GET",
        `history/period/${start.toISOString()}?filter_entity_id=${entityIds.join(",")}&end_time=${end.toISOString()}`,
      );

      // Transform data manually
      this._zonesHistory = data
        .map((states: any[]) => {
          if (!states || states.length === 0) return null;

          const entityId = states[0].entity_id;
          const name =
            this.hass.states[entityId]?.attributes?.friendly_name || entityId;

          const segments: HistorySegment[] = [];
          const tempPoints: TempPoint[] = [];

          // Temperature Bounds
          let minTemp = 100;
          let maxTemp = -100;
          const rawPoints: { t: number; v: number }[] = [];

          // Iterate states to build segments and collect temps
          for (let i = 0; i < states.length; i++) {
            const s = states[i];
            const nextS = states[i + 1];
            const sTime = new Date(s.last_changed).getTime();

            // --- Segment Logic ---
            const segmentStart = Math.max(sTime, startTime);
            let segmentEnd = nextS
              ? new Date(nextS.last_changed).getTime()
              : endTime;
            segmentEnd = Math.min(segmentEnd, endTime);

            if (segmentEnd > segmentStart) {
              // Determine Properties
              let colorClass = "color-unknown";
              let tooltipState = String(s.state);
              const attrs = s.attributes || {};
              const action = attrs.hvac_action;

              if (attrs.safety_mode) {
                colorClass = "color-safety";
                tooltipState = "Safety Mode";
              } else if (attrs.active_intent_source === "away_mode") {
                colorClass = "color-away";
                tooltipState = "Global Away Mode";
              } else if (attrs.open_window_sensor) {
                colorClass = "color-window";
                tooltipState = `Window Open (${attrs.open_window_sensor})`;
              } else if (attrs.active_intent_source === "occupancy_setback") {
                colorClass = "color-occupancy";
                tooltipState = "Occupancy Setback";
              } else if (action === "heating") {
                colorClass = "color-heat";
                tooltipState = `Heating (${s.state})`;
              } else if (action === "cooling") {
                colorClass = "color-cool";
                tooltipState = `Cooling (${s.state})`;
              } else {
                const stateLower = String(s.state).toLowerCase();
                if (stateLower === "heat") colorClass = "color-heat";
                else if (stateLower === "cool") colorClass = "color-cool";
                else if (stateLower === "off") colorClass = "color-off";
                else if (stateLower === "auto") colorClass = "color-auto";
                else if (stateLower === "idle") colorClass = "color-idle";
                else if (stateLower === "unavailable")
                  colorClass = "color-unknown";
              }

              // Merge or Push
              const lastSeg = segments[segments.length - 1];
              if (
                lastSeg &&
                lastSeg.color === colorClass &&
                lastSeg.tooltip === tooltipState
              ) {
                lastSeg.end = segmentEnd;
                lastSeg.width =
                  ((lastSeg.end - lastSeg.start) / totalDuration) * 100;
              } else {
                const duration = segmentEnd - segmentStart;
                const width = (duration / totalDuration) * 100;
                segments.push({
                  state: s.state,
                  tooltip: tooltipState,
                  start: segmentStart,
                  end: segmentEnd,
                  width,
                  color: colorClass,
                });
              }
            }

            // --- Temperature Logic ---
            const val = parseFloat(s.attributes?.current_temperature);
            if (!isNaN(val)) {
              rawPoints.push({ t: sTime, v: val });
              if (val < minTemp) minTemp = val;
              if (val > maxTemp) maxTemp = val;
            }
          }

          // Normalize Temp Range
          if (minTemp > maxTemp) {
            minTemp = 18;
            maxTemp = 24;
          } else {
            minTemp = Math.floor(minTemp - 1);
            maxTemp = Math.ceil(maxTemp + 1);
          }
          const yRange = maxTemp - minTemp || 1;

          // Process Temp Points for SVG
          rawPoints.sort((a, b) => a.t - b.t);

          for (const p of rawPoints) {
            const t = Math.max(p.t, startTime);
            if (t > endTime) break;

            const x = ((t - startTime) / totalDuration) * 100;
            // Invert Y because SVG 0 is top
            const y = 100 - ((p.v - minTemp) / yRange) * 100;

            tempPoints.push({ x, y, val: p.v });
          }

          return { name, segments, tempPoints, minTemp, maxTemp };
        })
        .filter(Boolean);
    } catch (e: any) {
      console.error("History fetch error:", e);
      this._error = "Failed to load history data.";
    } finally {
      this._isLoading = false;
    }
  }

  private _formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  private _renderTemperatureOverlay(zone: ZoneHistory) {
    if (zone.tempPoints.length < 2) return "";

    const d = zone.tempPoints
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
      )
      .join(" ");

    return html`
      <svg
        class="temp-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="${d}" />
      </svg>
      <div class="temp-labels">
        <span style="line-height: 1">${zone.maxTemp}°</span>
        <span style="line-height: 1">${zone.minTemp}°</span>
      </div>
    `;
  }

  protected render(): TemplateResult {
    return html`
      <div class="card">
        <div class="header-row">
          <div class="header">Zone History</div>
          <div class="header-actions">
            <div class="duration-selector">
              <button
                class="duration-btn ${this._duration === 3 ? "active" : ""}"
                @click=${() => this._setDuration(3)}
              >
                3h
              </button>
              <button
                class="duration-btn ${this._duration === 24 ? "active" : ""}"
                @click=${() => this._setDuration(24)}
              >
                24h
              </button>
              <button
                class="duration-btn ${this._duration === 72 ? "active" : ""}"
                @click=${() => this._setDuration(72)}
              >
                3d
              </button>
              <button
                class="duration-btn ${this._duration === 168 ? "active" : ""}"
                @click=${() => this._setDuration(168)}
              >
                7d
              </button>
            </div>
            <button
              class="refresh-btn"
              @click=${() => this._fetchHistory()}
              title="Refresh"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <div class="content">
          ${this._isLoading
            ? html`<div class="loading">Loading history...</div>`
            : ""}
          ${this._error ? html`<div class="error">${this._error}</div>` : ""}
          ${!this._isLoading && !this._error
            ? this._zonesHistory.map(
                (zone) => html`
                  <div class="zone-row">
                    <div class="zone-name">
                      <span>${zone.name}</span>
                    </div>
                    <div style="position: relative; margin-right: 30px;">
                      <!-- wrapper for labels -->
                      <div class="timeline-track">
                        ${zone.segments.map(
                          (seg) => html`
                            <div
                              class="segment ${seg.color}"
                              style="width: ${seg.width}%"
                              title="${seg.tooltip} (${this._formatDuration(
                                seg.end - seg.start,
                              )})
${new Date(seg.start).toLocaleTimeString()} - ${new Date(
                                seg.end,
                              ).toLocaleTimeString()}"
                            ></div>
                          `,
                        )}
                        ${this._renderTemperatureOverlay(zone)}
                      </div>
                    </div>
                  </div>
                `,
              )
            : ""}
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="dot color-heat"></div>
            Heat
          </div>
          <div class="legend-item">
            <div class="dot color-cool"></div>
            Cool
          </div>
          <div class="legend-item">
            <div class="dot color-auto"></div>
            Auto
          </div>
          <div class="legend-item">
            <div class="dot color-off"></div>
            Off
          </div>
          <div class="legend-item">
            <div class="dot color-safety"></div>
            Safety
          </div>
          <div class="legend-item">
            <div class="dot color-away"></div>
            Away
          </div>
          <div class="legend-item">
            <div class="dot color-window"></div>
            Window
          </div>
          <div class="legend-item">
            <div class="dot color-occupancy"></div>
            Setback
          </div>
          <div class="legend-item">
            <div
              style="width: 20px; height: 2px; background: var(--primary-text-color); opacity: 0.7;"
            ></div>
            Temp
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("history-view")) {
  customElements.define("history-view", HistoryView);
}
