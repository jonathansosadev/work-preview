const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();
/**
 * Default sender must be publicDisplayName} via GarageScore
 */
describe('Issue 363:', () => {
  // test
  it('Test default email sender', async function test() {
    await app.reset();
    const publicDisplayName = 'test363';
    const garage = await app.addGarage({ publicDisplayName });
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const contacts = await app.contacts();
    expect(contacts[0].sender).equals(`${publicDisplayName} via GarageScore`);
  });
});
