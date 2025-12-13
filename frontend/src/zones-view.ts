import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

@customElement("zones-view")
export class ZonesView extends LitElement {
  @property({ attribute: false }) public hass!: any;

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
  `;

  protected render(): TemplateResult {
    const zones = this._getZones();

    if (zones.length === 0) {
      return html`
        <div class="empty">
          <p>No zones configured yet.</p>
          <p>Use the Setup button above to adopt devices.</p>
        </div>
      `;
    }

    return html`
      <div class="grid">${zones.map((zone) => this._renderZoneCard(zone))}</div>
    `;
  }

  private _getZones(): HassEntity[] {
    if (!this.hass) return [];
    return Object.values(this.hass.states).filter((e: any) =>
      e.entity_id.startsWith("climate.zone_"),
    ) as HassEntity[];
  }

  private _renderZoneCard(zone: HassEntity): TemplateResult {
    // We check hvac_action if available for the icon color logic,
    // but the buttons control hvac_mode.
    const hvacAction = zone.attributes.hvac_action;

    let icon = "mdi:thermostat";
    let iconColor = "";

    // Status coloring based on Action (what it's doing) or State (what it's set to)
    if (hvacAction === "heating") {
      icon = "mdi:fire";
      iconColor = "var(--deep-orange-color, #ff5722)";
    } else if (hvacAction === "cooling") {
      icon = "mdi:snowflake";
      iconColor = "var(--blue-color, #2196f3)";
    } else if (zone.state === "heat") {
      icon = "mdi:fire";
      // Idle heat
      iconColor = "var(--primary-text-color)";
    } else if (zone.state === "auto") {
      icon = "mdi:calendar-clock";
    }

    const currentTemp = zone.attributes.current_temperature;

    return html`
      <div class="card" @click=${() => this._openZone(zone.entity_id)}>
        <div class="icon" style="color: ${iconColor || "inherit"}">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="name">
          ${zone.attributes.friendly_name || zone.entity_id}
        </div>
        <div class="temp">
          ${currentTemp != null ? `${currentTemp}°` : "--"}
        </div>
        <div class="state">
          ${hvacAction ? html`${hvacAction}` : html`${zone.state}`}
        </div>

        ${this._renderStatus(zone)}

        <div class="actions">
          <button
            class="mode-btn ${zone.state === "off" ? "active" : ""}"
            @click=${(e: Event) => this._setMode(e, zone.entity_id, "off")}
          >
            Off
          </button>
          <button
            class="mode-btn ${zone.state === "heat" ? "active" : ""}"
            @click=${(e: Event) => this._setMode(e, zone.entity_id, "heat")}
          >
            Heat
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

  private _renderStatus(zone: HassEntity): TemplateResult {
    const nextChange = zone.attributes.next_scheduled_change;
    const overrideEnd = zone.attributes.manual_override_end;
    const mode = zone.state;

    let message = "";

    if (mode !== "auto" && overrideEnd) {
      const time = new Date(overrideEnd).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      message = `Resumes Auto at ${time}`;
    } else if (mode === "auto" && nextChange) {
      const time = new Date(nextChange).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      message = `Next change at ${time}`;
    }

    if (!message) return html``;

    return html`
      <div
        style="font-size: 0.75rem; color: var(--secondary-text-color); margin-top: 4px;"
      >
        ${message}
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

  private _openZone(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("zone-selected", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
