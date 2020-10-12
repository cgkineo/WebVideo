import Stream from '../core/Stream';
import Frame from '../core/Frame';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import SepiaShader from './shaders/Sepia';

export default class Sepia extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.amount
   */
  constructor(options = {}) {
    const webgl = new WebGL();
    super({
      element: webgl.canvas
    });
    this.options = options;
    this.webgl = webgl;
    this.texture = new WebGLTexture(webgl.context);
    this.shader = new SepiaShader(webgl.context, {
      texture: this.texture
    });
  }

  render() {
    const source = this.sources[0];
    if (!source) return;
    /** @type {Frame} */
    const frame = source.frame;
    if (frame.setDimensions(this.webgl)) {
      this.shader.resize();
    }
    this.texture.loadContentsOf(frame.element);
    this.shader.run(this.options);
  }

  get amount() {
    return this.options.amount;
  }

  set amount(value) {
    if (this.options.amount === value) return;
    this.options.amount = value;
    this.render();
  }

}
