import AudioCrossfadeNode from './AudioCrossfadeNode';
import WebGL from './WebGL';
import WebGLTexture from './WebGLTexture';
import DisplacementShader from './shaders/Displacement';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class DisplacementNode extends AudioCrossfadeNode {

  /**
   * @param {VideoContext} context
   * @param {Object} options
   * @param {number} options.amount
   * @param {number} options.displacement
   */
  constructor(context, options = {}) {
    super(context, options);
    this.webgl = new WebGL();
    this.mediaElement = this.webgl.canvas;
    this.firstTexture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.secondTexture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.displacementImg = document.createElement('img');
    this.displacementTexture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.urlResolver = document.createElement('a');
    this.shader = new DisplacementShader(this.webgl.canvasWebGLContext, {
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
    this.firstTexture.loadContentsOf(source1.mediaElement);
    this.secondTexture.loadContentsOf(source2.mediaElement);
    this.urlResolver.href = this.options.displacement;
    if (this._displacementSrc !== this.displacementImg.src || this._displacementSrc !== this.urlResolver.href) {
      this.displacementImg.src = this.options.displacement;
      this.displacementTexture.loadContentsOf(this.displacementImg);
      this._displacementSrc = this.displacementImg.src;
    }
    this.shader.run(this.options);
  }

}
