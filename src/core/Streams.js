export default class Streams {

  constructor(streams) {
    this.items = streams;
  }

  pipe(destination) {
    this.items.forEach((source, index) => {
      source.pipe(destination, index);
    });
  }

  unpipe(destination) {
    this.items.forEach((source, index) => {
      source.unpipe(destination, index);
    });
  }

  drain(source) {
    this.items.forEach((destination) => {
      destination.drain(source);
    });
  }

  undrain(source) {
    this.items.forEach((destination) => {
      destination.undrain(source);
    });
  }

}
