const app = require('../../../server/server');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SourceTypes = require('../../../common/models/data/type/source-types');

const timeHelper = require('../../../common/lib/util/time-helper');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const leadTicketContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/lead-ticket-context');

const { ANASS, time, timeEnd, log } = require('../../../common/lib/util/log');

const getEventsToCreate = () => {
  const startMoment = moment('2021-01-01');
  const $match = {
    'leadTicket.createdAt': { $gte: startMoment.toDate() },
  };

  nBuckets = moment().diff(startMoment, 'days');
  const getBucketBoundary = (e, i) => startMoment.clone().add(i, 'days').toDate();
  const $bucket = {
    groupBy: '$leadTicket.createdAt',
    boundaries: Array.from(Array(nBuckets)).map(getBucketBoundary),
    default: 'NULL',
    output: {
      docs: { $push: { garageId: '$garageId', leadSaleType: '$leadTicket.saleType', source: '$source.type' } },
    },
  };

  const $unwind = '$docs';

  const $group = {
    _id: { date: '$_id', garageId: '$docs.garageId', leadSaleType: '$docs.leadSaleType' },
    sources: { $push: '$docs.source' },
  };

  const pipeline = [{ $match }, { $bucket }, { $unwind }, { $group }];

  return app.models.DatasAsyncviewLeadTicket.getMongoConnector().aggregate(pipeline).toArray();
};

const getCounters = (source) => {
  // counter specs will be transformed into an Object using Object.fromEntries
  // [key, value] where key is counter's name and value is an Int >= 0
  // values === 0 => eliminated
  // if you wish to add a new counter, feel free to add a line
  const escapedSource = source.replace('\\', '\\\\').replace('$', '\\u0024').replace('.', '\\u002e');
  const countersSpecs = [
    ['customSource', !SourceTypes.hasValue(source)], // #4010 counting manual leads with customSources
    ['manualLead', SourceTypes.hasValue(source) && !!SourceTypes.getPropertyFromValue(source, 'manualLeadSource')],
    [escapedSource, 1],
  ];
  return Object.fromEntries(countersSpecs.filter(([k, v]) => v > 0));
};

const createEvents = ({ _id: { date, garageId, leadSaleType }, sources }) => {
  return () => {
    if (!sources.length) {
      return;
    }

    const eventDay = timeHelper.dayNumber(date);
    const eventsEmitterContext = leadTicketContext.create(ObjectID(garageId), leadSaleType, eventDay);
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);

    for (source of sources) {
      const counters = getCounters(source);
      eventsEmitter.accumulatorAdd(leadTicketContext.EVENTS.ADD_LEAD_TICKET, counters);
    }
    return eventsEmitter.accumulatorEmit(true);
  };
};

app.on('booted', async () => {
  try {
    const eventsToCreate = await getEventsToCreate();

    await concurrentpromiseAll(eventsToCreate.map(createEvents), 500, true);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(42);
  }
});
