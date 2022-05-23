const TestApp = require('../../../common/lib/test/test-app');
const { expect } = require('chai'); // eslint-disable-line

const DataFileTypes = require('../../../common/models/data-file.data-type');

const app = new TestApp();
/**
 * Test the model 'data'
 */
describe('Customer revision interaction with lead/unsatisfied tickets:', () => {
  describe('when neither unsatisfied ticket and lead ticket are present', () => {
    beforeEach(async () => {
      await app.reset();
      const garage = await app.addGarage();
      const campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(10).submit();
    });
    it("revising doesn't create an unsatisfied ticket", async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Barack Obama');
      expect(data.get('customer.fullName')).to.equal('Barack Obama');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('firstName', 'Barack');
      expect(data.get('customer.firstName')).to.equal('Barack');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('lastName', 'Obama');
      expect(data.get('customer.lastName')).to.equal('Obama');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'barack.obama@white.house.us');
      expect(data.get('customer.contact.email')).to.equal('barack.obama@white.house.us');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;
    });
    it("revising doesn't create an lead ticket", async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Kobe Bryant');
      expect(data.get('customer.fullName')).to.equal('Kobe Bryant');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('firstName', 'Kobe');
      expect(data.get('customer.firstName')).to.equal('Kobe');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('lastName', 'Bryant');
      expect(data.get('customer.lastName')).to.equal('Bryant');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'kobe.bryant.8@la-lakers.com');
      expect(data.get('customer.contact.email')).to.equal('kobe.bryant.8@la-lakers.com');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('leadTicket')).not.to.be.ok;
    });
  });
  describe('when only unsatisfied ticket is present', () => {
    beforeEach(async () => {
      await app.reset();
      const garage = await app.addGarage();
      const campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(2).submit();
    });
    it("revising doesn't create a lead ticket", async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Kobe Bryant');
      expect(data.get('customer.fullName')).to.equal('Kobe Bryant');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('firstName', 'Kobe');
      expect(data.get('customer.firstName')).to.equal('Kobe');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('lastName', 'Bryant');
      expect(data.get('customer.lastName')).to.equal('Bryant');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'kobe.bryant.8@la-lakers.com');
      expect(data.get('customer.contact.email')).to.equal('kobe.bryant.8@la-lakers.com');
      expect(data.get('leadTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'kobe.bryant.8@la-lakers.com');
      expect(data.get('customer.contact.email')).to.equal('kobe.bryant.8@la-lakers.com');
      expect(data.get('leadTicket')).not.to.be.ok;
    });
    it('revising fullName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Barack Obama');
      expect(data.get('customer.fullName')).to.equal('Barack Obama');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.equal('Barack Obama');
    });
    it('revising firstName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('firstName', 'Barack');
      expect(data.get('customer.firstName')).to.equal('Barack');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.include('Barack');
    });
    it('revising lastName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('lastName', 'Obama');
      expect(data.get('customer.lastName')).to.equal('Obama');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.include('Obama');
    });
    it('revising email also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.email', 'barack.obama@white.house.us');
      expect(data.get('customer.contact.email')).to.equal('barack.obama@white.house.us');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.contact.email')).to.equal('barack.obama@white.house.us');
    });
    it('revising phone also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.contact.mobilePhone')).to.equal('+33612345678');
    });
  });
  describe('when only lead ticket is present', () => {
    beforeEach(async () => {
      await app.reset();
      const garage = await app.addGarage();
      const campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(10).setLead().submit();
    });
    it("revising doesn't create an unsatisfied ticket", async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Kobe Bryant');
      expect(data.get('customer.fullName')).to.equal('Kobe Bryant');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('firstName', 'Kobe');
      expect(data.get('customer.firstName')).to.equal('Kobe');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('lastName', 'Bryant');
      expect(data.get('customer.lastName')).to.equal('Bryant');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'kobe.bryant.8@la-lakers.com');
      expect(data.get('customer.contact.email')).to.equal('kobe.bryant.8@la-lakers.com');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;

      data.customer_revise('contact.email', 'kobe.bryant.8@la-lakers.com');
      expect(data.get('customer.contact.email')).to.equal('kobe.bryant.8@la-lakers.com');
      expect(data.get('unsatisfiedTicket')).not.to.be.ok;
    });
    it('revising fullName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Barack Obama');
      expect(data.get('customer.fullName')).to.equal('Barack Obama');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.fullName')).to.equal('Barack Obama');
    });
    it('revising firstName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('firstName', 'Barack');
      expect(data.get('customer.firstName')).to.equal('Barack');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.fullName')).to.include('Barack');
    });
    it('revising lastName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('lastName', 'Obama');
      expect(data.get('customer.lastName')).to.equal('Obama');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.fullName')).to.include('Obama');
    });
    it('revising email also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.email', 'barack.obama@white.house.us');
      expect(data.get('customer.contact.email')).to.equal('barack.obama@white.house.us');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.contact.email')).to.equal('barack.obama@white.house.us');
    });
    it('revising phone also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.contact.mobilePhone')).to.equal('+33612345678');
    });
  });
  describe('when both unsatisfied ticket and lead ticket are present', () => {
    beforeEach(async () => {
      await app.reset();
      const garage = await app.addGarage();
      const campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(2).setLead().submit();
    });

    it('revising fullName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Barack Obama');
      expect(data.get('customer.fullName')).to.equal('Barack Obama');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.equal('Barack Obama');
    });
    it('revising firstName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('firstName', 'Barack');
      expect(data.get('customer.firstName')).to.equal('Barack');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.include('Barack');
    });
    it('revising lastName also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('lastName', 'Obama');
      expect(data.get('customer.lastName')).to.equal('Obama');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.include('Obama');
    });
    it('revising email also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.email', 'barack.obama@white.house.us');
      expect(data.get('customer.contact.email')).to.equal('barack.obama@white.house.us');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.contact.email')).to.equal('barack.obama@white.house.us');
    });
    it('revising phone also affects unsatisfied ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.contact.mobilePhone')).to.equal('+33612345678');
    });

    it('revising fullName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('fullName', 'Barack Obama');
      expect(data.get('customer.fullName')).to.equal('Barack Obama');
      expect(data.get('unsatisfiedTicket')).to.be.an('object');
      expect(data.get('unsatisfiedTicket.customer.fullName')).to.equal('Barack Obama');
    });
    it('revising firstName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('firstName', 'Barack');
      expect(data.get('customer.firstName')).to.equal('Barack');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.fullName')).to.include('Barack');
    });
    it('revising lastName also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('lastName', 'Obama');
      expect(data.get('customer.lastName')).to.equal('Obama');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.fullName')).to.include('Obama');
    });
    it('revising email also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.email', 'barack.obama@white.house.us');
      expect(data.get('customer.contact.email')).to.equal('barack.obama@white.house.us');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.contact.email')).to.equal('barack.obama@white.house.us');
    });
    it('revising phone also affects lead ticket', async () => {
      const [data] = await app.datas();
      data.customer_revise('contact.mobilePhone', '+33612345678');
      expect(data.get('customer.contact.mobilePhone')).to.equal('+33612345678');
      expect(data.get('leadTicket')).to.be.an('object');
      expect(data.get('leadTicket.customer.contact.mobilePhone')).to.equal('+33612345678');
    });
  });
});
