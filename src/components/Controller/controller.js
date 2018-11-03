export default class Controller {
  constructor(model, view) {
    this._model = model;
    this._view = view;

    this._view.attachCallback("create", this.createItem.bind(this));
    this._view.attachCallback("change", this.changeItem.bind(this));
    this._view.attachCallback("delete", this.deleteItem.bind(this));

    this._model.forcedRefresh(); // чтобы list отобразился во View
  }

  createItem(category, date, itemData) {
    this._model.createItem(category, date, itemData);
  }

  changeItem(uuid, newItemData) {
    this._model.changeItem(uuid, newItemData);
  }

  deleteItem(uuid) {
    this._model.deleteItem(uuid);
  }
}
