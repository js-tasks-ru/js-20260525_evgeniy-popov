import { createElement } from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';
type SortType = 'string' | 'number';

interface SortableTableData {
  [key: string]: any;
}

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: SortType;
  template?: (value: any) => string;
}

export default class SortableTable {
  element: HTMLElement | null = null;
  data: SortableTableData[];
  config: SortableTableHeader[];

  sortField: string | null = null;
  sortOrder: SortOrder | null = null;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    data: SortableTableData[] = []
  ) {
    this.data = data;
    this.config = headersConfig;

    this.render();
  }

  private render() {
    const newElement = createElement(this.template());

    if (this.element) {
      this.element.replaceWith(newElement);
    }

    this.element = newElement;
  }

  private template() {
    return `
    <div class="sortable-table">
      <div class="sortable-table__header sortable-table__row">
        ${this.config.map(column => `
          <div
            class="sortable-table__cell"
            data-id="${column.id}"
            ${column.sortable ? 'data-sortable=""' : ''}
            ${
              this.sortField === column.id
                ? `data-order="${this.sortOrder}"`
                : ''
            }
          >
            ${column.title}
            ${
              column.sortable
                ? '<span class="sort-arrow"></span>'
                : ''
            }
          </div>
        `).join('')}
      </div>

      <div
        class="sortable-table__body"
        data-element="body"
      >
        ${this.data.map(row => `
          <div class="sortable-table__row">
            ${this.config.map(column => {
              const value = row[column.id];

              if (column.template) {
                return column.template(value);
              }

              return `<div class="sortable-table__cell">${value}</div>`;
            }).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  }

  sort(field: string, order: SortOrder) {
    const column = this.config.find(item => item.id === field);

    if (!column || !column.sortable) {
      return;
    }

    this.sortField = field;
    this.sortOrder = order;

    this.data.sort((a, b) => {
      let result = 0;

      if (column.sortType === 'string') {
        result = String(a[field]).localeCompare(
          String(b[field]),
          'ru'
        );
      }

      if (column.sortType === 'number') {
        result = Number(a[field]) - Number(b[field]);
      }

      return order === 'asc'
        ? result
        : -result;
    });

    this.render();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();

    this.element = null;
    this.data = [];
    this.config = [];
  }
}
