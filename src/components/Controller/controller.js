export default class Controller {
  constructor(model, view) {
    this._model = model;
    this._view = view;
    
    this._view.attachCallback("create", this.createItem.bind(this));
    this._view.attachCallback("edit", this.editItem.bind(this));
    this._view.attachCallback("delete", this.deleteItem.bind(this));

    this._model.forcedRefresh(); // чтобы list отобразился во View
  }

  createItem(category, date, itemData) {
    this._model.createItem(category, date, itemData);
  }

  editItem(uuid, newData) {
    this._model.editItem(uuid, newData);
  }

  deleteItem(uuid) {
    //alert(`delete `)
    this._model.deleteItem(uuid);
  }
}
