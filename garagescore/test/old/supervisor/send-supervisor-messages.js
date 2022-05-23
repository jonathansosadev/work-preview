/* eslint-disable no-unused-expressions */
const TestApp = require('../../../common/lib/test/test-app');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service');
const SupervisorMessageType = require('../../../common/models/supervisor-message.type');
const promises = require('../../../common/lib/util/promises');

const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();
/**
Test supervisor messages
*/

const checksCreatedContacts = async (expected) => {
  if (!expected) {
    return;
  }
  const contacts = await app.contacts();
  expect(contacts).to.be.not.null;
  expect(contacts.length).equal(expected.length, 'contacts.length');
  for (let c = 0; c < contacts.length; c++) {
    expect(contacts[c].type).equal(expected[c].type);
    expect(contacts[c].recipient).equal(expected[c].recipient);
    expect(contacts[c].status).equal(expected[c].status);
    expect(contacts[c].type).equal(expected[c].type);
    expect(contacts[c].payload.key).equal(expected[c].payload.key);
  }
};

describe('Supervisor:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Send warning to both tech', async function test() {
    const warn = promises.makeAsync(GsSupervisor.warn);
    await warn({
      type: SupervisorMessageType.SEND_NEXT_CONTACT_ERROR,
      payload: { error: 'Test error tech', context: 'Tests' },
    });
    // DROPPED_ALERT_EMAIL
    await app.sendSupervisorReports();
    await checksCreatedContacts([
      {
        type: 'SUPERVISOR_REPORT_EMAIL',
        to: 'hackers@custeed.com',
        status: 'Waiting',
        payload: { error: 'Test error tech' },
      },
    ]);
  });
  it('Send warning to customer', async function test() {
    const warn = promises.makeAsync(GsSupervisor.warn);
    await warn({
      type: SupervisorMessageType.DROPPED_ALERT_EMAIL,
      payload: { error: 'Test error customer', context: 'Tests' },
    });
    // DROPPED_ALERT_EMAIL
    await app.sendSupervisorReports();
    await checksCreatedContacts([
      {
        type: 'SUPERVISOR_REPORT_EMAIL',
        to: 'customer_success@custeed.com',
        status: 'Waiting',
        payload: { error: 'Test error customer' },
      }, // eslint-disable-line max-len
    ]);
  });
  it('Send warning to both team', async function test() {
    const warn = promises.makeAsync(GsSupervisor.warn);
    await warn({
      type: SupervisorMessageType.SEND_NEXT_CONTACT_ERROR,
      payload: { error: 'Test error tech', context: 'Tests' },
    });
    await warn({
      type: SupervisorMessageType.DROPPED_ALERT_EMAIL,
      payload: { error: 'Test error customer', context: 'Tests' },
    });
    // DROPPED_ALERT_EMAIL
    await app.sendSupervisorReports();
    await checksCreatedContacts([
      {
        type: 'SUPERVISOR_REPORT_EMAIL',
        to: 'hackers@custeed.com',
        status: 'Waiting',
        payload: { error: 'Test error tech' },
      }, // eslint-disable-line max-len
      {
        type: 'SUPERVISOR_REPORT_EMAIL',
        to: 'customer_success@custeed.com',
        status: 'Waiting',
        payload: { error: 'Test error customer' },
      }, // eslint-disable-line max-len
    ]);
  });
});
