const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const GarageStatuses = require('../../common/models/garage.status');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Garage set status', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Set garage status', async () => {
    const testGarage = await testApp.addGarage({ status: GarageStatuses.RUNNING_AUTO });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const request = `mutation GarageSetGarageStatus($id: String!, $status: String!, $tickets: [garageSetGarageStatusTicket]) {
      GarageSetGarageStatus(id: $id, status: $status, tickets: $tickets) {
      result
    }
    }`;
    let garageInstance = await testGarage.getInstance();
    expect(garageInstance.status).to.be.equal(GarageStatuses.RUNNING_AUTO);
    const id = garageInstance.getId().toString();
    const variables = { id, status: GarageStatuses.STOPPED };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.GarageSetGarageStatus).to.not.be.undefined;
    expect(res.data.GarageSetGarageStatus.result).equal('OK');
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.status).to.be.equal(GarageStatuses.STOPPED);
  });
});
