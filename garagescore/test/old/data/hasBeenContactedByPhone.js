const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const testTools = require('../../../common/lib/test/testtools');
// eslint-disable-next-line

const app = new TestApp();
const contactsTools = require('../campaigns/contacts/_contacts-tools')(app);

let person;
let garage;

describe('Data model: data.customer.hasBeenContactedByPhone', () => {
  beforeEach(async function () {
    await app.reset();
    person = testTools.random.person();
    person.email = 'nc@nc.com'; // So we're sure it doesn't send Emails
    garage = await app.addGarage({ specialTestScenario: true });
  });
  it('has not been contacted yet', async () => {
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted', async () => {
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasBeenContactedByPhone: true,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then dropped', async () => {
    person.mobilePhone = '+33600000000'; // Special phone number meant to be dropped
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then revised', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '0601020304');
    await datas[0].save();
    await campaign.sendNextContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: true,
          hasOriginalBeenContactedByPhone: true,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then revised then original dropped', async () => {
    person.mobilePhone = '+33600000000'; // Special phone number meant to be dropped
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '0601020304');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();

    const expected2 = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: true,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected2);
  });
  it('has been contacted then revised then revised dropped', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '+33600000000');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: true,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then revised then both dropped', async () => {
    person.mobilePhone = '+33600000000'; // Special phone number meant to be dropped
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '+33600000000');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
});
