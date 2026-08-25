import { createElement } from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  element: HTMLElement | null = null;
  min: number;
  max: number;
  formatValue: (value: number) => string;
  selected: DoubleSliderSelected;
  activeThumb: HTMLElement | null = null;

  subElements: {
    from?: HTMLElement;
    to?: HTMLElement;
    left?: HTMLElement;
    right?: HTMLElement;
    progress?: HTMLElement;
  } = {};
  constructor({
    min = 0,
    max = 100,
    formatValue = value => String(value),
    selected = {
      from: min,
      to: max
    }
  }: Options = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = { ...selected };
    this.render();
  }

  render() {
    this.element = createElement(this.template());

    this.subElements = {
      from: this.element.querySelector('[data-element="from"]') as HTMLElement,
      to: this.element.querySelector('[data-element="to"]') as HTMLElement,
      left: this.element.querySelector('[data-element="left"]') as HTMLElement,
      right: this.element.querySelector('[data-element="right"]') as HTMLElement,
      progress: this.element.querySelector('[data-element="progress"]') as HTMLElement
    };

    this.update();
    this.initialize();
  }

  initialize() {
    this.subElements.left?.addEventListener('pointerdown', this.onPointerDown);

    this.subElements.right?.addEventListener('pointerdown', this.onPointerDown);

    document.addEventListener('pointermove', this.onDocumentPointerMove);

    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown = (event: PointerEvent) => {
    event.preventDefault();

    this.activeThumb = event.currentTarget as HTMLElement;
  };

  onDocumentPointerMove = (event: PointerEvent) => {
    if (!this.activeThumb) return;

    this.onPointerMove(event, this.activeThumb);
  };

  onPointerUp = () => {
    if (!this.activeThumb) return;

    this.activeThumb = null;

    this.dispatchRangeSelect();
  };

  onPointerMove(event: PointerEvent, thumb: HTMLElement) {
    if (!this.element) return;

    const slider = this.element.querySelector(
      '.range-slider__inner'
    ) as HTMLElement;

    const rect = slider.getBoundingClientRect();

    if (rect.width === 0) return;

    let percent = (event.clientX - rect.left) / rect.width;

    percent = Math.max(0, Math.min(1, percent));

    const leftPercent = this.getPercent(this.selected.from);
    const rightPercent = this.getPercent(this.selected.to);

    if (thumb === this.subElements.left) {
      percent = Math.min(percent, rightPercent);

      this.selected.from = this.getValue(percent);
    }

    if (thumb === this.subElements.right) {
      percent = Math.max(percent, leftPercent);

      this.selected.to = this.getValue(percent);
    }

    this.update();
  }

  getPercent(value: number) {
    if (this.max === this.min) {
      return 0;
    }

    return (value - this.min) / (this.max - this.min);
  }

  getValue(percent: number) {
    if (this.max === this.min) {
      return this.min;
    }

    return Math.round(
      this.min + (this.max - this.min) * percent
    );
  }

  update() {
    const fromPercent = this.getPercent(this.selected.from);
    const toPercent = this.getPercent(this.selected.to);

    if (this.subElements.from) {
      this.subElements.from.textContent =
        this.formatValue(this.selected.from);
    }

    if (this.subElements.to) {
      this.subElements.to.textContent =
        this.formatValue(this.selected.to);
    }

    if (this.subElements.left) {
      this.subElements.left.style.left = `${fromPercent * 100}%`;
    }

    if (this.subElements.right) {
      this.subElements.right.style.right = `${(1 - toPercent) * 100}%`;
    }

    if (this.subElements.progress) {
      this.subElements.progress.style.left = `${fromPercent * 100}%`;

      this.subElements.progress.style.right = `${(1 - toPercent) * 100}%`;
    }
  }

  dispatchRangeSelect() {
    if (!this.element) return;

    this.element.dispatchEvent(
      new CustomEvent('range-select', {
        detail: {
          from: this.selected.from,
          to: this.selected.to
        },
        bubbles: true
      })
    );
  }

  destroy() {
    this.subElements.left?.removeEventListener('pointerdown', this.onPointerDown);
    this.subElements.right?.removeEventListener('pointerdown', this.onPointerDown);

    this.element?.remove();
    this.element = null;
  }

  template() {
    return `
      <div class="range-slider">
        <span data-element="from">
          ${this.formatValue(this.selected.from)}
        </span>

        <div class="range-slider__inner">
          <span
            data-element="progress"
            class="range-slider__progress"
          ></span>

          <span
            data-element="left"
            class="range-slider__thumb-left"
          ></span>

          <span
            data-element="right"
            class="range-slider__thumb-right"
          ></span>
        </div>

        <span data-element="to">
          ${this.formatValue(this.selected.to)}
        </span>
      </div>
    `;
  }
}
