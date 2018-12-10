export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.attachCallback('create', this.createItem.bind(this));
    this.view.attachCallback('edit', this.editItem.bind(this));
    this.view.attachCallback('delete', this.deleteItem.bind(this));

    this.model.forcedRefresh(); // чтобы list отобразился во View
  }

  createItem(category, date, itemData) {
    this.model.createItem(category, date, itemData);
  }

  editItem(uuid, newData) {
    this.model.editItem(uuid, newData);
  }

  deleteItem(uuid) {
    this.model.deleteItem(uuid);
  }
}
