import VideoScheduledSourceNode from './VideoScheduledSourceNode';
import RAFLoop from './RAFLoop';

export default class SourceNode extends VideoScheduledSourceNode {

  constructor(context, mediaElement, options = {}) {
    super(context, options);
    /** @type {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|HTMLAudioElement} */
    this.mediaElement = typeof mediaElement === 'string' ? document.querySelector(mediaElement) : mediaElement;
    this.changed = this.changed.bind(this);
    // Always push inputs the front to cascade correctly on each frame
    this.changed.order = -Infinity;
    this.isVideo = (this.mediaElement instanceof HTMLVideoElement);
    if (this.isVideo) {
      this.mediaElement.addEventListener('play', this.changed);
      this.mediaElement.addEventListener('timeupdate', this.changed);
      this._lastSeconds = 0;
    }
  }

  set mediaElement(value) {
    if (
      !(value instanceof HTMLVideoElement) &&
      !(value instanceof HTMLImageElement) &&
      !(value instanceof HTMLCanvasElement) &&
      !(value instanceof HTMLAudioElement)
    ) {
      throw new Error('SourceNode must be an HTMLVideoElement, HTMLImageElement, HTMLCanvasElement or HTMLAudioElement');
    }
    this._mediaElement = value;
    this.changed();
  }

  /**
   * @type {HTMLVideoElement}
   */
  get mediaElement() {
    return this._mediaElement;
  }

  /**
   * Trigger changed repeatedly for videos, throttle to the framerate and inside an animation frame
   */
  changed() {
    super.changed();
    if (!this.isVideo || this.mediaElement.paused) return;
    RAFLoop.add(this.changed);
  }

}
