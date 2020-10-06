import WebGLShader from '../../core/WebGLShader';

export default class ColorShader extends WebGLShader {

  get fragmentSource() {
    return `
uniform sampler2D texture;
uniform float brightness;
uniform float contrast;
uniform float hue;
uniform float saturation;
varying vec2 vTextureCoord;
void main() {
  vec4 color = texture2D(texture, vTextureCoord);

  color.rgb += brightness;
  if (contrast > 0.0) {
    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
  } else {
    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
  }

  float angle = hue * 3.14159265;
  float s = sin(angle), c = cos(angle);
  vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
  float len = length(color.rgb);
  color.rgb = vec3(
    dot(color.rgb, weights.xyz),
    dot(color.rgb, weights.zxy),
    dot(color.rgb, weights.yzx)
  );

  float average = (color.r + color.g + color.b) / 3.0;
  if (saturation > 0.0) {
    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));
  } else {
    color.rgb += (average - color.rgb) * (-saturation);
  }

  gl_FragColor = color;
}
    `;
  }

  parseUniforms(uniforms) {
    return {
      brightness: WebGLShader.clamp(-1, uniforms.brightness, 1),
      contrast: WebGLShader.clamp(-1, uniforms.contrast, 1),
      hue: WebGLShader.clamp(-1, uniforms.hue, 1),
      saturation: WebGLShader.clamp(-1, uniforms.saturation, 1),
    };
  }

}

