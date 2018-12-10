import EventEmitter from '../EventEmmiter/eventEmmiter';
import { storageAvailable } from '../../utils/local_storage';

const uuidv1 = require('uuid/v1');

export default class Model extends EventEmitter {
  constructor() {
    super();

    this.data = [];
    this.theLargestIndexOfLinks = 0;
    this.keyPrefix = 'fincalc_';

    // если какие-то записи именно нашей программы есть в local storage, достаем оттуда
    if (storageAvailable('localStorage')) {
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).includes(this.keyPrefix)) {
          const item = JSON.parse(localStorage.getItem(localStorage.key(i)));
          this.data.push(item);

          this.theLargestIndexOfLinks = Math.max(
            this.theLargestIndexOfLinks,
            item.index,
          );
        }
      }
    }

    this.data.sort((a, b) => a.index - b.index);

    window.addEventListener('storage', this.handleManualLsClear.bind(this));
  }

  createItem(category, date, itemData) {
    const newRecord = {
      uuid: this.keyPrefix + uuidv1(),
      category,
      date,
      data: itemData,
    };

    this.data.push(newRecord);

    if (storageAvailable('localStorage')) {
      this.theLargestIndexOfLinks += 1;
      newRecord.index = this.theLargestIndexOfLinks;
      localStorage.setItem(newRecord.uuid, JSON.stringify(newRecord));
    }

    this.emitEvent('data_changed', this.data);
  }

  editItem(uuidOfEditedItem, newData) {
    const changedItem = this.data.find(item =>
      item.uuid.includes(uuidOfEditedItem),
    );
    if (!changedItem) {
      return;
    }

    changedItem.data = newData;
    if (storageAvailable('localStorage')) {
      localStorage.removeItem(uuidOfEditedItem);
      localStorage.setItem(changedItem.uuid, JSON.stringify(changedItem));
    }
    this.emitEvent('data_changed', this.data);
  }

  deleteItem(uuidOfDelItem) {
    this.data = this.data.filter(item => item.uuid !== uuidOfDelItem);

    if (storageAvailable('localStorage')) {
      localStorage.removeItem(uuidOfDelItem);
    }
    this.emitEvent('data_changed', this.data);
  }

  forcedRefresh() {
    // для принудительного обновления view извне через эту функцию (при инициализации, например)
    this.emitEvent('data_changed', this.data);
  }

  handleManualLsClear() {
    // при возникновении события функция пробегается по всем оставшимся элементам в LS
    // и сравнивает их со списком this.data
    // для записей из this.data, которых нет в LS, удаляется поле index
    // В будущем эта функцияможет понадобиться, чтобы подсвечивать
    // те записи, которые пользователь вручную удалил из LS

    // временный массив того, что у нас на текущий момент осталось в локальном хранилище
    const itemsInLS = [];
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).includes(this.keyPrefix)) {
        itemsInLS.push(localStorage.key(i));
      }
    }
    this.data.forEach((item) => {
      if (!itemsInLS.find(x => x === item.uuid)) {
        delete item.index;
      }
    });
    // this.emitEvent("data_changed", this.data);
  }
}
