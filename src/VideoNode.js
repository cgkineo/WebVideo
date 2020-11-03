import hasWebAudio from './hasWebAudio';
import isIE from './isIE';
import EventTarget from '@ungap/event-target';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class Node extends EventTarget {

  constructor(context, options = {}) {
    super();
    this.onSourceChanged = this.onSourceChanged.bind(this);
    this.onOriginChanged = this.onOriginChanged.bind(this);
    /** @type {VideoContext} */
    this._context = context;
    this._options = options;
    this._lastRendered = 0;
    /** @type {HTMLElement} */
    this._mediaElement = null;
    /** @type {[Node]} */
    this.destinations = [];
    /** @type {[Node]} */
    this.sources = [];
    this.context.addNode(this);
  }

  /** @type {VideoContext} */
  get context() {
    return this._context;
  }

  get options() {
    return this._options;
  }

  set options(value) {
    this._options = value;
  }

  get lastRendered() {
    return this._lastRendered;
  }

  set height(value) {
    if (!(this._mediaElement instanceof HTMLCanvasElement) && !(this._mediaElement instanceof OffscreenCanvas)) {
      throw new Error(`Cannot only set height on canvas mediaElements`);
    }
    this._mediaElement.height = value;
  }

  get height() {
    return this.output.height ||
      this.output.videoHeight ||
      this.output.originalHeight ||
      this.output.clientHeight;
  }

  set width(value) {
    if (!(this._mediaElement instanceof HTMLCanvasElement) && !(this._mediaElement instanceof OffscreenCanvas)) {
      throw new Error(`Cannot only set width on canvas mediaElements`);
    }
    this._mediaElement.width = value;
  }

  get width() {
    return this.output.width ||
      this.output.videoWidth ||
      this.output.originalWidth ||
      this.output.clientWidth;
  }

  set mediaElement(value) {
    if (
      (window.OffscreenCanvas && !(value instanceof window.OffscreenCanvas)) &&
      !(value instanceof window.HTMLImageElement) &&
      !(value instanceof window.HTMLVideoElement) &&
      !(value instanceof window.HTMLAudioElement) &&
      !(value instanceof window.HTMLCanvasElement)
    ) {
      throw new Error(`Node.mediaElement must be a canvas, img, video or audio mediaElement`);
    }
    this._mediaElement = value;
  }

  get mediaElement() {
    return this._mediaElement;
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
   * @param {Node} destination
   * @param {number} inputIndex Input index for the destination stream
   */
  connect(destination, inputIndex = 0) {
    this.addDestination(destination);
    destination.addSource(this, inputIndex);
    return destination;
  }

  /**
   * Disconnect from a destination stream
   * @param {Node} destination
   * @param {number} inputIndex Input index for the destination stream
   */
  disconnect(destination, inputIndex = 0) {
    this.removeDestination(destination);
    destination.removeSource(this, inputIndex);
    return destination;
  }

  /**
   * Handle the connection of a destination stream
   * @param {Node} destination
   */
  addDestination(destination) {
    this.removeDestination(destination);
    this.destinations.push(destination);
  }

  /**
   * Handle the removal of a destination stream
   * @param {Node} destination
   */
  removeDestination(destination) {
    this.destinations = this.destinations.filter(item => item === destination);
  }

  /**
   * Handle the connection of a source stream
   * @param {Node} source
   * @param {number} inputIndex Input index for this stream
   */
  addSource(source, inputIndex = 0) {
    if (!source) return;
    this.removeSource(this.sources[inputIndex], inputIndex);
    this.sources[inputIndex] = source;
    source.addEventListener('changed', this.onSourceChanged);
    source.addEventListener('added', this.onOriginChanged);
    source.addEventListener('removed', this.onOriginChanged);
    const event = Node.createEvent('added', { detail: { source, inputIndex } });
    Node.propagateEvent(this, event);
    this.onOriginChanged(event);
  }

  /**
   * Handle the removal of a source stream
   * @param {Node} stream
   * @param {number} inputIndex
   */
  removeSource(source, inputIndex = 0) {
    if (source && this.sources[inputIndex] !== source) return;
    if (source) {
      source.removeEventListener('changed', this.onSourceChanged);
      source.removeEventListener('added', this.onOriginChanged);
      source.removeEventListener('removed', this.onOriginChanged);
    }
    delete this.sources[inputIndex];
    const event = Node.createEvent('removed', { detail: { source, inputIndex } });
    Node.propagateEvent(this, event);
  }

  /**
   * Executed when a source changed() is called
   * @param {Event} event
   */
  onSourceChanged(event) {
    this.changed(event);
  }

  onOriginChanged(event) {
    Node.propagateEvent(this, event);
  }

  get audioOrigins() {
    const hasAudioNode = Boolean(this._audioNode);
    if (hasAudioNode) return [this];
    const isAudioOrigin = this.sources.length === 0 && (this._mediaElement instanceof HTMLMediaElement);
    if (isAudioOrigin) return [this];
    const origins = [];
    for (let i = 0, l = this.sources.length; i < l; i++) {
      const source = this.sources[i];
      origins.push(...source.audioOrigins);
    }
    const uniques = [];
    origins.forEach(origin => {
      if (uniques.find(unique => origin === unique)) return;
      uniques.push(origin);
    });
    return uniques;
  }

  /**
   * Return an AudioNode or null, which represents this VideoNode
   * @type {AudioNode}
   */
  get audioNode() {
    if (!hasWebAudio) return null;
    const isAudioOrigin = this.sources.length === 0 && (this._mediaElement instanceof HTMLMediaElement);
    let hasAudioNode = Boolean(this._audioNode);
    if (isAudioOrigin && !hasAudioNode) {
      this._audioNode = this.context.audioContext.createMediaElementSource(this._mediaElement);
    }
    return (this._audioNode || null);
  }

  set audioNode(value) {
    this._audioNode = value;
  }

  /**
   * Rerender all changed sources origins to destinations
   */
  update() {
    let hasChanged = false;
    for (let i = 0, l = this.sources.length; i < l; i++) {
      const source = this.sources[i];
      if (source.lastChanged < this._lastRendered) continue;
      source.update();
      hasChanged = true;
    }
    if (!hasChanged) return;
    this._lastRendered = Date.now();
    this.render();
  }

  /**
   * Interface function for rendering transformation
   */
  render() {}

  /**
   * Cascade a changed event from source forward to destinations
   */
  changed(event = null) {
    this.lastChanged = Date.now();
    event = event || Node.createEvent('changed');
    return Node.propagateEvent(this, event);
  }

  /**
   * Ensure event creation is IE compatible
   * @param {string} type
   * @param {properties} properties
   */
  static createEvent(type, properties) {
    let event;
    if (isIE) {
      event = document.createEvent('Event');
      event.initEvent(type, true, false);
      event.detail = properties;
    } else {
      event = new CustomEvent(type, { detail: properties });
    }
    return event;
  }

  /**
   * Dispatch or clone and dispatch events to simulate propagation
   * @param {Node} from
   * @param {Event} event
   */
  static propagateEvent(from, event) {
    const isDispatched = Boolean(event.eventPhase);
    const dispatchEvent = isDispatched ?
      Node.createEvent(event.type, event) :
      event;
    if (isDispatched) {
      Object.defineProperty(dispatchEvent, 'path', {
        value: (event.path || []).concat([from]),
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
    return from.dispatchEvent(dispatchEvent);
  }

  get hasModifications() {
    return false;
  }

  get output() {
    return this._mediaElement;
  }

}
