import { LitElement, html, css, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import "./setup-view";
import "./timeline-view";
import "./zones-view";
import "./zone-editor";
import "./schedule-editor";

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
  @state() private _isAwayMode = false;

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
      margin-left: 16px;
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
    .icon-btn.active {
      color: var(--primary-text-color, white);
      background: rgba(255, 255, 255, 0.2);
    }
    .center-toggle {
      display: flex;
      background: var(--card-background-color, white);
      border-radius: 24px;
      padding: 4px;
      gap: 4px;
      margin: 16px auto 0 auto;
      width: fit-content;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .toggle-option {
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--secondary-text-color, #757575);
      transition: all 0.2s;
      border: none;
      background: none;
      line-height: normal;
    }
    .toggle-option.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    /* Specific Colors for Active States - actually, let's just use primary color for active bg */
    .toggle-option.home.active {
      background: var(--primary-color, #03a9f4);
    }
    .toggle-option.away.active {
      background: var(--warning-color, #ff9800);
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

  // ... (omitted) ...

  public connectedCallback() {
    super.connectedCallback();
    document.addEventListener("visibilitychange", this._handleVisibilityChange);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    if (this._unsubSettings) {
      this._unsubSettings();
      this._unsubSettings = undefined;
    }

    // NOTE: We intentionally DO NOT remove the visibility listener here.
    // If the component is disconnected while the tab is hidden, we need this listener
    // to fire when the tab becomes visible again to detect the "zombie" state
    // and force a reload.
  }

  private _handleVisibilityChange = () => {
    // Only proceed if the tab is visible
    if (document.visibilityState === "visible") {
      const isDashboardActive =
        window.location.pathname.includes("climate-dashboard");

      if (!this.isConnected && isDashboardActive) {
        console.warn(
          "[ClimateDashboard] Zombie state detected (Tab visible but component detached). Forcing reload.",
        );
        window.location.reload();
        return;
      }

      // Normal recovery: If connected, force a re-render
      if (this.isConnected) {
        this.requestUpdate();

        // Force update of the child view
        const activeView = this.shadowRoot?.querySelector(
          this._view === "zones"
            ? "zones-view"
            : this._view === "timeline"
              ? "timeline-view"
              : this._view === "setup"
                ? "setup-view"
                : this._view === "editor"
                  ? "zone-editor"
                  : this._view === "schedule"
                    ? "schedule-editor"
                    : "unknown",
        ) as LitElement;
        if (activeView) {
          activeView.requestUpdate();
        }
      }
    }
  };

  private _unsubSettings: any;

  protected updated(
    changedProps: Map<string | number | symbol, unknown>,
  ): void {
    super.updated(changedProps);
    if (changedProps.has("hass") && this.hass && !this._unsubSettings) {
      this._subscribeSettings();
    }
  }

  private async _subscribeSettings() {
    if (!this.hass) return;
    try {
      this._unsubSettings = await this.hass.connection.subscribeEvents(
        (event: any) => {
          if (event.data.is_away_mode_on !== undefined) {
            this._isAwayMode = event.data.is_away_mode_on;
          }
        },
        "climate_dashboard_settings_updated",
      );
    } catch (e) {
      console.error("Failed to subscribe to settings updates", e);
    }
  }

  protected firstUpdated(): void {
    this._scanForBadge();
    this._fetchGlobalSettings();
  }

  private async _fetchGlobalSettings() {
    if (!this.hass) return;
    try {
      const settings = await this.hass.callWS({
        type: "climate_dashboard/settings/get",
      });
      this._isAwayMode = settings.is_away_mode_on;
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
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
        area_id:
          this.hass.entities?.[s.entity_id]?.area_id ||
          this.hass.devices?.[this.hass.entities?.[s.entity_id]?.device_id]
            ?.area_id,
      }));
  }

  protected render(): TemplateResult {
    try {
      if (!this.hass) {
        return html`<div class="loading">Loading Home Assistant...</div>`;
      }

      return html`
        <div class="header">
          ${this._view !== "zones"
            ? html`
                <button
                  class="icon-btn"
                  @click=${() => {
                    if (this._view === "schedule") {
                      this._view = "timeline";
                      this._editingZoneId = null;
                    } else {
                      this._view = "zones";
                      this._editingZoneId = null;
                    }
                  }}
                >
                  <ha-icon icon="mdi:arrow-left"></ha-icon>
                </button>
              `
            : html`
                <ha-menu-button
                  .hass=${this.hass}
                  .narrow=${this.narrow}
                ></ha-menu-button>
              `}

          <div class="title">Climate</div>

          <div class="actions">
            <!-- Timeline Toggle -->
            <button
              class="icon-btn ${this._view === "timeline" ? "active" : ""}"
              @click=${() => (this._view = "timeline")}
            >
              <ha-icon icon="mdi:chart-timeline"></ha-icon>
            </button>

            <!-- Setup Toggle (Badge) -->
            <button
              class="icon-btn ${this._view === "setup" ? "active" : ""}"
              @click=${() => (this._view = "setup")}
            >
              <ha-icon icon="mdi:cog"></ha-icon>
              ${this._unmanagedCount > 0
                ? html`<span class="badge">${this._unmanagedCount}</span>`
                : ""}
            </button>
          </div>
        </div>

        <div class="content">
          <!-- Global Mode Toggles (Only show in main views) -->
          ${this._view === "zones" || this._view === "timeline"
            ? html`
                <div class="center-toggle">
                  <button
                    class="toggle-option home ${!this._isAwayMode
                      ? "active"
                      : ""}"
                    @click=${() => this._setAwayMode(false)}
                  >
                    <ha-icon icon="mdi:home"></ha-icon>
                    <span>Home</span>
                  </button>
                  <button
                    class="toggle-option away ${this._isAwayMode
                      ? "active"
                      : ""}"
                    @click=${() => this._setAwayMode(true)}
                  >
                    <ha-icon icon="mdi:walk"></ha-icon>
                    <span>Away</span>
                  </button>
                </div>
              `
            : ""}
          ${this._view === "zones"
            ? html`<zones-view
                .hass=${this.hass}
                .isAwayMode=${this._isAwayMode}
                @zone-settings=${(e: CustomEvent) => {
                  this._editingZoneId = e.detail.entityId;
                  this._view = "editor";
                }}
                @zone-details=${(e: CustomEvent) => {
                  // TODO: Pass focusZoneId to timeline
                  this._editingZoneId = e.detail.entityId;
                  this._view = "timeline";
                }}
              ></zones-view>`
            : ""}
          ${this._view === "setup"
            ? html`<setup-view .hass=${this.hass}></setup-view>`
            : ""}
          ${this._view === "timeline"
            ? html` <timeline-view
                .hass=${this.hass}
                .focusZoneId=${this._editingZoneId}
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
    } catch (e) {
      console.error("Critical Error rendering Climate Dashboard:", e);
      return html`
        <div
          style="padding: 24px; text-align: center; color: var(--error-color);"
        >
          <h2>Dashboard Error</h2>
          <p>Something went wrong rendering the dashboard.</p>
          <pre style="text-align: left; background: #eee; padding: 16px;">
${e instanceof Error ? e.message : String(e)}</pre
          >
          <button
            @click=${() => window.location.reload()}
            style="margin-top: 16px; padding: 8px 16px;"
          >
            Reload Page
          </button>
        </div>
      `;
    }
  }

  private async _setAwayMode(enabled: boolean) {
    if (this._isAwayMode === enabled) return;

    // Optimistic update
    const previous = this._isAwayMode;
    this._isAwayMode = enabled;

    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        is_away_mode_on: enabled,
      });
    } catch (e) {
      // Revert
      this._isAwayMode = previous;
      console.error("Failed to set Away Mode", e);
    }
  }
}

if (!customElements.get("climate-dashboard")) {
  customElements.define("climate-dashboard", ClimateDashboard);
}
