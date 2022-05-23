/*
A big accumulator,
Every time you add an event, it reuse an corresponding events-emitter or create internally a corresponding one
events-emitter are created for every {garageId, dataType, stepNumber, stepDisplayName}

*/
const EventsEmitter = require('./events-emitter');

class AccumulatorsPool {
  constructor(emitListener) {
    this.emitters = {};
    this.emitListener = emitListener;
  }

  // add an event but do not send it now
  add(context, type, counters, nEvents = 1) {
    const key = `${context.key1 || ''}${context.key2 || ''}${context.key3 || ''}${context.key4 || ''}${
      context.key5 || ''
    }`;
    let emitter = this.emitters[key];
    if (!emitter) {
      emitter = new EventsEmitter({ ...context, emitListener: this.emitListener });
      this.emitters[key] = emitter;
    }
    try {
      emitter.accumulatorAdd(type, counters, nEvents);
    } catch (e) {
      console.log(e);
      console.log(emitter);
      process.exit();
    }
  }

  // send every events accumulated
  async emit() {
    const emitters = Object.values(this.emitters);
    console.log(`Emit from ${emitters.length} emitters`);
    for (const emitter of emitters) {
      await emitter.accumulatorEmit();
    }
  }
}
module.exports = AccumulatorsPool;
