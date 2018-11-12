
const expensesRecordTemplate = require("./expensesRecordTemplate.hbs");
import Chart from 'chart.js';
import { formDateString } from '../../../utils/date'

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
      this._listOfRecords.addEventListener('click', this.handleConfirm.bind(this));
      this._listOfRecords.addEventListener('click', this.handleCancel.bind(this));

      this._form = root.querySelector('form[data-id="form"]');
      this._form.addEventListener('submit', this.handleCreate.bind(this));

      this._total = root.querySelector('p[data-id="total"]');

      this._calendar = root.querySelector('input[data-id="calendar"]');
      // const date = new Date();
      // let strDate = date.getFullYear() + 
      // '-' +
      // (date.getMonth() < 9 ? '0' + date.getMonth() + 1: date.getMonth() + 1) +
      // '-' +
      // (date.getDate() < 10 ? '0' + date.getDate(): date.getDate());
      this._calendar.value = /*strDate*/formDateString('-', -1);
      this._calendar.addEventListener('input', ()=>{this.render()});

      this._editModeEnabled = false;


      this._items = []; // локальная копия данных для отображения, т.е. функция Render 
                        // может вызываться как извне, с аргументом, так и изнутри, по событию календаря.
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
    //debugger
    if (!event.target.matches('div[data-id="edit"]')) {
      return;
    }

    if (this._editModeEnabled) {
      return;
    }

    const nameInput = event.target.parentElement.querySelector('input[data-id="edit-name"]');
    const amountInput = event.target.parentElement.querySelector('input[data-id="edit-amount"]');
    const purposeInput = event.target.parentElement.querySelector('select[data-id="edit-purpose"]');
    const periodicityInput = event.target.parentElement.querySelector('select[data-id="edit-periodicity"]');
 
    // Запоминаем данные, которые были до редактирования на случай cancel
    this._reservedName = nameInput.value;
    this._reservedAmount = amountInput.value;
    this._reservedPurposeIdx = purposeInput.selectedIndex;
    this._reservedPeriodicityIdx = periodicityInput.selectedIndex;

    // Изменяем интерфейс
    this._editModeEnabled = true;

    event.target.parentElement.classList.add('exp-item--edited');
    // Сделать функцией!!!!!!!!
    const buttons = [...event.target.parentElement.querySelectorAll('.item-button')];
    buttons.forEach(button=>button.classList.toggle('item-button--hidden'));
    // Сделать функцией!!!!!!!!
    // не работает на айфонe
    //const inputs = [...event.target.parentElement.querySelector('form').children];
    //inputs.forEach(child=>/*child.removeAttribute('disabled')*/child.disabled=false);

    nameInput.removeAttribute('disabled');
    amountInput.removeAttribute('disabled');
    purposeInput.removeAttribute('disabled');
    periodicityInput.removeAttribute('disabled');
  }

  handleConfirm(event) {
    //debugger
    if (!event.target.matches('div[data-id="confirm"]')) { 
      return;
    }

    const name = event.target.parentElement.querySelector('input[data-id="edit-name"]').value;
    const amount = +event.target.parentElement.querySelector('input[data-id="edit-amount"]').value;
 
    const inputPurpose = event.target.parentElement.querySelector('select[data-id="edit-purpose"]');
    const purpose = inputPurpose.options[inputPurpose.selectedIndex].text;
    const inputPeriodicity = event.target.parentElement.querySelector('select[data-id="edit-periodicity"]');
    const periodicity = inputPeriodicity.options[inputPeriodicity.selectedIndex].text;

    if (!name.trim() ||
      amount <= 0 ) {
      alert('Некорректные данные');
      return;
    }
 


    const newData = {
      name,
      amount,
      purpose,
      periodicity,
    }

    this._props.editCb(event.target.parentElement.dataset.uuid, newData);

    //event.target.parentElement.classList.remove('exp-item--edited');
    // Сделать функцией!!!!!!!!
    //const buttons = [...event.target.parentElement.querySelectorAll('.item-button')];
    //buttons.forEach(button=>button.classList.toggle('item-button--hidden'));
    
    // Сделать функцией!!!!!!!!
    //const inputs = [...event.target.parentElement.querySelector('div').children];
    //inputs.forEach(child=>child.setAttribute('disabled', true));

    this._editModeEnabled = false;
  }

  handleCancel(event) {
    //debugger
    if (!event.target.matches('div[data-id="cancel"]')) { 
      return;
    }
    // Возвращаем в инпуты значения, которые были до редактирования

    const nameInput = event.target.parentElement.querySelector('input[data-id="edit-name"]');
    const amountInput = event.target.parentElement.querySelector('input[data-id="edit-amount"]');
    const purposeInput = event.target.parentElement.querySelector('select[data-id="edit-purpose"]');
    const periodicityInput = event.target.parentElement.querySelector('select[data-id="edit-periodicity"]');

    nameInput.value = this._reservedName;
    amountInput.value = this._reservedAmount;
    purposeInput.selectedIndex = this._reservedPurposeIdx;
    periodicityInput.selectedIndex = this._reservedPeriodicityIdx;


    event.target.parentElement.classList.remove('exp-item--edited');
    // Сделать функцией!!!!!!!!
    const buttons = [...event.target.parentElement.querySelectorAll('.item-button')];
    buttons.forEach(button=>button.classList.toggle('item-button--hidden'));

    //const inputs = [...event.target.parentElement.querySelector('form').children];
    //inputs.forEach(child=>/*child.setAttribute('disabled', true)*/child.disabled=true);

    nameInput.setAttribute('disabled');
    amountInput.setAttribute('disabled');
    purposeInput.setAttribute('disabled');
    periodicityInput.setAttribute('disabled');

    this._editModeEnabled = false;
  }

  handleDelete(event) {
    //debugger
    if (!event.target.matches('div[data-id="delete"]')) {
      return;
    }
    this._props.deleteCb(event.target.parentElement.dataset.uuid);
  }

  handleCreate(event) {
 
    event.preventDefault();

    if (!this._inputName.value.trim() ||
        +this._inputAmount.value <= 0 ||
        +this._inputPurpose.selectedIndex < 1 ||
        +this._inputPeriodicity.selectedIndex < 1 ) {
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
      purpose: this._inputPurpose.options[this._inputPurpose.selectedIndex/*value*/].text,
      periodicity: this._inputPeriodicity.options[this._inputPeriodicity.selectedIndex/*value*/].text,
    }

    this._props.createCb('expenses', this._calendar.value, data);

    this._form.reset();
  }

}