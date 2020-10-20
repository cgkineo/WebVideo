import VideoNode from './VideoNode';
import VideoParam from './VideoParam';
import WebGL from './WebGL';
import WebGLTexture from './WebGLTexture';
import ColorShader from './shaders/Color';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class ColorNode extends VideoNode {

  /**
   * @param {VideoContext} context
   * @param {Object} options
   * @param {number} options.brightness
   * @param {number} options.contrast
   * @param {number} options.hue
   * @param {number} options.saturation
   */
  constructor(context, options = {}) {
    super(context, options);
    this.webgl = new WebGL();
    this.mediaElement = this.webgl.canvas;
    this.texture = new WebGLTexture(this.webgl.canvasWebGLContext);
    this.shader = new ColorShader(this.webgl.canvasWebGLContext, {
      texture: this.texture
    });
    this._brightness = new VideoParam(context, -1, 1, 0, value => {
      if (this.options.brightness === value) return;
      this.options.brightness = value;
      this.changed();
    });
    this._contrast = new VideoParam(context, -1, 1, 0, value => {
      if (this.options.contrast === value) return;
      this.options.contrast = value;
      this.changed();
    });
    this._hue = new VideoParam(context, -1, 1, 0, value => {
      if (this.options.hue === value) return;
      this.options.hue = value;
      this.changed();
    });
    this._saturation = new VideoParam(context, -1, 1, 0, value => {
      if (this.options.saturation === value) return;
      this.options.saturation = value;
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

  /** @type {VideoParam} */
  get brightness() {
    return this._brightness
  }

  /** @type {VideoParam} */
  get contrast() {
    return this._contrast;
  }

  /** @type {VideoParam} */
  get hue() {
    return this._hue;
  }

  /** @type {VideoParam} */
  get saturation() {
    return this._saturation;
  }

}
