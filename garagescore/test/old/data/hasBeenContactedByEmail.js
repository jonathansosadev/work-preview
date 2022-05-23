const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const testTools = require('../../../common/lib/test/testtools');
// eslint-disable-next-line
const app = new TestApp();
const contactsTools = require('../campaigns/contacts/_contacts-tools')(app);

const person = testTools.random.person();
person.mobilePhone = ' '; // So we're sure it doesn't send SMSs
let campaign;

describe('Data model: data.customer.hasBeenContactedByEmail', () => {
  beforeEach(async function () {
    await app.reset();
    const garage = await app.addGarage();
    campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.allowContactsRender();
  });
  it('has not been contacted yet', async () => {
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
    await app.sendWaitingContacts();
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: true,
          hasBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then dropped', async () => {
    await app.sendWaitingContacts();
    await app.dropMailgunContact(person);
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
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();

    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: true,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then revised then original dropped', async () => {
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();

    await app.dropMailgunContact(person);
    const expected1 = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected1);

    await campaign.sendNextContacts();
    const expected2 = {
      datas: [
        {
          hasBeenContactedByEmail: true,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected2);
  });
  it('has been contacted then revised then revised dropped', async () => {
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.dropMailgunContact({ email: 'revised@email.gs' });
    const expected = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: true,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected);
  });
  it('has been contacted then revised then both dropped', async () => {
    await app.sendWaitingContacts();
    const datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();
    await campaign.sendNextContacts();

    const expected1 = {
      datas: [
        {
          hasBeenContactedByEmail: true,
          hasOriginalBeenContactedByEmail: true,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected1);

    await app.dropMailgunContact(person);
    await app.dropMailgunContact({ email: 'revised@email.gs' });
    const expected2 = {
      datas: [
        {
          hasBeenContactedByEmail: false,
          hasOriginalBeenContactedByEmail: false,
          hasBeenContactedByPhone: false,
          hasOriginalBeenContactedByPhone: false,
        },
      ],
    };
    await contactsTools.checks(expected2);
  });
});
