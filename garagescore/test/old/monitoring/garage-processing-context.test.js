const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const GarageProcessingContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/garage-processing-context');
const dataTypes = require('../../../common/models/data/type/data-types');
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const timeHelper = require('../../../common/lib/util/time-helper');

const expect = chai.expect;
chai.should();

const app = new TestApp();

describe('Garage processing context', () => {
  let garage = null;
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage({ group: 'test', publicDisplayName: 'garageName' });
  });
  it('Sent event', async () => {
    const eventsEmitterContext = GarageProcessingContext.create(garage.getId(), dataTypes.MAINTENANCE);
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);
    eventsEmitter.accumulatorAdd(GarageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, { [`emptyName.total`]: 1 });
    eventsEmitter.accumulatorAdd(GarageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, { [`emptyDate.total`]: 1 });
    eventsEmitter.accumulatorAdd(GarageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, { [`emptyName.total`]: 1 });
    await eventsEmitter.accumulatorEmit();
    const count = await app.getCollection('InternalEvent').count();
    expect(count).equals(1);
    const event = await app.getCollection('InternalEvent').findOne();
    expect(event.eventDay).equals(timeHelper.todayDayNumber());
    expect(event.nEvents).equals(3);
    expect(event.nSamples).equals(1);
    expect(event.eventType).equals(GarageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW);
    expect(event.key1).equals(garage.getId());
    expect(event.key2).equals(dataTypes.MAINTENANCE);
    expect(event.key4).equals('test');
    expect(event.garageName).equals('garageName');
    expect(event.counters.emptyDate.total).equals(1);
    expect(event.counters.emptyName.total).equals(2);
  });
});
