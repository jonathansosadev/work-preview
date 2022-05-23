/*
 * Emit an event for the data
 */
function emitEvent(eventName, eventPayload, callback) {
  this.modelInstances.data.emitEvent(eventName, eventPayload, callback);
}

module.exports = emitEvent;
