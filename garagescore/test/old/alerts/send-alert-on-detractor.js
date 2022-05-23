const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
const testTools = require('../../../common/lib/test/testtools');
const RenderAlertMail = require('../../../common/lib/garagescore/alert-mail/render-content');

const expect = chai.expect;
const app = new TestApp();

/**
 * Send alert after negative reviews
 */
describe('Send alerts on detractor:', () => {
  it('Send unsatisfied if score is too low Maintenance', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({ defaultManager: user });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedApv: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();

    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(3); // first contact + thanks + alert
    const contact = contacts[2];
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal('UnsatisfiedMaintenance');
    expect(contact.to).equal(userEmail);
    expect(contact.sender).equal('GarageScore');
    await RenderAlertMail.getAlertPayload(contact);
    // check no two times send
    await survey.rate(0).submit();
    await app.sendAlerts();
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(3); // first contact + thanks + alert
  });
  it('Send unsatisfied if score is too low VN', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({ defaultManager: user });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(3);
    const contact = contacts[2];
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal('UnsatisfiedVn');
    expect(contact.to).equal(userEmail);
    expect(contact.sender).equal('GarageScore');
    await RenderAlertMail.getAlertPayload(contact);
  });
  it('Send unsatisfied if score is too low VO', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({ defaultManager: user });

    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.USED_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();

    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(3);
    const contact = contacts[2];
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal('UnsatisfiedVo');
    expect(contact.to).equal(userEmail);
    await RenderAlertMail.getAlertPayload(contact);
  });
  it('Send unsatisfied if score is too low VI and user finished page 0', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({
      type: 'VehicleInspection',
      defaultManager: user,
      subscriptions: {
        VehicleInspection: {
          enabled: true,
          price: 0,
        },
        active: true,
      },
      ratingType: 'stars',
      thresholds: {
        alertSensitiveThreshold: {
          maintenance: 6,
          sale_new: 6,
          sale_used: 6,
          vehicle_inspection: 6,
        },
      },
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({
      UnsatisfiedVI: true,
    });
    const campaign = await garage.runNewCampaign(dataFileTypes.VEHICLE_INSPECTIONS);
    const survey = await campaign.getSurvey();
    await survey.rate(1);
    //[SGS] if user finished page 0, send alert
    await survey.setProgress(1, false);
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(3);
    const contact = contacts[2];
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal('UnsatisfiedVI');
    expect(contact.to).equal(userEmail);
    expect(contact.sender).equal('Custeed-GarageScore');

    await RenderAlertMail.getAlertPayload(contact);
  });
  it('Do NOT Send unsatisfied if score is too low VI and user did NOT finished page 0', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({
      type: 'VehicleInspection',
      defaultManager: user,
      subscriptions: {
        VehicleInspection: {
          enabled: true,
          price: 0,
        },
        active: true,
      },
      ratingType: 'stars',
      thresholds: {
        alertSensitiveThreshold: {
          maintenance: 6,
          sale_new: 6,
          sale_used: 6,
          vehicle_inspection: 6,
        },
      },
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({
      UnsatisfiedVI: true,
    });
    const campaign = await garage.runNewCampaign(dataFileTypes.VEHICLE_INSPECTIONS);
    const survey = await campaign.getSurvey();
    await survey.rate(1);
    //[SGS] if user did not finished page 0, do not send alert
    await survey.setProgress(0, false);
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(2);
  });
});
