import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("zone-editor")
export class ZoneEditor extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public zoneId!: string;
  @property({ attribute: false }) public allEntities: any[] = [];

  // Form State
  @state() private _uniqueId = "";
  @state() private _name = "";
  @state() private _temperatureSensor = "";
  @state() private _heaters: Set<string> = new Set();
  @state() private _coolers: Set<string> = new Set();
  @state() private _windowSensors: Set<string> = new Set();

  // UI State
  @state() private _loading = false;
  @state() private _error = "";

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    h2 {
      margin-top: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      box-sizing: border-box;
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
      gap: 16px;
      margin-top: 32px;
      border-top: 1px solid var(--divider-color, #eee);
      padding-top: 16px;
    }
    button {
      padding: 10px 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.875rem;
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
    .delete {
      background: var(--error-color, #f44336);
      color: white;
      margin-right: auto;
    }
  `;

  protected async firstUpdated(): Promise<void> {
    await this._loadConfig();
  }

  private async _loadConfig() {
    if (!this.hass || !this.zoneId) return;
    this._loading = true;

    // Find existing zone entity
    // The zoneId passed here is likely "climate.zone_xxx" entity_id
    // But the update API needs unique_id.
    // We can get attributes from the state.
    const state = this.hass.states[this.zoneId];
    if (!state) {
      this._error = "Zone not found";
      this._loading = false;
      return;
    }

    // We assume attributes contain keys we need?
    // Actually, the attributes of climate entity don't expose heaters/coolers list strictly
    // unless we added them to attributes.
    // Wait, ClimateZone exposes them as extra_state_attributes?
    // Let's check ClimateZone code.
    // It exposes heaters, coolers, window_sensors in extra_state_attributes.
    // unique_id is NOT in state attributes usually.
    // We might need to fetch internal config via websocket for "get_zone"?

    // MVP Shortcut: We can infer most things, but unique_id is crucial for update.
    // Can we get unique_id from entity_registry?
    // Or we should assume the passed ID is the entity_id, and we can't update without unique_id.

    // PLAN B: Add a 'climate_dashboard/get_zone' or use existing data?
    // Actually, if we look at `zones()` in `storage.py`, it returns full config.
    // Maybe we just add `climate_dashboard/get_zones` in websocket?
    // Or we rely on state attributes if we put unique_id there?
    // Putting unique_id in attributes is easy useful debug.
    // Let's Check `climate_zone.py`.

    // Assuming we have to fetch config.
    // Let's assume we can fetch all zones or single zone via WS.
    // Since we don't have that yet, I'll rely on state attributes and...
    // wait, we can't get unique_id easily from frontend without Registry or Attribute.

    // Let's assume I will add `climate_dashboard/get_zone` command?
    // OR simpler: `scan` returns everything? No, scan is for unmanaged.

    // Let's rely on stored configuration.
    // I'll assume for now I can get it.
    // For MVP, I'll check if I can get unique_id from the entity registry via hass connection?
    // hass.callWS({type: 'config/entity_registry/get', entity_id: ...})
    try {
      const reg = await this.hass.callWS({
        type: "config/entity_registry/get",
        entity_id: this.zoneId,
      });
      this._uniqueId = reg.unique_id; // "zone_xxxxxxxx"

      // Now we need the full config (heaters list etc).
      // If these are in attributes, great.
      const attrs = state.attributes;
      this._name = attrs.friendly_name || "";
      this._temperatureSensor =
        attrs.temperature_sensor || attrs.sensor_entity_id || "";
      this._heaters = new Set(
        attrs.heaters ||
          (attrs.actuator_entity_id ? [attrs.actuator_entity_id] : []),
      );
      this._coolers = new Set(attrs.coolers || []);
      this._windowSensors = new Set(attrs.window_sensors || []);
    } catch (e) {
      console.error("Error loading zone config", e);
      this._error = "Failed to load zone configuration";
    }
    this._loading = false;
  }

  private _toggleSet(set: Set<string>, value: string) {
    if (set.has(value)) set.delete(value);
    else set.add(value);
    this.requestUpdate();
  }

  private _getEntityList(domains: string[]) {
    // Filter options from all available entities
    return this.allEntities.filter((e) => domains.includes(e.domain));
  }

  private async _save() {
    if (!this._name || !this._temperatureSensor) {
      alert("Name and Temperature Sensor are required.");
      return;
    }

    try {
      await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._name,
        temperature_sensor: this._temperatureSensor,
        heaters: Array.from(this._heaters),
        coolers: Array.from(this._coolers),
        window_sensors: Array.from(this._windowSensors),
      });
      this._goBack();
    } catch (e: any) {
      alert("Update failed: " + e.message);
    }
  }

  private _goBack() {
    this.dispatchEvent(new CustomEvent("close"));
  }

  render() {
    if (this._loading) return html`<div class="card">Loading...</div>`;
    if (this._error) return html`<div class="card">Error: ${this._error}</div>`;

    const heaterCandidates = this._getEntityList(["climate", "switch"]);
    const coolerCandidates = this._getEntityList(["climate"]);
    const windowCandidates = this._getEntityList(["binary_sensor"]);
    const sensorCandidates = this.allEntities.filter(
      (e) =>
        (e.domain === "sensor" && e.device_class === "temperature") ||
        e.domain === "climate",
    );

    return html`
      <div class="card">
        <h2>Edit Zone: ${this._name}</h2>

        <div class="field">
          <label>Zone Name</label>
          <input
            type="text"
            .value=${this._name}
            @input=${(e: any) => (this._name = e.target.value)}
          />
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
          </div>
        </div>

        <div class="actions">
          <button
            class="delete"
            @click=${() => alert("Delete not implemented")}
          >
            Delete Helper
          </button>
          <button class="cancel" @click=${this._goBack}>Cancel</button>
          <button class="save" @click=${this._save}>Save Changes</button>
        </div>
      </div>
    `;
  }
}
