import {createElement} from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  element: HTMLElement | null = null;

  data: SortableTableData[];
  config: SortableTableHeader[];
  sorted?: SortableTableSort;
  isSortLocally: boolean;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    {
      data = [],
      sorted,
      isSortLocally = true
    }: Options = {}
  ) {
    this.data = data ?? [];
    this.config = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally ?? true;

    this.sort();
  }

  private render() {
    const newElement = createElement(this.template());

    if (this.element) {
      this.element.replaceWith(newElement);
    }

    this.element = newElement;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    if (!this.element) return;

    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  private onPointerDown = (event: Event): void => {
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[data-sortable]');

    if (!cell || !cell.dataset.id) {
      return;
    }

    const id = cell.dataset.id;

    const order: SortOrder =
      this.sorted?.id === id
        ? this.sorted.order === 'asc'
          ? 'desc'
          : 'asc'
        : 'desc';

    this.sorted = {
      id,
      order
    };

    this.sort();
  };

  private template() {
    return `
      <div class="sortable-table">
        <div class="sortable-table__header sortable-table__row" data-element="header">
          ${this.config.map(column => `
            <div
              class="sortable-table__cell"
              data-id="${column.id}"
              ${column.sortable ? 'data-sortable' : ''}
              ${
                this.sorted?.id === column.id
                  ? `data-order="${this.sorted.order}"`
                  : ''
              }
            >
              ${column.title}
              ${
                column.sortable
                  ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>'
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

                return `
                            <div class="sortable-table__cell">
                              ${value}
                            </div>
                          `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  private sortOnClient() {
    if (!this.sorted) {
      this.render();
      return;
    }

    const column = this.config.find(
      item => item.id === this.sorted?.id
    );

    if (!column || !column.sortable) {
      this.render();
      return;
    }

    const { id, order } = this.sorted;

    this.data.sort((a, b) => {
      let result = 0;

      if (column.sortType === 'string') {
        result = String(a[id]).localeCompare(
          String(b[id]),
          'ru'
        );
      }

      if (column.sortType === 'number') {
        result = Number(a[id]) - Number(b[id]);
      }

      if (
        column.sortType === 'custom' &&
        column.customSorting
      ) {
        result = column.customSorting(a, b);
      }

      return order === 'asc'
        ? result
        : -result;
    });

    this.render();
  }

  private sortOnServer() {
    // this.render();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    if (!this.element) {
      return;
    }

    this.element?.removeEventListener('pointerdown', this.onPointerDown);

    this.remove();

    this.element = null;
    this.data = [];
    this.config = [];
  }
}
