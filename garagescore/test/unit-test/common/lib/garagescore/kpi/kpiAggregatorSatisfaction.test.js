const { expect } = require('chai');

const TestApp = require('../../../../../../common/lib/test/test-app');
const kpiAggregatorSatisfaction = require('../../../../../../common/lib/garagescore/kpi/kpiAggregatorSatisfaction');
const DataFileTypes = require('../../../../../../common/models/data-file.data-type');
const KpiPeriods = require('../../../../../../common/lib/garagescore/kpi/KpiPeriods');
const {
  KpiTypes,
  SourceTypes,
  DataTypes,
  ServiceMiddleMans,
  ServiceCategories,
} = require('../../../../../../frontend/utils/enumV2');
const DataBuilder = require('../../../../../../common/lib/test/test-instance-factory/data-builder');

const app = new TestApp();

async function generateSurvey(garage, dataType, count) {
  for (let i = 1; i <= count; i++) {
    const campaign = await garage.runNewCampaign(dataType);
    const survey = await campaign.getSurvey();
    await survey.rate(i).submit();
  }
}

describe('KpiAggregatorSatisfaction', () => {
  let garage;
  const surveyCount = 10;
  const periodToken = KpiPeriods.getPeriodsAffectedByGivenDate(new Date())[0].token;

  before(async () => {
    await app.reset();
    garage = await app.addGarage();
    // can't use databuilder to generate surveys
    await generateSurvey(garage, DataFileTypes.MAINTENANCES, surveyCount);
    await generateSurvey(garage, DataFileTypes.NEW_VEHICLE_SALES, surveyCount);
    await generateSurvey(garage, DataFileTypes.USED_VEHICLE_SALES, surveyCount);
  });

  it('should compute the satisfactionCountSurveys by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountSurveys,
      satisfactionCountSurveysApv,
      satisfactionCountSurveysVn,
      satisfactionCountSurveysVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountSurveys).to.equal(
      satisfactionCountSurveysApv + satisfactionCountSurveysVn + satisfactionCountSurveysVo
    );
    expect(satisfactionCountSurveysApv).to.equal(surveyCount);
    expect(satisfactionCountSurveysVn).to.equal(surveyCount);
    expect(satisfactionCountSurveysVo).to.equal(surveyCount);
  });

  it('should compute the satisfactionCountReviews by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountReviews,
      satisfactionCountReviewsApv,
      satisfactionCountReviewsVn,
      satisfactionCountReviewsVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountReviews).to.equal(
      satisfactionCountReviewsApv + satisfactionCountReviewsVn + satisfactionCountReviewsVo
    );
    expect(satisfactionCountReviewsApv).to.equal(surveyCount);
    expect(satisfactionCountReviewsVn).to.equal(surveyCount);
    expect(satisfactionCountReviewsVo).to.equal(surveyCount);
  });

  it('should compute the satisfactionCountPromoters by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountPromoters,
      satisfactionCountPromotersApv,
      satisfactionCountPromotersVn,
      satisfactionCountPromotersVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountPromoters).to.equal(
      satisfactionCountPromotersApv + satisfactionCountPromotersVn + satisfactionCountPromotersVo
    );
    // 9 to 10
    expect(satisfactionCountPromotersApv).to.equal(2);
    expect(satisfactionCountPromotersVn).to.equal(2);
    expect(satisfactionCountPromotersVo).to.equal(2);
  });

  it('should compute the satisfactionCountDetractors by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountDetractors,
      satisfactionCountDetractorsApv,
      satisfactionCountDetractorsVn,
      satisfactionCountDetractorsVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountDetractors).to.equal(
      satisfactionCountDetractorsApv + satisfactionCountDetractorsVn + satisfactionCountDetractorsVo
    );
    // 1 to 6
    expect(satisfactionCountDetractorsApv).to.equal(6);
    expect(satisfactionCountDetractorsVn).to.equal(6);
    expect(satisfactionCountDetractorsVo).to.equal(6);
  });

  it('should compute the satisfactionCountPassives by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountPassives,
      satisfactionCountPassivesApv,
      satisfactionCountPassivesVn,
      satisfactionCountPassivesVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountPassives).to.equal(
      satisfactionCountPassivesApv + satisfactionCountPassivesVn + satisfactionCountPassivesVo
    );
    // 7 to 8
    expect(satisfactionCountPassivesApv).to.equal(2);
    expect(satisfactionCountPassivesVn).to.equal(2);
    expect(satisfactionCountPassivesVo).to.equal(2);
  });

  it('should compute the satisfactionSumRating by garage', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionSumRating,
      satisfactionSumRatingApv,
      satisfactionSumRatingVn,
      satisfactionSumRatingVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionSumRating).to.equal(
      satisfactionSumRatingApv + satisfactionSumRatingVn + satisfactionSumRatingVo
    );
    // sum of 1 to 10
    expect(satisfactionSumRatingApv).to.equal(55);
    expect(satisfactionSumRatingVn).to.equal(55);
    expect(satisfactionSumRatingVo).to.equal(55);
  });

  it('should compute the serviceMiddleMans by garage', async () => {
    // need to use the databuilder to create service
    await new DataBuilder(app)
      .shouldSurfaceInStatistics()
      .garage((await app.garages())[0]._id.toString())
      .type(DataTypes.MAINTENANCE)
      .source(SourceTypes.DATAFILE)
      .service({ providedAt: new Date(Date.now() - 1000), middleMans: [ServiceMiddleMans.ALREADY_CUSTOMER] })
      .create();

    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountServiceMiddleManAlreadyCustomer,
      satisfactionCountServiceMiddleManAlreadyCustomerApv,
      satisfactionCountServiceMiddleManAlreadyCustomerVn,
      satisfactionCountServiceMiddleManAlreadyCustomerVo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountServiceMiddleManAlreadyCustomer).to.equal(
      satisfactionCountServiceMiddleManAlreadyCustomerApv +
        satisfactionCountServiceMiddleManAlreadyCustomerVn +
        satisfactionCountServiceMiddleManAlreadyCustomerVo
    );
    expect(satisfactionCountServiceMiddleManAlreadyCustomerApv).to.equal(1);
    expect(satisfactionCountServiceMiddleManAlreadyCustomerVn).to.equal(0);
    expect(satisfactionCountServiceMiddleManAlreadyCustomerVo).to.equal(0);
  });

  it('should compute the serviceCategories by garage', async () => {
    // need to use the databuilder to create service
    await new DataBuilder(app)
      .shouldSurfaceInStatistics()
      .garage((await app.garages())[0]._id.toString())
      .type(DataTypes.MAINTENANCE)
      .source(SourceTypes.DATAFILE)
      .service({ providedAt: new Date(Date.now() - 1000), categories: [ServiceCategories.MAINTENANCE_CAT_1] })
      .create();

    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
    });

    const {
      _id,
      satisfactionCountServiceCategoryMaintenance1,
      satisfactionCountServiceCategoryMaintenance1Apv,
      satisfactionCountServiceCategoryMaintenance1Vn,
      satisfactionCountServiceCategoryMaintenance1Vo,
    } = res[0];

    expect(_id).to.equal((await app.garages())[0]._id.toString());
    expect(satisfactionCountServiceCategoryMaintenance1).to.equal(
      satisfactionCountServiceCategoryMaintenance1Apv +
        satisfactionCountServiceCategoryMaintenance1Vn +
        satisfactionCountServiceCategoryMaintenance1Vo
    );
    expect(satisfactionCountServiceCategoryMaintenance1Apv).to.equal(1);
    expect(satisfactionCountServiceCategoryMaintenance1Vn).to.equal(0);
    expect(satisfactionCountServiceCategoryMaintenance1Vo).to.equal(0);
  });

  it('should compute the satisfaction kpis by frontdesk', async () => {
    const res = await kpiAggregatorSatisfaction(app, {
      period: KpiPeriods.getPeriodObjectFromKpiPeriodToken(periodToken),
      kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    });
    expect(res[0]._id.userId).not.to.be.undefined;
  });
});
