import Stream from '../core/Stream';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import SepiaShader from './shaders/Sepia';

export default class Sepia extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.amount
   */
  constructor(options = {}) {
    super(options);
    this.webgl = new WebGL();
    this.element = this.webgl.canvas;
    this.texture = new WebGLTexture(this.webgl.context);
    this.shader = new SepiaShader(this.webgl.context, {
      texture: this.texture
    });
  }

  render() {
    const source = this.sources[0];
    if (!source) return;
    if (source.applyDimensions(this.webgl)) {
      this.shader.resize();
    }
    this.texture.loadContentsOf(source.element);
    this.shader.run(this.options);
  }

  get amount() {
    return this.options.amount;
  }

  set amount(value) {
    if (this.options.amount === value) return;
    this.options.amount = value;
    this.changed();
  }

}
