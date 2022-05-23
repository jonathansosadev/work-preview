const _ = require('lodash');
const debug = require('debug')('garagescore:common:models:event'); // eslint-disable-line max-len,no-unused-vars

module.exports = function EventDefiniti(Event) {
  /** emit (and persist) an event from a model instance */
  Event.emitFromModelInstance = function (modelInstance, eventName, eventPayload, callback) {
    // eslint-disable-line no-param-reassign
    const Model = modelInstance.constructor;
    if (_.isUndefined(Model)) {
      callback(new Error('Event.emitFromModelInstance, no Model found'));
      return;
    }

    const modelName = Model.modelName;
    if (!modelName) {
      callback(new Error('Event.emitFromModelInstance, no modelName found'));
      return;
    }

    const event = {};
    event.name = eventName;
    event.emitterModel = modelName;
    event.emitterId = modelInstance.getId().toString();
    event.payload = _.isEmpty(eventPayload) ? {} : eventPayload;

    Event.create(event, (err, createdEvent) => {
      if (err) {
        callback(err);
        return;
      }
      Model.emit(eventName, eventPayload);
      callback(null, createdEvent);
      return;
    });
  };
};
