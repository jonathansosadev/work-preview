const chai = require('chai');

const TestApp = require('../../../common/lib/test/test-app');
const { crossLeadsAdd } = require('../../../common/lib/garagescore/cross-leads/darkbo-add-ovh-phones.js');
const PhoneBucketTypes = require('../../../common/models/phone-bucket.types.js');
const PhoneBucketCountryCodes = require('../../../common/models/phone-bucket.country-codes.js');

const { expect } = chai;
/* eslint-disable no-unused-expressions */
const app = new TestApp();
describe('Test phone-bucket collection', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Add a new phone', async function test() {
    await app.models.PhoneBucket.add('0033121982935');
    const allPhones = await app.models.PhoneBucket.find();
    expect(allPhones.length).to.be.equal(1);
    expect(allPhones[0].status).to.be.equal(PhoneBucketTypes.AVAILABLE);
    expect(allPhones[0].garageId).to.be.equal(undefined);
    expect(allPhones[0].drawnAt).to.be.equal(undefined);
  });
  it('Draw a new phone when empty', async function test() {
    let phone = null;
    try {
      phone = await app.models.PhoneBucket.draw('1');
    } catch (e) {
      expect(e.message).to.be.equal('No more phones for area 01');
    }
    expect(phone).to.be.equal(null);
  });
  it('Draw a new phone', async function test() {
    await app.models.PhoneBucket.add('0033321982935');
    const phone = await app.models.PhoneBucket.draw('3');
    expect(phone.createdAt instanceof Date).to.be.equal(true);
    expect(phone.createdAt).not.to.be.equal(undefined);
    expect(phone).not.to.be.equal(null);
    expect(phone.value).to.be.equal('0033321982935');
    expect(phone.countryCode).to.be.equal(PhoneBucketCountryCodes.FR);
  });
  it('Draw a new phone when all phones are taken', async function test() {
    await app.models.PhoneBucket.add('0034421982935');
    const phone = await app.models.PhoneBucket.draw('4', null, '', PhoneBucketCountryCodes.ES);
    expect(phone).not.to.be.equal(null);
    expect(phone.value).to.be.equal('0034421982935');
    expect(phone.countryCode).to.be.equal(PhoneBucketCountryCodes.ES);
    let secondPhone = null;
    try {
      secondPhone = await app.models.PhoneBucket.draw('4', null, '', PhoneBucketCountryCodes.ES);
    } catch (e) {}
    expect(secondPhone).to.be.equal(null);
    await app.models.PhoneBucket.add('0033221982930');
    let contacts = await app.models.Contact.find();
    expect(contacts[0].payload.logs[0]).to.be.equal('Plus de téléphone disponibles !!!');
    expect(contacts[1].payload.logs[0]).to.be.equal('Plus de téléphone disponibles !!!');
    const thirdPhone = await app.models.PhoneBucket.draw('2');
    expect(thirdPhone).not.to.be.equal(null);
    contacts = await app.models.Contact.find();
    expect(contacts[2].payload.logs[0]).to.be.equal('Plus de téléphone disponibles !!!');
  });
  it('Draw a new phone and test contact subject and area', async function test() {
    await app.models.PhoneBucket.add('0033421982935');
    let phone = null;
    try {
      phone = await app.models.PhoneBucket.draw('1');
    } catch (e) {
      expect(e.message).to.be.equal('No more phones for area 01');
    }
    expect(phone).to.be.equal(null);
    let contacts = await app.models.Contact.find();
    expect(contacts[0].payload.area).to.be.equal('1');
    await app.models.PhoneBucket.add('0033421982936');
    await app.models.PhoneBucket.add('0033421982937');
    await app.models.PhoneBucket.add('0033421982938');
    await app.models.PhoneBucket.add('0033421982939');
    phone = await app.models.PhoneBucket.draw('4');
    expect(phone.value).to.be.equal('0033421982935');
    contacts = await app.models.Contact.find();
    expect(contacts[1].payload.logs[0]).to.be.equal('Attention: Plus que 4 téléphones disponibles !');
    expect(contacts[1].payload.logs[1]).to.be.equal('');
    expect(contacts[1].payload.area).to.be.equal('4');
  });
  it('Add a phone already added', async function test() {
    await app.models.PhoneBucket.add('0033202020202');
    try {
      await app.models.PhoneBucket.add('0033202020202');
    } catch (e) {
      expect(e.message.includes('already in the bucket')).to.be.equal(true);
    }
  });
  it('See if no contact is created when we have more than 10 phones', async function test() {
    await crossLeadsAdd(app, { body: { phoneNumber: '0033185522890-99' } });
    await crossLeadsAdd(app, { body: { phoneNumber: '0033185522800-09' } });

    const phone = await app.models.PhoneBucket.draw('1');
    expect(phone.value).to.be.equal('0033185522890');
    const contacts = await app.models.Contact.find();
    expect(contacts.length).to.be.equal(0);
  });
  it("See if 2 consecutive draw doesn't draw the same phone", async function test() {
    await app.models.PhoneBucket.add('0033199999999');
    await app.models.PhoneBucket.add('0033199999998');
    const allPhones = await Promise.all([app.models.PhoneBucket.draw('1'), app.models.PhoneBucket.draw('1')]);
    expect(allPhones[0].value).to.be.equal('0033199999999');
    expect(allPhones[1].value).to.be.equal('0033199999998');
  });
  it('Should add phones through API when giving a normal range 0033285522890-99', async function test() {
    await crossLeadsAdd(app, { body: { phoneNumber: '0033285522890-99' } });
    const allPhones = await app.models.PhoneBucket.find({});
    expect(allPhones[0].value).to.be.equal('0033285522890');
    expect(allPhones[1].value).to.be.equal('0033285522891');
    expect(allPhones[8].value).to.be.equal('0033285522898');
    expect(allPhones[9].value).to.be.equal('0033285522899');
  });
  it('Should add phones through API when giving a weird range 0033183629502-11', async function test() {
    await crossLeadsAdd(app, { body: { phoneNumber: '0033183629502-11' } });
    const allPhones = await app.models.PhoneBucket.find({});
    expect(allPhones[0].value).to.be.equal('0033183629502');
    expect(allPhones[1].value).to.be.equal('0033183629503');
    expect(allPhones[8].value).to.be.equal('0033183629510');
    expect(allPhones[9].value).to.be.equal('0033183629511');
  });
  it('test a lot of errors when adding phones through API', async function test() {
    let res = await crossLeadsAdd(app, { body: { phoneNumber: '0033183629502-09' } });
    expect(res.errors[0].includes('Seems like the number of phones are lower than expected')).to.be.equal(true);
    res = await crossLeadsAdd(app, { body: { phoneNumber: '0033183629510-09' } });
    expect(res.errors[0]).to.be.equal("The start (10) is superior to the end (9) ! It shouldn't be the case.");
    res = await crossLeadsAdd(app, { body: { phoneNumber: '+33183629500-09' } });
    expect(res.errors[0]).to.be.equal('The fix part should start with 00: +33183629500-09');
    res = await crossLeadsAdd(app, { body: { phoneNumber: '003318362502-09' } });
    expect(res.errors[0]).to.be.equal('The fix part should contain 11 digits: 003318362502-09');
    const allPhones = await app.models.PhoneBucket.find({});
    expect(allPhones.length).to.be.equal(0);
  });
  it('Should add 50 phones 0033183629502-51', async function test() {
    await crossLeadsAdd(app, { body: { phoneNumber: '0033183629502-51' } });
    const allPhones = await app.models.PhoneBucket.find({});
    expect(allPhones[0].value).to.be.equal('0033183629502');
    expect(allPhones[1].value).to.be.equal('0033183629503');
    expect(allPhones[8].value).to.be.equal('0033183629510');
    expect(allPhones[9].value).to.be.equal('0033183629511');
    expect(allPhones[49].value).to.be.equal('0033183629551');
    expect(allPhones.length).to.be.equal(50);
  });
  it("Should send only when it's even", async function test() {
    // adding 11 phones
    await crossLeadsAdd(app, { body: { phoneNumber: '0033183629502-12' } });

    for (let i = 0; i < 3; i++) await app.models.PhoneBucket.draw('1');
    const [premierContact, secondContact] = await app.models.Contact.find();
    expect(premierContact.payload.logs[0]).to.be.equal('Attention: Plus que 10 téléphones disponibles !');
    expect(secondContact.payload.logs[0]).to.be.equal('Attention: Plus que 8 téléphones disponibles !');
  });
  it('Should draw a phone depending on garage phone or followed phone', async function test() {
    const testGarage = await app.addGarage({ googlePlace: { phone: ' 02 84 23 27 17' } });
    const garage = await app.models.Garage.findOne({ where: { _id: testGarage.id } });
    const testGarageWithoutPhone = await app.addGarage();
    const garageWithoutPhone = await app.models.Garage.findOne({ where: { _id: testGarageWithoutPhone.id } });
    await crossLeadsAdd(app, { body: { phoneNumber: '0033183629502' } });
    await crossLeadsAdd(app, { body: { phoneNumber: '0033283629502' } });
    await crossLeadsAdd(app, { body: { phoneNumber: '0033383629502-12' } });

    let drawn = await app.models.PhoneBucket.draw(
      app.models.PhoneBucket.getArea(garage.googlePlace, garage.crossLeadsConfig.sources[0].followed_phones),
      garage.garageId
    );
    expect(drawn.value).equal('0033283629502'); // Should get a 02 cause google has a phone starting by 02

    drawn = await app.models.PhoneBucket.draw(
      app.models.PhoneBucket.getArea(
        garageWithoutPhone.googlePlace || {},
        garageWithoutPhone.crossLeadsConfig.sources[0].followed_phones
      ),
      garageWithoutPhone.garageId
    );
    expect(drawn.value).equal('0033383629502'); // Should get a 03 cause google has no phone BUT followed has 03

    drawn = await app.models.PhoneBucket.draw(
      app.models.PhoneBucket.getArea({}, ['+33621982935']),
      garageWithoutPhone.garageId
    );
    expect(drawn.value).equal('0033183629502'); // Should get a 01 cause google has no phone AND followed has no valid phone
  });


  it('Should send internal alert when the number has not been generated', async function test() {
    const testGarage = await app.addGarage({ publicDisplayName: 'garage01'});
    const garage = await app.models.Garage.findOne({ where: { _id: testGarage.id } });

    try {
      await app.models.PhoneBucket.draw('4', garage.id, garage.publicDisplayName);
    } catch (e) {
      const [contact] = await app.models.Contact.find();

      expect(contact.payload.logs[0]).equal('Plus de téléphone disponibles !!!');
      expect(contact.payload.logs[1]).equal(`Le garage ${garage.publicDisplayName} (${garage.id}) n'a pas pu générer son numéro ! :(`);
    }
  });
});
