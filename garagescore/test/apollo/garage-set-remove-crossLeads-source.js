const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const PhoneBucket = require('../../common/models/phone-bucket.types');
const { GaragesTest } = require('../../frontend/utils/enumV2');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Garage deleted crossleads source', () => {
  beforeEach(async function () {
    await testApp.reset();
    const garage = await testApp.addGarage({
      crossLeadsConfig: {
        enabled: true,
        sources: [
          {
            enabled: true,
            email: `lacentrale.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
            phone: '0033188333590',
            type: 'LaCentrale',
          },
          {
            enabled: true,
            email: `leboncoin.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
            phone: '0033188333591',
            type: 'LeBonCoin',
          },
        ],
      },
    });
    await testApp.addUser({
      garageIds: [ObjectId(garage.id)],
      allGaragesAlerts: {
        UnsatisfiedMaintenance: true,
      },
    });
    await testApp.models.PhoneBucket.getMongoConnector().insertOne({
      value: '0033188333590',
      status: 'Taken',
      area: '1',
      countryCode: '0033',
      garageId: ObjectId(garage.id),
    });
  });

  it('It should return error when garage not found', async () => {
    const user = await testApp.models.User.findOne();
    const request = `
    mutation garageSetRemoveCrossLeadsSource_DEABcJGFfdcBIEedEdbeJbEaFJIBIaDe ($garageSetRemoveCrossLeadsSource0garageId: String,$garageSetRemoveCrossLeadsSource0email: String,$garageSetRemoveCrossLeadsSource0phone: String) {
      garageSetRemoveCrossLeadsSource (garageId: $garageSetRemoveCrossLeadsSource0garageId,email: $garageSetRemoveCrossLeadsSource0email,phone: $garageSetRemoveCrossLeadsSource0phone) {
          message
          status
        }
     }
    `;
    const variables = {
      garageSetRemoveCrossLeadsSource0email: `lacentrale.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
      garageSetRemoveCrossLeadsSource0garageId: GaragesTest.GARAGE_DUPONT,
      garageSetRemoveCrossLeadsSource0phone: '0033188333590',
    };

    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.data.garageSetRemoveCrossLeadsSource.status).equal('KO');
    expect(res.data.garageSetRemoveCrossLeadsSource.message).equal(`garage ${GaragesTest.GARAGE_DUPONT} not found`);
  });
  it('It should deleted crossleads source laCentrale on garage', async () => {
    const user = await testApp.models.User.findOne();
    const garage = await testApp.models.Garage.findOne();
    const phoneBucket = await testApp.models.PhoneBucket.findOne();
    const request = `
    mutation garageSetRemoveCrossLeadsSource_DEABcJGFfdcBIEedEdbeJbEaFJIBIaDe ($garageSetRemoveCrossLeadsSource0garageId: String,$garageSetRemoveCrossLeadsSource0email: String,$garageSetRemoveCrossLeadsSource0phone: String) {
      garageSetRemoveCrossLeadsSource (garageId: $garageSetRemoveCrossLeadsSource0garageId,email: $garageSetRemoveCrossLeadsSource0email,phone: $garageSetRemoveCrossLeadsSource0phone) {
        message
        status
      }
    }
    `;
    const variables = {
      garageSetRemoveCrossLeadsSource0email: `lacentrale.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
      garageSetRemoveCrossLeadsSource0garageId: garage.getId().toString(),
      garageSetRemoveCrossLeadsSource0phone: '0033188333590',
    };

    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const garageExpect = await testApp.models.Garage.findOne();
    const phoneBucketExpect = await testApp.models.PhoneBucket.findOne();

    // phone numlber before should be taken
    expect(phoneBucket.status).equal(PhoneBucket.TAKEN);
    // phone numlber after should be avaiable
    expect(phoneBucketExpect.status).equal(PhoneBucket.AVAILABLE);
    expect(res.data.garageSetRemoveCrossLeadsSource.status).equal('OK');
    // garage before sources deleted
    expect(garage.crossLeadsConfig.sources.length).equal(2);
    // garage after sources deleted
    expect(garageExpect.crossLeadsConfig.sources.length).equal(1);
  });
});
