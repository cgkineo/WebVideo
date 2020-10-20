import hasWebAudio from './hasWebAudio';
import EventTarget from '@ungap/event-target';
import SourceNode from './SourceNode';
import ColorNode from './ColorNode';
import DisplacementNode from './DisplacementNode';
import FadeNode from './FadeNode';
import SepiaNode from './SepiaNode';
import DestinationNode from './DestinationNode';
/** @typedef {import("./VideoNode").default} VideoNode */
/** @typedef {import("./VideoParam").default} VideoParam */

export default class VideoContext extends EventTarget {

  constructor(destinationElement, options = {}) {
    super();
    if (hasWebAudio) {
      this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const captureUserInteractionEvent = event => {
        document.removeEventListener('click', captureUserInteractionEvent, true);
        document.removeEventListener('play', captureUserInteractionEvent, true);
        if (this._audioContext.state !== 'suspended') return;
        this._audioContext.resume();
      };
      document.addEventListener('click', captureUserInteractionEvent, true);
      document.addEventListener('play', captureUserInteractionEvent, true);
    }
    /** @type {VideoNode} */
    this._nodes = [];
    /** @type {VideoParam} */
    this._params = [];
    this._destinationNode = destinationElement ? new DestinationNode(this, destinationElement, options) : null;
    this._currentTime = 0;
    this._lastResumeTime = 0;
    this._elapsedTime = 0;
    this.suspend();
  }

  get state() {
    return this._state;
  }

  /**
   * Internal helper for keeping nodes
   * @param {Node} node
   */
  addNode(node) {
    this._nodes.push(node);
  }

  /**
   * Internal helper for keeping parameters
   * @param {VideoParam} param
   */
  addParam(param) {
    this._params.push(param);
  }

  /** @type {[Node]} */
  get nodes() {
    return this._nodes;
  }

  /** @type {[VideoParam]} */
  get params() {
    return this._params;
  }

  /** @type {AudioContext} */
  get audioContext() {
    return this._audioContext;
  }

  /** @type {number} */
  get currentTime() {
    if (this._state === VideoContext.SUSPENDED) {
      return this._currentTime;
    }
    // Count elapsed time
    const now = Date.now();
    this._elapsedTime = this._lastResumeTime - now;
    return this._currentTime + this._elapsedTime;
  }

  suspend() {
    if (this._state === VideoContext.CLOSED) return;
    this._currentTime = this._currentTime + this._elapsedTime;
    this._state = VideoContext.SUSPENDED;
  }

  resume() {
    if (this._state === VideoContext.CLOSED) return;
    const now = Date.now();
    this._lastResumeTime = now;
    this._elapsedTime = 0;
    this._state = VideoContext.RUNNING;
  }

  close() {
    // TODO: clear up params, nodes, rafs etc
    this._state = VideoContext.CLOSED;
    if (!hasWebAudio) return;
    this.audioContext.close();
  }

  createElementSource(element, options) {
    return new SourceNode(this, element, options);
  }

  createColor(options) {
    return new ColorNode(this, options);
  }

  createDisplacement(options) {
    return new DisplacementNode(this, options);
  }

  createFade(options) {
    return new FadeNode(this, options);
  }

  createSepia(options) {
    return new SepiaNode(this, options);
  }

  get destination() {
    return this._destinationNode;
  }

}

VideoContext.SUSPENDED = 'suspended';
VideoContext.RUNNING = 'running';
VideoContext.CLOSED = 'closed';
