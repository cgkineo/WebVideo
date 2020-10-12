
export class RAFLoop {

  constructor() {
    this.callbacks = [];
    this.lastTick = -1;
    this.tick = this.tick.bind(this);
    this.kick = this.kick.bind(this);
    this.isTicking = false;
  }

  add(callback) {
    if (this.callbacks.find(cb => cb === callback)) return;
    this.callbacks.push(callback);
    if (this.isTicking) return;
    this.kick();
  }

  kick() {
    if (!this.callbacks.length) {
      this.isTicking = false;
      return;
    }
    requestAnimationFrame(this.tick);
  }

  tick() {
    this.isTicking = true;
    // Take a copy to prevent circular processing
    const callbacks = this.callbacks.slice(0);
    this.callbacks.length = 0;
    while (callbacks.length) {
      const callback = callbacks.shift();
      try {
        callback();
      } catch (err) {
        console.warn(err);
      }
    }
    this.kick();
  }

}

export default new RAFLoop();


