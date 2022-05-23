const { expect, assert } = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const KpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const { GarageTypes, KpiTypes, DataTypes } = require('../../../frontend/utils/enumV2');

const sendQuery = require('../_send-query-as');
const {
  random: { garage: randomGarage, user: randomUser },
} = require('../../../common/lib/test/testtools');
const testApp = new TestApp();
const ModelFactory = require('../modelsFactories/factory');
const { gql } = require('apollo-server-express');
const garageTypes = require('../../../common/models/garage.type');

/**
 * @type ModelFactory
 */
let garageFactory, userFactory, kpiByPeriodFactory, cockpitTopFilterFactory;

const query = gql`
  query kpiByPeriodGetKpis(
    $periodId: String!
    $kpiOrderBy: String!
    $kpiOrder: String!
    $cockpitType: String
    $garageIds: [String]
    $search: String
    $type: String
    $frontDeskUserName: String
    $allUsers: Boolean
    $limit: Int
    $skip: Int
    $kpiType: Int
  ) {
    kpiByPeriodGetKpis(
      periodId: $periodId
      kpiOrderBy: $kpiOrderBy
      kpiOrder: $kpiOrder
      cockpitType: $cockpitType
      garageIds: $garageIds
      search: $search
      type: $type
      frontDeskUserName: $frontDeskUserName
      allUsers: $allUsers
      limit: $limit
      skip: $skip
      kpiType: $kpiType
    ) {
      list {
        id
        frontDesk
        hideDirectoryPage
        garageId
        garageSlug
        garagePublicDisplayName
        externalId
        scoreNPS
        scoreAPV
        scoreVN
        scoreVO
        countSurveyPromotor
        countSurveyDetractor
        countSurveysResponded
        countSurveyRespondedAll
        countReceivedAndScheduledSurveys

        countNotContactablePercent
        countSurveysRespondedPercent

        countValidEmails
        countValidPhones
        countNotContactable
        countSurveysResponded
        countBlockedByEmail
        countWrongEmails
        countNotPresentEmails
        countBlockedByPhone
        countWrongPhones
        countNotPresentPhones
      }
      hasMore
    }
  }
`;

/*********************************** TEST HELPERS *****************************************/
const helpers = {
  log: (...args) => {
    const util = require('util');
    args.forEach((arg) => console.log(util.inspect(arg, { colors: true, depth: null, showHidden: false })));
  },
  generateLastMonthPeriod: () => {
    // period will be in format YYYYMM
    return parseInt(new Date().getFullYear().toString() + new Date().getMonth().toString().padStart(2, '0'), 10);
  },
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  allowedSuffixes: ['Apv', 'Vn', 'Vo'],
  kpiFields: [
    'satisfactionCountPromoters',
    'satisfactionCountDetractors',
    'contactsCountValidEmails',
    'contactsCountValidPhones',
    'contactsCountNotContactable',
    'contactsCountBlockedByEmail',
    'contactsCountWrongEmails',
    'contactsCountNotPresentEmails',
    'contactsCountBlockedByPhone',
    'contactsCountWrongPhones',
    'contactsCountNotPresentPhones',
    'contactsCountSurveysResponded',
    'contactsCountReceivedSurveys',
    'contactsCountScheduledContacts',
    'contactsCountTotalShouldSurfaceInCampaignStats',
  ],
};

const kpiFieldsGenerators = {
  generateMandatoryFields({ garageId, frontDeskUserId, kpiType, garageType, period } = {}) {
    return {
      [KpiDictionary.garageId]: garageId || '',
      [KpiDictionary.userId]: frontDeskUserId || 'ALL_USERS',
      [KpiDictionary.kpiType]: kpiType || KpiTypes.FRONT_DESK_USER_KPI,
      [KpiDictionary.garageType]: garageType || garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
      [KpiDictionary.period]: period || helpers.generateLastMonthPeriod(), // Examples: ALL_HISTORY: 0 | YEAR: 2019 | QUARTER: 2019[1-4] | MONTH: 201903 (ADDED TO _dontEraseZero)
      [KpiDictionary.automationCampaignId]: -1,
      [KpiDictionary.sourceType]: -1,
    };
  },
  generateUnsuffixedFields(kpiFields) {
    return {
      ...helpers.kpiFields.reduce((acc, field) => {
        acc[KpiDictionary[field]] = helpers.allowedSuffixes.reduce((sum, suffix) => {
          return sum + (acc[KpiDictionary[field + suffix]] || 0);
        }, 0);
        return acc;
      }, kpiFields),
    };
  },
  generateKpiFieldsByType(typeSuffix) {
    if (!typeSuffix || !helpers.allowedSuffixes.includes(typeSuffix)) {
      throw new Error(typeSuffix ? 'you should provide a type suffix' : `${typeSuffix} is not allowed suffix`);
    }
    return helpers.kpiFields.reduce((acc, field) => {
      acc[KpiDictionary[`${field}${typeSuffix}`]] = helpers.randomInt(0, 100);
      return acc;
    }, {});
  },
  generateNoSuffixFields: () => {
    return [
      'satisfactionSumRating',
      'satisfactionCountReviews',
      'satisfactionSumRatingApv',
      'satisfactionCountReviewsApv',
      'satisfactionSumRatingVn',
      'satisfactionCountReviewsVn',
      'satisfactionSumRatingVo',
      'satisfactionCountReviewsVo',
    ].reduce((acc, field) => {
      acc[KpiDictionary[field]] = helpers.randomInt(0, 100);
      return acc;
    }, {});
  },
};

