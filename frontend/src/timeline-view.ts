import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("timeline-view")
export class TimelineView extends LitElement {
  @property({ attribute: false }) public hass!: any;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .card {
      background: var(--card-background-color, white);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
    }
    .zone-item {
      border-bottom: 1px solid var(--divider-color, #eee);
      padding: 12px 0;
    }
    .zone-header {
      font-weight: bold;
      display: flex;
      justify-content: space-between;
    }
    .schedule-list {
      margin-top: 8px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .block {
      display: inline-block;
      background: var(--secondary-background-color, #f5f5f5);
      padding: 4px 8px;
      border-radius: 4px;
      margin-right: 4px;
      margin-bottom: 4px;
    }
  `;

  protected render(): TemplateResult {
    if (!this.hass) return html``;

    const zones = Object.values(this.hass.states).filter((s: any) =>
      s.entity_id.startsWith("climate.zone_"),
    );

    return html`
      <div class="card">
        <h2>Timeline (Managed Zones)</h2>
        ${zones.length === 0
          ? html`<p>No zones adopted yet.</p>`
          : zones.map((zone: any) => this._renderZone(zone))}
      </div>
    `;
  }

  private _renderZone(zone: any): TemplateResult {
    const schedule = zone.attributes.schedule || [];

    return html`
      <div class="zone-item">
        <div class="zone-header">
          <span>${zone.attributes.friendly_name || zone.entity_id}</span>
          <span>${zone.state} (${zone.attributes.temperature}°C)</span>
        </div>
        <div class="schedule-list">
          ${schedule.length === 0
            ? html`No schedule set`
            : schedule.map(
                (block: any) => html`
                  <span class="block">
                    ${block.name}: ${block.start_time} -> ${block.target_temp}°C
                  </span>
                `,
              )}
        </div>
      </div>
    `;
  }
}
