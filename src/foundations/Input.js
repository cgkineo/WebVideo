import Stream from '../core/Stream';
import RAFLoop from '../core/RAFLoop';

export default class Input extends Stream {

  constructor({
    element = null,
  } = {}) {
    super({ element });
    this.redraw = this.redraw.bind(this);
    this.onRedraw = this.onRedraw.bind(this);
    this.isVideo = (this.element instanceof HTMLVideoElement);
    this._isIn = false;
    if (this.isVideo) {
      this.element.addEventListener('play', this.redraw);
      this.element.addEventListener('timeupdate', this.redraw);
    }
  }

  /**
   * Trigger onRedraw, throttled to the framerate and inside an animation frame
   */
  redraw() {
    RAFLoop.add(this.onRedraw);
  }

  onRedraw() {
    this.changed();
    if (!this.isVideo || this.element.paused) return;
    RAFLoop.add(this.redraw);
  }

}