function populate(entireObj, keys, item) {
  let keysClone = [...keys],
    currentKey = keysClone.shift();

  if (keysClone.length > 0) {
    entireObj[item[currentKey]] = entireObj[item[currentKey]] || {};
    populate(entireObj[item[currentKey]], keysClone, item);
  } else {
    (entireObj[item[currentKey]] = entireObj[item[currentKey]] || []).push(item);
  }
}

const kpiGenerationHelpers = {
  computeField(kpiByPeriods, targetField, type = '', sumActive = true, garages = [], useGarage = false) {
    const field = targetField + this.generateCorrectSuffix(type);
    return kpiByPeriods.reduce((sum, kpi) => {
      if (!useGarage && (kpi[KpiDictionary[field]] === null || kpi[KpiDictionary[field]] === undefined)) {
        throw new Error(`${field} is not present in kpiByPeriods`);
      }
      if (sumActive && !useGarage) {
        return sum + (kpi[KpiDictionary[field]] || 0);
      }
      if (useGarage) {
        return garages.find((garage) => garage.id === kpi[KpiDictionary['garageId']])[targetField];
      }
      return kpi[KpiDictionary[field]];
    }, 0);
  },
  generateCorrectSuffix: (type) => {
    switch (type) {
      case DataTypes.NEW_VEHICLE_SALE:
        return 'Vn';
      case DataTypes.USED_VEHICLE_SALE:
        return 'Vo';
      case DataTypes.MAINTENANCE:
        return 'Apv';
      default:
        return '';
    }
  },
  generateCockpitTopFilterAllFields: ({
    garageId = null,
    garageType = GarageTypes.DEALERSHIP,
    type = KpiTypes.MAINTENANCE,
    garagePublicDisplayName = 'undefined',
    frontDeskUserName = 'undefined',
    source = 'DataFile',
    leadSaleType = 'NewVehicleSale',
    leadTicketManager = 'undefined',
    unsatisfiedTicketManager = 'undefined',
  } = {}) => {
    return {
      garageId: garageId,
      garageType: garageType,
      type: type,
      garagePublicDisplayName: garagePublicDisplayName,
      source: source,
      frontDeskUserName: frontDeskUserName,
      leadSaleType: leadSaleType,
      leadTicketManager: leadTicketManager,
      unsatisfiedTicketManager: unsatisfiedTicketManager,
    };
  },
  generateKpiByPeriodWithAllFields: ({ garageId, frontDeskUserId, kpiType, garageType, period } = {}) => {
    const suffixedFields = helpers.allowedSuffixes.reduce((acc, suffix) => {
      const kpiFields = kpiFieldsGenerators.generateKpiFieldsByType(suffix);
      return {
        ...acc,
        ...kpiFieldsGenerators.generateUnsuffixedFields(kpiFields),
        ...kpiFields,
      };
    }, {});
    return {
      ...kpiFieldsGenerators.generateMandatoryFields({ garageId, frontDeskUserId, kpiType, garageType, period }),
      ...suffixedFields,
      ...kpiFieldsGenerators.generateNoSuffixFields(),
    };
  },
  safeDivide(first, second) {
    if (first === 0 || second === 0) {
      return 0;
    }
    return first / second;
  },
  generateResponse(kpiByPeriodsArray, type = null, garages = []) {
     const scoreNps = this.safeDivide(
         this.computeField(kpiByPeriodsArray, 'satisfactionCountPromoters', type) -
         this.computeField(kpiByPeriodsArray, 'satisfactionCountDetractors', type),
         this.computeField(kpiByPeriodsArray, 'satisfactionCountReviews', type)
       ) * 100;

    return {
      externalId: this.computeField(kpiByPeriodsArray, 'externalId', null, false, garages, true),
      garageId: this.computeField(kpiByPeriodsArray, 'id', null, false, garages, true).toString(),
      garagePublicDisplayName: this.computeField(kpiByPeriodsArray, 'publicDisplayName', null, false, garages, true),
      garageSlug: this.computeField(kpiByPeriodsArray, 'slug', null, false, garages, true),
      hideDirectoryPage: this.computeField(kpiByPeriodsArray, 'hideDirectoryPage', null, false, garages, true),
      id: this.computeField(kpiByPeriodsArray, 'id', null, false, garages, true).toString(),

      frontDesk: this.computeField(kpiByPeriodsArray, 'userId', null, false).toString(),
      scoreNPS: scoreNps === 0 ? null : scoreNps,
      scoreAPV: this.safeDivide(
        this.computeField(kpiByPeriodsArray, 'satisfactionSumRatingApv', ''),
        this.computeField(kpiByPeriodsArray, 'satisfactionCountReviewsApv', '')
      ),
      scoreVN: this.safeDivide(
        this.computeField(kpiByPeriodsArray, 'satisfactionSumRatingVn', ''),
        this.computeField(kpiByPeriodsArray, 'satisfactionCountReviewsVn', '')
      ),

      scoreVO: this.safeDivide(
        this.computeField(kpiByPeriodsArray, 'satisfactionSumRatingVo', ''),
        this.computeField(kpiByPeriodsArray, 'satisfactionCountReviewsVo', '')
      ),

      countSurveyPromotor: this.computeField(kpiByPeriodsArray, 'satisfactionCountPromoters', type),
      countSurveyDetractor: this.computeField(kpiByPeriodsArray, 'satisfactionCountDetractors', type),
      countSurveysResponded: this.computeField(kpiByPeriodsArray, 'satisfactionCountReviews', type),
      countSurveyRespondedAll: this.computeField(kpiByPeriodsArray, 'satisfactionCountReviews', type),

      countNotContactablePercent:
        this.safeDivide(
          this.computeField(kpiByPeriodsArray, 'contactsCountNotContactable', type),
          this.computeField(kpiByPeriodsArray, 'contactsCountTotalShouldSurfaceInCampaignStats', type)
        ) * 100,
      countSurveysRespondedPercent:
        this.safeDivide(
          this.computeField(kpiByPeriodsArray, 'contactsCountSurveysResponded', type),
          this.computeField(kpiByPeriodsArray, 'contactsCountReceivedSurveys', type) +
            this.computeField(kpiByPeriodsArray, 'contactsCountScheduledContacts', type)
        ) * 100,

      countReceivedAndScheduledSurveys:
        this.computeField(kpiByPeriodsArray, 'contactsCountScheduledContacts', type) +
        this.computeField(kpiByPeriodsArray, 'contactsCountReceivedSurveys', type),

      countValidEmails: this.computeField(kpiByPeriodsArray, 'contactsCountValidEmails', type),
      countBlockedByEmail: this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByEmail', type),
      countWrongEmails: this.computeField(kpiByPeriodsArray, 'contactsCountWrongEmails', type),
      countNotPresentEmails: this.computeField(kpiByPeriodsArray, 'contactsCountNotPresentEmails', type),
      countValidPhones: this.computeField(kpiByPeriodsArray, 'contactsCountValidPhones', type),
      countBlockedByPhone: this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByPhone', type),
      countWrongPhones: this.computeField(kpiByPeriodsArray, 'contactsCountWrongPhones', type),
      countNotPresentPhones: this.computeField(kpiByPeriodsArray, 'contactsCountNotPresentPhones', type),
      countNotContactable: this.computeField(kpiByPeriodsArray, 'contactsCountNotContactable', type),
    };
  },
  groupBy(list, key) {
    return list.reduce(function (rv, x) {
      if (typeof key === 'string') (rv[x[key]] = rv[x[key]] || []).push(x);

      if (typeof key === 'object' && key.length) populate(rv, key, x);

      return rv;
    }, {});
  },
  generateGetKpisExpectedResponse(kpiByPeriodsArray, garages = [], type = null, group = ['0']) {
    return {
      list: Object.values(this.groupBy(kpiByPeriodsArray, group)).map((kpis) =>
        this.generateResponse(kpis, type, garages)
      ),
      hasMore: false,
    };
  },
};

