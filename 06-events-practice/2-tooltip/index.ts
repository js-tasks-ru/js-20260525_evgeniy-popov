import {createElement} from "../../shared/utils/create-element";

export default class Tooltip {
  static instance: Tooltip;

  element: HTMLElement | null = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.onPointerOver);
    document.addEventListener('pointerout', this.onPointerOut);
    document.addEventListener('pointermove', this.onPointerMove);
  }

  onPointerOver = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    const tooltipTarget = target.closest('[data-tooltip]') as HTMLElement | null;

    if (!tooltipTarget) return;

    const text = tooltipTarget.dataset.tooltip;

    if (!text) return;

    this.render(text);
  }

  onPointerMove = (event: PointerEvent) => {
    if (!this.element) return;

    this.element.style.left = `${event.clientX + 10}px`;
    this.element.style.top = `${event.clientY + 10}px`;
  }

  onPointerOut = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    const tooltipTarget = target.closest<HTMLElement>('[data-tooltip]');

    if (!tooltipTarget) return;

    this.element?.remove();
  }

  render(html: string) {
    this.element?.remove();

    this.element = createElement(`
      <div class="tooltip">
        ${html}
      </div>
    `);

    document.body.append(this.element);
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver);
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);

    this.element?.remove();
  }
}
