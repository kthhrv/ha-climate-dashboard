import { LitElement, html, css, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

export class AdoptDialog extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ type: Boolean, reflect: true }) public open = false;
  @property({ attribute: false }) public entities: any[] = [];
  @property({ attribute: false }) public preselected: string | null = null;

  @state() private _name = "";
  @state() private _temperatureSensor = "";
  @state() private _heaters: Set<string> = new Set();
  @state() private _coolers: Set<string> = new Set();
  @state() private _windowSensors: Set<string> = new Set();
  @state() private _roomType = "generic";

  @state() private _filterByArea = true;
  @state() private _targetAreaId: string | null = null;
  @state() private _targetAreaName: string | null = null;

  static styles = css`
    :host {
      display: none;
      position: fixed;
      z-index: 1000;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      align-items: center;
      justify-content: center;
    }
    :host([open]) {
      display: flex;
    }
    .dialog {
      background: var(--card-background-color, white);
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      color: var(--primary-text-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-height: 90vh;
      overflow-y: auto;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0;
    }
    .filter-toggle {
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-color, #03a9f4);
      font-weight: 500;
    }
    .field {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    input[type="text"],
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
    }
    .checkbox-list {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
    button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .cancel {
      background: transparent;
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }
    .save {
      background: var(--primary-color, #03a9f4);
      color: white;
    }
  `;

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("open") && this.open && this.preselected) {
      // Auto-populate based on preselected entity
      const ent = this.entities.find((e) => e.entity_id === this.preselected);
      if (ent) {
        this._name = ent.area_name || ent.name || ent.entity_id.split(".")[1];
        this._heaters.clear();
        this._coolers.clear();
        this._windowSensors.clear();

        // Area Logic
        if (ent.area_id) {
          this._targetAreaId = ent.area_id;
          this._targetAreaName = ent.area_name || "Zone Area";
          this._filterByArea = true;
        } else {
          this._targetAreaId = null;
          this._targetAreaName = null;
          this._filterByArea = false;
        }

        // Simple Heuristic for Room Type
        const lowerName = this._name.toLowerCase();
        if (lowerName.includes("bedroom") || lowerName.includes("sleeping")) {
          this._roomType = "bedroom";
        } else if (
          lowerName.includes("living") ||
          lowerName.includes("lounge")
        ) {
          this._roomType = "living_room";
        } else if (
          lowerName.includes("office") ||
          lowerName.includes("study")
        ) {
          this._roomType = "office";
        } else {
          this._roomType = "generic";
        }

        // Guess based on domain
        if (ent.domain === "climate") {
          this._heaters.add(ent.entity_id);
          this._temperatureSensor = ent.entity_id; // Default temp sensor to itself
        } else if (ent.domain === "switch") {
          this._heaters.add(ent.entity_id);
          // Need to find a temp sensor...
        }

        this.requestUpdate();
      }
    }
  }

  private _getEntityList(domains: string[]) {
    let list = this.entities.filter((e) => domains.includes(e.domain));

    if (this._filterByArea && this._targetAreaId) {
      // Filter: Keep if entity area matches target area
      // OR if entity has no area (maybe? No, request was strict).
      // Let's interpret "Only <area>" as strict area match.
      list = list.filter((e) => e.area_id === this._targetAreaId);
    }

    return list;
  }

  private _getSensors() {
    let list = this.entities.filter(
      (e) =>
        (e.domain === "sensor" && e.device_class === "temperature") ||
        e.domain === "climate",
    );
    if (this._filterByArea && this._targetAreaId) {
      list = list.filter((e) => e.area_id === this._targetAreaId);
    }
    return list;
  }

  private _toggleSet(set: Set<string>, value: string) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
    this.requestUpdate();
  }

  private _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }

    this.hass.callWS({
      type: "climate_dashboard/adopt",
      name: this._name,
      temperature_sensor: this._temperatureSensor,
      heaters: Array.from(this._heaters),
      coolers: Array.from(this._coolers),
      window_sensors: Array.from(this._windowSensors),
      room_type: this._roomType,
    });
    this.dispatchEvent(new CustomEvent("close"));
  }

  render() {
    const heaterCandidates = this._getEntityList(["climate", "switch"]);
    const coolerCandidates = this._getEntityList(["climate"]);
    const windowCandidates = this._getEntityList(["binary_sensor"]);
    const sensorCandidates = this._getSensors();

    return html`
      <div class="dialog">
        <div class="dialog-header">
          <h2>Adopt Zone</h2>
          ${this._targetAreaId
            ? html`
                <label class="filter-toggle">
                  <input
                    type="checkbox"
                    ?checked=${this._filterByArea}
                    @change=${(e: any) =>
                      (this._filterByArea = e.target.checked)}
                  />
                  Only ${this._targetAreaName}
                </label>
              `
            : ""}
        </div>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(e: any) => (this._name = e.target.value)}
          />
        </div>

        <div class="field">
          <label>Room Type (Smart Schedule)</label>
          <select
            .value=${this._roomType}
            @change=${(e: any) => (this._roomType = e.target.value)}
          >
            <option value="generic">Generic (9-5)</option>
            <option value="bedroom">Bedroom (Cool sleep)</option>
            <option value="living_room">Living Room (Comfort evenings)</option>
            <option value="office">Home Office (Comfort workdays)</option>
          </select>
        </div>

        <div class="field">
          <label>Temperature Sensor</label>
          <select
            @change=${(e: any) => (this._temperatureSensor = e.target.value)}
          >
            <option value="">Select Sensor</option>
            ${sensorCandidates.map(
              (e) => html`
                <option
                  value="${e.entity_id}"
                  ?selected=${this._temperatureSensor === e.entity_id}
                >
                  ${e.name || e.entity_id} (${e.entity_id})
                </option>
              `,
            )}
          </select>
        </div>

        <div class="field">
          <label>Heaters</label>
          <div class="checkbox-list">
            ${heaterCandidates.map(
              (e) => html`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._heaters.has(e.entity_id)}
                    @change=${() => this._toggleSet(this._heaters, e.entity_id)}
                  />
                  <span>${e.name || e.entity_id} (${e.domain})</span>
                </div>
              `,
            )}
            ${heaterCandidates.length === 0
              ? html`<div style="color:var(--secondary-text-color)">
                  No heaters found in this area
                </div>`
              : ""}
          </div>
        </div>

        <div class="field">
          <label>Coolers</label>
          <div class="checkbox-list">
            ${coolerCandidates.map(
              (e) => html`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._coolers.has(e.entity_id)}
                    @change=${() => this._toggleSet(this._coolers, e.entity_id)}
                  />
                  <span>${e.name || e.entity_id}</span>
                </div>
              `,
            )}
            ${coolerCandidates.length === 0
              ? html`<div style="color:var(--secondary-text-color)">
                  No coolers found in this area
                </div>`
              : ""}
          </div>
        </div>

        <div class="field">
          <label>Window Sensors</label>
          <div class="checkbox-list">
            ${windowCandidates.map(
              (e) => html`
                <div class="checkbox-item">
                  <input
                    type="checkbox"
                    ?checked=${this._windowSensors.has(e.entity_id)}
                    @change=${() =>
                      this._toggleSet(this._windowSensors, e.entity_id)}
                  />
                  <span>${e.name || e.entity_id}</span>
                </div>
              `,
            )}
            ${windowCandidates.length === 0
              ? html`<div style="color:var(--secondary-text-color)">
                  No window sensors found in this area
                </div>`
              : ""}
          </div>
        </div>

        <div class="actions">
          <button
            class="cancel"
            @click=${() => this.dispatchEvent(new CustomEvent("close"))}
          >
            Cancel
          </button>
          <button class="save" @click=${this._save}>Create Zone</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("adopt-dialog")) {
  customElements.define("adopt-dialog", AdoptDialog);
}
