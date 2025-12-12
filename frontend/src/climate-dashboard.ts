import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TemplateResult } from "lit";
import "./inbox-view";
import "./timeline-view";

@customElement("climate-dashboard")
export class ClimateDashboard extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public narrow!: boolean;
  @property({ attribute: false }) public panel!: any;

  @state() private _view: "inbox" | "timeline" = "inbox";

  static styles = css`
    :host {
      display: block;
      background-color: var(--primary-background-color);
      min-height: 100vh;
    }
    .nav {
      background: var(--app-header-background-color, #03a9f4);
      color: var(--app-header-text-color, white);
      padding: 16px;
      display: flex;
      gap: 16px;
    }
    .nav-item {
      cursor: pointer;
      opacity: 0.7;
      font-weight: 500;
    }
    .nav-item.active {
      opacity: 1;
      border-bottom: 2px solid white;
    }
  `;

  protected render(): TemplateResult {
    return html`
      <div class="nav">
        <div
          class="nav-item ${this._view === "inbox" ? "active" : ""}"
          @click=${() => (this._view = "inbox")}
        >
          Inbox
        </div>
        <div
          class="nav-item ${this._view === "timeline" ? "active" : ""}"
          @click=${() => (this._view = "timeline")}
        >
          Timeline
        </div>
      </div>

      <div class="content">
        ${this._view === "inbox"
          ? html`<inbox-view .hass=${this.hass}></inbox-view>`
          : html`<timeline-view .hass=${this.hass}></timeline-view>`}
      </div>
    `;
  }
}
