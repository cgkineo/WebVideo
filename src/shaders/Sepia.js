import WebGLShader from '../WebGLShader';

export default class SepiaShader extends WebGLShader {

  get fragmentSource() {
    return `
uniform sampler2D texture;
uniform float amount;
varying vec2 vTextureCoord;
void main() {
  vec4 color = texture2D(texture, vTextureCoord);
  float r = color.r;
  float g = color.g;
  float b = color.b;

  color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
  color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
  color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));

  gl_FragColor = color;
}
    `;
  }

  parseUniforms(uniforms) {
    return {
      amount: WebGLShader.clamp(0, uniforms.amount, 1),
    };
  }

}
