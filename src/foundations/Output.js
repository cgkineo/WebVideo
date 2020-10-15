import Stream from '../core/Stream';
import RAFLoop from '../core/RAFLoop';

export default class Output extends Stream {

  constructor(options = {}) {
    super();
    this.element = typeof options.element === 'string' ? document.querySelector(options.element) : options.element;
    this.context = this.element.getContext('2d', { alpha: false });
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    // Always push outputs to the end as each frame will be most up to date
    this.update = this.update.bind(this);
    this.update.order = Infinity;
  }

  set element(value) {
    if (!(value instanceof window.HTMLCanvasElement) && !(value instanceof window.OffscreenCanvas)) {
      throw new Error('Output element can only be an HTMLCanvasElement or OffscreenCanvas instance');
    }
    this._element = value;
  }

  get element () {
    return this._element;
  }

  render() {
    const source = this.sources[0];
    /** @type {Frame} */
    source.applyDimensions(this.element);
    this.context.drawImage(source.element, 0, 0, source.width, source.height);
  }

  onSourceChanged() {
    // Limit renders to framerate
    RAFLoop.add(this.update);
  }

  update() {
    if (!(this.element instanceof window.HTMLCanvasElement) && !(value instanceof window.OffscreenCanvas)) return;
    this.cascadeRender();
  }

}
