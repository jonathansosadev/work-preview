/**
 * Emits events about our app (send an http request to a webhook in mongodb)
 * Events are saved in the internalEvents collection
 */
const app = require('../../../../../server/server');

class EventsEmitter {
  constructor(context) {
    if (!context) {
      this.disabled = true;
      return;
    }
    const { key1, key2, key3, key4, key5, emitListener, correlatedFields, eventDay } = context;

    this.key1 = key1;
    this.key2 = key2;
    this.key3 = key3;
    this.key4 = key4;
    this.key5 = key5;
    this.emitListener = emitListener;
    this.correlatedFields = correlatedFields;
    this.eventDay = eventDay;
  }

  // add an event but do not send it now
  accumulatorAdd(eventType, counters, nEvents = 1) {
    if (this.disabled) {
      return;
    }
    if (!this.accumulatedEvents) {
      this.accumulatedEvents = {};
    }
    if (!this.accumulatedEvents[eventType]) {
      this.accumulatedEvents[eventType] = { eventType, nEvents: 0, counters: {} };
    }
    this.accumulatedEvents[eventType].nEvents += nEvents;
    if (counters) {
      const eventCounts = this.accumulatedEvents[eventType].counters;
      const keys = Object.keys(counters);
      keys.forEach((key) => {
        let count = eventCounts[key] || 0;
        count += counters[key];
        eventCounts[key] = count;
      });
    }
  }

  // send every events accumulated
  async accumulatorEmit(returnPromise = false) {
    if (this.disabled) {
      return;
    }
    if (!this.accumulatedEvents) {
      return;
    }
    const { key1, key2, key3, key4, key5 } = this;
    const events = Object.values(this.accumulatedEvents);
    for (const e of events) {
      if (this.emitListener) {
        const data = {
          key1,
          key2,
          key3,
          key4,
          key5,
          eventType: e.eventType,
          counters: e.counters,
          nEvents: e.nEvents,
        };
        this.emitListener(data);
      }
      const addInternalEventPromise = app.models.InternalEvent.add(
        [key1, key2, key3, key4, key5],
        e.eventType,
        e.counters,
        e.nEvents,
        this.correlatedFields,
        this.eventDay
      );

      if (returnPromise) {
        return addInternalEventPromise;
      }
      await addInternalEventPromise;
      /**/
    }
  }
}

module.exports = EventsEmitter;
