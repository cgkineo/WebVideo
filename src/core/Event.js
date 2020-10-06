export default class Event {

  constructor({
    name = '',
    target = null,
    path = [ target ],
    value = null
  } = {}) {
    this.name = name;
    this.target = target;
    this.path = path;
    this.value = value;
  }

}
