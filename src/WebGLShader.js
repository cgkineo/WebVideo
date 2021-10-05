export default class WebGLShader {
  get vertexSource () {
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
    `
  }

  get fragmentSource () {
    return `
uniform sampler2D texture;
varying vec2 vTextureCoord;
void main() {
  gl_FragColor = texture2D(texture, vTextureCoord);
}
    `
  }

  constructor (canvasWebGLContext, textures) {
    const vertexSource = 'precision highp float;' + this.vertexSource
    const fragmentSource = 'precision highp float;' + this.fragmentSource
    this.uniformLocations = {}
    this.uniformValues = {}
    this.textureStore = {}
    this.textureUnit = 0
    this.canvasWebGLContext = canvasWebGLContext
    this.vertexAttribute = null
    this.texCoordAttribute = null
    this.program = this.canvasWebGLContext.createProgram()
    this.canvasWebGLContext.attachShader(this.program, this.compileSource(this.canvasWebGLContext.VERTEX_SHADER, vertexSource))
    this.canvasWebGLContext.attachShader(this.program, this.compileSource(this.canvasWebGLContext.FRAGMENT_SHADER, fragmentSource))
    this.canvasWebGLContext.linkProgram(this.program)
    if (!this.canvasWebGLContext.getProgramParameter(this.program, this.canvasWebGLContext.LINK_STATUS)) {
      throw new Error('link error: ' + this.canvasWebGLContext.getProgramInfoLog(this.program))
    }
    if (textures) {
      this.textures(textures)
    }
  }

  compileSource (type, source) {
    const shader = this.canvasWebGLContext.createShader(type)
    this.canvasWebGLContext.shaderSource(shader, source)
    this.canvasWebGLContext.compileShader(shader)
    if (!this.canvasWebGLContext.getShaderParameter(shader, this.canvasWebGLContext.COMPILE_STATUS)) {
      throw new Error('compile error: ' + this.canvasWebGLContext.getShaderInfoLog(shader))
    }
    return shader
  }

  uniforms (uniforms) {
    if (!uniforms) return this
    let hasChanged = false
    for (const name in uniforms) {
      if (!Object.prototype.hasOwnProperty.call(uniforms, name)) continue
      if (this.uniformValues[name] === uniforms[name]) continue
      hasChanged = true
      break
    }
    if (!hasChanged) return this
    this.canvasWebGLContext.useProgram(this.program)
    for (const name in uniforms) {
      if (!Object.prototype.hasOwnProperty.call(uniforms, name)) continue
      this.uniformValues[name] = uniforms[name]
      const location = this.uniformLocations[name] = this.uniformLocations[name] ||
        this.canvasWebGLContext.getUniformLocation(this.program, name)
      // Will be null if the uniform isn't used in the shader
      if (location === null) continue
      const value = uniforms[name]

      if (Array.isArray(value)) {
        switch (value.length) {
          case 1:
            this.canvasWebGLContext.uniform1fv(location, new Float32Array(value))
            break
          case 2:
            this.canvasWebGLContext.uniform2fv(location, new Float32Array(value))
            break
          case 3:
            this.canvasWebGLContext.uniform3fv(location, new Float32Array(value))
            break
          case 4:
            this.canvasWebGLContext.uniform4fv(location, new Float32Array(value))
            break
          case 9:
            this.canvasWebGLContext.uniformMatrix3fv(location, false, new Float32Array(value))
            break
          case 16:
            this.canvasWebGLContext.uniformMatrix4fv(location, false, new Float32Array(value))
            break
          default:
            throw new Error('dont\'t know how to load uniform "' + name + '" of length ' + value.length)
        }
        continue
      }

      if (Number.isFinite(value)) {
        this.canvasWebGLContext.uniform1f(location, value)
        continue
      }

      throw new Error('attempted to set uniform "' + name + '" to invalid value ' + (value || 'undefined').toString())
    }
  }

  parseUniforms (uniforms) {
    return uniforms
  }

  textures (textures) {
    // textures are uniforms too but for some reason can't be specified by this.canvasWebGLContext.uniform1f,
    // even though floating point numbers represent the integers 0 through 7 exactly
    if (!textures) {
      // make sure textures are in the right place for render
      for (const name in this.textureStore) {
        const store = this.textureStore[name]
        store.texture.setContext(this.canvasWebGLContext)
        store.texture.use(store.unit)
        this.canvasWebGLContext.uniform1i(store.location, store.unit)
      }
      return
    }
    this.canvasWebGLContext.useProgram(this.program)
    for (const name in textures) {
      const store = this.textureStore[name] = this.textureStore[name] || {
        unit: this.textureUnit++,
        texture: textures[name],
        location: this.canvasWebGLContext.getUniformLocation(this.program, name)
      }
      store.texture.setContext(this.canvasWebGLContext)
      store.texture.use(store.unit)
      this.canvasWebGLContext.uniform1i(store.location, store.unit)
    }
  }

  resize () {
    this.viewport = this.canvasWebGLContext.getParameter(this.canvasWebGLContext.VIEWPORT)
  }

  drawRect (left, top, right, bottom) {
    top = top !== undefined ? (top - this.viewport[1]) / this.viewport[3] : 0
    left = left !== undefined ? (left - this.viewport[0]) / this.viewport[2] : 0
    right = right !== undefined ? (right - this.viewport[0]) / this.viewport[2] : 1
    bottom = bottom !== undefined ? (bottom - this.viewport[1]) / this.viewport[3] : 1
    if (!this.canvasWebGLContext.vertexBuffer) {
      this.canvasWebGLContext.vertexBuffer = this.canvasWebGLContext.createBuffer()
    }
    this.canvasWebGLContext.bindBuffer(this.canvasWebGLContext.ARRAY_BUFFER, this.canvasWebGLContext.vertexBuffer)
    this.canvasWebGLContext.bufferData(this.canvasWebGLContext.ARRAY_BUFFER, new Float32Array([left, top, left, bottom, right, top, right, bottom]), this.canvasWebGLContext.STATIC_DRAW)
    if (!this.canvasWebGLContext.texCoordBuffer) {
      this.canvasWebGLContext.texCoordBuffer = this.canvasWebGLContext.createBuffer()
      this.canvasWebGLContext.bindBuffer(this.canvasWebGLContext.ARRAY_BUFFER, this.canvasWebGLContext.texCoordBuffer)
      this.canvasWebGLContext.bufferData(this.canvasWebGLContext.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), this.canvasWebGLContext.STATIC_DRAW)
    }
    if (!this.vertexAttribute) {
      this.vertexAttribute = this.canvasWebGLContext.getAttribLocation(this.program, 'aVertexPosition')
      this.canvasWebGLContext.enableVertexAttribArray(this.vertexAttribute)
    }
    if (!this.texCoordAttribute) {
      this.texCoordAttribute = this.canvasWebGLContext.getAttribLocation(this.program, 'aTextureCoord')
      this.canvasWebGLContext.enableVertexAttribArray(this.texCoordAttribute)
    }
    this.canvasWebGLContext.useProgram(this.program)
    this.canvasWebGLContext.bindBuffer(this.canvasWebGLContext.ARRAY_BUFFER, this.canvasWebGLContext.vertexBuffer)
    this.canvasWebGLContext.vertexAttribPointer(this.vertexAttribute, 2, this.canvasWebGLContext.FLOAT, false, 0, 0)
    this.canvasWebGLContext.bindBuffer(this.canvasWebGLContext.ARRAY_BUFFER, this.canvasWebGLContext.texCoordBuffer)
    this.canvasWebGLContext.vertexAttribPointer(this.texCoordAttribute, 2, this.canvasWebGLContext.FLOAT, false, 0, 0)
    this.canvasWebGLContext.drawArrays(this.canvasWebGLContext.TRIANGLE_STRIP, 0, 4)
  }

  run (uniforms, textures) {
    this.uniforms(this.parseUniforms(uniforms))
    this.textures(textures)
    this.drawRect()
  }

  destroy () {
    if (!this.canvasWebGLContext) return
    this.canvasWebGLContext.deleteProgram(this.program)
    this.program = null
    this.canvasWebGLContext = null
  }

  static clamp (min, value, max) {
    if (value < min) return min
    if (value > max) return max
    return value
  }
}