const initializeModelFactories = () => {
  garageFactory = new ModelFactory(testApp.models.Garage, randomGarage);
  userFactory = new ModelFactory(testApp.models.User, randomUser);
  cockpitTopFilterFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.CockpitTopFilter.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByPeriod');
        }
        return result.ops[0];
      },
    },
    kpiGenerationHelpers.generateCockpitTopFilterAllFields
  );
  kpiByPeriodFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.KpiByPeriod.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByPeriod');
        }
        return result.ops[0];
      },
    },
    kpiGenerationHelpers.generateKpiByPeriodWithAllFields
  );
};

/*************** END OF TEST HELPERS *****************/

/*************** BEGINNING OF ASSERTION HELPERS *****************/

async function assertQueryResponse(queryVariables, user, expectedResponse) {
  const dealershipResult = await sendQuery(testApp, query, queryVariables, user.id.toString());

  const { data: { kpiByPeriodGetKpis: dealershipResponse } = {}, errors: dealershipErrors } = dealershipResult;
  expect(dealershipErrors).to.be.undefined;
  expect(dealershipResponse).to.be.an('object');
  assert.deepEqual(dealershipResponse, expectedResponse);
}

async function assertQueryHasError(queryVariables, user) {
  const result = await sendQuery(testApp, query, queryVariables, user.id.toString());

  const { errors } = result;
  expect(errors).to.not.be.undefined;
  return errors;
}

/*************** END OF ASSERTION HELPERS *****************/

/** END TEST HELPERS */

/** TESTS */

