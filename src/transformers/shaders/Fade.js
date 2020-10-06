import WebGLShader from '../../core/WebGLShader';

export default class FadeShader extends WebGLShader {

  get fragmentSource() {
    return `
varying vec2 vTextureCoord;
uniform float amount;
uniform sampler2D firstTexture;
uniform sampler2D secondTexture;
void main( void ) {
  vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);

  vec4 firstDistortedColor = texture2D(firstTexture, textureCoords);
  vec4 secondDistortedColor = texture2D(secondTexture, textureCoords);

  float displacementFactor = (cos(amount / (1.0 / 3.141592)) + 1.0) / 2.0;

  vec4 finalColor = mix(secondDistortedColor, firstDistortedColor, displacementFactor);

  finalColor = vec4(finalColor.rgb, finalColor.a);

  gl_FragColor = finalColor;
}
    `;
  }

  parseUniforms(uniforms) {
    return {
      amount: WebGLShader.clamp(0, uniforms.amount, 1)
    };
  }

}
