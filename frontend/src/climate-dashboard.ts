import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./inbox-view";

@customElement("climate-dashboard")
export class ClimateDashboard extends LitElement {
  @property({ type: Object }) public hass: any;
  @property({ type: Boolean }) public narrow: boolean = false;
  @property({ type: Object }) public route: any;
  @property({ type: Object }) public panel: any;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      background-color: var(--primary-background-color);
      color: var(--primary-text-color);
      padding: 16px;
      box-sizing: border-box;
    }
    h1 {
      color: var(--primary-color);
    }
  `;

  protected render() {
    return html` <inbox-view .hass=${this.hass}></inbox-view> `;
  }
}
