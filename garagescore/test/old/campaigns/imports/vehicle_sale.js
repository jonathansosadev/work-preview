/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataTypes = require('../../../../common/models/data-file.data-type');
const contactsConfigs = require('../../../../common/lib/garagescore/data-campaign/contacts-config');

const app = new TestApp();

const contactsTools = require('../contacts/_contacts-tools')(app);

/**
 Do we know how to determine if VO or VN in MixedVehicleSale files?
 */
describe('Test VehicleSale:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Knows if the Data is VN or VO', async function () {
    const persons = [];
    const person1 = testTools.random.person();
    const person2 = testTools.random.person();
    const person3 = testTools.random.person();
    const person4 = testTools.random.person();
    person1.email = 'toto@gmail.com';
    person1.Service = 'VO';
    person2.email = 'toto2@gmail.com';
    person2.Service = 'VN';
    person3.email = 'toto3@gmail.com';
    person3.Service = 'VO';
    person4.email = 'toto4@gmail.com';
    person4.Service = 'issou';
    persons.push(person1);
    persons.push(person2);
    persons.push(person3);
    persons.push(person4);
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    await garage.runMultipleCampaigns(dataTypes.VEHICLE_SALES, persons);
    const expected = {};

    expected.datas = [
      {
        addressee: contactsTools.customer(person4),
        type: 'Unknown',
      },
      {
        addressee: contactsTools.customer(person3),
        nextCampaignContact: contactsConfigs.sale_email_2.key,
        type: 'UsedVehicleSale',
      },
      {
        addressee: contactsTools.customer(person2),
        nextCampaignContact: contactsConfigs.sale_email_2.key,
        type: 'NewVehicleSale',
      },
      {
        addressee: contactsTools.customer(person1),
        nextCampaignContact: contactsConfigs.sale_email_2.key,
        type: 'UsedVehicleSale',
      },
    ];
    await contactsTools.checks(expected);
  });
});
