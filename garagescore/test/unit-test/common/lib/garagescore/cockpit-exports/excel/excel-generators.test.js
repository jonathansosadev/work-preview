const chai = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../../../../../../common/lib/test/test-app');
const excelGenerators = require('../../../../../../../common/lib/garagescore/cockpit-exports/excels/excel-generators');
const { ExportTypes, ExportCategories } = require('../../../../../../../frontend/utils/enumV2');
const KpiDictionary = require('../../../../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiTypes = require('../../../../../../../common/models/kpi-type');
const KpiPeriods = require('../../../../../../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriods = require('../../../../../../../common/models/garage-history.period');
const GarageTypes = require('../../../../../../../common/models/garage.type');
const fieldHandler = require('../../../../../../../common/lib/garagescore/cockpit-exports/fields/fields-handler');

const testApp = new TestApp();
const expect = chai.expect;
describe('excel-generators', () => {
  before(async function () {
    await testApp.reset();
  });
  it('getExportFileName i18n', async () => {
    const f = excelGenerators.getExportFileName;
    const x = f('es-ES', ExportTypes.GARAGES, {
      periodId: '2020-month09',
      startPeriodId: 'startPeriodId',
      endPeriodId: 'endPeriodId',
    });
    expect(x).includes('Septiembre 2020');
    expect(x).includes('Por establecimiento');
  });
  it('getGeneratedExcel i18n', async () => {
    const garage1 = await testApp.addGarage({ type: GarageTypes.DEALERSHIP, externalId: '002121' });
    const simple = {
      [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
      [KpiDictionary.garageId]: new ObjectID(garage1.id),
      [KpiDictionary.period]: KpiPeriods.fromGhPeriodToKpiPeriod(GarageHistoryPeriods.LAST_QUARTER, {}),

      // KPIs without percents
      [KpiDictionary.satisfactionCountSurveys]: 10000,
      [KpiDictionary.satisfactionCountReviews]: 1500,
      [KpiDictionary.satisfactionNPS]: 100,
      [KpiDictionary.satisfactionRating]: 8,
      [KpiDictionary.satisfactionCountReviewsApv]: 100,
      [KpiDictionary.satisfactionRatingApv]: 4,
      [KpiDictionary.satisfactionCountReviewsVn]: 1,
      [KpiDictionary.satisfactionRatingVn]: 10,
      [KpiDictionary.satisfactionCountReviewsVo]: 100,
      [KpiDictionary.satisfactionRatingVo]: 4,
      [KpiDictionary.contactsCountSurveysResponded]: 42,
      [KpiDictionary.satisfactionCountPromoters]: 80,
      [KpiDictionary.satisfactionCountDetractors]: 80,
      [KpiDictionary.countUnsatisfied]: 1500,
      [KpiDictionary.countUnsatisfiedUntouched]: 500,
      [KpiDictionary.countUnsatisfiedTouched]: 1000,
      [KpiDictionary.countUnsatisfiedClosedWithResolution]: 100,
      [KpiDictionary.countUnsatisfiedReactive]: 100,
      [KpiDictionary.countLeads]: 200,
      [KpiDictionary.countLeadsUntouched]: 50,
      [KpiDictionary.countLeadsTouched]: 80,
      [KpiDictionary.countConvertedLeads]: 70,
      [KpiDictionary.countLeadsClosedWithSale]: 70,
      [KpiDictionary.countLeadsReactive]: 5,
      [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: 100,
      [KpiDictionary.contactsCountReceivedSurveys]: 100,
      [KpiDictionary.contactsCountScheduledContacts]: 100,
      [KpiDictionary.contactsCountValidEmails]: 90,
      [KpiDictionary.contactsCountValidPhones]: 50,
      [KpiDictionary.contactsCountNotContactable]: 50,
      [KpiDictionary.erepCountReviews]: 1000,
      [KpiDictionary.erepNPS]: 100,
      [KpiDictionary.erepRating]: 100,
      [KpiDictionary.erepCountPromoters]: 600,
      [KpiDictionary.erepCountPassives]: 200,
      [KpiDictionary.erepCountDetractors]: 200,
      [KpiDictionary.contactsCountBlockedByPhone]: 35,
    };
    await testApp.models.KpiByPeriod.getMongoConnector().insertOne(simple);
    const query = [];
    const excel = await excelGenerators.getGeneratedExcel(query, {
      exportType: ExportTypes.GARAGES,
      locale: 'es-ES',
      dataTypes: 'toto',
      fields: [fieldHandler[ExportCategories.BY_GARAGES].SATISFACTION[0]],
    });
    expect(excel._worksheets[1].name).includes('por establecimiento');
    expect(excel._worksheets[1]._rows[1]._cells[0]._column._header).includes('Num. Opiniones');
  });
});
