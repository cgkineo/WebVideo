import isIE from './isIE';

export default class WebGLTexture {

  constructor(canvasWebGLContext, width = 0, height = 0, format = canvasWebGLContext.RGBA, type = canvasWebGLContext.UNSIGNED_BYTE) {
    this.canvasWebGLContext = canvasWebGLContext;
    this.handle = canvasWebGLContext.createTexture();
    this._width = width;
    this._height = height;
    this.format = format;
    this.type = type;

    if (isIE) {
      this.canvas = window.OffscreenCanvas ? new window.OffscreenCanvas(0, 0) : document.createElement('canvas');
      this.canvasContext = this.canvas.getContext('2d', { alpha: true });
      this.canvasContext.webkitImageSmoothingEnabled = false;
      this.canvasContext.mozImageSmoothingEnabled = false;
      this.canvasContext.msImageSmoothingEnabled = false;
      this.canvasContext.imageSmoothingEnabled = false;
    }

    this.canvasWebGLContext.bindTexture(this.canvasWebGLContext.TEXTURE_2D, this.handle);
    this.canvasWebGLContext.pixelStorei(this.canvasWebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    this.canvasWebGLContext.pixelStorei(this.canvasWebGLContext.UNPACK_FLIP_Y_WEBGL, true);
    this.canvasWebGLContext.texParameteri(this.canvasWebGLContext.TEXTURE_2D, this.canvasWebGLContext.TEXTURE_MAG_FILTER, this.canvasWebGLContext.LINEAR);
    this.canvasWebGLContext.texParameteri(this.canvasWebGLContext.TEXTURE_2D, this.canvasWebGLContext.TEXTURE_MIN_FILTER, this.canvasWebGLContext.LINEAR);
    this.canvasWebGLContext.texParameteri(this.canvasWebGLContext.TEXTURE_2D, this.canvasWebGLContext.TEXTURE_WRAP_S, this.canvasWebGLContext.CLAMP_TO_EDGE);
    this.canvasWebGLContext.texParameteri(this.canvasWebGLContext.TEXTURE_2D, this.canvasWebGLContext.TEXTURE_WRAP_T, this.canvasWebGLContext.CLAMP_TO_EDGE);
    if (width && height) {
      this.canvasWebGLContext.texImage2D(this.canvasWebGLContext.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
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
    if (isIE) {
      this.canvas.height = this._height;
      this.canvas.width = this._width;
    }
    this.canvasWebGLContext.bindTexture(this.canvasWebGLContext.TEXTURE_2D, this.handle);
    this.canvasWebGLContext.texImage2D(this.canvasWebGLContext.TEXTURE_2D, 0, this.format, this._width , this._height, 0, this.format, this.type, null);
  }

  loadContentsOf(mediaElement) {
    this.width = mediaElement.width || mediaElement.mediaWidth;
    this.height = mediaElement.height || mediaElement.mediaHeight;
    this.canvasWebGLContext.bindTexture(this.canvasWebGLContext.TEXTURE_2D, this.handle);
    if (isIE) {
      this.canvasContext.drawImage(mediaElement, 0, 0, this.width, this.height);
      this.canvasWebGLContext.texImage2D(this.canvasWebGLContext.TEXTURE_2D, 0, this.format, this.format, this.type, this.canvas);
      return;
    }
    this.canvasWebGLContext.texImage2D(this.canvasWebGLContext.TEXTURE_2D, 0, this.format, this.format, this.type, mediaElement);
  }

  setContext(canvasWebGLContext) {
    this.canvasWebGLContext = canvasWebGLContext;
  }

  use(unit) {
    this.canvasWebGLContext.activeTexture(this.canvasWebGLContext.TEXTURE0 + (unit || 0));
    this.canvasWebGLContext.bindTexture(this.canvasWebGLContext.TEXTURE_2D, this.handle);
  }

  unuse(unit) {
    this.canvasWebGLContext.activeTexture(this.canvasWebGLContext.TEXTURE0 + (unit || 0));
    this.canvasWebGLContext.bindTexture(this.canvasWebGLContext.TEXTURE_2D, null);
  }

  destroy() {
    this.canvasWebGLContext.deleteTexture(this.handle);
    this.handle = null;
  }

}

