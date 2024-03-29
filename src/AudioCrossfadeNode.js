import hasWebAudio from './hasWebAudio'
import VideoNode from './VideoNode'
import VideoParam from './VideoParam'

export default class AudioCrossfadeNode extends VideoNode {
  constructor (...args) {
    super(...args)
    this._amount = new VideoParam(this.context, 0, 1, 0, value => {
      if (this.options.amount === value) return
      this.options.amount = value
      // Use an equal-power crossfading curve:
      const gain1 = Math.cos(value * 0.5 * Math.PI)
      const gain2 = Math.cos((1.0 - value) * 0.5 * Math.PI)
      if (hasWebAudio) {
        // Use WebAudio GainNodes to control crossfade
        this.audioNode.source1.gain.value = gain1
        this.audioNode.source2.gain.value = gain2
      } else {
        // Use origin volume properties to control crossfade
        const source1 = this.sources[0]
        const source2 = this.sources[1]
        const source1Origins = source1.audioOrigins
        const source2Origins = source2.audioOrigins
        source1Origins.forEach(origin => { origin.mediaElement.volume = gain1 })
        source2Origins.forEach(origin => { origin.mediaElement.volume = gain2 })
      }
      this.changed()
    })
  }

  destroy () {
    /* if (hasWebAudio) {
      if (this.audioNode.source1) detachOriginsFromOuput(this.sources[0], this.audioNode.source1);
      if (this.audioNode.source2) detachOriginsFromOuput(this.sources[1], this.audioNode.source2);
    } */

    super.destroy()

    /* function detachOriginsFromOuput (source, output) {
      const origins = source.audioOrigins
      origins.forEach(origin => origin.audioNode.disconnect(output))
    } */
  }

  onOriginChanged (event) {
    if (!hasWebAudio) return

    // console.log('Test1 AudioCrossfadeNode::onOriginChanged', event.type, 'event source', event?.detail?.detail?.source?.toString());

    if (event.type === 'removed') {
      const source = event.detail?.detail?.source
      const inputIndex = event.detail?.detail?.inputIndex

      if (source && this.audioNode) {
        const output = inputIndex === 0 ? this.audioNode.source1 : this.audioNode.source2
        source.audioOrigins.forEach(origin => origin.audioNode.disconnect(output))
        this.logger.log(`removed ${source.toString()} audio from ${this.toString()} gain ${inputIndex}`)
      }

      return
    }

    const source1 = this.sources[0]
    const source2 = this.sources[1]

    if (!source1 || !source2) return

    const audioContext = this.context.audioContext
    const source1Origins = source1.audioOrigins
    const source2Origins = source2.audioOrigins
    // Use GainNodes to mix two volumes together
    this.audioNode = this.audioNode || new GainNode(audioContext)
    this.audioNode.source1 = this.audioNode.source1 || new GainNode(audioContext)
    this.audioNode.source2 = this.audioNode.source2 || new GainNode(audioContext)
    this.audioNode.source1.connect(this.audioNode)
    this.audioNode.source2.connect(this.audioNode)
    // Attach sources accordingly
    function attachOriginsToOutput (origins, output) {
      origins.forEach(origin => origin.audioNode.connect(output))
    }
    attachOriginsToOutput(source1Origins, this.audioNode.source1)
    attachOriginsToOutput(source2Origins, this.audioNode.source2)
  }

  /** @type {VideoParam} */
  get amount () {
    return this._amount
  }

  /**
   * Rerender changed sources origins to destinations
   */
  update () {
    let hasChanged = false
    for (let i = 0, l = 2; i < l; i++) {
      const source = this.sources[i]
      if (!source) continue
      if (this.options.amount === 0 && i === 1) continue
      if (this.options.amount === 1 && i === 0) continue
      if (source.lastChanged < this._lastRendered) continue
      source.update()
      hasChanged = true
    }
    if (!hasChanged) return
    this._lastRendered = Date.now()
    this.render()
  }

  get hasModifications () {
    return (this.options.amount !== 0 && this.options.amount !== 1)
  }

  get output () {
    if (this.options.amount === 0 && this.sources[0]) {
      return this.sources[0].output
    }
    if (this.options.amount === 1 && this.sources[1]) {
      return this.sources[1].output
    }
    return this._mediaElement
  }
}
