import Stream from '../core/Stream';
import Frame from '../core/Frame';
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
    const webgl = new WebGL();
    super({
      element: webgl.canvas
    });
    this.options = options;
    this.webgl = webgl;
    this.texture = new WebGLTexture(webgl.context);
    this.shader = new ColorShader(webgl.context, {
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

  get brightness() {
    return this.options.brightness;
  }

  set brightness(value) {
    if (this.options.brightness === value) return;
    this.options.brightness = value;
    this.render();
  }

  get contrast() {
    return this.options.contrast;
  }

  set contrast(value) {
    if (this.options.contrast === value) return;
    this.options.contrast = value;
    this.render();
  }

  get hue() {
    return this.options.hue;
  }

  set hue(value) {
    if (this.options.hue === value) return;
    this.options.hue = value;
    this.render();
  }

  get saturation() {
    return this.options.saturation;
  }

  set saturation(value) {
    if (this.options.saturation === value) return;
    this.options.saturation = value;
    this.render();
  }

}
