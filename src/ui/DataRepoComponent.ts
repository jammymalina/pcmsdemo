import feather from 'feather-icons';
import uuid from 'uuid/v4';
import Component from './Component';
import DataRepository from '../DataRepository';

class DataRepoComponent extends Component {
  private tableElement: HTMLTableElement;
  private panelElement: HTMLElement;
  private settingsButton: HTMLButtonElement;
  private refreshButton: HTMLButtonElement;
  private removeButton: HTMLButtonElement;
  private checkButton: HTMLButtonElement;

  constructor(dataRepository: DataRepository) {
    super(document.createElement('div'));
    this.createUI();
    this.state = {
      repository: dataRepository,
      selected: new Set<string>()
    };
  }

  async render() {
    this.refreshDataTable();
    this.highlightTableRows();
    this.toggleSettingsButton();
  }

  private async settingsButtonClick() {

  }

  private async refreshButtonClick() {
    await this.state.repository.refresh();
    await this.render();
  }

  private async removeButtonClick() {
    if (this.state.selected.size === 0) {
      return;
    }
    const deleted = await this.state.repository.delete(Array.from(this.state.selected));
    deleted.forEach((d: string) => this.state.selected.delete(d));
    await this.render();
  }

  private async checkButtonClick() {
    this.selectAll();
  }

  private selectAll() {
    if (this.state.repository.size === 0) {
      return;
    }
    const selected = this.state.selected;
    const selectAction = selected.size >= this.state.repository.size ?
      selected.clear.bind(selected) : () => this.state.repository.data.forEach((item: any) => {
        const pkName = this.state.repository.tablePrimaryKey;
        if (Object.prototype.hasOwnProperty.call(item, pkName)) {
          selected.add(item[pkName]);
        }
      });
    selectAction();
    this.onSelectChange();
  }

  private selectCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const key = checkbox.dataset.key;
    if (checkbox.checked) {
      this.state.selected.add(key);
    } else {
      this.state.selected.delete(key);
    }
    this.onSelectChange();
  }

  private onSelectChange() {
    this.highlightTableRows();
    this.toggleSettingsButton();
    this.toggleCheckBoxes();
  }

  private refreshDataTable() {
    this.clearDataTable();
    const dataKeys = new Set<string>(this.state.repository.dataKeys);
    dataKeys.delete(this.state.repository.tablePrimaryKey);

    const tHead = document.createElement('thead');
    const orderedKeys = Array.from(dataKeys);
    const thHTML = orderedKeys.map(x => `<th scope="col">${x}</th>`).join('\n');
    tHead.innerHTML = `
      <thead>
        <tr>
          <th scope="col">${this.state.repository.tablePrimaryKey}</th>
          ${thHTML}
        </tr>
      </thead>
    `;

    const tBody = document.createElement('tbody');
    const data = this.state.repository.data;
    const tbodyChildren: HTMLTableRowElement[] = data.map((item: any) => {
      const primaryKey = Object.prototype.hasOwnProperty.call(item, this.state.repository.tablePrimaryKey) ?
        item[this.state.repository.tablePrimaryKey] : '';

      const tr = document.createElement('tr');
      tr.setAttribute('id', primaryKey);
      tr.classList.add(this.state.repository.tableName);

      const primaryKeyTH = document.createElement('th');
      primaryKeyTH.setAttribute('scope', 'row');

      const formContainer = document.createElement('div');
      formContainer.classList.add('form-check', 'form-check-inline');

      const checkboxId = uuid();

      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('id', checkboxId);
      checkbox.setAttribute('data-key', primaryKey);
      checkbox.classList.add('form-check-input', 'data-checkbox');
      checkbox.style.display = 'none';
      if (this.state.selected.has(primaryKey)) {
        checkbox.checked = true;
      }
      checkbox.addEventListener('change', this.selectCheckboxChange.bind(this));

      const label = document.createElement('label');
      label.setAttribute('for', checkboxId);
      label.classList.add('form-check-label');
      label.innerHTML = primaryKey;

      formContainer.appendChild(checkbox);
      formContainer.appendChild(label);
      primaryKeyTH.appendChild(formContainer);

      const tds = orderedKeys.map((key) => {
        const td = document.createElement('td');
        td.innerHTML = Object.prototype.hasOwnProperty.call(item, key) ?
          item[key] : '';
        return td;
      });

      tr.appendChild(primaryKeyTH);
      tds.forEach(td => tr.appendChild(td));

      return tr;
    });
    tbodyChildren.forEach(tr => tBody.appendChild(tr));

    this.tableElement.appendChild(tHead);
    this.tableElement.appendChild(tBody);
  }

  private clearDataTable() {
    while (this.tableElement.firstChild) {
      this.tableElement.removeChild(this.tableElement.firstChild);
    }
  }

  private createUI() {
    this.panelElement = document.createElement('ul');
    this.panelElement.classList.add('nav', 'justify-content-between');

    this.settingsButton = this.createButton('settings', 'Settings', this.settingsButtonClick.bind(this));
    this.refreshButton = this.createButton('refresh-ccw', 'Refresh', this.refreshButtonClick.bind(this));
    this.removeButton = this.createButton('trash-2', 'Delete selected', this.removeButtonClick.bind(this));
    this.checkButton = this.createButton('check', 'Select all',this.checkButtonClick.bind(this));

    this.panelElement.appendChild(this.checkButton);

    const buttonContainer = document.createElement('div');
    buttonContainer.appendChild(this.settingsButton);
    buttonContainer.appendChild(this.refreshButton);
    buttonContainer.appendChild(this.removeButton);
    this.panelElement.appendChild(buttonContainer);

    this.tableElement = document.createElement('table');
    this.tableElement.classList.add('table');

    this.element.appendChild(this.panelElement);
    this.element.appendChild(this.tableElement);
  }

  private createButton(icon: string, tooltip: string, clickEventCallback: EventListener) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-balloon', tooltip);
    button.setAttribute('data-balloon-pos', 'down');
    button.classList.add('btn', 'btn-outline-primary');
    button.innerHTML = `<i data-feather="${icon}"></i>`;
    button.addEventListener('click', clickEventCallback);
    return button;
  }

  private highlightTableRows() {
    Array.from(document.getElementsByClassName(this.state.repository.tableName)).forEach(tr => tr.classList.remove('table-active'));
    Array.from(this.state.selected).forEach((id: string) => document.getElementById(id).classList.add('table-active'));
  }

  private toggleSettingsButton() {
    const icon = (this.state.selected.size > 0 && this.state.selected.size >= this.state.repository.size) ?
      'x' : 'check';
    const tooltip = (this.state.selected.size > 0 && this.state.selected.size >= this.state.repository.size) ?
      'Clear selection' : 'Select all';
    this.checkButton.setAttribute('data-balloon', tooltip);
    this.checkButton.innerHTML = `<i data-feather="${icon}"></i>`;
    feather.replace();
  }

  private toggleCheckBoxes() {
    const checkboxes = Array.from(document.getElementsByClassName('data-checkbox')) as HTMLInputElement[];
    checkboxes.forEach(checkbox => checkbox.checked = this.state.selected.has(checkbox.dataset.key));
  }
}

export default DataRepoComponent;
