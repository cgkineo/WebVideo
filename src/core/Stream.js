import Events from './Events';
import Event from './Event';
import Frame from './Frame';

export default class Stream extends Events {

  static getNextId(name) {
    if (Stream._uid >= Number.MAX_SAFE_INTEGER) Stream._uid = 0;
    Stream._uid = Stream._uid || 0;
    return (name||"")+(Stream._uid++);
  }

  constructor(options) {
    super();
    this.uid = Stream.getNextId(options && options.name),
    this.options = options;
    /** @type {[Stream]} */
    this.destinations = [];
    /** @type {[Stream]} */
    this.sources = [];
    /** @type {[number]} */
    this.sourceLastChanged = [];
    /** @type {Frame} */
    this._frame = null;
    /** @type {HTMLVideoElement} */
    this.element = options.element;
    this.on({
      "pipe": this.addDestination,
      "unpipe": this.removeDestination,
      "drain": this.addSource,
      "undrain": this.removeSource
    });
  }

  set element(value) {
    this._element = value;
    this.frame = new Frame(value);
  }

  /**
   * @type {HTMLVideoElement}
   */
  get element() {
    return this._element;
  }

  set frame(value) {
    this._frame = value;
  }

  /**
   * @type {Frame}
   */
  get frame() {
    return this._frame;
  }

  /**
   * Connect to a destination stream
   * @param {Stream} destination
   * @param {number} inputIndex Input index for the destination stream
   */
  pipe(destination, inputIndex = 0) {
    this.trigger('pipe', destination);
    destination.trigger('drain', this, inputIndex);
    return destination;
  }

  /**
   * Handle the connection of a destination stream
   * @param {Stream} destination
   */
  addDestination(destination) {
    this.removeDestination(destination);
    this.destinations.push(destination);
  }

  /**
   * Disconnect from a destination stream
   * @param {Stream} destination
   * @param {number} inputIndex Input index for the destination stream
   */
  unpipe(destination, inputIndex = 0) {
    this.trigger('unpipe', destination)
    destination.trigger('undrain', this, inputIndex);
    return destination;
  }

  /**
   * Handle the removal of a destination stream
   * @param {Stream} destination
   */
  removeDestination(destination) {
    this.destinations = this.destinations.filter(item => item === destination);
  }

  /**
   * Connect to a source stream
   * @param {Stream} source
   * @param {number} inputIndex Input index for this stream
   */
  drain(source, inputIndex = 0) {
    if (arguments.length === 1 && (source instanceof Array)) {
      source.forEach((source, inputIndex) => {
        source.trigger('pipe', this);
        this.trigger('drain', source, inputIndex);
      });
      return this;
    }
    source.trigger('pipe', this);
    this.trigger('drain', source, inputIndex);
    return this;
  }

  /**
   * Handle the connection of a source stream
   * @param {Stream} source
   * @param {number} inputIndex Input index for this stream
   */
  addSource(source, inputIndex = 0) {
    this.removeSource(this.sources[inputIndex], inputIndex);
    this.sources[inputIndex] = source;
    this.listenTo(source, {
      changed: (event) => {
        this.sourceLastChanged[inputIndex] = Date.now();
        event = new Event(event);
        event.path.push(this);
        this.onSourceChanged(event, inputIndex);
      }
    });
  }

  /**
   * Disconnect from a source stream
   * @param {Stream} source
   * @param {number} inputIndex Input index for this stream
   */
  undrain(source, inputIndex = 0) {
    if (arguments.length === 1 && (source instanceof Array)) {
      source.forEach((source, inputIndex) => {
        source.trigger('unpipe', this);
        this.trigger('undrain', source, inputIndex);
      });
      return this;
    }
    source.trigger('unpipe', this);
    this.trigger('undrain', source, inputIndex);
    return this;
  }

  /**
   * Handle the removal of a source stream
   * @param {Stream} stream
   * @param {number} inputIndex
   */
  removeSource(source, inputIndex = 0) {
    if (source && this.sources[inputIndex] !== source) return;
    this.stopListening(source, 'changed');
    delete this.sources[inputIndex];
  }

  /**
   * Executed when a source changed() is called
   * @param {Event} event
   */
  onSourceChanged(event, inputIndex) {
    this.render();
    this.changed(event, inputIndex);
  }

  render() {}

  /**
   * Cascade a changed event from source forward to destinations
   */
  changed(event = null, inputIndex = -1) {
    event = event || new Event({
      name: 'changed',
      target: this
    });
    this.onChanged(event, inputIndex);
    this.trigger('changed', event, inputIndex);
    return this;
  }

  /**
   * Executed when changed() is called
   * @param {Event} event
   * @param {number} inputIndex
   */
  onChanged(event, inputIndex) {}

}
