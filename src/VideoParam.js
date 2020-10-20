import RAFLoop from './RAFLoop';
/** @typedef {import("./VideoContext").default} VideoContext */

export default class VideoParam {

  constructor(context, minValue, maxValue, defaultValue, updater) {
    this.changed = this.changed.bind(this);
    /** @type {VideoContext} */
    this._context = context;
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
    for (let i = 0, l = this._scheduledChanges.length; i < l; i++) {
      const scheduledChanged = [i];

    }
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