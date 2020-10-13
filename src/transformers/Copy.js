import Stream from '../core/Stream';
import Frame from '../core/Frame';

export default class Copy extends Stream {

  constructor() {
    super({
      element: document.createElement('canvas')
    });
    this.context = this.element.getContext('2d', { alpha: true });
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;
  }

  render() {
    const source = this.sources[0];
    if (!source) return;
    /** @type {Frame} */
    const frame = source.frame;
    frame.setDimensions(this.frame);
    this.context.drawImage(frame.element, 0, 0, frame.width, frame.height);
  }

}
