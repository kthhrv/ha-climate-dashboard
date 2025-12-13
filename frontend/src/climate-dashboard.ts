import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./setup-view";
import "./timeline-view";
import "./zones-view";
import "./zone-editor";
import "./schedule-editor";

@customElement("climate-dashboard")
export class ClimateDashboard extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public panel!: any;

  @state() private _view:
    | "zones"
    | "timeline"
    | "setup"
    | "editor"
    | "schedule" = "zones";
  @state() private _editingZoneId: string | null = null;
  @state() private _unmanagedCount = 0;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background-color: var(--primary-background-color);
      min-height: 100vh;
      font-family: var(--paper-font-body1_-_font-family);
    }
    .header {
      background: var(--app-header-background-color, #03a9f4);
      color: var(--app-header-text-color, white);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 20px;
      font-weight: 500;
      flex: 1;
    }
    .actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .icon-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
    }
    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--error-color, #f44336);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .content {
      flex: 1;
      overflow-y: auto;
    }
  `;

  protected firstUpdated(): void {
    this._scanForBadge();
  }

  private async _scanForBadge() {
    if (!this.hass) return;
    try {
      const devices: any[] = await this.hass.callWS({
        type: "climate_dashboard/scan",
      });
      // Filter for primary devices only (Heaters/AC/Switches) for the badge count
      const candidates = devices.filter((d) =>
        ["climate", "switch"].includes(d.domain),
      );
      this._unmanagedCount = candidates.length;
    } catch (e) {
      console.error("Badge scan failed", e);
    }
  }

  private _getEditorCandidates() {
    if (!this.hass) return [];
    const domains = ["climate", "switch", "sensor", "binary_sensor"];
    return Object.values(this.hass.states)
      .filter(
        (s: any) =>
          domains.includes(s.entity_id.split(".")[0]) &&
          !s.attributes.is_climate_dashboard_zone &&
          !s.entity_id.startsWith("climate.zone_"),
      )
      .map((s: any) => ({
        entity_id: s.entity_id,
        domain: s.entity_id.split(".")[0],
        name: s.attributes.friendly_name || s.entity_id,
        device_class: s.attributes.device_class,
        // area_name missing, but acceptable for MVP
      }));
  }

  private _handleZoneClick(e: CustomEvent) {
    this._editingZoneId = e.detail.entityId;
    this._view = "editor";
  }

  protected render(): TemplateResult {
    return html`
      <div class="header">
        ${this._view !== "zones"
          ? html`
              <button
                class="icon-btn"
                @click=${() => {
                  if (this._view === "schedule") this._view = "timeline";
                  else {
                    this._view = "zones";
                    this._editingZoneId = null;
                  }
                }}
              >
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
            `
          : html`<div style="width: 40px;"></div>`}

        <div class="title">Climate</div>

        <div class="actions">
          <!-- Timeline Toggle -->
          <button
            class="icon-btn"
            @click=${() => (this._view = "timeline")}
            ?hidden=${this._view === "timeline" ||
            this._view === "editor" ||
            this._view === "schedule"}
          >
            <ha-icon icon="mdi:chart-timeline"></ha-icon>
          </button>

          <!-- Setup Toggle (Badge) -->
          <button
            class="icon-btn"
            @click=${() => (this._view = "setup")}
            ?hidden=${this._view === "editor" || this._view === "schedule"}
          >
            <ha-icon icon="mdi:cog"></ha-icon>
            ${this._unmanagedCount > 0
              ? html`<span class="badge">${this._unmanagedCount}</span>`
              : ""}
          </button>
        </div>
      </div>

      <div class="content">
        ${this._view === "zones"
          ? html`<zones-view
              .hass=${this.hass}
              @zone-selected=${this._handleZoneClick}
            ></zones-view>`
          : ""}
        ${this._view === "setup"
          ? html`<setup-view .hass=${this.hass}></setup-view>`
          : ""}
        ${this._view === "timeline"
          ? html` <timeline-view
              .hass=${this.hass}
              @schedule-selected=${(e: CustomEvent) => {
                this._editingZoneId = e.detail.entityId;
                this._view = "schedule";
              }}
            ></timeline-view>`
          : ""}
        ${this._view === "editor" && this._editingZoneId
          ? html`
              <zone-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                .allEntities=${this._getEditorCandidates()}
                @close=${() => {
                  this._view = "zones";
                  this._editingZoneId = null;
                }}
              ></zone-editor>
            `
          : ""}
        ${this._view === "schedule" && this._editingZoneId
          ? html`
              <schedule-editor
                .hass=${this.hass}
                .zoneId=${this._editingZoneId}
                @close=${() => {
                  this._view = "timeline";
                  this._editingZoneId = null;
                }}
              ></schedule-editor>
            `
          : ""}
      </div>
    `;
  }
}
