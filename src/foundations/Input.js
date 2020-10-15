import Stream from '../core/Stream';
import RAFLoop from '../core/RAFLoop';

export default class Input extends Stream {

  constructor(options = {}) {
    super();
    /** @type {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|HTMLAudioElement} */
    this.element = typeof options.element === 'string' ? document.querySelector(options.element) : options.element;
    this.changed = this.changed.bind(this);
    // Always push inputs the front to cascade correctly on each frame
    this.changed.order = -Infinity;
    this.isVideo = (this.element instanceof HTMLVideoElement);
    if (this.isVideo) {
      this.element.addEventListener('play', this.changed);
      this.element.addEventListener('timeupdate', this.changed);
      this._lastSeconds = 0;
    }
  }

  set element(value) {
    if (
      !(value instanceof HTMLVideoElement) &&
      !(value instanceof HTMLImageElement) &&
      !(value instanceof HTMLCanvasElement) &&
      !(value instanceof HTMLAudioElement)
    ) {
      throw new Error('Input must be an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement or HTMLAudioElement');
    }
    this._element = value;
    this.changed();
  }

  /**
   * @type {HTMLVideoElement}
   */
  get element() {
    return this._element;
  }

  /**
   * Trigger changed repeatedly for videos, throttle to the framerate and inside an animation frame
   */
  changed() {
    super.changed();
    if (!this.isVideo || this.element.paused) return;
    RAFLoop.add(this.changed);
  }

}