describe('Apollo Query::getKpiByPeriodKpis-----', () => {
  beforeEach(async () => {
    await testApp.reset();
    initializeModelFactories();
  });

  it('should call query and return a response', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((g) => g.id),
    });
    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: [garages[0].id.toString()],
        periodId: 'lastQuarter',
        type: null,
        frontDesk: null,
        kpiOrderBy: 'scoreNPS',
        kpiOrder: 'DESC',
      },
      user.id.toString()
    );

    const { data: { kpiByPeriodGetKpis } = {}, errors } = result;
    expect(errors).to.be.undefined;
    expect(kpiByPeriodGetKpis).to.be.an('object');
  });

  it('should return all histories for all user garages', async () => {
    const dealershipGarage = await garageFactory.createInDB({
      type: GarageTypes.DEALERSHIP,
    });
    const otherGarage = await garageFactory.createInDB({
      type: GarageTypes.DEALERSHIP,
    });
    const user = await userFactory.createInDB({
      garageIds: [dealershipGarage.id],
    });
    const kpiByPeriod = await kpiByPeriodFactory.createInDB(
      kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
        garageId: dealershipGarage.id,
        frontDeskUserId: -1,
        kpiType: KpiTypes.GARAGE_KPI,
        garageType: garageTypes.getIntegerVersion(dealershipGarage.type),
        period: 10,
      })
    );
    await kpiByPeriodFactory.createInDB(
      kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
        garageId: otherGarage.id,
        frontDeskUserId: -1,
        kpiType: KpiTypes.GARAGE_KPI,
        garageType: garageTypes.getIntegerVersion(dealershipGarage.type),
        period: 10,
      })
    );

    await assertQueryResponse(
      {
        periodId: 'lastQuarter',
        cockpitType: GarageTypes.DEALERSHIP,
        kpiOrder: 'DESC',
        kpiOrderBy: 'countSurveysRespondedPercent',
        type: null,
      },
      user,
      kpiGenerationHelpers.generateGetKpisExpectedResponse([kpiByPeriod], [dealershipGarage])
    );
  });

  it('Should return errors if mandatory fields are not submitted', async () => {
    const user = await userFactory.createInDB();

    await assertQueryHasError(
      {
        cockpitType: GarageTypes.DEALERSHIP,
        kpiOrder: 'DESC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
      },
      user
    );

    await assertQueryHasError(
      {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
      },
      user
    );

    await assertQueryHasError(
      {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'DESC',
        type: null,
      },
      user
    );
  });

  describe('-----Testing Where Input arguments-----', () => {
    it('should return an kpiByPeriodGetKpis list for one specific garage Id', async () => {
      const garages = await garageFactory.count(5).createInDB();
      const user = await userFactory.createInDB({
        garageIds: garages.map((g) => g.id),
      });
      const kpiByPeriods = await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      await assertQueryResponse(
        {
          garageIds: [garages[0].getId().toString()],
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysRespondedPercent',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter((kpi) => kpi[KpiDictionary['garageId']].toString() === garages[0].getId().toString()),
          garages
        )
      );
    });

    it('should returns correct results based on periodId', async () => {
      const garage = await garageFactory.createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: [garage.id] });

      const nbOfHistories = {
        default: 3,
        may2019: 5,
      };

      const kpiByPeriods = await kpiByPeriodFactory
        .sequence([
          {
            count: nbOfHistories.default,
            fields: {
              ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
                garageId: garage.id,
                frontDeskUserId: -1,
                kpiType: KpiTypes.GARAGE_KPI,
                garageType: garageTypes.getIntegerVersion(garage.type),
                period: 10,
              }),
            },
          },
          {
            count: nbOfHistories.may2019,
            fields: {
              ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
                garageId: garage.id,
                frontDeskUserId: -1,
                kpiType: KpiTypes.GARAGE_KPI,
                garageType: garageTypes.getIntegerVersion(garage.type),
                period: 201905,
              }),
            },
          },
        ])
        .createInDB();

      await assertQueryResponse(
        {
          garageId: garage.id.toString(),
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) =>
              kpi[KpiDictionary['garageId']].toString() === garage.id.toString() && kpi[KpiDictionary['period']] === 10
          ),
          [garage]
        )
      );
    });

    it('should be empty if user has no garage', async () => {
      const garage = await garageFactory.createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB();
      await kpiByPeriodFactory
        .sequence([
          {
            count: 3,
            fields: {
              ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
                garageId: garage.id,
                frontDeskUserId: -1,
                kpiType: KpiTypes.GARAGE_KPI,
                garageType: garageTypes.getIntegerVersion(garage.type),
                period: 10,
              }),
            },
          },
        ])
        .createInDB({ garageId: garage.id });

      await assertQueryResponse(
        {
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysRespondedPercent',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse([], [garage])
      );
    });

    it('should be empty and throw if user has no acess to this garage', async () => {
      const garages = await garageFactory.count(2).createInDB({ type: GarageTypes.DEALERSHIP });
      const users = await userFactory
        .sequence([
          { count: 1, fields: { garageIds: [garages[0].id] } },
          { count: 1, fields: { garageIds: [garages[1].id] } },
        ])
        .createInDB();
      await kpiByPeriodFactory
        .sequence([
          {
            count: 3,
            fields: {
              ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
                garageId: garages[0].id,
                frontDeskUserId: -1,
                kpiType: KpiTypes.GARAGE_KPI,
                garageType: garageTypes.getIntegerVersion(garages[0].type),
                period: 10,
              }),
            },
          },
          {
            count: 3,
            fields: {
              ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
                garageId: garages[1].id,
                frontDeskUserId: -1,
                kpiType: KpiTypes.GARAGE_KPI,
                garageType: garageTypes.getIntegerVersion(garages[1].type),
                period: 10,
              }),
            },
          },
        ])
        .createInDB();

      await assertQueryHasError(
        {
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysRespondedPercent',
          type: null,
          garageIds: [garages[0].id.toString()],
        },
        users[1]
      );

      await assertQueryHasError(
        {
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysRespondedPercent',
          type: null,
          garageIds: [garages[1].id.toString()],
        },
        users[0]
      );
    });

    it('should correctly order results', async () => {
      const garages = await garageFactory.count(10).createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: garages.map((garage) => garage.id) });
      await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      const requestArgs = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'DESC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
      };

      let result = await sendQuery(testApp, query, requestArgs, user.id.toString());

      let isCorrectlyOrdered = result.data.kpiByPeriodGetKpis.list.every(
        (curr, idx, histories) => !idx || histories[idx - 1].countSurveysResponded >= curr.countSurveysResponded
      );

      console.log(result.data.kpiByPeriodGetKpis.list);

      expect(isCorrectlyOrdered).to.be.true;

      result = await sendQuery(
        testApp,
        query,
        {
          ...requestArgs,
          kpiOrder: 'ASC',
        },
        user.id.toString()
      );

      isCorrectlyOrdered = result.data.kpiByPeriodGetKpis.list
        .reverse()
        .every(
          (curr, idx, histories) => !idx || histories[idx - 1].countSurveysResponded >= curr.countSurveysResponded
        );

      expect(isCorrectlyOrdered).to.be.true;
    });

    it('should return right number of kpiByPeriodGetKpis by CockpitType', async () => {
      const garages = await garageFactory
        .sequence([
          {
            count: 1,
            fields: {
              type: GarageTypes.DEALERSHIP,
            },
          },
          {
            count: 1,
            fields: {
              type: GarageTypes.MOTORBIKE_DEALERSHIP,
            },
          },
        ])
        .createInDB();
      const user = await userFactory.createInDB({ garageIds: garages.map((garage) => garage.id) });
      const kpiByPeriods = await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) => kpi[KpiDictionary['garageType']] === garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP)
          ),
          garages
        )
      );

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'DESC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) =>
              kpi[KpiDictionary['garageType']] === garageTypes.getIntegerVersion(GarageTypes.MOTORBIKE_DEALERSHIP)
          ),
          garages
        )
      );
    });

    it('Return correct number of histories by CockpitType if type not in ["DEALERSHIP", "MOTORBIKE_DEALERSHIP", "VEHICLE_INSPECTION"] fallbacks to DEALERSHIP', async () => {
      // create one garage of each type with 3 histories
      const garages = await garageFactory
        .sequence([
          { count: 1, fields: { type: GarageTypes.DEALERSHIP } },
          { count: 1, fields: { type: GarageTypes.MOTORBIKE_DEALERSHIP } },
          { count: 1, fields: { type: GarageTypes.VEHICLE_INSPECTION } },
          { count: 1, fields: { type: GarageTypes.CARAVANNING } },
          { count: 1, fields: { type: GarageTypes.AGENT } },
          { count: 1, fields: { type: GarageTypes.CAR_REPAIRER } },
          { count: 1, fields: { type: GarageTypes.CAR_RENTAL } },
          { count: 1, fields: { type: GarageTypes.UTILITY_CAR_DEALERSHIP } },
          { count: 1, fields: { type: GarageTypes.OTHER } },
        ])
        .createInDB();

      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });
      const kpiByPeriods = await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 3,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) =>
              kpi[KpiDictionary['garageType']] === garageTypes.getIntegerVersion(GarageTypes.MOTORBIKE_DEALERSHIP)
          ),
          garages
        )
      );

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.VEHICLE_INSPECTION,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) => kpi[KpiDictionary['garageType']] === garageTypes.getIntegerVersion(GarageTypes.VEHICLE_INSPECTION)
          ),
          garages
        )
      );

      const result = await sendQuery(
        testApp,
        query,
        {
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: null,
        },
        user.id.toString()
      );

      // all without motorBikeDealership and Vehicule inspection
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter(
            (kpi) =>
              kpi[KpiDictionary['garageType']] !== garageTypes.getIntegerVersion(GarageTypes.VEHICLE_INSPECTION) &&
              kpi[KpiDictionary['garageType']] !== garageTypes.getIntegerVersion(GarageTypes.MOTORBIKE_DEALERSHIP)
          ),
          garages
        ).list.length
      );
    });

    it('Should return correct results if a search args is submitted', async () => {
      const garages = await garageFactory
        .sequence([
          { count: 1, fields: { publicDisplayName: 'First' } },
          { count: 1, fields: { publicDisplayName: 'Second' } },
          { count: 1, fields: { publicDisplayName: 'Third' } },
        ])
        .createInDB({ type: GarageTypes.DEALERSHIP });

      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });

      await cockpitTopFilterFactory
        .sequence(
          garages.map((g) => ({
            count: 3,
            fields: kpiGenerationHelpers.generateCockpitTopFilterAllFields({
              garageId: g.id,
              garageType: g.type,
              garagePublicDisplayName: g.publicDisplayName,
            }),
          }))
        )
        .createInDB();

      await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 3,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      const requestArgs = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
        search: 'First',
      };

      let result = await sendQuery(testApp, query, requestArgs, user.id.toString());
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(1);
      expect(result.data.kpiByPeriodGetKpis.list[0].garagePublicDisplayName).to.equal(garages[0].publicDisplayName);

      result = await sendQuery(testApp, query, { ...requestArgs, search: 'Second' }, user.id.toString());

      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(1);
      expect(result.data.kpiByPeriodGetKpis.list[0].garagePublicDisplayName).to.equal(garages[1].publicDisplayName);

      result = await sendQuery(testApp, query, { ...requestArgs, search: 'Third' }, user.id.toString());

      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(1);
      expect(result.data.kpiByPeriodGetKpis.list[0].garagePublicDisplayName).to.equal(garages[2].publicDisplayName);
    });

    it('should return appropriate number of histories by historyType', async () => {
      const garage = await garageFactory.createInDB();
      const user = await userFactory.createInDB({ garageIds: [garage.id] });
      const kpiByPeriods = await kpiByPeriodFactory
        .sequence(
          [garage].map((g) => ({
            count: 10,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: DataTypes.MAINTENANCE,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(kpiByPeriods, [garage], DataTypes.MAINTENANCE)
      );

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: DataTypes.NEW_VEHICLE_SALE,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(kpiByPeriods, [garage], DataTypes.NEW_VEHICLE_SALE)
      );

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          type: DataTypes.USED_VEHICLE_SALE,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(kpiByPeriods, [garage], DataTypes.USED_VEHICLE_SALE)
      );
    });

    it('Should not return histories with frontDesk = ALL_USERS if allUsers params is true', async () => {
      const garage = await garageFactory.createInDB();
      const user = await userFactory.createInDB({ garageIds: [garage.id] });
      const kpiByPeriods = await kpiByPeriodFactory
        .sequence([
          {
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: garage.id,
              frontDeskUserId: 'ALL_USERS',
              kpiType: KpiTypes.FRONT_DESK_USER_KPI,
              garageType: garageTypes.getIntegerVersion(garage.type),
              period: 10,
            }),
          },
          {
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: garage.id,
              frontDeskUserId: 'test_name',
              kpiType: KpiTypes.FRONT_DESK_USER_KPI,
              garageType: garageTypes.getIntegerVersion(garage.type),
              period: 10,
            }),
          },
        ])
        .createInDB();

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          garageIds: [garage.id.toString()],
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          allUsers: true,
          kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter((kpi) => kpi[KpiDictionary['userId']] !== 'ALL_USERS'),
          [garage]
        )
      );

      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          garageIds: [garage.id.toString()],
          periodId: 'lastQuarter',
          kpiOrder: 'ASC',
          kpiOrderBy: 'countSurveysResponded',
          allUsers: false,
          kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        },
        user,
        kpiGenerationHelpers.generateGetKpisExpectedResponse(
          kpiByPeriods.filter((kpi) => kpi[KpiDictionary['userId']] === 'ALL_USERS'),
          [garage]
        )
      );
    });
  });

  it('should not return histories with frondDesk = ALL_USERS when searching', async () => {
    const frontDesk = 'absolutely_unique';
    const garage = await garageFactory.createInDB({ type: GarageTypes.DEALERSHIP });
    const user = await userFactory.createInDB({ garageIds: [garage.id] });
    await cockpitTopFilterFactory
      .sequence(
        [garage].map((g) => ({
          count: 1,
          fields: kpiGenerationHelpers.generateCockpitTopFilterAllFields({
            garageId: g.id.toString(),
            garageType: g.type,
            garagePublicDisplayName: g.publicDisplayName,
            frontDeskUserName: frontDesk,
          }),
        }))
      )
      .createInDB();

    const kpiByPeriods = await kpiByPeriodFactory
      .sequence([
        {
          count: 1,
          fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
            garageId: garage.id,
            frontDeskUserId: 'ALL_USERS',
            kpiType: KpiTypes.FRONT_DESK_USER_KPI,
            garageType: garageTypes.getIntegerVersion(garage.type),
            period: 10,
          }),
        },
        {
          count: 1,
          fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
            garageId: garage.id,
            frontDeskUserId: frontDesk,
            kpiType: KpiTypes.FRONT_DESK_USER_KPI,
            garageType: garageTypes.getIntegerVersion(garage.type),
            period: 10,
          }),
        },
      ])
      .createInDB();

    await assertQueryResponse(
      {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countSurveysResponded',
        search: frontDesk,
        allUsers: true,
        kpiType: KpiTypes.FRONT_DESK_USER_KPI,
      },
      user,
      kpiGenerationHelpers.generateGetKpisExpectedResponse(
        kpiByPeriods.filter((kpi) => kpi[KpiDictionary['userId']] !== 'ALL_USERS'),
        [garage]
      )
    );

    // specific frontDesk, no garageId, allusers = false
    let requestArgs = {
      cockpitType: GarageTypes.DEALERSHIP,
      periodId: 'lastQuarter',
      kpiOrder: 'ASC',
      kpiOrderBy: 'countSurveysResponded',
      search: frontDesk,
      allUsers: false,
      kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    };

    let result = await sendQuery(testApp, query, requestArgs, user.id.toString());
    expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(0);

    // specific garageId, specific frontDesk, allUsers = false
    await assertQueryResponse(
      {
        garageIds: [garage.id.toString()],
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countSurveysResponded',
        search: frontDesk,
        allUsers: false,
        kpiType: KpiTypes.FRONT_DESK_USER_KPI,
      },
      user,
      kpiGenerationHelpers.generateGetKpisExpectedResponse(
        kpiByPeriods.filter((kpi) => kpi[KpiDictionary['userId']] === 'ALL_USERS'),
        [garage]
      )
    );

    // specific garageId, specific frontDesk, allUsers = true
    await assertQueryResponse(
      {
        garageIds: [garage.id.toString()],
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countSurveysResponded',
        search: frontDesk,
        allUsers: true,
        kpiType: KpiTypes.FRONT_DESK_USER_KPI,
      },
      user,
      kpiGenerationHelpers.generateGetKpisExpectedResponse(
        kpiByPeriods.filter(
          (kpi) =>
            kpi[KpiDictionary['userId']] === frontDesk &&
            kpi[KpiDictionary['garageId']].toString() === garage.id.toString()
        ),
        [garage]
      )
    );
  });

  describe('------testing options input arguments results------', () => {
    it('should return right results with submitted limit and skip args', async () => {
      const garages = await garageFactory.count(50).createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });

      await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      // const histories = await garageHistoryFactory.count(50).createInDB({ garageId: garage.id });

      const requestArgs = {
        garageIds: garages.map((g) => g.id.toString()),
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'DESC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
        limit: 50,
      };
      const limitsAndSkips = {
        firstTest: 6,
        secondTest: 20,
        thirdTest: { limit: 5, skip: 10 },
        fourthTest: { limit: 12, skip: 13 },
      };
      const fullResult = await sendQuery(testApp, query, requestArgs, user.id.toString());
      expect(fullResult.data.kpiByPeriodGetKpis.list).to.have.lengthOf(garages.length);

      let result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.firstTest },
        user.id.toString()
      );
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.firstTest);
      //
      result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.secondTest },
        user.id.toString()
      );
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.secondTest);
      //
      result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.thirdTest.limit, skip: limitsAndSkips.thirdTest.skip },
        user.id.toString()
      );
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.thirdTest.limit);
      expect(result.data.kpiByPeriodGetKpis.list[0].id).to.equal(
        fullResult.data.kpiByPeriodGetKpis.list[limitsAndSkips.thirdTest.skip].id
      );
      //
      result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.fourthTest.limit, skip: limitsAndSkips.fourthTest.skip },
        user.id.toString()
      );

      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.fourthTest.limit);
      expect(result.data.kpiByPeriodGetKpis.list[0].id).to.equal(
        fullResult.data.kpiByPeriodGetKpis.list[limitsAndSkips.fourthTest.skip].id
      );
    });

    it('should ajust the limit to 100 if the submitted limit is above 100 or below 1', async () => {
      const garages = await garageFactory.count(150).createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });

      await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();

      const limits = {
        under: 0,
        accepted: 40,
        over: 150,
        fallback: 100,
      };

      const requestArgs = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,

        limit: limits.accepted,
      };

      let result = await sendQuery(testApp, query, requestArgs, user.id.toString());
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limits.accepted);

      result = await sendQuery(testApp, query, { ...requestArgs, limit: limits.over }, user.id.toString());
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limits.fallback);

      result = await sendQuery(testApp, query, { ...requestArgs, limit: limits.under }, user.id.toString());
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limits.fallback);
    });

    it('should correctly handles the hasMore behavior', async () => {
      const garages = await garageFactory.count(50).createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });

      await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 10,
            }),
          }))
        )
        .createInDB();
      const limitsAndSkips = {
        all: 50,
        firstTest: { limit: 10 },
        secondTest: { limit: 10, skip: 10 },
        thirdTest: { limit: 10, skip: 20 },
      };
      const requestArgs = {
        garageIds: garages.map((g) => g.id.toString()),
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'DESC',
        kpiOrderBy: 'countSurveysResponded',
        type: null,
        limit: limitsAndSkips.all,
      };

      const fullResult = await sendQuery(testApp, query, requestArgs, user.id.toString());

      expect(fullResult.data.kpiByPeriodGetKpis.list).to.have.lengthOf(garages.length);
      expect(fullResult.data.kpiByPeriodGetKpis.hasMore).to.be.false;

      let result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.firstTest.limit },
        user.id.toString()
      );

      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.firstTest.limit);
      expect(result.data.kpiByPeriodGetKpis.hasMore).to.be.true;

      result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.secondTest.limit, skip: limitsAndSkips.secondTest.skip },
        user.id.toString()
      );
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.secondTest.limit);
      expect(result.data.kpiByPeriodGetKpis.hasMore).to.be.true;
      expect(result.data.kpiByPeriodGetKpis.list[0].id).to.equal(
        fullResult.data.kpiByPeriodGetKpis.list[limitsAndSkips.secondTest.skip].id
      );

      result = await sendQuery(
        testApp,
        query,
        { ...requestArgs, limit: limitsAndSkips.thirdTest.limit, skip: limitsAndSkips.thirdTest.skip },
        user.id.toString()
      );
      expect(result.data.kpiByPeriodGetKpis.list).to.have.lengthOf(limitsAndSkips.thirdTest.limit);
      expect(result.data.kpiByPeriodGetKpis.hasMore).to.be.true;
      expect(result.data.kpiByPeriodGetKpis.list[0].id).to.equal(
        fullResult.data.kpiByPeriodGetKpis.list[limitsAndSkips.thirdTest.skip].id
      );
    });
  });

  describe('------ testing specific fields resolvers------', () => {
    it('should correctly resolve the "countReceivedAndScheduledSurveys" field', async () => {
      const garages = await garageFactory.count(3).createInDB({ type: GarageTypes.DEALERSHIP });
      const user = await userFactory.createInDB({ garageIds: garages.map((g) => g.id) });

      const receivedAndScheduledSurveysCounts = {
        firstTest: {
          countReceivedSurveys: 150,
          countScheduledContacts: 250,
          garageId: garages[0].id,
        },
        secondTest: {
          countReceivedSurveys: 150,
          countScheduledContacts: null,
          garageId: garages[1].id,
        },
        thirdTest: {
          countReceivedSurveys: null,
          countScheduledContacts: null,
          garageId: garages[2].id,
        },
      };
      kpiByPeriodFactory.addSequenceStage(1, {
        ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
          garageId: receivedAndScheduledSurveysCounts.firstTest.garageId,
          frontDeskUserId: -1,
          kpiType: KpiTypes.GARAGE_KPI,
          garageType: garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
          period: 10,
        }),
        [KpiDictionary['contactsCountReceivedSurveys']]:
          receivedAndScheduledSurveysCounts.firstTest.countReceivedSurveys,
        [KpiDictionary['contactsCountScheduledContacts']]:
          receivedAndScheduledSurveysCounts.firstTest.countScheduledContacts,
      });
      kpiByPeriodFactory.addSequenceStage(1, {
        ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
          garageId: receivedAndScheduledSurveysCounts.secondTest.garageId,
          frontDeskUserId: -1,
          kpiType: KpiTypes.GARAGE_KPI,
          garageType: garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
          period: 10,
        }),
        [KpiDictionary['contactsCountReceivedSurveys']]:
          receivedAndScheduledSurveysCounts.secondTest.countReceivedSurveys,
        [KpiDictionary['contactsCountScheduledContacts']]:
          receivedAndScheduledSurveysCounts.secondTest.countScheduledContacts,
      });
      kpiByPeriodFactory.addSequenceStage(1, {
        ...kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
          garageId: receivedAndScheduledSurveysCounts.thirdTest.garageId,
          frontDeskUserId: -1,
          kpiType: KpiTypes.GARAGE_KPI,
          garageType: garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
          period: 10,
        }),
        [KpiDictionary['contactsCountReceivedSurveys']]:
          receivedAndScheduledSurveysCounts.thirdTest.countReceivedSurveys,
        [KpiDictionary['contactsCountScheduledContacts']]:
          receivedAndScheduledSurveysCounts.thirdTest.countScheduledContacts,
      });

      const kpiByPeriods = await kpiByPeriodFactory.createInDB();

      console.log(JSON.stringify(kpiByPeriods, null, 2));
      // 4000 contactsCountReceivedSurveys
      // 4006 contactsCountScheduledContacts

      const requestArgs = {
        garageIds: [garages[0].id.toString()],
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        kpiOrder: 'ASC',
        kpiOrderBy: 'countReceivedAndScheduledSurveys',
        type: null,
      };

      let result = await sendQuery(testApp, query, requestArgs, user.id.toString());

      expect(result.data.kpiByPeriodGetKpis.list[0].countReceivedAndScheduledSurveys).to.equal(
        receivedAndScheduledSurveysCounts.firstTest.countReceivedSurveys +
          receivedAndScheduledSurveysCounts.firstTest.countScheduledContacts
      );

      result = await sendQuery(
        testApp,
        query,
        {
          ...requestArgs,
          garageIds: [garages[1].id.toString()],
        },
        user.id.toString()
      );

      expect(result.data.kpiByPeriodGetKpis.list[0].countReceivedAndScheduledSurveys).to.equal(
        receivedAndScheduledSurveysCounts.secondTest.countReceivedSurveys
      );

      result = await sendQuery(
        testApp,
        query,
        {
          ...requestArgs,
          garageIds: [garages[2].id.toString()],
        },
        user.id.toString()
      );

      expect(result.data.kpiByPeriodGetKpis.list[0].countReceivedAndScheduledSurveys).to.equal(0);
    });
  });
});
