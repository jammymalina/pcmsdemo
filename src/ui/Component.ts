import ComponentState from './ComponentState';

class Component {
  state: ComponentState;
  element: HTMLElement;

  constructor(element: HTMLElement) {
    this.state = {};
    this.element = element;
  }

  inject(container: HTMLElement) {
    container.appendChild(this.element);
  }

  async render(): Promise<void> {
    return Promise.resolve();
  }
}

export default Component;
