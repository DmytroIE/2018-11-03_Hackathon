import Model from './components/Model/model';
import View from './components/View/view';
import Controller from './components/Controller/controller';

import './styles.scss';


const model = new Model();

const view = new View(model);

new Controller(model, view);
// const d = new Date('11 oct 2018'); debugger
// model.createItem('expenses', d.toString, {
//   name: 'Газ',
//   amount: 1000,
//   category: 'Ком. услуги',
//   type: 'Ежемесячные'}
//   );