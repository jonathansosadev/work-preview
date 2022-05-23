const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const GarageTypes = require('../../../../common/models/garage.type');
/* eslint-disable no-unused-expressions */
const app = new TestApp();
const expect = require('chai').expect;
const ContactStatus = require('../../../../common/models/contact.status');

/**
 Do we send the first contacts ?
 */

function checkContactsStatus(contacts, status) {
  contacts.forEach((contact) => {
    expect(contact.status).equal(status);
  });
}

describe('Test send contacts with mock :', () => {
  let person = null;

  beforeEach(async function beforeEach() {
    await app.allowContactsRender();
    await app.reset();
    person = testTools.random.person();
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({ disableSmsWithValidEmails: false });
    // await garage.setScenario(testScenario);
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
  });

  it('Send first contacts to mocks mailgun & smsfactor', async function test() {
    const contactsSent = await app.sendWaitingContacts();

    expect(contactsSent.sms.length).equal(1);
    expect(contactsSent.emails.length).equal(1);

    const smsSent = contactsSent.sms[0];
    const emailSent = contactsSent.emails[0];
    expect(smsSent.messageText).to.match(/(Evaluez le service sur|Evaluez-le sur)/);
    expect(emailSent.body).to.match(/Nous vous remercions d’avoir confié/);
  });

  it('Test mock mailgun response on mail send & smsfactor send', async function test() {
    let contacts = await app.models.Contact.find({});

    checkContactsStatus(contacts, ContactStatus.WAITING);
    await app.sendWaitingContacts();
    contacts = await app.contacts();
    const emailContact = contacts.find((c) => c.type.includes('EMAIL'));
    const smsContact = contacts.find((c) => c.type.includes('SMS'));

    expect(emailContact.status).equal(ContactStatus.SEND);
    expect(smsContact.status).equal(ContactStatus.OPENED);
  });

  it('Test drop email', async function test() {
    // 1/ we check all contacts to waiting
    let contacts = await app.models.Contact.find({});
    checkContactsStatus(contacts, ContactStatus.WAITING);

    // 2/ we send all contacts waiting
    await app.sendWaitingContacts();

    contacts = await app.models.Contact.find({});
    let emailContact = contacts.find((c) => c.type.includes('EMAIL'));
    expect(emailContact.status).equal(ContactStatus.SEND);

    // 3/ we simulate mailgun webhook response on mail sent and before set mail on drop
    await app.dropMailgunContact(person);
    await app.simulateMailgunResponse();
    // 4/ check if dropped mail is mark as drop
    contacts = await app.contacts();
    emailContact = contacts.find((c) => c.type.includes('EMAIL'));
    expect(emailContact.status).equal(ContactStatus.DROPPED);
  });

  it('Test delivered email', async function test() {
    // 1/ we check all contacts to waiting
    let contacts = await app.contacts();
    checkContactsStatus(contacts, ContactStatus.WAITING);

    // 2/ we send all contacts waiting
    await app.sendWaitingContacts();

    contacts = await app.contacts();
    let emailContact = contacts.find((c) => c.type.includes('EMAIL'));
    expect(emailContact.status).equal(ContactStatus.SEND);

    // 3/ we simulate mailgun webhook reponse on mail sent and before set mail on drop
    // mockMailGun.drop(person.email);
    await app.simulateMailgunResponse();
    // 4/ check if dropped mail is mark as drop
    contacts = await app.contacts();
    emailContact = contacts.find((c) => c.type.includes('EMAIL'));
    expect(emailContact.status).equal(ContactStatus.DELIVERED);
  });
});

describe('Custom sender based on garage type', () => {
  let person = null;

  beforeEach(async function beforeEach() {
    await app.allowContactsRender();
    await app.reset();
    person = testTools.random.person();
  });

  it('sms and email to a contact should have a custom sender for a VehicleInspection garage', async function test() {
    const garage = await app.addGarage({ type: GarageTypes.VEHICLE_INSPECTION });
    await app.upsertDefaultScenario({ disableSmsWithValidEmails: false });
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);

    const contactsSent = await app.sendWaitingContacts();

    expect(contactsSent.sms.length).equal(1);
    expect(contactsSent.emails.length).equal(1);

    const smsSent = contactsSent.sms[0];
    const emailSent = contactsSent.emails[0];

    expect(emailSent.from).to.include('via Custeed-GarageScore');
    expect(emailSent.from).to.not.include('via GarageScore');

    expect(smsSent.sender).to.equal('Custeed');
  });

  it("sms and email to a contact should NOT have a custom sender if it's NOT a VehicleInspection garage", async function test() {
    const garage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    await app.upsertDefaultScenario({ disableSmsWithValidEmails: false });
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);

    const contactsSent = await app.sendWaitingContacts();

    expect(contactsSent.sms.length).equal(1);
    expect(contactsSent.emails.length).equal(1);

    const smsSent = contactsSent.sms[0];
    const emailSent = contactsSent.emails[0];

    expect(emailSent.from).to.include('via GarageScore');
    expect(emailSent.from).to.not.include('via Custeed-GarageScore');

    expect(smsSent.sender).to.equal('GarageScore');
  });
});
