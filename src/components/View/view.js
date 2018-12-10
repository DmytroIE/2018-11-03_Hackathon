import EventEmitter from '../EventEmmiter/eventEmmiter';

import IncomeSection from './Sections/Income/income-section';
import ExpensesSection from './Sections/Expenses/expenses-section';

const numberOfActiveSectionAtStartUp = 1;

export default class View extends EventEmitter {
  constructor(model) {
    super();

    this.sections = [
      {
        tab: document.getElementById('income-tab'),
        HTMLEl: document.getElementById('income-section'),
        item: new IncomeSection(document.getElementById('income-section'), {
          createCb: this.handleCreate.bind(this),
          editCb: this.handleEdit.bind(this),
          deleteCb: this.handleDelete.bind(this),
        }),
      },
      {
        tab: document.getElementById('expenses-tab'),
        HTMLEl: document.getElementById('expenses-section'),
        item: new ExpensesSection(document.getElementById('expenses-section'), {
          createCb: this.handleCreate.bind(this),
          editCb: this.handleEdit.bind(this),
          deleteCb: this.handleDelete.bind(this),
        }),
      },
      {
        tab: document.getElementById('goals-tab'),
        HTMLEl: document.getElementById('goals-section'),
        item: null,
      },
      {
        tab: document.getElementById('charts-tab'),
        HTMLEl: document.getElementById('charts-section'),
        item: null,
      },
      {
        tab: document.getElementById('settings-tab'),
        HTMLEl: document.getElementById('settings-section'),
        item: null,
      },
    ];
    this.activeSection = numberOfActiveSectionAtStartUp;

    this.setActiveSection(this.activeSection);

    this.model = model;
    // Подписка на события модели
    this.model.attachCallback('data_changed', this.render.bind(this));

    // обработчики DOM-событий
    document
      .getElementById('tabs')
      .addEventListener('click', this.handleTabs.bind(this));
  }

  handleTabs(event) {
    event.preventDefault();
    if (!event.target.matches('a[id$="tab"]')) {
      return;
    }
    const numberOfSelectedSection = +event.target.dataset.index;
    if (this.activeSection === numberOfSelectedSection) {
      return;
    }
    this.activeSection = numberOfSelectedSection;
    this.setActiveSection(this.activeSection);
  }

  handleCreate(category, date, itemData) {
    this.emitEvent('create', category, date, itemData);
  }

  handleEdit(uuid, newData) {
    this.emitEvent('edit', uuid, newData);
  }

  handleDelete(uuid) {
    this.emitEvent('delete', uuid);
  }

  render(listOfRecords) {
    const sortedByCategories = {};
    listOfRecords.forEach((record) => {
      if (!sortedByCategories[record.category]) {
        sortedByCategories[record.category] = [];
      }
      sortedByCategories[record.category].push(record);
    });

    this.sections[0].item.render(sortedByCategories['income']);
    this.sections[1].item.render(sortedByCategories['expenses']);
  }

  // ----AUX FUNCTIONS----

  setActiveSection(numberOfActiveSection) {
    this.sections[numberOfActiveSection].HTMLEl.classList.remove(
      'section--hidden',
    );
    this.sections[numberOfActiveSection].tab.classList.add('nav__link--active');

    this.sections.forEach((section, idx) => {
      if (idx !== numberOfActiveSection) {
        section.HTMLEl.classList.add('section--hidden');
        section.tab.classList.remove('nav__link--active');
      }
    });
  }
}
