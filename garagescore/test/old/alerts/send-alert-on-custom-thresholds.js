const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const AlertTypes = require('../../../common/models/alert.types');
const chai = require('chai');
const testTools = require('../../../common/lib/test/testtools');
const RenderAlertMail = require('../../../common/lib/garagescore/alert-mail/render-content');

const expect = chai.expect;
const app = new TestApp();

/**
 * Send alert after reviews with custom sensitive threshold
 */
describe('Send alerts on sensitive custom thresholds:', () => {
  let garage = null;
  let userEmail = null;
  beforeEach(async function beforeEach() {
    await app.reset();
    userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    garage = await app.addGarage({
      defaultManager: user,
      thresholds: {
        alertSensitiveThreshold: {
          maintenance: 6,
          sale_new: 8,
          sale_used: 6,
        },
      },
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
  });
  it('Do not send alert on maintenance', async function test() {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(7).submit();
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(2); // first contact + thanks
  });
  it('Send alert on sale new ', async function test() {
    let users = await app.models.User.find({});
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    users = await app.models.User.find({});
    const survey = await campaign.getSurvey();
    users = await app.models.User.find({});
    await survey.rate(7).submit();
    users = await app.models.User.find({});
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(3); // first contact + thanks + alert sensitive
    const contact = contacts[2];
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal(AlertTypes.SENSITIVE_VN);
    expect(contact.to).equal(userEmail);
    await RenderAlertMail.getAlertPayload(contact);
  });
});
