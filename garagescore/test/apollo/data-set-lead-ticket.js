const chai = require('chai');

const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const exampleData = require('./examples/data-with-lead-ticket.js');

const { expect } = chai;
const app = new TestApp();

/* data-set-lead-ticket */
describe('data set lead ticket field', () => {
  beforeEach(async function () {
    await app.reset();
  });
  it('set lead ticket field', async function test() {
    const garage = await app.addGarage();
    exampleData.garageId = garage.garageId;
    let data = await app.models.Data.create(exampleData);
    const user = await app.addUser({ email: 'userLeadTicketField@test.com' });
    const request = `mutation dataSetLeadTicket($dataId: String!, $field: String!, $value: String) {
      dataSetLeadTicket(dataId: $dataId, field: $field, value: $value) {
        status
        message
      }
    }`;
    const fields = { dataId: data.id.toString(), field: 'leadTicket.budget', value: '42 000€' };
    // Self assign a ticket
    let res = await _sendQueryAs(app, request, fields, user.getId());
    data = await app.models.Data.findById(fields.dataId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(data.get('leadTicket.budget')).to.be.equal(42000);
  });
});
