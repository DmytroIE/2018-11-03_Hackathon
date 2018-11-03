import Model from './components/Model/model';
import View from './components/View/view';
import Controller from './components/Controller/controller';


import styles from './styles.scss';
import logo from './img/logo.png';


const model = new Model();

const view = new View(model);

new Controller(model, view);

