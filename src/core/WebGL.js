export default class WebGL {

  constructor() {
    this.canvas = document.createElement('canvas');
    try {
      this.context = this.canvas.getContext("webgl", {
        alpha: true
      }) || this.canvas.getContext('experimental-webgl', {
        alpha: true
      });
    } catch (e) {}
    if (!this.context) throw 'No WebGL support';
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
    this.context.enable(this.context.BLEND);
  }

  get width() {
    return this.canvas.width;
  }

  set width(value) {
    this.canvas.width = value;
    this.resize();
  }

  get height() {
    return this.canvas.height;
  }

  set height(value) {
    this.canvas.height = value;
    this.resize();
  }

  resize() {
    this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

}
