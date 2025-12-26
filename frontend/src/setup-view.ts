import { LitElement, html, css, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import "./adopt-dialog";

interface ClimateEntity {
  entity_id: string;
  name: string;
  state: string;
  domain: string;
  attributes: Record<string, any>;
  area_name?: string;
  area_id?: string;
}

interface GlobalSettings {
  default_override_type: "next_block" | "duration" | "disabled";
  default_timer_minutes: number;
  window_open_delay_seconds: number;
  home_away_entity_id: string | null;
  away_delay_minutes: number;
  away_temperature: number;
  away_temperature_cool: number;
  is_away_mode_on: boolean;
}

interface CircuitConfig {
  id: string;
  name: string;
  heaters: string[];
  member_zones: string[];
}

export class SetupView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  @state() private _devices: ClimateEntity[] = [];
  @state() private _loading = false;
  @state() private _settings: GlobalSettings = {
    default_override_type: "disabled",
    default_timer_minutes: 60,
    window_open_delay_seconds: 30,
    home_away_entity_id: null,
    away_delay_minutes: 10,
    away_temperature: 16.0,
    away_temperature_cool: 30.0,
    is_away_mode_on: false,
  };
  @state() private _circuits: CircuitConfig[] = [];

  // Circuit Dialog
  @state() private _circuitDialogOpen = false;
  @state() private _editingCircuit: CircuitConfig | null = null;
  @state() private _tempCircuitName = "";
  @state() private _tempCircuitHeaters: string[] = [];

  // Dialog State
  @state() private _dialogOpen = false;
  @state() private _selectedEntity: string | null = null;
  @state() private _filterText = "";

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
      margin-bottom: 16px;
    }
    h2 {
      margin-top: 0;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border: 1px solid var(--divider-color, #eee);
      border-radius: 8px;
    }
    .item-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon {
      color: var(--state-climate-cool-color, #2b9af9);
    }
    .empty {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 32px;
    }
    .area-badge {
      background: var(--primary-color, #03a9f4);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 6px;
    }
    .adopt-btn {
      background-color: var(--primary-color, #03a9f4);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .adopt-btn:hover {
      background-color: var(--primary-color-dark, #0288d1);
    }
    .circuit-item {
      border: 1px solid var(--divider-color);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .circuit-actions ha-icon-button {
      color: var(--secondary-text-color);
    }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .settings-row label {
      font-weight: 500;
    }
    select,
    input {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    }
    .search-input {
      width: 100%;
      margin-bottom: 12px;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      box-sizing: border-box;
    }
  `;

  protected firstUpdated(): void {
    this._fetchDevices();
    this._fetchSettings();
    this._fetchCircuits();
  }

  private async _fetchCircuits() {
    if (!this.hass) return;
    try {
      this._circuits = await this.hass.callWS({
        type: "climate_dashboard/circuit/list",
      });
    } catch (e) {
      console.error("Failed to fetch circuits", e);
    }
  }

  private async _deleteCircuit(id: string) {
    if (!confirm("Delete this circuit?")) return;
    try {
      await this.hass.callWS({
        type: "climate_dashboard/circuit/delete",
        circuit_id: id,
      });
      this._fetchCircuits();
    } catch (e) {
      alert("Failed to delete: " + e);
    }
  }

  private _openCircuitDialog(circuit?: CircuitConfig) {
    if (circuit) {
      this._editingCircuit = circuit;
      this._tempCircuitName = circuit.name;
      this._tempCircuitHeaters = [...circuit.heaters];
    } else {
      this._editingCircuit = null;
      this._tempCircuitName = "";
      this._tempCircuitHeaters = [];
    }
    this._circuitDialogOpen = true;
  }

  private async _saveCircuit() {
    if (!this._tempCircuitName) return alert("Name required");

    const payload: any = {
      name: this._tempCircuitName,
      heaters: this._tempCircuitHeaters,
    };

    try {
      if (this._editingCircuit) {
        payload.type = "climate_dashboard/circuit/update";
        payload.id = this._editingCircuit.id;
        // Preserver members? Not editing members here yet
      } else {
        payload.type = "climate_dashboard/circuit/create";
      }

      await this.hass.callWS(payload);
      this._circuitDialogOpen = false;
      this._fetchCircuits();
    } catch (e) {
      alert("Error: " + e);
    }
  }

  private async _fetchSettings() {
    if (!this.hass) return;
    try {
      this._settings = await this.hass.callWS({
        type: "climate_dashboard/settings/get",
      });
    } catch (e) {
      console.error("Failed to fetch settings", e);
    }
  }

  private async _fetchDevices() {
    if (!this.hass) return;
    this._loading = true;
    try {
      this._devices = await this.hass.callWS({
        type: "climate_dashboard/scan",
      });
    } catch (e) {
      console.error("Failed to fetch devices", e);
    } finally {
      this._loading = false;
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="card">
        <h2>System Settings</h2>
        <div class="settings-row">
          <label>Default Override Behavior</label>
          <select
            .value=${this._settings.default_override_type}
            @change=${(e: Event) =>
              this._updateSetting(
                "default_override_type",
                (e.target as HTMLSelectElement).value,
              )}
          >
            <option value="disabled">Disabled (Manual Not Respected)</option>
            <option value="next_block">Until Next Schedule</option>
            <option value="duration">Timer (Fixed Duration)</option>
          </select>
        </div>

        ${this._settings.default_override_type === "duration"
          ? html`
              <div class="settings-row">
                <label>Default Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="720"
                  step="5"
                  .value=${this._settings.default_timer_minutes}
                  @change=${(e: Event) =>
                    this._updateSetting(
                      "default_timer_minutes",
                      parseInt((e.target as HTMLInputElement).value),
                    )}
                />
              </div>
            `
          : ""}

        <div class="settings-row">
          <label>Door/Window Open Delay (seconds)</label>
          <input
            type="number"
            min="0"
            max="300"
            step="5"
            .value=${this._settings.window_open_delay_seconds}
            @change=${(e: Event) =>
              this._updateSetting(
                "window_open_delay_seconds",
                parseInt((e.target as HTMLInputElement).value),
              )}
          />
        </div>

        <h3>Home/Away Automation</h3>

        <div class="settings-row">
          <label>Presence Entity (Optional)</label>
          <input
            type="text"
            placeholder="group.family"
            .value=${this._settings.home_away_entity_id || ""}
            @change=${(e: Event) =>
              this._updateSetting(
                "home_away_entity_id",
                (e.target as HTMLInputElement).value || null,
              )}
          />
        </div>

        <div class="settings-row">
          <label>Away Delay (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            step="1"
            .value=${this._settings.away_delay_minutes}
            @change=${(e: Event) =>
              this._updateSetting(
                "away_delay_minutes",
                parseInt((e.target as HTMLInputElement).value),
              )}
          />
        </div>

        <div class="settings-row">
          <label>Away Heat Temperature (°C)</label>
          <input
            type="number"
            min="5"
            max="30"
            step="0.5"
            .value=${this._settings.away_temperature}
            @change=${(e: Event) =>
              this._updateSetting(
                "away_temperature",
                parseFloat((e.target as HTMLInputElement).value),
              )}
          />
        </div>

        <div class="settings-row">
          <label>Away Cool Temperature (°C)</label>
          <input
            type="number"
            min="16"
            max="35"
            step="0.5"
            .value=${this._settings.away_temperature_cool || 30.0}
            @change=${(e: Event) =>
              this._updateSetting(
                "away_temperature_cool",
                parseFloat((e.target as HTMLInputElement).value),
              )}
          />
        </div>
      </div>

      <div class="card">
        <div
          style="display:flex; justify-content:space-between; align-items:center"
        >
          <h2>Heating Circuits</h2>
          <button class="adopt-btn" @click=${() => this._openCircuitDialog()}>
            + Create
          </button>
        </div>
        ${this._circuits.length === 0
          ? html`<div class="empty">No circuits defined.</div>`
          : html`<div class="list">
              ${this._circuits.map(
                (c) => html`
                  <div class="circuit-item">
                    <div>
                      <strong>${c.name}</strong>
                      <div
                        style="font-size:0.8em; color:var(--secondary-text-color)"
                      >
                        Heaters: ${c.heaters.join(", ") || "None"}
                      </div>
                    </div>
                    <div class="circuit-actions">
                      <button
                        style="background:none; border:none; color:blue; cursor:pointer"
                        @click=${() => this._openCircuitDialog(c)}
                      >
                        Edit
                      </button>
                      <button
                        style="background:none; border:none; color:red; cursor:pointer"
                        @click=${() => this._deleteCircuit(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                `,
              )}
            </div>`}
      </div>

      ${this._renderCircuitDialog()}

      <div class="card">
        <h2>Unmanaged Devices</h2>
        <input
          type="text"
          class="search-input"
          placeholder="Filter devices by name, id or area..."
          .value=${this._filterText}
          @input=${(e: Event) =>
            (this._filterText = (e.target as HTMLInputElement).value)}
        />
        ${this._loading ? html`<p>Scanning...</p>` : this._renderList()}
      </div>

      <adopt-dialog
        .hass=${this.hass}
        .open=${this._dialogOpen}
        .entities=${this._devices}
        .preselected=${this._selectedEntity}
        @close=${this._closeDialog}
      ></adopt-dialog>
    `;
  }

  private _renderList(): TemplateResult {
    // Only show "primary" candidates in the list (heaters/coolers)
    // Hide pure sensors/windows from the main "Adopt" list to avoid clutter?
    // Or just show everything? Let's show actuators as primary.
    const lowerFilter = this._filterText.toLowerCase();
    const candidates = this._devices.filter((d) => {
      const basicMatch = ["climate", "switch"].includes(d.domain);
      const textMatch =
        !this._filterText ||
        d.name.toLowerCase().includes(lowerFilter) ||
        d.entity_id.toLowerCase().includes(lowerFilter) ||
        (d.area_name && d.area_name.toLowerCase().includes(lowerFilter));
      return basicMatch && textMatch;
    });

    if (candidates.length === 0) {
      return html`<div class="empty">No unmanaged actuators found.</div>`;
    }

    return html`
      <div class="list">
        ${candidates.map(
          (device) => html`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon
                    icon="${device.domain === "switch"
                      ? "mdi:power-socket"
                      : "mdi:thermostat"}"
                  ></ha-icon>
                </span>
                <div>
                  <div>${device.name || device.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color); display: flex; align-items: center; margin-top: 2px;"
                  >
                    ${device.area_name
                      ? html`<span class="area-badge"
                          >${device.area_name}</span
                        >`
                      : ""}
                    ${device.entity_id} • ${device.state}
                  </div>
                </div>
              </div>
              <button
                class="adopt-btn"
                @click=${() => this._openDialog(device.entity_id)}
              >
                Adopt
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _openDialog(entityId: string) {
    this._selectedEntity = entityId;
    this._dialogOpen = true;
  }

  private _closeDialog() {
    this._dialogOpen = false;
    this._selectedEntity = null;
    this._fetchDevices(); // Refresh list
  }

  private async _updateSetting(key: string, value: any) {
    // Update local state immediately for responsiveness
    this._settings = { ...this._settings, [key]: value };

    // Persist
    try {
      await this.hass.callWS({
        type: "climate_dashboard/settings/update",
        [key]: value,
      });
    } catch (e) {
      console.error("Failed to update settings", e);
      // Revert on error?
      this._fetchSettings();
    }
  }

  private _renderCircuitDialog() {
    if (!this._circuitDialogOpen) return html``;

    // Filter potential heaters (switches/climates)
    const potentialHeaters = this._devices.filter((d) =>
      ["switch", "climate"].includes(d.domain),
    );

    return html`
      <div
        style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; justify-content:center; align-items:center"
      >
        <div
          style="background:var(--card-background-color, white); padding:20px; border-radius:12px; width: 400px; max-width:90%"
        >
          <h2>${this._editingCircuit ? "Edit Circuit" : "Create Circuit"}</h2>

          <div style="margin-bottom:16px">
            <label style="display:block; margin-bottom:4px">Name</label>
            <input
              type="text"
              style="width:100%"
              .value=${this._tempCircuitName}
              @input=${(e: any) => (this._tempCircuitName = e.target.value)}
            />
          </div>

          <div style="margin-bottom:16px">
            <label style="display:block; margin-bottom:4px"
              >Shared Heaters (Boilers/Pumps)</label
            >
            <div
              style="max-height:150px; overflow-y:auto; border:1px solid #ccc; padding:8px; border-radius:4px"
            >
              ${potentialHeaters.map(
                (h) => html`
                  <div
                    style="display:flex; align-items:center; gap:8px; margin-bottom:4px"
                  >
                    <input
                      type="checkbox"
                      .checked=${this._tempCircuitHeaters.includes(h.entity_id)}
                      @change=${(e: any) => {
                        if (e.target.checked)
                          this._tempCircuitHeaters = [
                            ...this._tempCircuitHeaters,
                            h.entity_id,
                          ];
                        else
                          this._tempCircuitHeaters =
                            this._tempCircuitHeaters.filter(
                              (id) => id !== h.entity_id,
                            );
                      }}
                    />
                    <span>${h.name || h.entity_id}</span>
                  </div>
                `,
              )}
            </div>
          </div>

          <div
            style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px"
          >
            <button
              class="adopt-btn"
              style="background:#ccc; color:black"
              @click=${() => (this._circuitDialogOpen = false)}
            >
              Cancel
            </button>
            <button class="adopt-btn" @click=${this._saveCircuit}>Save</button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("setup-view")) {
  customElements.define("setup-view", SetupView);
}
