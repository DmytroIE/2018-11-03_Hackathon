import EventEmitter from '../EventEmmiter/eventEmmiter';
const expensesRecordTemplate = require("./expensesRecordTemplate.hbs");




const numberOfActiveSectionAtStartUp = 1;


export default class View extends EventEmitter {
  constructor(model) {
    super();

    this._model = model;
    this._sections = document.querySelectorAll('section[id$="section"]');
    this._tabs = document.querySelectorAll('a[id$="tab"]');
    this._activeSection = numberOfActiveSectionAtStartUp;
  
    this.setActiveSection(this._activeSection);

    //----MODEL EVENTS----
    this._model.attachCallback('data_changed', this.render.bind(this));

    //----EVENTS----
    document.getElementById('tabs').addEventListener('click', this.handleTabs.bind(this));
    document.getElementById('expenses-list').addEventListener('click', this.handleEdit.bind(this));
    document.getElementById('expenses-list').addEventListener('click', this.handleDelete.bind(this));

  }



  handleTabs(event) {
    event.preventDefault();
    if (!event.target.matches('a[id$="tab"]')) {
      return;
    }
    const numberOfSelectedSection = + event.target.dataset.index;
    if (this._activeSection === numberOfSelectedSection) {
      return;
    }
    this._activeSection = numberOfSelectedSection;
    this.setActiveSection(this._activeSection);
  }

  handleCreate() {
    
  }

  handleEdit(event) {
    if (!event.target.matches('div[id$="edit"]')) {
      return;
    }


  }

  handleDelete(event) {
    if (!event.target.matches('div[id$="delete"]')) {
      return;
    }
    this.emitEvent('delete', event.target.parentElement.dataset.uuid);    
  }

  render(listOfRecords) {
    const sortedByCategories = {};
    listOfRecords.forEach(record => {
      if(!sortedByCategories[record.category]) {
        sortedByCategories[record.category] = [];
      }
      sortedByCategories[record.category] = record;
    })


  }

  //----AUX FUNCTIONS----

  setActiveSection(numberOfActiveSection) {
    
    this._sections[numberOfActiveSection].classList.remove('section--hidden');
    this._sections.forEach((section, idx) => {
      if (idx !== numberOfActiveSection) {
        section.classList.add('section--hidden');
      }
    });

    this._tabs[numberOfActiveSection].classList.add('nav__item--active');
    this._tabs.forEach((tab, idx) => {
      if (idx !== numberOfActiveSection) {
        tab.classList.remove('nav__item--active');
      }
    });

  }
}