import VideoNode from './VideoNode'
import VideoParam from './VideoParam'

export default class VideoScheduledSourceNode extends VideoNode {
  constructor (context, options = {}) {
    super(context, options)
    this._started = new VideoParam(context, false, true, false, value => {
      if (this.options.started === value) return
      this.options.started = value
      value === true ? this.doStart() : this.doStop()
      this.changed()
    })
  }

  /**
   * Boolean for scheduling start/stop
   * @type {VideoParam}
   */
  get started () {
    return this._started
  }

  /**
   * To be implemented by subclasses
   */
  doStart () {}

  /**
   * To be implemented by subclasses
   */
  doStop () {}

  /**
   * To be implemented by subclasses
   */
  start (when = 0) {}

  /**
   * To be implemented by subclasses
   */
  stop (when = 0) {}
}
