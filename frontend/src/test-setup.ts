import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { vi } from "vitest";

// Stub HA Custom Elements to prevent rendering errors
@customElement("ha-icon")
export class HaIcon extends LitElement {
  render() {
    return html``;
  }
}

@customElement("ha-menu-button")
export class HaMenuButton extends LitElement {
  render() {
    return html``;
  }
}

@customElement("ha-icon-button")
export class HaIconButton extends LitElement {
  render() {
    return html``;
  }
}

@customElement("ha-dialog")
export class HaDialog extends LitElement {
  render() {
    return html`<slot></slot><slot name="secondaryAction"></slot
      ><slot name="primaryAction"></slot>`;
  }
}

// Global Mock for HASS object factory
export const createMockHass = () => ({
  callWS: vi.fn(),
  callService: vi.fn(),
  states: {},
  entities: {},
  areas: {},
  floors: {},
});
