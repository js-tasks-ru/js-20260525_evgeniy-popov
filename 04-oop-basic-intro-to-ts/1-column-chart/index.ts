import { createElement } from "../../shared/utils/create-element";

interface Options {
  data: number[],
  label: string,
  value: string,
  link?: string,
  formatHeading?: (value: string) => string,
}

export default class ColumnChart {
  element: HTMLElement | null;
  chartHeight: number = 50;

  private data: number[];
  private label: string;
  private value: string | number;
  private link?: string;
  private formatHeading: (value: string | number) => string;
  constructor({ data = [], label = '', value = '', link = '', formatHeading = (value: string) => value }: Options = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.element = createElement(this.getTemplate());
  }

  update(data) {
    this.data = data;
    if (this.element) {
      const charBody = this.element.querySelector('.column-chart__chart');

      charBody.innerHTML = `${this.getColumnBody()}`;

      this.element.classList.toggle('column-chart_loading', !this.data.length);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    this.element = null;
  }

  private getLink(): string {
    if (!this.link) {
      return '';
    }

    return `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  private getTemplate() {
    const isLoading = !this.data.length;

    return`
      <div class="column-chart ${isLoading ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight}">
       <div class="column-chart__title">
         Total: ${this.label}
         ${this.getLink()}
       </div>
       <div class="column-chart__container">
         <div data-element="header" class="column-chart__header">
           ${this.formatHeading(this.value)}
         </div>
         <div data-element="body" class="column-chart__chart">
           ${this.getColumnBody()}
         </div>
       </div>
      </div>
    `
  }

  private getColumnBody() {
    const maxValue = Math.max(...this.data);

    if (!maxValue) {
      return '';
    }
    const scale = this.chartHeight / maxValue;
    return this.data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const value  = Math.floor(item * scale);

      return`
        <div style="--value: ${value}" data-tooltip="${percent}"></div>
      `
    }).join('');
  }
}
