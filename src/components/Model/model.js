import EventEmitter from '../EventEmmiter/eventEmmiter';
import {storageAvailable} from '../../utils/local_storage';
import {defaultData} from './defaultData'

const uuidv1 = require('uuid/v1');


export default class Model extends EventEmitter {
  constructor() {
    super();

  }



}

console.log(uuidv1());