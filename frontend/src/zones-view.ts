import { LitElement, html, css, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { DataEngine } from "./data-engine";

interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

export class ZonesView extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean }) public isAwayMode = false;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
      cursor: pointer;
      transition: transform 0.1s;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }
    .card:active {
      transform: scale(0.98);
    }
    .icon {
      font-size: 24px;
      margin-bottom: 8px;
      color: var(--primary-text-color);
    }
    .icon.active {
      color: var(--state-climate-heat-color, #ff9800);
    }
    .name {
      font-weight: 500;
      margin-bottom: 4px;
      font-size: 1rem;
    }
    .temp {
      font-size: 1.5rem;
      font-weight: 300;
    }
    .state {
      font-size: 0.8rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
      text-transform: capitalize;
    }
    .empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 32px;
      color: var(--secondary-text-color);
    }
    .actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }
    .mode-btn {
      background: transparent;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 0.8rem;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s;
    }
    .mode-btn:hover {
      background: var(--secondary-background-color);
    }
    .mode-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .settings-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      color: var(--secondary-text-color);
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
    }
    .settings-btn:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    .floor-header {
      grid-column: 1 / -1;
      margin-top: 24px;
      margin-bottom: 8px;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .floor-header ha-icon {
      color: var(--secondary-text-color);
    }
    .floor-header:first-child {
      margin-top: 0;
    }
    .status-msg {
      font-size: 0.75rem;
      color: var(--secondary-text-color);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
    }
    .status-msg ha-icon {
      --mdc-icon-size: 14px;
    }
  `;

  protected render(): TemplateResult {
    try {
      const groupedZones = DataEngine.getGroupedZones(this.hass);

      if (groupedZones.length === 0) {
        return html`
          <div class="empty">
            <p>No zones configured yet.</p>
            <p>Use the Setup button above to adopt devices.</p>
          </div>
        `;
      }

      return html`
        <div class="grid">
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
                : html`<div class="floor-header">
                    <ha-icon icon="mdi:devices"></ha-icon>Other Devices
                  </div>`}
              ${group.zones.map((zone) => this._renderZoneCard(zone))}
            `;
          })}
        </div>
      `;
    } catch (e) {
      console.error("Error rendering ZonesView:", e);
      return html`<div class="error">Error loading zones</div>`;
    }
  }

  private _renderZoneCard(zone: HassEntity): TemplateResult {
    const hvacAction = zone.attributes.hvac_action;
    const currentTemp = zone.attributes.current_temperature;

    // Status Logic via DataEngine
    const status = DataEngine.getZoneStatus(zone, this.isAwayMode);

    // Icon logic
    // We prefer the Status Icon if it's high priority (Safety, Window, Away)
    // Otherwise we use the state icon
    let mainIcon = status.icon;
    let mainIconColor = status.color;

    // Override icon for normal operation to show action
    if (
      status.text === "Following Schedule" ||
      status.text === "Unknown State"
    ) {
      if (hvacAction === "heating") {
        mainIcon = "mdi:fire";
        mainIconColor = "var(--deep-orange-color, #ff5722)";
      } else if (hvacAction === "cooling") {
        mainIcon = "mdi:snowflake";
        mainIconColor = "var(--blue-color, #2196f3)";
      } else if (zone.state === "heat") {
        mainIcon = "mdi:fire";
        mainIconColor = "var(--primary-text-color)"; // Idle
      } else if (zone.state === "cool") {
        mainIcon = "mdi:snowflake";
        mainIconColor = "var(--primary-text-color)";
      } else if (zone.state === "off") {
        mainIcon = "mdi:power-off";
        mainIconColor = "var(--disabled-text-color)";
      }
    }

    return html`
      <div class="card" @click=${() => this._openDetails(zone.entity_id)}>
        <button
          class="settings-btn"
          @click=${(e: Event) => this._openSettings(e, zone.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

        <div class="icon" style="color: ${mainIconColor || "inherit"}">
          <ha-icon icon="${mainIcon}"></ha-icon>
        </div>
        <div class="name">
          ${zone.attributes.friendly_name || zone.entity_id}
        </div>
        <div class="temp">
          ${currentTemp != null ? `${currentTemp}°` : "--"}
        </div>

        <!-- Status Message -->
        <div class="status-msg" style="color: ${status.color}">
          ${status.text}
        </div>
        ${status.subtext
          ? html`<div
              class="status-msg"
              style="font-size: 0.7em; opacity: 0.8; color: ${status.color}"
            >
              ${status.subtext}
            </div>`
          : ""}

        <div class="actions">
          <button
            class="mode-btn ${zone.state === "off" ? "active" : ""}"
            @click=${(e: Event) => this._setMode(e, zone.entity_id, "off")}
          >
            Off
          </button>

          <button
            class="mode-btn ${zone.state === "auto" ? "active" : ""}"
            @click=${(e: Event) => this._setMode(e, zone.entity_id, "auto")}
          >
            Auto
          </button>
        </div>
      </div>
    `;
  }

  private async _setMode(e: Event, entityId: string, mode: string) {
    e.stopPropagation();
    await this.hass.callService("climate", "set_hvac_mode", {
      entity_id: entityId,
      hvac_mode: mode,
    });
  }

  private _openDetails(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("zone-details", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _openSettings(e: Event, entityId: string) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("zone-settings", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (!customElements.get("zones-view")) {
  customElements.define("zones-view", ZonesView);
}
