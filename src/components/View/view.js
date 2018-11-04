import EventEmitter from '../EventEmmiter/eventEmmiter';

import ExpensesSection from './Sections/expenses-section';



const numberOfActiveSectionAtStartUp = 1;


export default class View extends EventEmitter {
  constructor(model) {
    super();

    this._sections = [
      {
        tab: document.getElementById('income-tab'),
        HTMLEl: document.getElementById('income-section'),
        item: null
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
      item: null
    },
    {
      tab: document.getElementById('charts-tab'),
      HTMLEl: document.getElementById('charts-section'),
      item: null
    },
    {
      tab: document.getElementById('settings-tab'),
      HTMLEl: document.getElementById('settings-section'),
      item: null
    },
  ];
    this._activeSection = numberOfActiveSectionAtStartUp;
  
    this.setActiveSection(this._activeSection);

    this._model = model;
    //----MODEL EVENTS----
    this._model.attachCallback('data_changed', this.render.bind(this));

    //----EVENTS----
    document.getElementById('tabs').addEventListener('click', this.handleTabs.bind(this));


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

  handleCreate(category, date, itemData) {
    this.emitEvent('create', category, date, itemData); 
  }

  handleEdit(uuid, newData) {
    this.emitEvent('edit', uuid, ); 
  }

  handleDelete(uuid) {

    this.emitEvent('delete', uuid);    
  }

  render(listOfRecords) {
    console.log('render in view');
    const sortedByCategories = {};
    listOfRecords.forEach(record => {
      if(!sortedByCategories[record.category]) {
        sortedByCategories[record.category] = [];
      }
      sortedByCategories[record.category].push(record);
    })

    this._sections[1].item.render(sortedByCategories['expenses'] || []);
  }

  //----AUX FUNCTIONS----

  setActiveSection(numberOfActiveSection) {

    this._sections[numberOfActiveSection].HTMLEl.classList.remove('section--hidden');
    this._sections[numberOfActiveSection].tab.classList.add('nav__item--active');

    this._sections.forEach((section, idx) => {
      if (idx !== numberOfActiveSection) {
        section.HTMLEl.classList.add('section--hidden');
        section.tab.classList.remove('nav__item--active');
      }
    });
  }

   
    


}