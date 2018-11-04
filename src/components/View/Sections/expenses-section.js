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

      this._form = root.querySelector('form[data-id="form"]');
      this._form.addEventListener('submit', this.handleCreate.bind(this));

      this._total = root.querySelector('p[data-id="total"]');

      this._calendar = root.querySelector('input[data-id="calendar"]');
      const date = new Date();
      let strDate = date.getFullYear() + 
      '-' +
      (date.getMonth() < 9 ? '0' + date.getMonth() + 1: date.getMonth() + 1) +
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

      this._chartOptions = {
        legend: { display: false },
        title: {
          display: false,
          //text: 'Populations of Africa'
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      };
    
      this._expenseChart = new Chart(root.querySelector('canvas[data-id="chart"]').getContext("2d"), {
      type: 'bar',
      data: this._chartData,
      options: this._chartOptions,
    });
      

  }

  render(items) {
  //  debugger
    if(items) {
      this._items = items; // хранить данные в объекте на случай, если понадобится обновить по событию календаря, а не извне
    }
    //Делаем массив записей только на соответствующую дату
    const onlyForThisDate = this._items.filter(item => { //чтобы не добавлялись записи, например, на 31е ноября
      if (this._calendar.value) {return item.date.includes(this._calendar.value);}
    });

    
    //---------MARKUP---------
    if(onlyForThisDate.length > 0) {
      const markup = onlyForThisDate.reduce( (acc, curr) => acc + expensesRecordTemplate(curr),'')
      this._listOfRecords.innerHTML = markup;
    } else {
      this._listOfRecords.innerHTML = '<li class="exp-item">Добавьте свои расходы здесь</li>';
    }
    //--------TOTAL----------
    let totalAmount = 0; 
    

    //--------CHART-----------
    const tempObj = {};

    onlyForThisDate.reduce(
      (acc, curr) => {
        if (!acc[curr.data.purpose]) {
            acc[curr.data.purpose] = 0;
        }
      acc[curr.data.purpose] += +curr.data.amount;
      totalAmount += +curr.data.amount;
      return acc;
      },
      tempObj
    )
    this._chartData.labels = Object.keys(tempObj);
    this._chartData.datasets[0].data = Object.values(tempObj);
    this._expenseChart.update();
    
    this._total.textContent = `Общая сумма: ${totalAmount}`;
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
 
    event.preventDefault();

    if (!this._inputName.value.trim() ||
        !this._inputAmount.value.trim() || 
        +this._inputAmount.value < 0 ||
        +this._inputPurpose.value < 1 ||
        +this._inputPeriodicity.value < 1 ) {
          alert('Некорректные данные');
          return;
        }
    if (!this._calendar.value) { //чтобы не добавлялись записи, например, на 31е ноября
      alert('Нет такой даты');
      return;
    }
    
    const data = {
      name: this._inputName.value,
      amount: this._inputAmount.value,
      purpose: this._inputPurpose.options[this._inputPurpose.value].text,
      periodicity: this._inputPeriodicity.options[this._inputPeriodicity.value].text,
    }

    this._props.createCb('expenses', this._calendar.value, data);

    this._form.reset();
  }
}