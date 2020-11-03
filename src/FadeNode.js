import AudioCrossfadeNode from './AudioCrossfadeNode';
import WebGL from './WebGL';
import WebGLTexture from './WebGLTexture';
import FadeShader from './shaders/Fade';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class FadeNode extends AudioCrossfadeNode {

  /**
   * @param {VideoContext} context
   * @param {Object} options
   * @param {number} options.amount
   */
  constructor(context, options = {}) {
    super(context, options);
    this.webgl = new WebGL();
    this.mediaElement = this.webgl.canvas;
    this.firstTexture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.secondTexture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.shader = new FadeShader(this.webgl.canvasWebGLContext, {
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
    if (this.options.amount !== 1) {
      this.firstTexture.loadContentsOf(source1.mediaElement);
    }
    if (this.options.amount !== 0) {
      this.secondTexture.loadContentsOf(source2.mediaElement);
    }
    this.shader.run(this.options);
  }

}
