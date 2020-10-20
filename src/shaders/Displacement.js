import WebGLShader from '../WebGLShader';

export default class DisplacementShader extends WebGLShader {

  get fragmentSource() {
    return `
varying vec2 vTextureCoord;
uniform float amount;
uniform sampler2D firstTexture;
uniform sampler2D secondTexture;
uniform sampler2D displacementTexture;
void main( void ) {
  vec2 textureCoords = vec2(vTextureCoord.x, vTextureCoord.y);

  vec4 displacementColor = texture2D(displacementTexture, textureCoords);

  float displacementFactor = (cos(amount / (1.0 / 3.141592)) + 1.0) / 2.0;
  float effectFactor = 1.0;

  vec2 firstDisplacementCoords = vec2(textureCoords.x - (1.0 - displacementFactor) * (displacementColor.r * effectFactor), textureCoords.y);
  vec2 secondDisplacementCoords = vec2(textureCoords.x + displacementFactor * (displacementColor.r * effectFactor), textureCoords.y);

  vec4 firstDistortedColor = texture2D(firstTexture, firstDisplacementCoords);
  vec4 secondDistortedColor = texture2D(secondTexture, secondDisplacementCoords);

  vec4 finalColor = mix(secondDistortedColor, firstDistortedColor, displacementFactor);

  finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);

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
