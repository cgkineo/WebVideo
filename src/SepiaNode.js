import VideoNode from './VideoNode';
import VideoParam from './VideoParam';
import WebGL from './WebGL';
import WebGLTexture from './WebGLTexture';
import SepiaShader from './shaders/Sepia';

export default class SepiaNode extends VideoNode {

  /**
   * @param {Object} options
   * @param {number} options.amount
   */
  constructor(context, options = {}) {
    super(context, options);
    this.webgl = new WebGL();
    this.mediaElement = this.webgl.canvas;
    this.texture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.shader = new SepiaShader(this.webgl.canvasWebGLContext, {
      texture: this.texture
    });
    this._amount = new VideoParam(context, 0, 1, 0, value => {
      if (this.options.amount === value) return;
      this.options.amount = value;
      this.changed();
    });
  }

  render() {
    const source = this.sources[0];
    if (!source) return;
    if (source.applyDimensions(this.webgl)) {
      this.shader.resize();
    }
    this.texture.loadContentsOf(source.mediaElement);
    this.shader.run(this.options);
  }

  get amount() {
    return this._amount;
  }

}
