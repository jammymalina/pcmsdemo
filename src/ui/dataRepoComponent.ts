import Component from './component';
import DataRepository from '../dataRepository';
import uuid from 'uuid/v4';

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
    const icon = (this.state.selected.size > 0 && this.state.selected.size >= this.state.repository.size) ? 
      'x' : 'check';
    this.checkButton.innerHTML = `<i data-feather="${icon}"></i>`;
  }

  private async settingsButtonClick() {

  }

  private async refreshButtonClick() {
    await this.state.repository.refresh();
    await this.render();
  }

  private async removeButtonClick() {

  }

  private async checkButtonClick() {

  }

  private selectCheckboxChange(event: Event) {
    const checkBox = event.target as HTMLInputElement;
    const key = checkBox.dataset.key;
    if (checkBox.checked) {
      this.state.selected.add(key);
    } else {
      this.state.selected.delete(key);
    }
    this.onSelectChange();
  }

  private onSelectChange() {
    this.render();
  }

  private refreshDataTable() {
    this.clearDataTable();
    const dataKeys = new Set<string>(this.state.repository.dataKeys);
    dataKeys.delete(this.state.repository.primaryKey);

    const tHead = document.createElement('thead');
    const orderedKeys = Array.from(dataKeys);
    const thHTML = orderedKeys.map(x => `<th scope="col">${x}</th>`).join('\n');
    tHead.innerHTML = `
      <thead>
        <tr>
          <th scope="col">${this.state.repository.primaryKey}</th>
          ${thHTML}
        </tr>
      </thead>
    `;

    const tBody = document.createElement('tbody');
    const data = this.state.repository.data;
    const tbodyChildren: Array<HTMLTableRowElement> = data.map((item: any) => {
      const primaryKey = Object.prototype.hasOwnProperty.call(item, this.state.repository.primaryKey) ?
        item[this.state.repository.primaryKey] : '';

      const tr = document.createElement('tr');
      tr.setAttribute('id', primaryKey);
      tr.classList.add(this.state.repository.tableName);

      const primaryKeyTH = document.createElement('th');
      primaryKeyTH.setAttribute('scope', 'row');

      const formContainer = document.createElement('div');
      formContainer.classList.add('form-check', 'form-check-inline');

      const checkBoxId = uuid();

      const checkBox = document.createElement('input');
      checkBox.setAttribute('type', 'checkbox');
      checkBox.setAttribute('id', checkBoxId);
      checkBox.setAttribute('data-key', primaryKey);
      checkBox.classList.add('form-check-input');
      checkBox.style.display = 'none';
      if (this.state.selected.has(primaryKey)) {
        checkBox.checked = true;
      }
      checkBox.addEventListener('change', this.selectCheckboxChange.bind(this));
      
      const label = document.createElement('label');
      label.setAttribute('for', checkBoxId);
      label.classList.add('form-check-label');
      label.innerHTML = primaryKey;
      
      formContainer.appendChild(checkBox);
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
    
    this.settingsButton = this.createButton('settings', this.settingsButtonClick.bind(this));
    this.refreshButton = this.createButton('refresh-ccw', this.refreshButtonClick.bind(this));
    this.removeButton = this.createButton('trash-2', this.removeButtonClick.bind(this));
    this.checkButton = this.createButton('check', this.checkButtonClick.bind(this));

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

  private createButton(icon: string, clickEventCallback: EventListener) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary');
    button.innerHTML = `<i data-feather="${icon}"></i>`;
    button.addEventListener('click', clickEventCallback);
    return button;
  }

  private highlightTableRows() {
    Array.from(document.getElementsByClassName(this.state.repository.tableName)).forEach(tr => tr.classList.remove('table-active'));
    Array.from(this.state.selected).forEach((id: string) => document.getElementById(id).classList.add('table-active'));
  }
}

export default DataRepoComponent;
