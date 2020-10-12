
export class RAFLoop {

  constructor({ fps = 60 } = {}) {
    this.callbacks = [];
    this.lastTick = -1;
    this.tick = this.tick.bind(this);
    this.kick = this.kick.bind(this);
    this.isWaitingTick = false;
    this.fps = fps;
  }

  set fps(value) {
    if (value > 60) value = 60;
    else if (value < 25) value = 25;
    this._fps = value;
    this._interval = 1000 / value;
  }

  get fps() {
    return this._fps;
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
    this._lastTry = Date.now();
    requestAnimationFrame(this.tick);
  }

  tick() {
    this.isTicking = true;
    const now = Date.now();
    this._rafOffset = now - this._lastTry;
    if (this._rafOffset < 10) this._rafOffset = 10;
    const timePassed = (now - this.lastTick);
    const timeLeft = this._interval - timePassed;
    if (timeLeft >= 20) {
      // Too soon, able to schedule
      return setTimeout(this.kick, timeLeft - this._rafOffset);
    }
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
    this.lastTick = now;
    setTimeout(this.kick, this._interval - this._rafOffset);
  }

}

export default new RAFLoop();


