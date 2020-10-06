function initializeEvents(subject) {
  if (subject.hasOwnProperty("events") && subject.events && subject.trigger) return;
  if (!subject.hasOwnProperty("events") || !subject.events) {
    Object.defineProperty(subject, 'events', {
      value: new Array(),
      enumerable: false,
      writable: true
    });
  }
  if (!subject.trigger) {
    Object.defineProperty(subject, 'trigger', {
      value: Events.prototype.trigger,
      enumerable: false,
      writable: true
    });
  }
}

class EventAttachment {

  constructor(options) {
    if (!options.name) return;
    if (!options.callback) {
      throw "Cannot find callback";
    }
    initializeEvents(options.from);
    initializeEvents(options.to);
    this.from = options.from;
    this.to = options.to;
    this.context = options.context;
    this.name = options.name;
    this.callback = options.callback;
    this.once = options.once;
    this.from.events.push(this);
    if (this.from === this.to) return;
    this.to.events.push(this);
  }

  destroy() {
    this.from.events = this.from.events.filter(function(event) {
      return event !== this;
    }.bind(this));
    if (this.from === this.to) return;
    this.to.events = this.to.events.filter(function(event) {
      return event !== this;
    }.bind(this));
  }

}

function parseEventsArgumentNotation(name, callback, subject, each, that) {
  if (name instanceof Object) {
    const object = name;
    subject = subject || that;
    for (let k in object) {
      const names = k.split(" ");
      for (let i = 0, l = names.length; i < l; i++) {
        const eventName = names[i];
        const cb = object[k];
        each.call(that, eventName, cb, subject);
      }
    }
  } else if (typeof name === "string") {
    subject = subject || that;
    const names = name.split(" ");
    for (let i = 0, l = names.length; i < l; i++) {
      const eventName = names[i];
      each.call(that, eventName, callback, subject);
    }
  } else if (name === undefined && callback === undefined && subject === undefined) {
    return each.call(that, null, null, null);
  }
}

export default class Events {

  listenTo(subject, name, callback) {
    parseEventsArgumentNotation(name, callback, subject, (name, callback, subject) => {
      new EventAttachment({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  }

  listenToOnce(subject, name, callback) {
    parseEventsArgumentNotation(name, callback, subject, (name, callback, subject) => {
      new EventAttachment({
        from: subject,
        to: this,
        context: this,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  }

  stopListening(subject, name, callback) {
    parseEventsArgumentNotation(name, callback, subject, function(name, callback) {
      if (!this.events) return;
      for (let i = this.events.length - 1; i > -1; i--) {
        const event = this.events[i];
        if (event.to.events !== this.events) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  }

  on(name, callback, context) {
    parseEventsArgumentNotation(name, callback, context, function(name, callback, context) {
      new EventAttachment({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: false
      });
    }, this);
  }

  once(name, callback, context) {
    parseEventsArgumentNotation(name, callback, context, (name, callback, context) => {
      new EventAttachment({
        from: this,
        to: this,
        context: context,
        name: name,
        callback: callback,
        once: true
      });
    }, this);
  }

  off(name, callback, context) {
    parseEventsArgumentNotation(name, callback, context, (name, callback) => {
      if (!this.events) return;
      for (let i = this.events.length - 1; i > -1; i--) {
        const event = this.events[i];
        if (event.from.events !== this.events) continue;
        if (name !== null && event.name !== name) continue;
        if (callback !== null && event.callback !== callback) continue;
        event.destroy();
      }
    }, this);
  }

  trigger(name, ...args) {
    const events = [];
    if (!this.events) return;
    for (let i = 0, l = this.events.length; i < l; i++) {
      const event = this.events[i];
      if (event.from.events !== this.events) continue;
      if (event.name !== "*" && event.name !== name) continue;
      events.push(event);
    }
    events.reverse();
    for (let i = events.length - 1; i > -1; i--) {
      const event = events[i];
      if (event.name === "*") {
        event.callback.apply(event.context, arguments);
      } else {
        event.callback.apply(event.context, args);
      }
      if (!event.once) continue;
      event.destroy();
    }
  }

  destroy() {
    this.stopListening();
  }

}
