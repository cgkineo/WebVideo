import hasWebAudio from './hasWebAudio';
import VideoNode from './VideoNode';
import VideoParam from './VideoParam';

export default class AudioCrossfadeNode extends VideoNode {

  constructor(...args) {
    super(...args);
    this._amount = new VideoParam(this.context, 0, 1, 0, value => {
      if (this.options.amount === value) return;
      this.options.amount = value;
      // Use an equal-power crossfading curve:
      const gain1 = Math.cos(value * 0.5 * Math.PI);
      const gain2 = Math.cos((1.0 - value) * 0.5 * Math.PI);
      if (hasWebAudio) {
        // Use WebAudio GainNodes to control crossfade
        this.audioNode.source1.gain.value = gain1;
        this.audioNode.source2.gain.value = gain2;
      } else {
        // Use origin volume properties to control crossfade
        const source1 = this.sources[0];
        const source2 = this.sources[1];
        const source1Origins = source1.audioOrigins;
        const source2Origins = source2.audioOrigins;
        source1Origins.forEach(origin => origin.mediaElement.volume = gain1);
        source2Origins.forEach(origin => origin.mediaElement.volume = gain2);
      }
      this.changed();
    });
  }

  onOriginChanged() {
    const source1 = this.sources[0];
    const source2 = this.sources[1];
    if (!source1 || !source2) return;
    if (!hasWebAudio) return;
    const audioContext = this.context.audioContext;
    const source1Origins = source1.audioOrigins;
    const source2Origins = source2.audioOrigins;
    // Use GainNodes to mix two volumes together
    this.audioNode = this.audioNode || new GainNode(audioContext);
    this.audioNode.source1 = this.audioNode.source1 || new GainNode(audioContext);
    this.audioNode.source2 = this.audioNode.source2 || new GainNode(audioContext);
    this.audioNode.source1.connect(this.audioNode);
    this.audioNode.source2.connect(this.audioNode);
    // Attach sources accordingly
    function attachOriginsToOutput(origins, output) {
      origins.forEach(origin => origin.audioNode.connect(output));
    }
    attachOriginsToOutput(source1Origins, this.audioNode.source1);
    attachOriginsToOutput(source2Origins, this.audioNode.source2);
  }

  /** @type {VideoParam} */
  get amount() {
    return this._amount;
  }

    /**
   * Rerender all changed sources origins to destinations
   */
  update() {
    let hasChanged = false;
    for (let i = 0, l = this.sources.length; i < l; i++) {
      const source = this.sources[i];
      // TODO: Ignore inactive sources
      if (source.lastChanged < this._lastRendered) continue;
      source.update();
      hasChanged = true;
    }
    if (!hasChanged) return;
    this._lastRendered = Date.now();
    this.render();
  }

}
