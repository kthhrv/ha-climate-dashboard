import { LitElement, html, css, TemplateResult } from "lit";
import { property } from "lit/decorators.js";

interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
}

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
  `;

  protected render(): TemplateResult {
    const groupedZones = this._getGroupedZones();

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
  }

  private _getGroupedZones(): {
    floorName: string | null;
    floorIcon: string | null;
    zones: HassEntity[];
  }[] {
    if (!this.hass) return [];

    const zones = Object.values(this.hass.states).filter((e: any) =>
      e.entity_id.startsWith("climate.zone_"),
    ) as HassEntity[];

    // If no floors defined, return flat list as "Other"
    // Note: hass.floors is a dictionary { floor_id: FloorObject }
    if (!this.hass.floors || Object.keys(this.hass.floors).length === 0) {
      if (zones.length === 0) return [];
      return [{ floorName: null, floorIcon: null, zones }];
    }

    // Map: Floor ID -> Zones
    const floorMap: Record<
      string,
      {
        floorName: string;
        floorIcon: string | null;
        level: number | null;
        zones: HassEntity[];
      }
    > = {};

    const unassignedZones: HassEntity[] = [];

    zones.forEach((zone) => {
      // Find area of this zone entity
      // Registry lookups are typically separate, but we can try to find the area via entity registry
      // or assume we have hass.entities.
      // Since 'hass' is the huge main object, it usually has .entities, .areas, .floors if user is admin.
      // But standard 'hass' object in standard cards might not expose full registry.
      // We rely on what is passed. LitElement property `hass` usually has everything.

      // We need to find the entity registry entry for this zone
      const entityReg = this.hass.entities?.[zone.entity_id];
      const areaId = entityReg?.area_id;
      const area = areaId ? this.hass.areas?.[areaId] : null;
      const floorId = area?.floor_id;

      if (floorId && this.hass.floors?.[floorId]) {
        const floor = this.hass.floors[floorId];
        if (!floorMap[floorId]) {
          floorMap[floorId] = {
            floorName: floor.name,
            floorIcon: floor.icon,
            level: floor.level,
            zones: [],
          };
        }
        floorMap[floorId].zones.push(zone);
      } else {
        unassignedZones.push(zone);
      }
    });

    // Sort floors by level (if available) or name
    const sortedFloors = Object.values(floorMap).sort((a, b) => {
      if (a.level !== null && b.level !== null) return b.level - a.level;
      return a.floorName.localeCompare(b.floorName);
    });

    // Build final result
    const result: {
      floorName: string | null;
      floorIcon: string | null;
      zones: HassEntity[];
    }[] = sortedFloors.map((f) => ({
      floorName: f.floorName,
      floorIcon: f.floorIcon,
      zones: f.zones,
    }));

    if (unassignedZones.length > 0) {
      result.push({
        floorName: null,
        floorIcon: null,
        zones: unassignedZones,
      });
    }

    return result;
  }

  private _renderZoneCard(zone: HassEntity): TemplateResult {
    // We check hvac_action if available for the icon color logic,
    // but the buttons control hvac_mode.
    const hvacAction = zone.attributes.hvac_action;

    let icon = "mdi:thermostat";
    let iconColor = "";

    // Status coloring based on Action (what it's doing) or State (what it's set to)
    if (zone.attributes.safety_mode) {
      icon = "mdi:alert-circle";
      iconColor = "var(--error-color, #db4437)";
    } else if (zone.attributes.using_fallback_sensor) {
      icon = "mdi:thermometer-alert";
      iconColor = "var(--warning-color, #ffa726)";
    } else if (hvacAction === "heating") {
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
      <div class="card" @click=${() => this._openDetails(zone.entity_id)}>
        <button
          class="settings-btn"
          @click=${(e: Event) => this._openSettings(e, zone.entity_id)}
        >
          <ha-icon icon="mdi:cog"></ha-icon>
        </button>

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

    if (zone.attributes.safety_mode) {
      message = "Sensor Unavailable: Safety Mode active";
    } else if (zone.attributes.using_fallback_sensor) {
      message = "Warning: Using Area Fallback Sensor";
    } else if (overrideEnd) {
      const time = new Date(overrideEnd).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      message = `Overridden until ${time}`;
    } else if (zone.attributes.open_window_sensor) {
      message = `${zone.attributes.open_window_sensor} open`;
    } else if (mode === "auto" && nextChange) {
      const time = new Date(nextChange).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const nextTemp = zone.attributes.next_scheduled_temp;
      if (nextTemp != null) {
        message = `${time} -> ${nextTemp}°`;
      } else {
        message = `${time}`;
      }
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
