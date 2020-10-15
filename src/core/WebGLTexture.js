export default class WebGLTexture {

  constructor(context, width = 0, height = 0, format = context.RGBA, type = context.UNSIGNED_BYTE) {
    this.context = context;
    this.handle = context.createTexture();
    this._width = width;
    this._height = height;
    this.format = format;
    this.type = type;
    this._isIE = (window.navigator.userAgent.indexOf('Trident/') !== -1);
    if (this._isIE) {
      this.canvas = window.OffscreenCanvas ? new window.OffscreenCanvas(0, 0) : document.createElement('canvas');
      this.canvasContext = this.canvas.getContext('2d', { alpha: true });
      this.canvasContext.webkitImageSmoothingEnabled = false;
      this.canvasContext.mozImageSmoothingEnabled = false;
      this.canvasContext.msImageSmoothingEnabled = false;
      this.canvasContext.imageSmoothingEnabled = false;
    }

    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
    this.context.pixelStorei(this.context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    if (width && height) {
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
    }
  }

  set height(value) {
    if (this._height === value) return;
    this._height = value;
    this.resize();

  }

  get height() {
    return this._height;
  }

  set width(value) {
    if (this._width === value) return;
    this._width = value;
    this.resize();
  }

  get width() {
    return this._width;
  }

  resize() {
    if (!this._width || !this._height) return;
    if (this._isIE) {
      this.canvas.height = this._height;
      this.canvas.width = this._width;
    }
    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, this._width , this._height, 0, this.format, this.type, null);
  }

  loadContentsOf(element) {
    this.width = element.width || element.mediaWidth;
    this.height = element.height || element.mediaHeight;
    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
    if (this._isIE) {
      this.canvasContext.drawImage(element, 0, 0, this.width, this.height);
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, this.format, this.type, this.canvas);
      return;
    }
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, this.format, this.type, element);
  }

  setContext(context) {
    this.context = context;
  }

  use(unit) {
    this.context.activeTexture(this.context.TEXTURE0 + (unit || 0));
    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
  }

  unuse(unit) {
    this.context.activeTexture(this.context.TEXTURE0 + (unit || 0));
    this.context.bindTexture(this.context.TEXTURE_2D, null);
  }

  destroy() {
    this.context.deleteTexture(this.handle);
    this.handle = null;
  }

  static fromElement(context, element) {
    const texture = new WebGLTexture(context, 0, 0, context.RGBA, context.UNSIGNED_BYTE);
    if (element) {
      texture.loadContentsOf(element);
    }
    return texture;
  }

}

