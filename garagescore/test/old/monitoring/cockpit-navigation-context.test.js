const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const timeHelper = require('../../../common/lib/util/time-helper');
const CockpitNavigationContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/cockpit-navigation-context');

const expect = chai.expect;
chai.should();

const app = new TestApp();

describe('Cockpit navigation context', () => {
  let user = null;
  beforeEach(async () => {
    await app.reset();
    user = await app.addUser({ job: 'test', email: 'test@test.com' });
  });
  it('Sent event', async () => {
    const eventsEmitterContext = CockpitNavigationContext.create('page1', user.getId());
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);
    eventsEmitter.accumulatorAdd(CockpitNavigationContext.EVENTS.CLICKS, { button1: 14 });
    eventsEmitter.accumulatorAdd(CockpitNavigationContext.EVENTS.TIME_SPENT_ON_PAGE, { time: 30 });
    eventsEmitter.accumulatorAdd(CockpitNavigationContext.EVENTS.TIME_SPENT_ON_PAGE, { time: 14 });
    await eventsEmitter.accumulatorEmit();
    const count = await app.getCollection('InternalEvent').count();
    expect(count).equals(2);
    let event = await app.getCollection('InternalEvent').getMongoConnector().findOne({ eventType: 'CLICKS' });
    expect(event.eventDay).equals(timeHelper.todayDayNumber());
    expect(event.nEvents).equals(1);
    expect(event.nSamples).equals(1);
    expect(event.eventType).equals(CockpitNavigationContext.EVENTS.CLICKS);
    expect(event.key1).equals('page1');
    expect(event.key2).equals(user.getId());
    expect(event.key3).equals('test');
    expect(event.userEmail).equals('test@test.com');
    expect(event.counters.button1).equals(14);
    event = await app.getCollection('InternalEvent').getMongoConnector().findOne({ eventType: 'TIME_SPENT_ON_PAGE' });
    expect(event.eventDay).equals(timeHelper.todayDayNumber());
    expect(event.nEvents).equals(2);
    expect(event.nSamples).equals(1);
    expect(event.eventType).equals(CockpitNavigationContext.EVENTS.TIME_SPENT_ON_PAGE);
    expect(event.key1).equals('page1');
    expect(event.key2).equals(user.getId());
    expect(event.key3).equals('test');
    expect(event.userEmail).equals('test@test.com');
    expect(event.counters.time).equals(44);
  });
});
