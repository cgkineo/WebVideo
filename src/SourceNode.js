import VideoScheduledSourceNode from './VideoScheduledSourceNode';
import RAFLoop from './RAFLoop';
import VideoParam from './VideoParam';

export default class SourceNode extends VideoScheduledSourceNode {

  constructor(context, mediaElement, options = {}) {
    super(context, options);
    /** @type {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement|HTMLAudioElement} */
    this.mediaElement = typeof mediaElement === 'string' ? document.querySelector(mediaElement) : mediaElement;
    this.changed = this.changed.bind(this);
    // Always push inputs the front to cascade correctly on each frame
    this.changed.order = -Infinity;
    this.isPlayable = (this.mediaElement instanceof HTMLVideoElement) || (this.mediaElement instanceof HTMLAudioElement);
    if (this.isPlayable) {
      this.mediaElement.addEventListener('play', this.changed);
      this.mediaElement.addEventListener('timeupdate', this.changed);
      this._lastSeconds = 0;
    }
    this._currentTime = new VideoParam(context, 0, Number.MAX_SAFE_INTEGER, 0, value => {
      if (!this.isPlayable) return;
      if (this.options.currentTime === value) return;
      this.options.currentTime = value;
      console.log('move media time to', value);
      this.mediaElement.currentTime = value;
      this.changed();
    });
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

  /** @type {VideoParam} */
  get currentTime() {
    return this._currentTime;
  }

  async start(when = 0) {
    if (when === 0) {
      return this.doStart();
    }
    this._currentTime.setValueAtTime(true, when);
  }

  stop(when = 0) {
    if (when === 0) {
      return this.doStop();
    }
    this._currentTime.setValueAtTime(false, when);
  }

  async doStart() {
    if (!this.isPlayable) return;
    await this.mediaElement.play();
  }

  doStop() {
    if (!this.isPlayable) return;
    this.mediaElement.pause();
  }

  /**
   * Trigger changed repeatedly for videos, throttle to the framerate and inside an animation frame
   */
  changed() {
    super.changed();
    if (!this.isPlayable || this.mediaElement.paused) return;
    RAFLoop.add(this.changed);
  }

}
