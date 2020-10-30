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
    this._playing = new VideoParam(context, 0, 1, 0, value => {
      if (this.options.playing === value) return;
      this.options.playing = value;
      value == 1 ? this.doStart() : this.doStop();
      this.changed();
    });

    this._playhead = new VideoParam(context, 0, Number.MAX_SAFE_INTEGER, 0, value => {
      if (this.options.playhead === value) return;
      this.options.playhead = value;
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
  get playing() {
    return this._playing;
  }

  /** @type {VideoParam} */
  get playhead() {
    return this._playhead;
  }

  /**
   * Trigger changed repeatedly for videos, throttle to the framerate and inside an animation frame
   */
  changed() {
    super.changed();
    if (!this.isPlayable || this.mediaElement.paused) return;
    RAFLoop.add(this.changed);
  }

  async doStart() {
    if (this.isPlayable) {
      await this.mediaElement.play();
    }
  }

  doStop() {
    if (this.isPlayable) this.mediaElement.pause();
  }

}
