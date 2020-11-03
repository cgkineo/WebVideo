import RAFLoop from './RAFLoop';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class VideoParam {

  constructor(context, minValue, maxValue, defaultValue, updater) {
    this.changed = this.changed.bind(this);
    /** @type {VideoContext} */
    this._context = context;
    this._type = typeof minValue;
    this._minValue = minValue;
    this._maxValue = maxValue;
    this._updater = updater;
    this._scheduledChanges = [];
    this.value = defaultValue;
    this._context.addParam(this);
  }

  get context() {
    return this._context;
  }

  changed() {
    // TODO: see https://www.w3.org/TR/webaudio/#AudioParam
    //  Based on this.context.currentTime
    // Apply the values according to the outstanding scheduled events
    if (!this._scheduledChanges.length) return;
    for (let i = 0, l = this._scheduledChanges.length; i < l; i++) {
      const scheduledChanged = this._scheduledChanges[i];
      if (scheduledChanged.hasOwnProperty('startTime')) {
        const isExpired = (this.context.currentTime >= scheduledChanged.startTime);
        if (!isExpired) continue;
        switch (scheduledChanged.type) {
          case 'SetValue':
            this.value = scheduledChanged.value;;
            // mark this scheduled change as actioned
            scheduledChanged.isComplete = true;
            console.log('modify VideoParam');
            break;
        }
      }
    }
    this._scheduledChanges = this._scheduledChanges.filter(scheduledChange => !scheduledChange.isComplete);
    RAFLoop.add(this.changed);
  }

  get minValue() {
    return this._minValue;
  }

  get maxValue() {
    return this._maxValue;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value instanceof Function) {
      value = value();
    }
    this._value = value;
    this._updater(value);
  }

  setValueAtTime(value, startTime) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime
    this._scheduledChanges.push({
      type: 'SetValue',
      startTime,
      value
    });
    RAFLoop.add(this.changed);
  }

  linearRampToValueAtTime(value, endTime) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime
    this._scheduledChanges.push({
      type: 'LinearRampToValue',
      endTime,
      value
    });
    // TODO: look for any preceding event, if found schedule the linearRamp to begin at the endTime of the
    // previous event (either a setValueAtTime or linearRampToValueAtTime)
    RAFLoop.add(this.changed);
  }

  exponentialRampToValueAtTime(value, endTime) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime
    this._scheduledChanges.push({
      type: 'ExponentialRampToValue',
      endTime,
      value
    });
    RAFLoop.add(this.changed);
  }

  setTargetAtTime(target, startTime, timeConstant) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime
    this._scheduledChanges.push({
      type: 'SetTarget',
      startTime,
      timeConstant,
      target
    });
    RAFLoop.add(this.changed);
  }

  setValueCurveAtTime(values, startTime, duration) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime
    this._scheduledChanges.push({
      type: 'SetValueCurve',
      startTime,
      duration,
      values
    });
    RAFLoop.add(this.changed);
  }

  cancelScheduledValues(startTime) {
    // see https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues
    if (startTime <= Date.now()) {
      this._scheduledChanges = [];
      return;
    }
    this._scheduledChanges.push({
      type: 'cancelScheduledValues',
      startTime
    });
    RAFLoop.add(this.changed);
  }

  cancelAndHoldAtTime() {
    // TODO: Recalculate existing animations, see https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime
  }

}
