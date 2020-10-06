

export default class Frame {

  constructor(element = null) {
    this.element = element;
  }

  set height(value) {
    if (!(this._element instanceof HTMLCanvasElement)) {
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
    if (!(this._element instanceof HTMLCanvasElement)) {
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
    if (value instanceof Frame) {
      value = value.element;
    }
    if (!(value instanceof HTMLElement) || (
      !(value instanceof HTMLImageElement) &&
      !(value instanceof HTMLVideoElement) &&
      !(value instanceof HTMLCanvasElement)
    )) {
      throw new Error(`Frame must contain a canvas, img or video element`);
    }
    this._element = value;
  }

  get element() {
    return this._element;
  }

  setDimensions(setOns) {
    if (!(setOns instanceof Array)) {
      setOns = [setOns];
    }
    const width = this.width;
    const height = this.height;
    setOns.forEach(function(setOn) {
      setOn.width = width;
      setOn.height = height;
    }.bind(this));
  }

}
