const expensesRecordTemplate = require("./expensesRecordTemplate.hbs");
import Chart from 'chart.js';

export default class ExpensesSection {
  constructor(root, props) {
    
    this._props = props;

//    document.getElementById('expenses-create').addEventListener('click', )
//    document.getElementById('expenses-list').addEventListener('click', );
//    document.getElementById('expenses-list').addEventListener('click', this.handleDelete.this);

      this._inputName = root.querySelector('input[data-id="name"]');
      this._inputAmount = root.querySelector('input[data-id="amount"]');
      this._inputPurpose = root.querySelector('select[data-id="purpose"]');
      this._inputPeriodicity = root.querySelector('select[data-id="periodicity"]');

      this._listOfRecords = root.querySelector('ul[data-id="list"]');
      this._listOfRecords.addEventListener('click', this.handleDelete.bind(this));
      this._listOfRecords.addEventListener('click', this.handleEdit.bind(this));

      this._createButton = root.querySelector('button[data-id="create"]');
      this._createButton.addEventListener('click', this.handleCreate.bind(this));

      this._calendar = root.querySelector('input[data-id="calendar"]');
      const date = new Date();
      let strDate = date.getFullYear() + 
      '-' +
      (date.getMonth() < 10 ? '0' + date.getMonth(): date.getMonth()) +
      '-' +
      (date.getDate() < 10 ? '0' + date.getDate(): date.getDate());
      this._calendar.value = strDate;
      this._calendar.addEventListener('input', ()=>{this.render()});


      this._items = []; // локальная копия данных для отображения, т.е. функция Render 
                        // может вызываться как извне, с арнументом, так и изнутри, по событию календаря.
                        // Вот в этом втором случае используется внутренняя копия

      this._chartData = {
        labels: [],
        datasets: [
          {
            label: "Expenses",
            backgroundColor: [                
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)',
                    'rgb(255, 159, 64)',
                ],
            data: []
          }
        ]
      };

      console.log(root.querySelector('canvas[data-id="chart"]').getContext("2d"));
    
      this._expenseChart = new Chart(root.querySelector('canvas[data-id="chart"]').getContext("2d"), {
      type: 'bar',
      data: this._chartData,
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Predicted world population (millions) in 2050'
        }
      }
    });
      

  }

  render(items) {
    // console.log('render in expenses');
    if(items) {
      this._items = items; // хранить данные в объекте на случай, если понадобится обновить по событию календаря, а не извне
    }
    
    const onlyForThisDate = this._items.filter(item => item.date.includes(this._calendar.value));


    // if(this._items.length > 0) {
    //   const markup = this._items.reduce( (acc, curr) => acc + expensesRecordTemplate(curr),'')
    //   this._listOfRecords.innerHTML = markup;
    // } else {
    //   this._listOfRecords.innerHTML = '<li >There are no records here yet</li>';
    // }

    if(onlyForThisDate.length > 0) {
      const markup = onlyForThisDate.reduce( (acc, curr) => acc + expensesRecordTemplate(curr),'')
      this._listOfRecords.innerHTML = markup;
    } else {
      this._listOfRecords.innerHTML = '<li >There are no records here yet</li>';
    }
  }

  handleEdit(event) {

    if (!event.target.matches('div[data-id="edit"]')) {
      return;
    }
    //this._props.editCb(event.target.parentElement.dataset.uuid, );
  }

  handleDelete(event) {

    if (!event.target.matches('div[data-id="delete"]')) {
      return;
    }
    this._props.deleteCb(event.target.parentElement.dataset.uuid);
  }

  handleCreate(event) {

    event.stopPropagation();

    if (!this._inputName.value.trim() ||
        !this._inputAmount.value.trim() || 
        +this._inputAmount.value < 0 ||
        +this._inputPurpose.value < 1 ||
        +this._inputPeriodicity.value < 1 ) {
          alert('Некорректные данные');
          return;
        }

    const data = {
      name: this._inputName.value,
      amount: this._inputAmount.value,
      purpose: this._inputPurpose.options[this._inputPurpose.value].text,
      periodicity: this._inputPeriodicity.options[this._inputPeriodicity.value].text,
    }

    this._props.createCb('expenses', this._calendar.value, data);
  }
}