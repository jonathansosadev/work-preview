const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const generateKpis = require('../../common/lib/garagescore/daily-kpi/generate-kpis');
const DataFileTypes = require('../../common/models/data-file.data-type');
const moment = require('moment');
const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const { KpiTypes } = require('../../frontend/utils/enumV2');
const { ObjectId } = require('mongodb');

const app = new TestApp();

function kpiPeriodFromDate() {
  return Number(moment.utc().format('YYYYMM'));
}

async function setPhoneStatus(app, dataId, status = 'Wrong') {
  return app.models.Data.getMongoConnector().updateOne(
    { _id: new ObjectId(dataId) },
    { $set: { 'campaign.contactStatus.phoneStatus': status } }
  );
}

async function generateCampaign(garage, datatype = DataFileTypes.MAINTENANCES) {
  const campaign = await garage.runNewCampaign(datatype);
  const survey = await campaign.getSurvey();
  await survey.rate(10).submit();
}

describe('generate kpi contacts', () => {
  let garage = null;
  let dataConnector = null;
  before(async () => {
    await app.reset();
    await app.models.KpiByPeriod.dataSource.autoupdate();
    garage = await app.addGarage();
    dataConnector = app.models.Data.getMongoConnector();
  });
  it('should generate valid kpis', async () => {
    // geenrate 2 campaigns
    await generateCampaign(garage);
    await generateCampaign(garage);

    const datas = await dataConnector.find({}).toArray();

    expect(datas.length).to.equal(2);

    await setPhoneStatus(app, datas[0]._id, 'Wrong');

    const date = datas[0].service.providedAt;

    // generate kpi's
    const { success, error } = await generateKpis(app, {
      periods: [date],
      garageIds: [garage.id],
    });
    expect(success).to.equal(true);
    expect(error).to.be.null;

    const kpis = await app.models.KpiByPeriod.getMongoConnector()
      .find({
        [KpiDictionary.period]: kpiPeriodFromDate(),
      })
      .toArray();

    expect(kpis.length).to.equal(3);
    const garageKpi = kpis.find((kpi) => kpi[KpiDictionary.kpiType] === KpiTypes.GARAGE_KPI);
    expect(garageKpi).to.not.be.undefined;

    const frontDeskUserKpi = kpis.find((kpi) => kpi[KpiDictionary.kpiType] === KpiTypes.FRONT_DESK_USER_KPI);
    expect(frontDeskUserKpi).to.not.be.undefined;

    // both kpi's should have :
    const expected = {
      [KpiDictionary.contactsCountReceivedSurveys]: 2,
      [KpiDictionary.contactsCountSurveysResponded]: 2,
      [KpiDictionary.contactsCountValidEmails]: 2,
      [KpiDictionary.contactsCountValidPhones]: 1, // 1 because we set the phone status to wrong for 1 data
      [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: 2,
      //APV
      [KpiDictionary.contactsCountReceivedSurveysApv]: 2,
      [KpiDictionary.contactsCountSurveysRespondedApv]: 2,
      [KpiDictionary.contactsCountValidEmailsApv]: 2,
      [KpiDictionary.contactsCountValidPhonesApv]: 1, // 1 because we set the phone status to wrong for 1 data
      [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsApv]: 2,
    };
    for (const key in expected) {
      expect(garageKpi[key], `[garageKpi] Failed for key ${key}`).to.equal(expected[key]);
      expect(frontDeskUserKpi[key], `[frontDeskUserKpi] Failed for key ${key}`).to.equal(expected[key]);
    }
  });
});
