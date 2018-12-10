import Model from './components/Model/model';
import View from './components/View/view';
import Controller from './components/Controller/controller';

import styles from './styles.scss';
import logo from './img/logo.png';

// Общие обработчики событий
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('tabs');


function handleHamburgerClick(evt) {
  evt.stopPropagation();
  navList.classList.toggle('nav__list--visible');
}

hamburger.addEventListener('click', handleHamburgerClick);

document.body.addEventListener('click', ({ target }) => {
  if (!target.matches('#tabs *') && !target.matches('#tabs')) {
    console.log(target);
    navList.classList.remove('nav__list--visible');
  }
});

// Создание MCV
const model = new Model();

const view = new View(model);

new Controller(model, view);