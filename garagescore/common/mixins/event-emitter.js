'use strict';

var debug = require('debug')('garagescore:common:mixins:event-emitter'); // eslint-disable-line max-len,no-unused-vars

/*
 * EventEmitter mixin
 */

function eventEmitterMixin(Model, options) {
  /* Emit an event  (static) */
  Model.emitEvent = function (modelInstance, eventName, eventPayload, callback) {
    Model.app.models.Event.emitFromModelInstance(modelInstance, eventName, eventPayload, callback);
  };
  /* Emit an event  (non-static) */
  Model.prototype.emitEvent = function (eventName, eventPayload, callback) {
    Model.app.models.Event.emitFromModelInstance(this, eventName, eventPayload, callback);
  };
  /* Emit an event  (non-static) */
  Model.prototype.emitAsyncEvent = async function (eventName, eventPayload) {
    return new Promise(
      function (resolve) {
        // eslint-disable-line
        Model.app.models.Event.emitFromModelInstance(this, eventName, eventPayload, resolve);
      }.bind(this)
    );
  };
}

module.exports = eventEmitterMixin;
