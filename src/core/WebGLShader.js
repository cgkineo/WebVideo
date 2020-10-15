export default class WebGLShader {

  get vertexSource() {
    return `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;
varying vec2 vVertexPosition;
void main() {
  vTextureCoord = aTextureCoord;
  vVertexPosition = aVertexPosition;
  gl_Position = vec4(aVertexPosition * 2.0 - 1.0, 0.0, 1.0);
}
    `;
  }

  get fragmentSource() {
    return `
uniform sampler2D texture;
varying vec2 vTextureCoord;
void main() {
  gl_FragColor = texture2D(texture, vTextureCoord);
}
    `;
  }

  constructor(context, textures) {
    const vertexSource = 'precision highp float;' + this.vertexSource;
    const fragmentSource = 'precision highp float;' + this.fragmentSource;
    this.uniformLocations = {};
    this.uniformValues = {};
    this.textureStore = {};
    this.textureUnit = 0;
    this.context = context;
    this.vertexAttribute = null;
    this.texCoordAttribute = null;
    this.program = this.context.createProgram();
    this.context.attachShader(this.program, this.compileSource(this.context.VERTEX_SHADER, vertexSource));
    this.context.attachShader(this.program, this.compileSource(this.context.FRAGMENT_SHADER, fragmentSource));
    this.context.linkProgram(this.program);
    if (!this.context.getProgramParameter(this.program, this.context.LINK_STATUS)) {
        throw 'link error: ' + this.context.getProgramInfoLog(this.program);
    }
    if (textures) {
      this.textures(textures);
    }
  }

  compileSource(type, source) {
    var shader = this.context.createShader(type);
    this.context.shaderSource(shader, source);
    this.context.compileShader(shader);
    if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
      throw 'compile error: ' + this.context.getShaderInfoLog(shader);
    }
    return shader;
  }

  uniforms(uniforms) {
    if (!uniforms) return this;
    let hasChanged = false;
    for (var name in uniforms) {
      if (!uniforms.hasOwnProperty(name)) continue;
      if (this.uniformValues[name] === uniforms[name]) continue;
      hasChanged = true;
      break;
    }
    if (!hasChanged) return this;
    this.context.useProgram(this.program);
    for (var name in uniforms) {
      if (!uniforms.hasOwnProperty(name)) continue;
      this.uniformValues[name] = uniforms[name];
      var location = this.uniformLocations[name] = this.uniformLocations[name] ||
        this.context.getUniformLocation(this.program, name);
      // Will be null if the uniform isn't used in the shader
      if (location === null) continue;
      var value = uniforms[name];

      if (Array.isArray(value)) {
        switch (value.length) {
          case 1:
            this.context.uniform1fv(location, new Float32Array(value));
            break;
          case 2:
            this.context.uniform2fv(location, new Float32Array(value));
            break;
          case 3:
            this.context.uniform3fv(location, new Float32Array(value));
            break;
          case 4:
            this.context.uniform4fv(location, new Float32Array(value));
            break;
          case 9:
            this.context.uniformMatrix3fv(location, false, new Float32Array(value));
            break;
          case 16:
            this.context.uniformMatrix4fv(location, false, new Float32Array(value));
            break;
          default:
            throw 'dont\'t know how to load uniform "' + name + '" of length ' + value.length;
        }
        continue;
      }

      if (Number.isFinite(value)) {
        this.context.uniform1f(location, value);
        continue;
      }

      throw 'attempted to set uniform "' + name + '" to invalid value ' + (value || 'undefined').toString();
    }
  }

  parseUniforms(uniforms) {
    return uniforms;
  }

  textures(textures) {
    // textures are uniforms too but for some reason can't be specified by this.context.uniform1f,
    // even though floating point numbers represent the integers 0 through 7 exactly
    if (!textures) {
      // make sure textures are in the right place for render
      for (var name in this.textureStore) {
        var store = this.textureStore[name];
        store.texture.setContext(this.context);
        store.texture.use(store.unit);
        this.context.uniform1i(store.location, store.unit);
      }
      return;
    }
    this.context.useProgram(this.program);
    for (var name in textures) {
      var store = this.textureStore[name] = this.textureStore[name] || {
        unit: this.textureUnit++,
        texture: textures[name],
        location: this.context.getUniformLocation(this.program, name)
      };
      store.texture.setContext(this.context);
      store.texture.use(store.unit);
      this.context.uniform1i(store.location, store.unit);
    }
  }

  resize() {
    this.viewport = this.context.getParameter(this.context.VIEWPORT);
  }

  drawRect(left, top, right, bottom) {
    top = top !== undefined ? (top - this.viewport[1]) / this.viewport[3] : 0;
    left = left !== undefined ? (left - this.viewport[0]) / this.viewport[2] : 0;
    right = right !== undefined ? (right - this.viewport[0]) / this.viewport[2] : 1;
    bottom = bottom !== undefined ? (bottom - this.viewport[1]) / this.viewport[3] : 1;
    if (this.context.vertexBuffer == null) {
      this.context.vertexBuffer = this.context.createBuffer();
    }
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.vertexBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([ left, top, left, bottom, right, top, right, bottom ]), this.context.STATIC_DRAW);
    if (this.context.texCoordBuffer == null) {
      this.context.texCoordBuffer = this.context.createBuffer();
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.texCoordBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 1 ]), this.context.STATIC_DRAW);
    }
    if (this.vertexAttribute == null) {
      this.vertexAttribute = this.context.getAttribLocation(this.program, 'aVertexPosition');
      this.context.enableVertexAttribArray(this.vertexAttribute);
    }
    if (this.texCoordAttribute == null) {
      this.texCoordAttribute = this.context.getAttribLocation(this.program, 'aTextureCoord');
      this.context.enableVertexAttribArray(this.texCoordAttribute);
    }
    this.context.useProgram(this.program);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.vertexBuffer);
    this.context.vertexAttribPointer(this.vertexAttribute, 2, this.context.FLOAT, false, 0, 0);
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.context.texCoordBuffer);
    this.context.vertexAttribPointer(this.texCoordAttribute, 2, this.context.FLOAT, false, 0, 0);
    this.context.drawArrays(this.context.TRIANGLE_STRIP, 0, 4);
  }

  run(uniforms, textures) {
    this.uniforms(this.parseUniforms(uniforms));
    this.textures(textures);
    this.drawRect();
  }

  destroy() {
    if (!this.context) return;
    this.context.deleteProgram(this.program);
    this.program = null;
    this.context = null;
  }

  static clamp(min, value, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

}

