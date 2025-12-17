import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";

interface ScheduleBlock {
  name: string;
  start_time: string;
  temp_heat: number;
  temp_cool: number;
  days: string[];
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export class ScheduleEditor extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public zoneId!: string;

  @state() private _schedule: ScheduleBlock[] = [];
  @state() private _loading = false;
  @state() private _uniqueId = "";
  @state() private _config: any = {};

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      max-width: 800px;
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
      justify-content: space-between;
      align-items: center;
    }
    .block-list {
      margin-top: 20px;
    }
    .block-item {
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .field {
      flex: 1;
      min-width: 120px;
    }
    label {
      display: block;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      margin-bottom: 4px;
    }
    input,
    select {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--primary-background-color);
      color: var(--primary-text-color);
      box-sizing: border-box;
    }
    .days-selector {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .day-btn {
      padding: 6px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      background: transparent;
      flex: 1;
      min-width: 40px;
      text-align: center;
    }
    .day-btn.active {
      background: var(--primary-color, #03a9f4);
      color: white;
      border-color: var(--primary-color, #03a9f4);
    }
    .actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    button {
      padding: 10px 24px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
    }
    .add-btn {
      background: var(--primary-color);
      color: white;
      width: 100%;
      margin-top: 10px;
    }
    .save {
      background: var(--primary-color);
      color: white;
    }
    .cancel {
      background: transparent;
      border: 1px solid var(--divider-color);
    }
    .delete-btn {
      color: var(--error-color, red);
      background: none;
      padding: 4px;
    }
  `;

  protected async firstUpdated(): Promise<void> {
    await this._loadConfig();
  }

  private async _loadConfig() {
    if (!this.hass || !this.zoneId) return;
    this._loading = true;

    try {
      // 1. Get Unique ID
      const reg = await this.hass.callWS({
        type: "config/entity_registry/get",
        entity_id: this.zoneId,
      });
      this._uniqueId = reg.unique_id;

      // 2. We actually need the full schedule config from storage.
      // Currently we don't have a specific `get_zone` command, but we can rely on
      // state attributes for the schedule IF we trust they are up to date.
      // Best way is to read attributes from state.
      const state = this.hass.states[this.zoneId];
      if (state && state.attributes.schedule) {
        // Deep copy to avoid mutating state directly
        const rawSchedule = JSON.parse(
          JSON.stringify(state.attributes.schedule),
        );
        // Normalize: Ensure temp_heat/temp_cool exist
        this._schedule = rawSchedule.map((block: any) => ({
          ...block,
          temp_heat: block.temp_heat ?? 20.0,
          temp_cool: block.temp_cool ?? 24.0,
        }));

        // Also cache other config parts logic needs, though update API accepts individual fields?
        // Wait, update API accepts partial?
        // Looking at websocket.py:
        // updated_config = existing_zone.copy()
        // updated_config.update({...})
        // But validation (vol.Required) forces us to send name, sensor etc.
        // So we DO need to send everything back.
        // We need to capture existing values.
        this._config = {
          name: state.attributes.friendly_name,
          temperature_sensor: state.attributes.temperature_sensor,
          heaters: state.attributes.heaters || [],
          coolers: state.attributes.coolers || [],
          window_sensors: state.attributes.window_sensors || [],
        };
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load schedule");
    }
    this._loading = false;
  }

  private _addBlock() {
    this._schedule = [
      ...this._schedule,
      {
        name: "New Block",
        start_time: "08:00",
        temp_heat: 20.0,
        temp_cool: 24.0,
        days: ["mon", "tue", "wed", "thu", "fri"],
      },
    ];
  }

  private _removeBlock(index: number) {
    this._schedule = this._schedule.filter((_, i) => i !== index);
  }

  private _updateBlock(index: number, field: keyof ScheduleBlock, value: any) {
    const newSchedule = [...this._schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    this._schedule = newSchedule;
  }

  private _toggleDay(index: number, day: string) {
    const block = this._schedule[index];
    const days = new Set(block.days);
    if (days.has(day)) days.delete(day);
    else days.add(day);
    this._updateBlock(index, "days", Array.from(days));
  }

  private async _save() {
    try {
      await this.hass.callWS({
        type: "climate_dashboard/update",
        unique_id: this._uniqueId,
        name: this._config.name, // Required fields
        temperature_sensor: this._config.temperature_sensor,
        heaters: this._config.heaters,
        coolers: this._config.coolers,
        window_sensors: this._config.window_sensors,
        schedule: this._schedule,
      });
      this.dispatchEvent(new CustomEvent("close"));
    } catch (e: any) {
      alert("Save failed: " + e.message);
    }
  }

  render() {
    if (this._loading) return html`<div>Loading...</div>`;

    return html`
      <div class="card">
        <h2>Schedule: ${this._config.name}</h2>
        <div class="block-list">
          ${this._schedule.map(
            (block, index) => html`
              <div class="block-item">
                <div class="block-header">
                  <span>Block ${index + 1}</span>
                  <button
                    class="delete-btn"
                    @click=${() => this._removeBlock(index)}
                  >
                    <ha-icon icon="mdi:delete"></ha-icon>
                  </button>
                </div>

                <div class="row">
                  <div class="field">
                    <label>Name</label>
                    <input
                      type="text"
                      .value=${block.name}
                      @input=${(e: any) =>
                        this._updateBlock(index, "name", e.target.value)}
                    />
                  </div>
                  <div class="field">
                    <label>Start Time</label>
                    <input
                      type="time"
                      .value=${block.start_time}
                      @input=${(e: any) =>
                        this._updateBlock(index, "start_time", e.target.value)}
                    />
                  </div>
                  ${this._config.heaters.length > 0
                    ? html`
                        <div class="field">
                          <label>Heat To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${block.temp_heat ?? 20}
                            @input=${(e: any) =>
                              this._updateBlock(
                                index,
                                "temp_heat",
                                parseFloat(e.target.value),
                              )}
                          />
                        </div>
                      `
                    : ""}
                  ${this._config.coolers.length > 0
                    ? html`
                        <div class="field">
                          <label>Cool To (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            .value=${block.temp_cool ?? 24}
                            @input=${(e: any) =>
                              this._updateBlock(
                                index,
                                "temp_cool",
                                parseFloat(e.target.value),
                              )}
                          />
                        </div>
                      `
                    : ""}
                </div>

                <div class="row">
                  <div class="field" style="flex: 2;">
                    <label>Days</label>
                    <div class="days-selector">
                      ${DAYS.map(
                        (day) => html`
                          <button
                            class="day-btn ${block.days.includes(day)
                              ? "active"
                              : ""}"
                            @click=${() => this._toggleDay(index, day)}
                          >
                            ${day.toUpperCase()}
                          </button>
                        `,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            `,
          )}
        </div>

        <button class="add-btn" @click=${this._addBlock}>
          <ha-icon icon="mdi:plus"></ha-icon> Add Time Block
        </button>

        <div class="actions">
          <button
            class="cancel"
            @click=${() => this.dispatchEvent(new CustomEvent("close"))}
          >
            Cancel
          </button>
          <button class="save" @click=${this._save}>Save Schedule</button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get("schedule-editor")) {
  customElements.define("schedule-editor", ScheduleEditor);
}
