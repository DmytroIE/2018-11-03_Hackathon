import Chart from 'chart.js';
import { formDateString } from '../../../utils/date';

const expensesRecordTemplate = require('./expensesRecordTemplate.hbs');

export default class ExpensesSection {
  constructor(root, props) {
    this.props = props;

    this.inputName = root.querySelector('input[data-id="name"]');
    this.inputAmount = root.querySelector('input[data-id="amount"]');
    this.inputPurpose = root.querySelector('select[data-id="purpose"]');
    this.inputPeriodicity = root.querySelector(
      'select[data-id="periodicity"]',
    );

    this.listOfRecords = root.querySelector('ul[data-id="list"]');
    this.listOfRecords.addEventListener('click', this.handleDelete.bind(this));
    this.listOfRecords.addEventListener('click', this.handleEdit.bind(this));
    this.listOfRecords.addEventListener(
      'click',
      this.handleConfirm.bind(this),
    );
    this.listOfRecords.addEventListener('click', this.handleCancel.bind(this));

    this.form = root.querySelector('form[data-id="form"]');
    this.form.addEventListener('submit', this.handleCreate.bind(this));

    this.total = root.querySelector('p[data-id="total"]');

    this.calendar = root.querySelector('input[data-id="calendar"]');

    this.calendar.value = formDateString('-', -1);
    this.calendar.addEventListener('input', this.render.bind(this));

    this.editModeEnabled = false;

    this.items = []; // локальная копия данных для отображения, т.е. для функции Render
    // Render может вызываться как извне, с аргументом, так и изнутри, по событию календаря.
    // Вот в этом втором случае используется внутренняя копия

    this.chartData = {
      labels: [],
      datasets: [
        {
          label: 'Expenses',
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)',
          ],
          data: [],
        },
      ],
    };

    this.chartOptions = {
      legend: { display: false },
      title: {
        display: false,
        // text: 'Populations of Africa'
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    };

    this.expenseChart = new Chart(
      root.querySelector('canvas[data-id="chart"]').getContext('2d'),
      {
        type: 'bar',
        data: this.chartData,
        options: this.chartOptions,
      },
    );
  }

  render(items) {
    if (Array.isArray(items)) {
      // хранить данные в объекте на случай, если понадобится обновить
      // по событию календаря, который вызывает render, передавая аргументом
      // событие (см. стр. 34)
      this.items = items;
    }
    // Делаем массив записей только на соответствующую дату
    // чтобы не добавлялись записи, например, на 31е ноября
    const onlyForThisDate = this.items.filter(
      item => this.calendar.value && item.date.includes(this.calendar.value),
    );

    // Создаем разметку
    if (onlyForThisDate.length > 0) {
      const markup = onlyForThisDate.reduce(
        (acc, curr) => acc + expensesRecordTemplate(curr),
        '',
      );
      this.listOfRecords.innerHTML = markup;
    } else {
      this.listOfRecords.innerHTML =
        '<li class="exp-item">Добавьте свои расходы здесь</li>';
    }
    // обнуляем предварительно общую сумму расходов
    let totalAmount = 0;

    // рисуем диаграмму

    // делаем временный объект, и в нем поля, соответствующие цели расходов
    const tempObj = {};

    onlyForThisDate.reduce((acc, curr) => {
      if (!acc[curr.data.purpose]) {
        acc[curr.data.purpose] = 0;
      }
      acc[curr.data.purpose] += +curr.data.amount;
      totalAmount += +curr.data.amount;
      return acc;
    }, tempObj);

    // заполняем диаграму
    this.chartData.labels = Object.keys(tempObj);
    this.chartData.datasets[0].data = Object.values(tempObj);
    this.expenseChart.update();

    this.total.textContent = `Общая сумма: ${totalAmount}`;
  }

  handleEdit(event) {
    if (!event.target.matches('div[data-id="edit"]')) {
      return;
    }

    if (this.editModeEnabled) {
      return;
    }

    const nameInput = event.target.parentElement.querySelector(
      'input[data-id="edit-name"]',
    );
    const amountInput = event.target.parentElement.querySelector(
      'input[data-id="edit-amount"]',
    );
    const purposeInput = event.target.parentElement.querySelector(
      'select[data-id="edit-purpose"]',
    );
    const periodicityInput = event.target.parentElement.querySelector(
      'select[data-id="edit-periodicity"]',
    );

    // Запоминаем данные, которые были до редактирования на случай cancel
    this.reservedName = nameInput.value;
    this.reservedAmount = amountInput.value;
    this.reservedPurposeIdx = purposeInput.selectedIndex;
    this.reservedPeriodicityIdx = periodicityInput.selectedIndex;

    // Изменяем интерфейс
    this.editModeEnabled = true;
    event.target.parentElement.classList.add('exp-item--edited');

    // Прячем кнопки "Редактировать" и "Удалить"
    // показываем "применить изменения" и "отмена"
    const buttons = [
      ...event.target.parentElement.querySelectorAll('.item-button'),
    ];
    buttons.forEach(button => button.classList.toggle('item-button--hidden'));

    // делаем поля ввода доступными для изменения
    nameInput.removeAttribute('disabled', ' ');
    amountInput.removeAttribute('disabled', ' ');
    purposeInput.removeAttribute('disabled', ' ');
    periodicityInput.removeAttribute('disabled', ' ');
  }

  handleConfirm(event) {
    if (!event.target.matches('div[data-id="confirm"]')) {
      return;
    }

    // получаем данные из inputs
    const name = event.target.parentElement.querySelector(
      'input[data-id="edit-name"]',
    ).value;
    const amount = +event.target.parentElement.querySelector(
      'input[data-id="edit-amount"]',
    ).value;

    const inputPurpose = event.target.parentElement.querySelector(
      'select[data-id="edit-purpose"]',
    );
    const purpose = inputPurpose.options[inputPurpose.selectedIndex].text;
    const inputPeriodicity = event.target.parentElement.querySelector(
      'select[data-id="edit-periodicity"]',
    );
    const periodicity = inputPeriodicity.options[inputPeriodicity.selectedIndex].text;

    // проверяем данные
    if (!name.trim() || amount <= 0) {
      alert('Некорректные данные');
      return;
    }

    // формируем объект для передачи в Model
    const newData = {
      name,
      amount,
      purpose,
      periodicity,
    };

    this.props.editCb(event.target.parentElement.dataset.uuid, newData);
    this.editModeEnabled = false;
  }

  handleCancel(event) {
    if (!event.target.matches('div[data-id="cancel"]')) {
      return;
    }

    // Возвращаем в инпуты значения, которые были до редактирования
    const nameInput = event.target.parentElement.querySelector(
      'input[data-id="edit-name"]',
    );
    const amountInput = event.target.parentElement.querySelector(
      'input[data-id="edit-amount"]',
    );
    const purposeInput = event.target.parentElement.querySelector(
      'select[data-id="edit-purpose"]',
    );
    const periodicityInput = event.target.parentElement.querySelector(
      'select[data-id="edit-periodicity"]',
    );

    nameInput.value = this.reservedName;
    amountInput.value = this.reservedAmount;
    purposeInput.selectedIndex = this.reservedPurposeIdx;
    periodicityInput.selectedIndex = this.reservedPeriodicityIdx;

    // Убираем красную подсветку редактируемой строки
    event.target.parentElement.classList.remove('exp-item--edited');

    // прячем конпки "применить изменения" и "отмена"
    const buttons = [
      ...event.target.parentElement.querySelectorAll('.item-button'),
    ];
    buttons.forEach(button => button.classList.toggle('item-button--hidden'));

    // убираем режим редактирования из inputs
    nameInput.setAttribute('disabled', ' ');
    amountInput.setAttribute('disabled', ' ');
    purposeInput.setAttribute('disabled', ' ');
    periodicityInput.setAttribute('disabled', ' ');

    this.editModeEnabled = false;
  }

  handleDelete(event) {
    if (!event.target.matches('div[data-id="delete"]')) {
      return;
    }
    this.props.deleteCb(event.target.parentElement.dataset.uuid);
  }

  handleCreate(event) {
    event.preventDefault();

    // проверка данных
    if (
      !this.inputName.value.trim()
      || +this.inputAmount.value <= 0
      || +this.inputPurpose.selectedIndex < 1
      || +this.inputPeriodicity.selectedIndex < 1
    ) {
      alert('Некорректные данные');
      return;
    }

    if (!this.calendar.value) {
      // чтобы не добавлялись записи, например, на 31е ноября
      alert('Нет такой даты');
      return;
    }

    // формируем объект для передачи в Model
    const data = {
      name: this.inputName.value,
      amount: this.inputAmount.value,
      purpose: this.inputPurpose.options[
        this.inputPurpose.selectedIndex
      ].text,
      periodicity: this.inputPeriodicity.options[
        this.inputPeriodicity.selectedIndex
      ].text,
    };

    this.props.createCb('expenses', this.calendar.value, data);

    this.form.reset();
  }
}
