import Events from './Events';
import Event from './Event';

export default class Stream extends Events {

  static getNextId() {
    if (Stream._uid >= Number.MAX_SAFE_INTEGER) Stream._uid = 0;
    Stream._uid = Stream._uid || 0;
    return Stream._uid++;
  }

  constructor(options = {}) {
    super();
    this.uid = Stream.getNextId(),
    this.options = options;
    /** @type {[Stream]} */
    this.destinations = [];
    /** @type {[Stream]} */
    this.sources = [];
    /** @type {[number]} */
    this.sourceLastChanged = [];
    this.lastRendered = 0;
    /** @type {HTMLElement} */
    this._element = null;
    this.on({
      "pipe": this.addDestination,
      "unpipe": this.removeDestination,
      "drain": this.addSource,
      "undrain": this.removeSource
    });
  }

  set height(value) {
    if (!(this._element instanceof HTMLCanvasElement) && !(this._element instanceof OffscreenCanvas)) {
      throw new Error(`Cannot only set height on canvas elements`);
    }
    this._element.height = value;
  }

  get height() {
    return this._element.height ||
      this._element.videoHeight ||
      this._element.originalHeight ||
      this._element.clientHeight;
  }

  set width(value) {
    if (!(this._element instanceof HTMLCanvasElement) && !(this._element instanceof OffscreenCanvas)) {
      throw new Error(`Cannot only set width on canvas elements`);
    }
    this._element.width = value;
  }

  get width() {
    return this._element.width ||
      this._element.videoWidth ||
      this._element.originalWidth ||
      this._element.clientWidth;
  }

  set element(value) {
    if (
      (window.OffscreenCanvas && !(value instanceof window.OffscreenCanvas)) &&
      !(value instanceof window.HTMLImageElement) &&
      !(value instanceof window.HTMLVideoElement) &&
      !(value instanceof window.HTMLAudioElement) &&
      !(value instanceof window.HTMLCanvasElement)
    ) {
      throw new Error(`Stream.element must be a canvas, img, video or audio element`);
    }
    this._element = value;
  }

  get element() {
    return this._element;
  }

  applyDimensions(setOns) {
    if (!(setOns instanceof Array)) {
      setOns = [setOns];
    }
    const width = this.width;
    const height = this.height;
    let isChanged = false;
    setOns.forEach(function(setOn) {
      if (setOn.width === width && setOn.height === height) return;
      isChanged = true;
      setOn.width = width;
      setOn.height = height;
    }.bind(this));
    return isChanged;
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
    // this.render();
    this.changed(event, inputIndex);
  }

  cascadeRender() {
    for (let i = 0, l = this.sources.length; i < l; i++) {
      const source = this.sources[i];;
      if (source.lastChanged < this.lastRendered) continue;
      source.cascadeRender();
    }
    this.lastRendered = Date.now();
    this.render();
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
    this.lastChanged = Date.now();
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
