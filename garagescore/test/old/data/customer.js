const TestApp = require('../../../common/lib/test/test-app');
const { graphql } = require('graphql');
const schema = require('../../../common/lib/garagescore/api/graphql');
const testTools = require('../../../common/lib/test/testtools');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line
// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();
let Data = null;
/**
 * Test the model 'data'
 */
describe('Data model Customer:', () => {
  beforeEach(async function () {
    await app.reset();
    Data = app.models.Data;
  });
  // to catch the rejection we need to return the should.be` => as many test as 'shoulds'
  // https://github.com/domenic/chai-as-promised/issues/173
  it('Remove weird characters from email', async function test() {
    const garage = await app.addGarage();
    const person = testTools.random.person();
    person.email = '\u0000joebob@gmail.com'; // So we're sure it doesn't send SMSs
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    let datas = await app.datas();
    expect(datas[0].customer.contact.email.value).equal('joebob@gmail.com');
  });
  it('Revise data with valid email', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.email', {
      isEmpty: true,
    });
    data.campaign_generateEmailStatus();
    expect(data.get('campaign.contactStatus.emailStatus')).to.equal('Empty');
    data.customer_revise('contact.email', 'uuuu@tata.gs');
    data.campaign_generateEmailStatus();
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.true;
    expect(data.customer.contact).to.not.be.undefined;
    expect(data.customer.contact.email).to.not.be.undefined;
    expect(data.get('customer.contact.email.value')).to.equal('uuuu@tata.gs');
    expect(data.get('customer.contact.email.revised')).to.equal('uuuu@tata.gs');
    expect(data.get('customer.contact.email.originalContactStatus')).to.equal('Empty');
    expect(data.get('campaign.contactStatus.emailStatus')).to.equal('Valid');
  });
  it('Revise data with invalid email', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.email.value', 'first@gs.com');
    data.set('customer.contact.email.value', 'first@gs.com');
    data.customer_revise('contact.email', 'uuuu');
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.undefined;
    expect(data.customer.contact.email.value).to.equal('first@gs.com');
    expect(data.customer.contact.email.revised).to.be.undefined;
  });
  it('Revise data with valid mobilePhone', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.mobilePhone', {
      isEmpty: true,
    });
    data.campaign_generatePhoneStatus();
    expect(data.get('campaign.contactStatus.phoneStatus')).to.equal('Empty');
    data.customer_revise('contact.mobilePhone', '0625033300');
    data.campaign_generatePhoneStatus();
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.true;
    expect(data.customer.contact).to.not.be.undefined;
    expect(data.customer.contact.mobilePhone).to.not.be.undefined;
    expect(data.get('customer.contact.mobilePhone.value')).to.equal('+33625033300');
    expect(data.get('customer.contact.mobilePhone.revised')).to.equal('+33625033300');
    expect(data.get('customer.contact.mobilePhone.originalContactStatus')).to.equal('Empty');
    expect(data.get('campaign.contactStatus.phoneStatus')).to.equal('Valid');
  });
  it('Revise data with invalid mobile', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.mobilePhone', {
      value: '+33 6 25 03 33 00',
      original: '+33 6 25 03 33 00',
    });
    data.customer_revise('contact.mobilePhone', '0615221');
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.undefined;
    expect(data.customer.contact.mobilePhone.value).to.equal('+33 6 25 03 33 00');
    expect(data.customer.contact.mobilePhone.revised).to.be.undefined;
  });
  it('Revise data with same mobile but in different format', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.mobilePhone', {
      value: '+33625033300',
      original: '+33625033300',
    });
    data.customer_revise('contact.mobilePhone', '0625033300');
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.undefined;
    expect(data.customer.contact.mobilePhone.value).to.equal('+33625033300');
    expect(data.customer.contact.mobilePhone.revised).to.be.undefined;
  });
  it('Revise data with same email but in different case', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.email', {
      value: 'oabida@garagescore.com',
      original: 'oabida@garagescore.com',
    });
    data.customer_revise('contact.mobilePhone', 'OABIDA@garagescore.com');
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isRevised).to.be.undefined;
    expect(data.customer.contact.email.value).to.equal('oabida@garagescore.com');
    expect(data.customer.contact.email.revised).to.be.undefined;
  });
  it('Revise data with same value', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.email.value', 'Uuuu');
    data.customer_revise('contact.email', 'uuuu');
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.isValidated).to.be.true;
    expect(data.customer.contact).to.not.be.undefined;
    expect(data.customer.contact.email).to.not.be.undefined;
    expect(data.customer.contact.email.value).to.equal('Uuuu');
    expect(data.customer.contact.email.revised).to.equal(undefined);
  });
  it('#639: Revise data when old Data isDropped', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.set('customer.contact.email.value', 'Uuuu');
    data.set('customer.contact.email.isDropped', true);
    data.customer_revise('contact.email', 'kkkk@lllldszld.pp'); // must be a valid email to be revised
    expect(data.customer).to.not.be.undefined;
    expect(data.customer.contact).to.not.be.undefined;
    expect(data.customer.contact.email).to.not.be.undefined;
    expect(data.customer.contact.email.value).to.equal('kkkk@lllldszld.pp');
    expect(data.customer.contact.email.isDropped).to.equal(false);
    expect(data.customer.contact.email.isOriginalDropped).to.equal(true);
    expect(data.customer.contact.email.isValidated).to.equal(undefined);
    expect(data.customer.contact.email.revised).to.equal('kkkk@lllldszld.pp');
  });
  it('Check isEmpty when true', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data.addCustomer('', { value: '' }, '', '', '', '');
    expect(data.get('customer.contact.email.isEmpty')).to.equal(true);
    expect(data.get('customer.contact.mobilePhone.isEmpty')).to.equal(true);
    expect(data.get('customer.fullName.isEmpty')).to.equal(true);
  });

  it('it should continue if error "The string supplied did not seem to be a phone number"', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    const input = {
      email: { value: 'bob@bob.com' },
      mobilePhone: { value: '6', isValid: false },
      gender: { value: 'M' },
      title: { value: 'Monsieur' },
      firstName: { value: 'Bob' },
      lastName: { value: 'Plop' },
      fullName: { value: 'Bob Plop' },
      street: { value: '1 Street Fighter' },
      postalCode: { value: '99999' },
      city: { value: 'Fighter' },
      countryCode: { value: 'Fr' },
      optOutMailing: { value: true },
      optOutSMS: { value: true },
    }
    const result =  data.addCustomer(
      input.email,
      input.mobilePhone,
      input.gender,
      input.title,
      input.firstName,
      input.lastName,
      input.fullName,
      input.street,
      input.postalCode,
      input.city,
      input.countryCode,
      input.optOutMailing,
      input.optOutSMS
    );

    expect(result.get('customer.contact.mobilePhone.isSyntaxOK')).to.equal(false);
    expect(result.get('customer.contact.mobilePhone.original')).to.equal('6');
    expect(result.get('customer.firstName.original')).to.equal('Bob');
    expect(result.get('customer.lastName.original')).to.equal('Plop');
    expect(result.get('customer.fullName.original')).to.equal('Bob Plop');
    expect(result.get('customer.street.original')).to.equal('1 Street Fighter');
  });

  it('it should format and add phone number', async () => {
    const data = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    const input = {
      mobilePhone: { value: '07.99 99.47 74', isValid: false },
      countryCode: { value: 'Fr' },
    }
    const result =  data.addCustomer(
      input.email,
      input.mobilePhone,
      input.gender,
      input.title,
      input.firstName,
      input.lastName,
      input.fullName,
      input.street,
      input.postalCode,
      input.city,
      input.countryCode,
      input.optOutMailing,
      input.optOutSMS
    );

    expect(result.get('customer.contact.mobilePhone.value')).to.equal('+33799994774');
  });
  it('Revise fullName with 4 words', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, {
      firstName: 'Bob David',
      lastName: 'Du Charbonnier',
    });
    const survey = await campaign.getSurvey();
    await survey.reviseCustomer(null, 'Bob David Du Charbonnier').submit();

    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.firstName.revised')).equal(undefined);
    expect(datas[0].get('customer.firstName.revised')).equal(undefined);
    expect(datas[0].get('customer.lastName.revised')).equal(undefined);
  });
  it('update Customer fullName', async () => {
    const data = await Data.create({
      garageId: '12345678',
      type: 'toto',
      garageType: 'Dealership',
      customer: {
        fullName: {
          value: 'George Bob',
        },
      },
      leadTicket: {
        actions: [],
        customer: {
          value: 'George Bob',
        },
      },
    });
    // update
    data.set('leadTicket.customer.fullName', 'Georgette Boby');
    // expect
    expect(data.get('customer.fullName')).equal('Georgette Boby');
    expect(data.get('leadTicket.customer.fullName')).equal('Georgette Boby');
  });
});
