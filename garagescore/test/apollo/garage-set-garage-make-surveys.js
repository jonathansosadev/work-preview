const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const GarageStatuses = require('../../common/models/garage.status');
const { expect } = chai;
const testApp = new TestApp();
const { ObjectId } = require('mongodb');

/* Get garage data from api */
describe('Garage set garage make surveys', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Set a garage make survey', async () => {
    const testGarage = await testApp.addGarage({ status: GarageStatuses.RUNNING_AUTO });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const request = `mutation GarageSetGarageMakeSurveys($modifications: [GarageSetGarageMakeSurveysModifications]!) {
      GarageSetGarageMakeSurveys(modifications: $modifications) {
      success
    }
    }`;
    let garage = await testGarage.getInstance();
    const garageId = garage.getId().toString();

    expect(garage.brandNames[0]).equal('Renault');

    // makesurvey modification
    const modification = {
      value: 3,
      brand: 'Renault',
      isMaker: false,
      garageId,
      type: 'Maintenance',
    };

    // maker survey informations
    const modification2 = {
      value: 5,
      brand: 'Renault',
      isMaker: true,
      garageId,
      type: 'Maintenance',
    };

    const variables = { modifications: [modification, modification2] };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const isGarageUpdated = res.data.GarageSetGarageMakeSurveys.success;
    expect(isGarageUpdated).to.be.true;
    garage = await testApp.models.Garage.findOne({ _id: ObjectId(garageId) });

    expect(garage.firstContactDelay.Maintenance.value).to.be.equal(3);
    expect(garage.firstContactDelay.Maintenance.history[0].userId).to.be.equal(user.getId().toString());
    expect(garage.firstContactDelay.Maintenance.history[0].value).to.be.equal(3);
    expect(garage.firstContactDelay.Maintenance.history[0].prevValue).to.be.equal(0);

    expect(garage.firstContactDelay.Maintenance.makerSurvey.Renault.value).to.be.equal(5);
    expect(garage.firstContactDelay.Maintenance.makerSurvey.Renault.prevValue).to.be.equal(0);
    expect(garage.firstContactDelay.Maintenance.makerSurvey.Renault.userId).to.be.equal(user.getId().toString());
  });
});
