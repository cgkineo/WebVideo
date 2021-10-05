import hasWebAudio from './hasWebAudio'
import VideoNode from './VideoNode'
import RAFLoop from './RAFLoop'

export default class DestinationNode extends VideoNode {
  constructor (context, mediaElement, options = {}) {
    super(context, options)
    this.mediaElement = typeof mediaElement === 'string' ? document.querySelector(mediaElement) : mediaElement
    this.canvas2DContext = this.mediaElement.getContext('2d', { alpha: false })
    this.canvas2DContext.webkitImageSmoothingEnabled = false
    this.canvas2DContext.mozImageSmoothingEnabled = false
    this.canvas2DContext.msImageSmoothingEnabled = false
    this.canvas2DContext.imageSmoothingEnabled = false

    // Always push outputs to the end as each frame will be most up to date
    this.update = this.update.bind(this)
    this.update.order = Infinity
  }

  set mediaElement (value) {
    if (!(value instanceof window.HTMLCanvasElement) && !(value instanceof window.OffscreenCanvas)) {
      throw new Error('DestinationNode mediaElement can only be an HTMLCanvasElement or OffscreenCanvas instance')
    }
    this._mediaElement = value
  }

  get mediaElement () {
    return this._mediaElement
  }

  onSourceChanged (event) {
    // Limit renders to framerate
    RAFLoop.add(this.update)
  }

  onOriginChanged (event, inputIndex) {
    if (!hasWebAudio) return

    const audioContext = this.context.audioContext
    const source = event.detail?.detail?.source

    // we are only concerned with sources (dis)connecting directly with this DestinationNode
    if (!source || event.target !== this) return

    if (event.type === 'removed') {
      source.audioOrigins.forEach(origin => origin.audioNode.disconnect(audioContext.destination))
    } else if (event.type === 'added') {
      source.audioOrigins.forEach(origin => origin.audioNode.connect(audioContext.destination))
    }
  }

  update () {
    if (!(this.mediaElement instanceof window.HTMLCanvasElement) && !(this.mediaElement instanceof window.OffscreenCanvas)) return
    super.update()
  }

  render () {
    const source = this.sources[0]
    /** @type {Frame} */
    source.applyDimensions(this.mediaElement)
    this.canvas2DContext.drawImage(source.output, 0, 0, source.width, source.height)
  }
}
