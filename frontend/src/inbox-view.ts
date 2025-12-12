import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface ClimateEntity {
  entity_id: string;
  name: string;
  state: string;
  attributes: Record<string, any>;
}

@customElement("inbox-view")
export class InboxView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  @state() private _devices: ClimateEntity[] = [];
  @state() private _loading = false;

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
        <h2>Inbox</h2>
        ${this._loading ? html`<p>Scanning...</p>` : this._renderList()}
      </div>
    `;
  }

  private _renderList(): TemplateResult {
    if (this._devices.length === 0) {
      return html`<div class="empty">
        No unmanaged devices found. Inbox Zero!
      </div>`;
    }

    return html`
      <div class="list">
        ${this._devices.map(
          (device) => html`
            <div class="item">
              <div class="item-info">
                <span class="icon">
                  <ha-icon icon="mdi:thermostat"></ha-icon>
                </span>
                <div>
                  <div>${device.name || device.entity_id}</div>
                  <div
                    style="font-size: 0.8em; color: var(--secondary-text-color)"
                  >
                    ${device.entity_id} • ${device.state}
                  </div>
                </div>
              </div>
              <mwc-button @click=${() => this._adoptEntity(device.entity_id)}
                >ADOPT</mwc-button
              >
            </div>
          `,
        )}
      </div>
    `;
  }

  private async _adoptEntity(entityId: string) {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/adopt",
        actuator_id: entityId,
      });
      // Refresh the list to remove the adopted item
      this._fetchDevices();
    } catch (err) {
      console.error("Failed to adopt", err);
      alert("Failed to adopt entity: " + (err as Error).message);
    }
  }
}
