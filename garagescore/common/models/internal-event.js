const timeHelper = require('../lib/util/time-helper');
const moment = require('moment');

module.exports = function InternalEventDef(InternalEventLoopback) {
  /**
   *
   * @param keys  up to 5 keys (stored as key1, key2 and indexed)
   * @param eventType type of event (indexed field)
   * @param counters list of counters as {{'counters.xx': 3}, {'counters.yy': 1}}
   * @param nEvents number of events
   * @param correlatedFields a fonction to compute additional fields based on the keys
   */
  InternalEventLoopback.add = async (
    keys,
    eventType,
    counters = {},
    nEvents = 1,
    correlatedFields = null,
    eventDay = timeHelper.todayDayNumber()
  ) => {
    const InternalEvents = InternalEventLoopback.getMongoConnector();
    const app = InternalEventLoopback.app;
    const [key1, key2, key3, key4, key5] = keys;
    if (!key1 && !key2 && !key3 && !key4 && !key5) {
      return;
    }
    const $match = {
      eventType,
      eventDay,
      nSamples: { $lte: 500 },
    };
    if (key1) {
      $match.key1 = key1;
    }
    if (key2) {
      $match.key2 = key2;
    }
    if (key3) {
      $match.key3 = key3;
    }
    if (key4) {
      $match.key4 = key4;
    }
    if (key5) {
      $match.key5 = key5;
    }
    const counters2 = {}; // we dont want to modify the sample
    Object.keys(counters).forEach((c) => {
      counters2[`counters.${c}`] = counters[c];
    });
    const $inc = {
      nSamples: 1,
      nEvents: nEvents,
      ...counters2,
    };
    const sample = {
      key1,
      key2,
      key3,
      eventType,
      counters,
      nEvents,
    };
    const $push = {
      samples: sample,
    };
    const { acknowledged, matchedCount, modifiedCount } = await InternalEvents.updateOne(
      $match,
      {
        $push,
        $inc,
      },
      { upsert: true }
    );
    if (matchedCount === 0 && correlatedFields) {
      {
        const computed = await correlatedFields(app, { key1, key2, key3, key4, key5 });
        await InternalEvents.updateOne($match, {
          $set: {
            ...computed,
            eventDate: new Date(),
            eventDateString: moment().format('DD/MM/YYYY'),
          },
        });
      }
    }

    return {
      acknowledged,
      matchedCount,
      modifiedCount,
    };
  };
};
