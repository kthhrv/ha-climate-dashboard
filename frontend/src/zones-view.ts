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
    const isHeating = zone.state === "heat";
    const isCooling = zone.state === "cool";

    let icon = "mdi:thermostat";
    let iconColor = "";

    if (isHeating) {
      icon = "mdi:fire";
      iconColor = "var(--state-climate-heat-color, #ff9800)";
    } else if (isCooling) {
      icon = "mdi:snowflake";
      iconColor = "var(--state-climate-cool-color, #2b9af9)";
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
        <div class="state">${zone.state}</div>
      </div>
    `;
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
