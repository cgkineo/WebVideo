import WebGLTexture from './WebGLTexture';

export default class WebGL {

  constructor() {
    this.canvas = window.OffscreenCanvas ? new window.OffscreenCanvas(0, 0) : document.createElement('canvas');
    try {
      const defaults = {
        alpha: false,
        antialias: true,
        depth: true,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "default",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        stencil: false,
        desynchronized: false
      };
      this.context = this.canvas.getContext("webgl", defaults) || this.canvas.getContext('experimental-webgl', defaults);
    } catch (e) {}
    if (!this.context) throw 'No WebGL support';
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
    this.context.enable(this.context.BLEND);
    this.framebuffer = new WebGLTexture(this.context);
  }

  get width() {
    return this.canvas.width;
  }

  set width(value) {
    this.canvas.width = value;
    this.framebuffer.width = value;
    this.resize();
  }

  get height() {
    return this.canvas.height;
  }

  set height(value) {
    this.canvas.height = value;
    this.framebuffer.height = value;
    this.resize();
  }

  resize() {
    this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

}
