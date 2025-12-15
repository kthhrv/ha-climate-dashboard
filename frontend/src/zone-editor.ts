import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
// import { fireEvent } from "./fire-event";
// import "@material/mwc-button";

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
  @state() private _restoreDelayMinutes = 0;

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
    input[type="number"],
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
    .dialog-btn {
      background: transparent;
      border: none;
      color: var(--primary-color, #03a9f4);
      font-weight: 500;
      text-transform: uppercase;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      letter-spacing: 0.0892857143em;
    }
    .dialog-btn.delete-confirm {
      color: var(--error-color, #f44336);
    }
    .dialog-btn:hover {
      background: rgba(0, 0, 0, 0.04);
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

    console.log("Loading config for zoneId:", this.zoneId);

    // 1. Get State
    const state = this.hass.states[this.zoneId];
    if (!state) {
      console.error("Zone state not found for:", this.zoneId);
      this._error = "Zone not found";
      this._loading = false;
      return;
    }

    console.log("Zone Attributes:", state.attributes);

    // 2. Get Unique ID (Try attributes first, then registry)
    if (state.attributes.unique_id) {
      this._uniqueId = state.attributes.unique_id;
    } else {
      try {
        const reg = await this.hass.callWS({
          type: "config/entity_registry/get",
          entity_id: this.zoneId,
        });
        this._uniqueId = reg.unique_id;
      } catch (e) {
        console.warn("Could not fetch registry entry:", e);
      }
    }

    if (!this._uniqueId) {
      this._error = "Could not determine Unique ID";
      this._loading = false;
      return;
    }

    // 3. Populate Fields
    const attrs = state.attributes;
    this._name = attrs.friendly_name || "";
    this._temperatureSensor =
      attrs.temperature_sensor || attrs.sensor_entity_id || "";

    // Heaters (ensure array)
    const heaters =
      attrs.heaters ||
      (attrs.actuator_entity_id ? [attrs.actuator_entity_id] : []);
    this._heaters = new Set(heaters);

    // Coolers
    const coolers = attrs.coolers || [];
    this._coolers = new Set(coolers);

    // Window Sensors
    const windows = attrs.window_sensors || [];
    this._windowSensors = new Set(windows);

    // Restore Delay
    this._restoreDelayMinutes = attrs.restore_delay_minutes || 0;

    console.log("Loaded Config:", {
      name: this._name,
      temp: this._temperatureSensor,
      heaters: this._heaters,
      coolers: this._coolers,
      restore: this._restoreDelayMinutes,
    });

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
        restore_delay_minutes: Number(this._restoreDelayMinutes),
      });
      this._goBack();
    } catch (e: any) {
      alert("Update failed: " + e.message);
    }
  }

  @state() private _showDeleteDialog = false;

  private async _deleteConfirm() {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/delete",
        unique_id: this._uniqueId,
      });
      this._goBack();
    } catch (e: any) {
      console.error("[ZoneEditor] Delete failed:", e);
      alert("Delete failed: " + e.message);
    } finally {
      this._showDeleteDialog = false;
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
                  <span>${e.name} (${e.entity_id})</span>
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

        <div class="field">
          <label>Auto-Restore Delay (Minutes)</label>
          <div
            style="font-size: 0.8em; color: var(--secondary-text-color); margin-bottom: 4px;"
          >
            Automatically revert to Auto/Schedule after this many minutes. Set
            to 0 to disable.
          </div>
          <input
            type="number"
            min="0"
            .value=${this._restoreDelayMinutes}
            @input=${(e: any) => (this._restoreDelayMinutes = e.target.value)}
          />
        </div>

        <div class="actions">
          <button
            class="delete"
            @click=${() => (this._showDeleteDialog = true)}
          >
            Delete
          </button>
          <div style="flex: 1"></div>
          <button class="cancel" @click=${this._goBack}>Cancel</button>
          <button class="save" @click=${this._save}>Save</button>
        </div>

        <!-- Confirmation Dialog -->
        <ha-dialog
          .open=${this._showDeleteDialog}
          @closed=${() => (this._showDeleteDialog = false)}
          heading="Delete Zone"
        >
          <div>
            Are you sure you want to delete <strong>${this._name}</strong>? This
            action cannot be undone.
          </div>
          <div slot="secondaryAction">
            <button
              class="dialog-btn"
              @click=${() => (this._showDeleteDialog = false)}
            >
              Cancel
            </button>
          </div>
          <div slot="primaryAction">
            <button
              class="dialog-btn delete-confirm"
              @click=${this._deleteConfirm}
            >
              Delete
            </button>
          </div>
        </ha-dialog>
      </div>
    `;
  }
}
