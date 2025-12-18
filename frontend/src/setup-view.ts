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
  default_override_type: "next_block" | "duration";
  default_timer_minutes: number;
}

export class SetupView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  @state() private _devices: ClimateEntity[] = [];
  @state() private _loading = false;
  @state() private _settings: GlobalSettings = {
    default_override_type: "next_block",
    default_timer_minutes: 60,
  };

  // Dialog State
  @state() private _dialogOpen = false;
  @state() private _selectedEntity: string | null = null;

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
  `;

  protected firstUpdated(): void {
    this._fetchDevices();
    this._fetchSettings();
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
      </div>

      <div class="card">
        <h2>Unmanaged Devices</h2>
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
    const candidates = this._devices.filter((d) =>
      ["climate", "switch"].includes(d.domain),
    );

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
}

if (!customElements.get("setup-view")) {
  customElements.define("setup-view", SetupView);
}
