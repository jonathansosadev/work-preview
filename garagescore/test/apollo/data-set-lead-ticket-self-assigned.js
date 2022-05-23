const chai = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const LA_CENTRALE = require('../../common/lib/garagescore/cross-leads/examples/LaCentrale.json');
const crossLeadsIncomingEmail = require('../../workers/jobs/scripts/cross-leads-incoming-email.js');
const { GaragesTest } = require('../../frontend/utils/enumV2');

const { expect } = chai;
const app = new TestApp();

const _generateMockIncomingEmail = async (garageId, emailJson, params) => {
  let example = emailJson || {
    type: 'Email',
    externalId: 'fus ro dah',
    status: IncomingCrossLeadsStatus.NEW,
    raw: {
      Subject: 'COUCOU',
      'body-html': '<div>COUCOU</div>',
      'body-plain': 'COUCOU plain text',
    },
    payload: {
      to: `lacentrale.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
      html: '<div>Nothing to parse here</div>',
    },
  };
  if (params) example = { ...example, ...params };
  example.receivedAt = new Date();
  example.payload.to = example.payload.to.replace(/\.(.*)@/, `.${garageId}@`);
  example.garageId = ObjectID(garageId);
  return app.models.IncomingCrossLead.create(example);
};

/* data-set-lead-ticket-self-assigned */
describe('data set lead ticket self assigned', () => {
  it('self assign a lead ticket', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const email = await _generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    let [data] = await garage.datas();
    const user = await app.addUser({ email: 'user@test.com' });
    const request = `mutation dataSetLeadTicketSelfAssigned($dataId: String!) {
      DataSetLeadTicketSelfAssigned(dataId: $dataId) {
        status
        message
      }
    }`;
    await user.addGarage(garage);
    const variables = { dataId: data.id.toString() };

    // Self assign a ticket
    let res = await _sendQueryAs(app, request, variables, user.getId());
    data = await app.models.Data.findById(variables.dataId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(201);
    expect(data.get('leadTicket.manager')).to.be.equal(user.getId());
    expect(data.get('leadTicket.selfAssignedTo')).to.be.equal(user.getId());

    // retry the same ticket
    res = await _sendQueryAs(app, request, variables, user.id); // Should not change anything
    data = await app.models.Data.findById(variables.dataId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(208); // Already manager of it
    expect(data.get('leadTicket.manager')).to.be.equal(user.getId());
    expect(data.get('leadTicket.selfAssignedTo')).to.be.equal(user.getId());

    // add a new user and try the same ticket
    const user2 = await app.addUser({ email: 'user2@test.com' });
    await user2.addGarage(garage);

    res = await _sendQueryAs(app, request, variables, user2.getId()); //  Should not change anything, error should be shown
    data = await app.models.Data.findById(variables.dataId);
    expect(data.get('leadTicket.manager')).to.be.equal(user.getId());
    expect(data.get('leadTicket.selfAssignedTo')).to.be.equal(user.getId());

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(403); // Someone else already took it
    expect(res.data.DataSetLeadTicketSelfAssigned.message).to.be.equal(
      `Sorry, user ${user.getId()} was there before you ${user2.getId()} on data ${variables.dataId}`
    );

    // see the actions if one transfer has been added
    expect(data.get('leadTicket.actions.2.selfAssigned')).to.be.true;
    expect(data.get('leadTicket.actions.2.sourceType')).to.be.equal(LA_CENTRALE.sourceType);
    expect(data.get('leadTicket.actions.2.assignerUserId')).to.be.equal(user.getId());
    expect(data.get('leadTicket.actions.2.ticketManagerId')).to.be.equal(user.getId());
  });
  it('should not access ticket from a other garage', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const email = await _generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    let [data] = await garage.datas();
    const user = await app.addUser({ email: 'user@test.com' });
    const request = `mutation dataSetLeadTicketSelfAssigned($dataId: String!) {
      DataSetLeadTicketSelfAssigned(dataId: $dataId) {
        status
        message
      }
    }`;
    const variables = { dataId: data.id.toString() };

    // Self assign a ticket
    let res = await _sendQueryAs(app, request, variables, user.getId());
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(403);
    expect(res.data.DataSetLeadTicketSelfAssigned.message).to.be.equal(`Sorry, this ticket doesn't belong to you`);
  });
});
