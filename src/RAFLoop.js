class RAFLoop {
  constructor () {
    this.callbacks = []
    this.lastTick = -1
    this.tick = this.tick.bind(this)
    this.kick = this.kick.bind(this)
    this.isTicking = false

    this.then = window.performance.now()
    this.now = null
    this.elapsed = null
    this.fpsInterval = 1000 / 60 // limit RAF to max 60 fps
  }

  add (callback) {
    const index = this.callbacks.findIndex(cb => cb === callback)
    if (index !== -1) {
      this.callbacks.splice(index, 1)
    }
    this.callbacks.push(callback)
    if (this.isTicking) return
    this.kick()
  }

  remove (callback) {
    const index = this.callbacks.findIndex(cb => cb === callback)
    if (index !== -1) {
      this.callbacks.splice(index, 1)
    }
  }

  kick () {
    if (!this.callbacks.length) {
      this.isTicking = false
      return
    }
    this.isTicking = true
    requestAnimationFrame(this.tick)
  }

  tick (newtime) {
    this.now = newtime
    this.elapsed = this.now - this.then

    if (this.elapsed < this.fpsInterval) {
      this.kick()
      return
    }

    this.then = this.now - (this.elapsed % this.fpsInterval)

    // Take a copy to prevent circular processing
    const callbacks = this.callbacks.slice(0)
    this.callbacks.length = 0
    // Sort by order if defined
    callbacks.sort((a, b) => {
      return (a.order || 0) - (b.order || 0)
    })
    while (callbacks.length) {
      const callback = callbacks.shift()
      try {
        callback()
      } catch (err) {
        console.warn(err)
      }
    }
    this.kick()
  }
}

export default new RAFLoop()
