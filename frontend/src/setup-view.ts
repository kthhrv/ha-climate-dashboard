import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./adopt-dialog";

interface ClimateEntity {
  entity_id: string;
  name: string;
  state: string;
  domain: string;
  attributes: Record<string, any>;
  area_name?: string;
}

@customElement("setup-view")
export class SetupView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  @state() private _devices: ClimateEntity[] = [];
  @state() private _loading = false;

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
  `;

  protected firstUpdated(): void {
    this._fetchDevices();
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
}
