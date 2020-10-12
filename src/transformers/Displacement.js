import Stream from '../core/Stream';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import DisplacementShader from './shaders/Displacement';

export default class Displacement extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.amount
   * @param {number} options.displacement
   * @param {string} options.name
   */
  constructor(options = {}) {
    const webgl = new WebGL();
    super({
      element: webgl.canvas,
      name: options.name
    });
    this.options = options;
    this.webgl = webgl;
    this.firstTexture = new WebGLTexture(webgl.context);
    this.secondTexture = new WebGLTexture(webgl.context);
    this.displacementImg = document.createElement('img');
    this.displacementImg.src = options.displacement;
    this.displacementTexture = new WebGLTexture(webgl.context);
    this.shader = new DisplacementShader(webgl.context, {
      firstTexture: this.firstTexture,
      secondTexture: this.secondTexture,
      displacementTexture: this.displacementTexture
    });
  }

  render() {
    const source1 = this.sources[0];
    const source2 = this.sources[1];
    if (!source1 || !source2) return;
    const frame1 = source1.frame;
    const frame2 = source2.frame;
    if (frame1.setDimensions(this.webgl)) {
      this.shader.resize();
    }
    this.firstTexture.loadContentsOf(frame1.element);
    this.secondTexture.loadContentsOf(frame2.element);
    this.displacementTexture.loadContentsOf(this.displacementImg);
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
