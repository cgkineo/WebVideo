import Stream from '../core/Stream';
import WebGL from '../core/WebGL';
import WebGLTexture from '../core/WebGLTexture';
import ColorShader from './shaders/Color';

export default class Color extends Stream {

  /**
   * @param {Object} options
   * @param {number} options.brightness
   * @param {number} options.contrast
   * @param {number} options.hue
   * @param {number} options.saturation
   */
  constructor(options = {}) {
    super(options);
    this.webgl = new WebGL();
    this.element = this.webgl.canvas;
    this.texture = new WebGLTexture(this.webgl.context);
    this.shader = new ColorShader(this.webgl.context, {
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

  get brightness() {
    return this.options.brightness;
  }

  set brightness(value) {
    if (this.options.brightness === value) return;
    this.options.brightness = value;
    this.changed();
  }

  get contrast() {
    return this.options.contrast;
  }

  set contrast(value) {
    if (this.options.contrast === value) return;
    this.options.contrast = value;
    this.changed();
  }

  get hue() {
    return this.options.hue;
  }

  set hue(value) {
    if (this.options.hue === value) return;
    this.options.hue = value;
    this.changed();
  }

  get saturation() {
    return this.options.saturation;
  }

  set saturation(value) {
    if (this.options.saturation === value) return;
    this.options.saturation = value;
    this.changed();
  }

}
