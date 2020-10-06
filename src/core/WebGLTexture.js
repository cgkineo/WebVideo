export default class WebGLTexture {

  constructor(context, width, height, format, type) {
    width = width || 0;
    height = height || 0;
    format = format || context.RGBA;
    type = type || context.UNSIGNED_BYTE;
    this.context = context;
    this.handle = context.createTexture();
    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;

    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
    this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, true);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MAG_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
    this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
    if (width && height) {
      this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
    }
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
    this.context.texImage2D(this.context.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
  }

  loadContentsOf(element) {
    this.width = element.width || element.mediaWidth;
    this.height = element.height || element.mediaHeight;
    this.context.bindTexture(this.context.TEXTURE_2D, this.handle);
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
