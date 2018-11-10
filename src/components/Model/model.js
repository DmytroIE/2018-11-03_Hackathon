import EventEmitter from "../EventEmmiter/eventEmmiter";
import { storageAvailable } from "../../utils/local_storage";
import { defaultData } from "./defaultData";

const uuidv1 = require("uuid/v1");

export default class Model extends EventEmitter {
  constructor() {
    super();

    this._data = [];
    this._theLargestIndexOfLinks = 0;
    this._keyPrefix = "fincalc_";

    // если какие-то записи именно нашей программы есть в local storage, достаем оттуда
    if (storageAvailable("localStorage")) {
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).includes(this._keyPrefix)) {
          const item = JSON.parse(localStorage.getItem(localStorage.key(i)));
          this._data.push(item);

          this._theLargestIndexOfLinks = Math.max(
            this._theLargestIndexOfLinks,
            item.index
          );
        }
      }
    }

    this._data.sort((a, b) => a.index - b.index);

    window.addEventListener("storage", this.handleManualLsClear.bind(this));
  }

  createItem(category, date, itemData) {

    const newRecord = {
      uuid: this._keyPrefix + uuidv1(),
      category,
      date,
      data: itemData,
    };

    this._data.push(newRecord);

    if (storageAvailable('localStorage')) {
      this._theLargestIndexOfLinks += 1;
      newRecord.index = this._theLargestIndexOfLinks;
      localStorage.setItem(newRecord.uuid, JSON.stringify(newRecord));
    } 

    this.emitEvent("data_changed", this._data);
  }

  editItem(uuidOfEditedItem, newData) {
    const changedItem = this._data.find(item => item.uuid.includes(uuidOfEditedItem));
    if(!changedItem) {
      return;
    }

    changedItem.data = newData;
    if (storageAvailable("localStorage")) {
      localStorage.removeItem(uuidOfEditedItem);
      localStorage.setItem(changedItem.uuid, JSON.stringify(changedItem));
    }
    this.emitEvent("data_changed", this._data);
  }

  deleteItem(uuidOfDelItem) {
    this._data = this._data.filter(item => item.uuid !== uuidOfDelItem);

    if (storageAvailable("localStorage")) {
      localStorage.removeItem(uuidOfDelItem);
    }
    this.emitEvent("data_changed", this._data);
  }

  forcedRefresh() {
    // для принудительного обновления view извне через эту функцию (при инициализации, например)
    this.emitEvent("data_changed", this._data);
  }

  handleManualLsClear(evt) {
    // при возникновении события функция пробегается по всем оставшимся элементам в LS
    // и сравнивает их со списком this._data
    // для записей из this._data, которых нет в LS, удаляется поле index


    const itemsInLS = []; // временный массив того, что у нас на текущий момент осталось в локальном хранилище
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).includes(this._keyPrefix)) {
        itemsInLS.push(localStorage.key(i));
      }
    }
    this._data.forEach(item => {
      if (!itemsInLS.find(x => x === item.uuid)) {
        delete item.index;
      }
    });
    //this.emitEvent("data_changed", this._data);
  }
}
