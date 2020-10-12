import Input from './Input';
import Frame from '../core/Frame';

export default class Output extends Input {

  constructor({
    element = null
  } = {}) {
    super({ element });
  }

  set element(value) {
    this._element = value;
    this.frame = new Frame(value);
    this.context = this.element.getContext('2d');
  }

  get element () {
    return this._element;
  }

  onSourceChanged() {
    // Limit changes to framerate
    this.redraw();
  }

  onRedraw() {
    if (!(this.element instanceof HTMLCanvasElement)) return;
    const source = this.sources[0];
    /** @type {Frame} */
    const frame = source.frame;
    frame.setDimensions(this.frame);
    this.context.drawImage(frame.element, 0, 0, frame.width, frame.height);
  }

}
