import Stream from '../core/Stream';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import DisplacementShader from './shaders/Displacement';

export default class Displacement extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.amount
   * @param {number} options.displacement
   */
  constructor(options = {}) {
    super(options);
    this.webgl = new WebGL();
    this.element = this.webgl.canvas;
    this.firstTexture = new WebGLTexture(this.webgl.context);
    this.secondTexture = new WebGLTexture(this.webgl.context);
    this.displacementImg = document.createElement('img');
    this.displacementTexture = new WebGLTexture(this.webgl.context);
    this.urlResolver = document.createElement('a');
    this.shader = new DisplacementShader(this.webgl.context, {
      firstTexture: this.firstTexture,
      secondTexture: this.secondTexture,
      displacementTexture: this.displacementTexture
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
    this.urlResolver.href = this.options.displacement;
    if (this._displacementSrc !== this.displacementImg.src || this._displacementSrc !== this.urlResolver.href) {
      this.displacementImg.src = this.options.displacement;
      this.displacementTexture.loadContentsOf(this.displacementImg);
      this._displacementSrc = this.displacementImg.src;
    }
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
