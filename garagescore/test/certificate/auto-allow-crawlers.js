const TestApp = require('../../common/lib/test/test-app');
const chai = require('chai');
const dataFileTypes = require('../../common/models/data-file.data-type');
const promises = require('../../common/lib/util/promises');
const ContactType = require('../../common/models/contact.type');
const { processGarage } = require('../../common/lib/garagescore/certificate/auto-allow-crawlers');

const expect = chai.expect;

const app = new TestApp();
const garageOptions = { dms: { Maintenances: true } };
/**
 * Certificate auto publication
 */
describe('Certificate automatic publication:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
    await promises.wait(app.models.CensoredWords.updateAllCachedCensoredWords);
  });
  it('Creating a review', async function test() {
    await app.reset();
    let garage = await app.addGarage(garageOptions);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).submit();
    garage = await app.garages();
    await processGarage(app, garage[0]);
    expect(garage[0].hideDirectoryPage).to.be.true;
  });
  it('Creating enough reviews but below threshold', async function test() {
    await app.reset();
    let garage = await app.addGarage(garageOptions);
    for (let i = 0; i < 25; i++) {
      const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(5).submit();
    }
    garage = await app.garages();
    await processGarage(app, garage[0]);
    expect(garage[0].hideDirectoryPage).to.be.true;
  });
  it('Creating enough reviews but without comment', async function test() {
    await app.reset();
    let garage = await app.addGarage(garageOptions);
    for (let i = 0; i < 25; i++) {
      const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(10).submit();
    }
    garage = await app.garages();
    await processGarage(app, garage[0]);
    expect(garage[0].hideDirectoryPage).to.be.true;
  });
  it('Creating enough reviews triggering the alert', async function test() {
    await app.reset();
    let garage = await app.addGarage(garageOptions);
    for (let i = 0; i < 25; i++) {
      const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(10).setReview('Je suis un très beau commentaire').submit();
    }
    garage = await app.garages();
    await processGarage(app, garage[0]);
    garage = await app.garages();
    expect(garage[0].hideDirectoryPage).to.be.false;
    const contacts = await app.contacts();
    const alerts = [];
    contacts.forEach((contact) => {
      if (contact.type === ContactType.ALERT_EMAIL) {
        alerts.push(contact);
      }
    });
    expect(alerts.length).to.be.equal(1);
    expect(alerts[0].sender).to.be.equal('GarageScore');
    expect(alerts[0].status).to.be.equal('Waiting');
  });
});
