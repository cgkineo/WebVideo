import Stream from '../core/Stream';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import FadeShader from './shaders/Fade';

export default class Fade extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.amount
   */
  constructor(options = {}) {
    super(options);
    this.webgl = new WebGL();
    this.element = this.webgl.canvas;
    this.firstTexture = new WebGLTexture(this.webgl.context);
    this.secondTexture = new WebGLTexture(this.webgl.context);
    this.shader = new FadeShader(this.webgl.context, {
      firstTexture: this.firstTexture,
      secondTexture: this.secondTexture
    });
  }

  render() {
    const source1 = this.sources[0];
    const source2 = this.sources[1];
    if (!source1 || !source2) return;
    if (source1.applyDimensions(this.webgl)) {
      this.shader.resize();
    }
    this.firstTexture.loadContentsOf(source1.element);
    this.secondTexture.loadContentsOf(source2.element);
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
