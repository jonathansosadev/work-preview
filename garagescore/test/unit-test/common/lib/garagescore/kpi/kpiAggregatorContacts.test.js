const { expect } = require('chai');

const TestApp = require('../../../../../../common/lib/test/test-app');
const kpiAggregatorContacts = require('../../../../../../common/lib/garagescore/kpi/kpiAggregatorContacts');
const DataFileTypes = require('../../../../../../common/models/data-file.data-type');
const KpiPeriods = require('../../../../../../common/lib/garagescore/kpi/KpiPeriods');
const {
  ContactCampaignStatuses,
  ContactCampaignEmailStatuses,
  ContactCampaignPhoneStatuses,
  KpiTypes,
} = require('../../../../../../frontend/utils/enumV2');

const app = new TestApp();

async function generateCampaign(garage, dataType, count) {
  for (let i = 1; i <= count; i++) {
    const campaign = await garage.runNewCampaign(dataType);
    const survey = await campaign.getSurvey();
    await survey.rate(i).submit();
  }
}

describe('KpiAggregatorContacts', () => {
  let garageId;
  const surveyCount = 2;
  const periodToken = KpiPeriods.getPeriodsAffectedByGivenDate(new Date())[0].token;

  before(async () => {
    await app.reset();
    const garage = await app.addGarage();
    garageId = garage._garageId;
    await generateCampaign(garage, DataFileTypes.MAINTENANCES, surveyCount);
  });

  it('should compute the contactsCountSurveysResponded by garage', async () => {
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountSurveysResponded } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountSurveysResponded).to.equal(surveyCount);
  });

  it('should compute the contactsCountReceivedSurveys by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.status': ContactCampaignStatuses.RECEIVED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountReceivedSurveys } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountReceivedSurveys).to.equal(surveyCount);
  });

  it('should compute the contactsCountValidEmails by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.VALID } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountValidEmails } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountValidEmails).to.equal(surveyCount);
  });

  it('should compute the contactsCountValidPhones by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.phoneStatus': ContactCampaignPhoneStatuses.VALID } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountValidPhones } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountValidPhones).to.equal(surveyCount);
  });

  it('should compute the contactsCountNotContactable by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.status': ContactCampaignStatuses.IMPOSSIBLE } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountNotContactable } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountNotContactable).to.equal(surveyCount);
  });

  it('should compute the contactsCountTotalShouldSurfaceInCampaignStats by garage', async () => {
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountTotalShouldSurfaceInCampaignStats } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountTotalShouldSurfaceInCampaignStats).to.equal(surveyCount);
  });

  it('should compute the contactsCountScheduledContacts by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.status': ContactCampaignStatuses.SCHEDULED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountScheduledContacts } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountScheduledContacts).to.equal(surveyCount);
  });

  it('should compute the contactsCountBlockedLastMonthEmail by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.RECENTLY_CONTACTED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountBlockedLastMonthEmail } = res[0];

    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountBlockedLastMonthEmail).to.equal(surveyCount);
  });

  it('should compute the contactsCountUnsubscribedByEmail by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.UNSUBSCRIBED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountUnsubscribedByEmail } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountUnsubscribedByEmail).to.equal(surveyCount);
  });

  it('should compute the contactsCountBlockedByPhone by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.phoneStatus': ContactCampaignPhoneStatuses.UNSUBSCRIBED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountBlockedByPhone } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountBlockedByPhone).to.equal(surveyCount);
  });

  it('should compute the contactsCountBlockedByEmail by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.UNSUBSCRIBED } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountBlockedByEmail } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountBlockedByEmail).to.equal(surveyCount);
  });

  it('should compute the contactsCountWrongEmails by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.WRONG } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountWrongEmails } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountWrongEmails).to.equal(surveyCount);
  });

  it('should compute the contactsCountNotPresentEmails by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.emailStatus': ContactCampaignEmailStatuses.EMPTY } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountNotPresentEmails } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountNotPresentEmails).to.equal(surveyCount);
  });

  it('should compute the contactsCountWrongPhones by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.phoneStatus': ContactCampaignPhoneStatuses.WRONG } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountWrongPhones } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountWrongPhones).to.equal(surveyCount);
  });

  it('should compute the contactsCountNotPresentPhones by garage', async () => {
    await app.models.Data.getMongoConnector().updateMany(
      {},
      { $set: { 'campaign.contactStatus.phoneStatus': ContactCampaignPhoneStatuses.EMPTY } }
    );
    const res = await kpiAggregatorContacts(app, { period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken) });

    const { _id, contactsCountNotPresentPhones } = res[0];
    expect(res.length).to.equal(1);
    expect(_id).to.equal(garageId.toString());
    expect(contactsCountNotPresentPhones).to.equal(surveyCount);
  });

  it('should compute the contacts kpis by frontdesk', async () => {
    const res = await kpiAggregatorContacts(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
      kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    });
    expect(res.length).to.equal(1);
    expect(res[0]._id.userId).not.to.be.undefined;
  });
});
