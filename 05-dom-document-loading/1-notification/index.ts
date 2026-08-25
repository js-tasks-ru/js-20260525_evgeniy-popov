import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?: string;
}

export default class NotificationMessage {
  element: HTMLElement | null;
  duration: number;
  timerId: ReturnType<typeof setTimeout> | null = null;

  static activeNotification: NotificationMessage | null = null;

  constructor(
    message: string,
    options: Options = {},
    target?: HTMLElement
  ) {
    const {
      duration = 2000,
      type = "success",
    } = options;

    NotificationMessage.activeNotification?.destroy();

    this.duration = duration;

    const durationInSeconds = this.duration / 1000;

    this.element = createElement(
      this.template(message, type, durationInSeconds)
    );

    NotificationMessage.activeNotification = this;

    this.show(target);
  }

  show(target?: HTMLElement) {
    if (!this.element) return;

    if (target) {
      target.appendChild(this.element);
    } else {
      document.body.appendChild(this.element);
    }

    this.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  private template(text: string, type: string, duration: number) {
    return `
      <div
        class="notification ${type}"
        style="--value: ${duration}s"
      >
        <div class="timer"></div>

        <div class="inner-wrapper">
          <div data-element="header" class="notification-header">
            Notification
          </div>

          <div data-element="body" class="notification-body">
            ${text}
          </div>
        </div>
      </div>
    `;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.remove();
    this.element = null;

    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }
  }
}
