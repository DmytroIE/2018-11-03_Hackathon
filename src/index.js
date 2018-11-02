import Model from './components/Model/model';
import View from './components/View/view';
import Controller from './components/Controller/controller';

import './styles.scss';


const model = new Model();

const view = new View(model);

new Controller(model, view);

