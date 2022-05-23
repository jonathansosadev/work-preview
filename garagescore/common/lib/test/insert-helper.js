const KpiTypes = require('../../models/kpi-type');
const KpiPeriods = require('../../lib/garagescore/kpi/KpiPeriods');
const KpiDictionary = require('../../lib/garagescore/kpi/KpiDictionary');
const { ObjectId } = require('mongodb');
const DataTypes = require('../../models/data/type/data-types');
const GarageTypes = require('../../models/garage.type');

const testValues = {
  ErepKpiByPeriod: {
    goodRating: 100,
    badRating: 0,
    reviewers: 20,
  },
};

const insertUser = async (testApp) => {
  return testApp.addUser({ email: 'user@custeed.com' });
};

const insertGarage = (testApp, user = null, config = null) => {
  let garage1;
  if (config) {
    garage1 = testApp.addGarage(config);
  } else {
    garage1 = testApp.addGarage();
  }
  if (user) {
    user.addGarage(garage1);
  }
  return garage1;
};
const insertGarageWithExogenousErep = (testApp, user = null) => {
  return insertGarage(testApp, user, {
    subscriptions: { EReputation: { enabled: true } },
    exogenousReviewsConfigurations: {
      Google: {
        token: 'TOKEN',
        externalId: 'ID',
      },
    },
  });
};

const insertDataExogenousReview = async (testApp, garageId) => {
  const data = await testApp.models.Data.init(garageId, {
    type: DataTypes.EXOGENOUS_REVIEW,
    sourceType: 'Google',
    garageType: GarageTypes.DEALERSHIP,
    raw: {},
  });
  data.set('service.providedAt', new Date());
  return testApp.models.Data.create(data);
};

const insertErepKpiByPeriod = async (
  testApp,
  garageId,
  score = testValues.ErepKpiByPeriod.goodRating,
  period = KpiPeriods.GH_LAST_QUARTER
) => {
  return testApp.models.KpiByPeriod.getMongoConnector()
    .insertOne({
      [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
      [KpiDictionary.garageId]: new ObjectId(garageId),
      [KpiDictionary.period]: KpiPeriods.fromGhPeriodToKpiPeriod(period),
      [KpiDictionary.erepCountHasRating]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepSumRating]: score,
      [KpiDictionary.erepCountReviewsGoogle]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepSumRatingGoogle]: score,
      [KpiDictionary.erepCountHasRatingGoogle]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsGoogle]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsWithoutResponseGoogle]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountReviewsPagesJaunes]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepSumRatingPagesJaunes]: score,
      [KpiDictionary.erepCountHasRatingPagesJaunes]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsPagesJaunes]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsWithoutResponsePagesJaunes]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountReviewsFacebook]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsFacebook]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountRecommendFacebook]: testValues.ErepKpiByPeriod.reviewers,
      [KpiDictionary.erepCountDetractorsWithoutResponseFacebook]: testValues.ErepKpiByPeriod.reviewers,
    })
    .then((res) => testApp.models.KpiByPeriod.getMongoConnector().findOne({ _id: ObjectId(res.insertedId) }));
};

module.exports = {
  testValues,
  insertUser,
  insertGarage,
  insertGarageWithExogenousErep,
  insertErepKpiByPeriod,
  insertDataExogenousReview,
};
