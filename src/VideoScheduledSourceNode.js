import VideoNode from './VideoNode';
import RAFLoop from './RAFLoop';

export default class VideoScheduledSourceNode extends VideoNode {

  constructor(context, options = {}) {
    super(context, options);
    this.check = this.check.bind(this);
    this._startTime = null;
    this._stopTime = null;
  }

  check() {
    const isDue = this._startTime != null && this.context.currentTime >= this._startTime;
    const isExpired = this._stopTime != null && this.context.currentTime >= this._stopTime;

    // note that with this implementation there is no guarantee how far the playhead of underlying media
    // will have advanced: it is not guaranteed to have moved (whenStop - whenStart)

    if (isDue && !isExpired) {
      this._startTime = null;
      this.doStart();
    }
    if (isExpired) {
      this._stopTime = null;
      this.doStop();
    }
    if (this._startTime != null || this._stopTime != null) {
      RAFLoop.add(this.check);
    }
  }

  doStart() {} // to be implemented by subclasses
  doStop() {} // to be implemented by subclasses

  start(when) {
    // TODO: Based on this.context.currentTime
    this._startTime = when || 0;
    RAFLoop.add(this.check);
  }

  stop(when) {
    // TODO: Based on this.context.currentTime
    this._stopTime = when || 0;
    RAFLoop.add(this.check);
  }

}
