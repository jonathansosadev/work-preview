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
const { gql, UserInputError } = require('apollo-server-express');
const garageTypes = require('../../../common/models/garage.type');

/**
 * @type ModelFactory
 */
let garageFactory, userFactory, kpiByPeriodFactory;

const query = gql`
  query kpiByPeriodGetSingle(
    $cockpitType: String!
    $garageIds: [String]
    $periodId: String!
    $type: String
    $frontDesk: String
  ) {
    kpiByPeriodGetSingle(
      cockpitType: $cockpitType
      garageIds: $garageIds
      periodId: $periodId
      type: $type
      frontDesk: $frontDesk
    ) {
      totalShouldSurfaceInCampaignStats
      countEmails
      countSurveys
      countReceivedSurveys
      countSurveysResponded
      countSurveySatisfied
      countSurveyUnsatisfied
      countSurveyLead
      countSurveyLeadVo
      countSurveyLeadVn
      countValidEmails
      countBlockedByEmail
      countUnsubscribedByEmail
      countWrongEmails
      countNotPresentEmails
      countValidPhones
      countBlockedByPhone
      countWrongPhones
      countNotPresentPhones
      countBlocked
      countNotContactable
      countSurveyRespondedAPV
      countSurveyRespondedVN
      countSurveyRespondedVO
      countScheduledContacts
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
  satisfactionFields: [
    'satisfactionCountSurveys',
    'satisfactionCountReviews',
    'satisfactionCountPromoters',
    'satisfactionCountDetractors',
    'satisfactionCountPassives',
  ],
  contactFields: [
    'contactsCountReceivedSurveys',
    'contactsCountSurveysResponded',
    'contactsCountValidEmails',
    'contactsCountValidPhones',
    'contactsCountNotContactable',
    'contactsCountTotalShouldSurfaceInCampaignStats',
    'contactsCountScheduledContacts',
    'contactsCountBlockedLastMonthEmail',
    'contactsCountUnsubscribedByEmail',
    'contactsCountBlockedByPhone',
    'contactsCountBlockedByEmail',
    'contactsCountWrongEmails',
    'contactsCountNotPresentEmails',
    'contactsCountWrongPhones',
    'contactsCountNotPresentPhones',
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
  generateUnsuffixedFields(satisfactionFields, contactsFields) {
    return {
      ...helpers.contactFields.reduce((acc, field) => {
        acc[KpiDictionary[field]] = helpers.allowedSuffixes.reduce((sum, suffix) => {
          return sum + (acc[KpiDictionary[field + suffix]] || 0);
        }, 0);
        return acc;
      }, contactsFields),
      ...helpers.satisfactionFields.reduce((acc, field) => {
        acc[KpiDictionary[field]] = helpers.allowedSuffixes.reduce((sum, suffix) => {
          return sum + (acc[KpiDictionary[field + suffix]] || 0);
        }, 0);
        return acc;
      }, satisfactionFields),
    };
  },
  generateSatisfactionFieldsByType(typeSuffix) {
    if (!typeSuffix || !helpers.allowedSuffixes.includes(typeSuffix)) {
      throw new Error(typeSuffix ? 'you should provide a type suffix' : `${typeSuffix} is not allowed suffix`);
    }
    return helpers.satisfactionFields.reduce((acc, field) => {
      acc[KpiDictionary[`${field}${typeSuffix}`]] = helpers.randomInt(0, 100);
      return acc;
    }, {});
  },
  generateContactsFieldsByType(typeSuffix) {
    if (!typeSuffix || !helpers.allowedSuffixes.includes(typeSuffix)) {
      throw new Error(typeSuffix ? 'you should provide a type suffix' : `${typeSuffix} is not allowed suffix`);
    }
    return helpers.contactFields.reduce((acc, field) => {
      acc[KpiDictionary[`${field}${typeSuffix}`]] = helpers.randomInt(0, 100);
      return acc;
    }, {});
  },
  generateNoSuffixFields: () => {
    return [
      'contactsCountSurveysRespondedApv',
      'contactsCountSurveysRespondedVn',
      'contactsCountSurveysRespondedVo',
      'countLeadsPotentialSales',
      'countLeadsPotentialSalesVo',
      'countLeadsPotentialSalesVn',
    ].reduce((acc, field) => {
      acc[KpiDictionary[field]] = helpers.randomInt(0, 100);
      return acc;
    }, {});
  },
};

const kpiGenerationHelpers = {
  computeField(kpiByPeriods, targetField, type = '') {
    const field = targetField + this.generateCorrectSuffix(type);
    return kpiByPeriods.reduce((sum, kpi) => {
      if (kpi[KpiDictionary[field]] === null || kpi[KpiDictionary[field]] === undefined) {
        throw new Error(`${field} is not present in kpiByPeriods`);
      }
      return sum + (kpi[KpiDictionary[field]] || 0);
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
  generateKpiByPeriodWithAllFields: ({ garageId, frontDeskUserId, kpiType, garageType, period } = {}) => {
    const suffixedFields = helpers.allowedSuffixes.reduce((acc, suffix) => {
      const satisfactionFields = kpiFieldsGenerators.generateSatisfactionFieldsByType(suffix);
      const contactsFields = kpiFieldsGenerators.generateContactsFieldsByType(suffix);
      return {
        ...acc,
        ...kpiFieldsGenerators.generateUnsuffixedFields(satisfactionFields, contactsFields),
        ...satisfactionFields,
        ...contactsFields,
      };
    }, {});
    return {
      ...kpiFieldsGenerators.generateMandatoryFields({ garageId, frontDeskUserId, kpiType, garageType, period }),
      ...suffixedFields,
      ...kpiFieldsGenerators.generateNoSuffixFields(),
    };
  },
  generateGetSingleExpectedResponse(kpiByPeriodsArray, type = null) {
    return {
      totalShouldSurfaceInCampaignStats: this.computeField(
        kpiByPeriodsArray,
        'contactsCountTotalShouldSurfaceInCampaignStats',
        type
      ),
      countEmails: this.computeField(kpiByPeriodsArray, 'contactsCountValidEmails', type),
      countSurveys:
        this.computeField(kpiByPeriodsArray, 'contactsCountReceivedSurveys', type) +
        this.computeField(kpiByPeriodsArray, 'contactsCountScheduledContacts', type),
      countReceivedSurveys: this.computeField(kpiByPeriodsArray, 'contactsCountReceivedSurveys', type),
      countSurveysResponded: this.computeField(kpiByPeriodsArray, 'contactsCountSurveysResponded', type),
      countSurveySatisfied: this.computeField(kpiByPeriodsArray, 'satisfactionCountPromoters', type),
      countSurveyUnsatisfied: this.computeField(kpiByPeriodsArray, 'satisfactionCountDetractors', type),
      countSurveyLead: this.computeField(kpiByPeriodsArray, 'countLeadsPotentialSales'),
      countSurveyLeadVo: this.computeField(kpiByPeriodsArray, 'countLeadsPotentialSalesVo'),
      countSurveyLeadVn: this.computeField(kpiByPeriodsArray, 'countLeadsPotentialSalesVn'),
      countValidEmails: this.computeField(kpiByPeriodsArray, 'contactsCountValidEmails', type),
      countBlockedByEmail: this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByEmail', type),
      countUnsubscribedByEmail: this.computeField(kpiByPeriodsArray, 'contactsCountUnsubscribedByEmail', type),
      countWrongEmails: this.computeField(kpiByPeriodsArray, 'contactsCountWrongEmails', type),
      countNotPresentEmails: this.computeField(kpiByPeriodsArray, 'contactsCountNotPresentEmails', type),
      countValidPhones: this.computeField(kpiByPeriodsArray, 'contactsCountValidPhones', type),
      countBlockedByPhone: this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByPhone', type),
      countWrongPhones: this.computeField(kpiByPeriodsArray, 'contactsCountWrongPhones', type),
      countNotPresentPhones: this.computeField(kpiByPeriodsArray, 'contactsCountNotPresentPhones', type),
      countBlocked:
        this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByEmail', type) +
        this.computeField(kpiByPeriodsArray, 'contactsCountBlockedByPhone', type),
      countNotContactable: this.computeField(kpiByPeriodsArray, 'contactsCountNotContactable', type),
      countSurveyRespondedAPV: this.computeField(kpiByPeriodsArray, 'contactsCountSurveysRespondedApv'),
      countSurveyRespondedVN: this.computeField(kpiByPeriodsArray, 'contactsCountSurveysRespondedVn'),
      countSurveyRespondedVO: this.computeField(kpiByPeriodsArray, 'contactsCountSurveysRespondedVo'),
      countScheduledContacts: this.computeField(kpiByPeriodsArray, 'contactsCountScheduledContacts', type),
    };
  },
};

const initializeModelFactories = () => {
  garageFactory = new ModelFactory(testApp.models.Garage, randomGarage);
  userFactory = new ModelFactory(testApp.models.User, randomUser);
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

  const { data: { kpiByPeriodGetSingle: dealershipResponse } = {}, errors: dealershipErrors } = dealershipResult;
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

/*************** BEGINNING OF TEST CASES *****************/

describe('KpiByPeriod :: GetSingle tests suite', () => {
  beforeEach(async () => {
    await testApp.reset();
    initializeModelFactories();
  });

  describe('General behaviour :: testing query behaviour', () => {
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
        },
        user.id.toString()
      );

      const { data: { kpiByPeriodGetSingle } = {}, errors } = result;
      expect(errors).to.be.undefined;
      expect(kpiByPeriodGetSingle).to.be.an('object');
    });

    it('should return single Kpi for one dealership garage for lastQuarter period', async () => {
      const dealershipGarage = await garageFactory.createInDB({
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
      await assertQueryResponse(
        {
          cockpitType: GarageTypes.DEALERSHIP,
          garageIds: [dealershipGarage.id.toString()],
          periodId: 'lastQuarter',
        },
        user,
        kpiGenerationHelpers.generateGetSingleExpectedResponse([kpiByPeriod])
      );
    });

    it('should return appropriate response for multiple dealership garages', async () => {
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
          cockpitType: GarageTypes.DEALERSHIP,
          periodId: 'lastQuarter',
        },
        user,
        kpiGenerationHelpers.generateGetSingleExpectedResponse(kpiByPeriods)
      );
    });

    it('should return error with missing mandatory Field', async () => {
      const user = await userFactory.createInDB();
      await assertQueryHasError(
        {
          cockpitType: GarageTypes.DEALERSHIP,
        },
        user
      );

      await assertQueryHasError(
        {
          periodId: 'lastQuarter',
        },
        user
      );
    });
  });

  describe('Query Arg testing :: GarageIds', () => {
    it('should return right kpiByPeriod for One garageId', async () => {
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
      const queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages[0].id.toString(),
        periodId: 'lastQuarter',
      };

      const expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods.filter((k) => k[0] === garages[0].id)
      );
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should return right kpiByPeriod for multiple garageIds', async () => {
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

      const queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages.slice(0, 2).map((g) => g.id.toString()),
        periodId: 'lastQuarter',
      };

      const expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods.filter((k) =>
          garages
            .slice(0, 2)
            .map((g) => g.id)
            .includes(k[0])
        )
      );

      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should return empty response if user try to access a garage he does not own', async () => {
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
      const user2 = await userFactory.createInDB({
        garageIds: [],
      });

      let queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages[0].id.toString(),
        periodId: 'lastQuarter',
      };
      let expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse([]);

      await assertQueryResponse(queryVariables, user2, expectedResponse);

      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods.filter((k) => k[0] === garages[0].id)
      );
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should take all user owned garages if no garageIds is passed', async () => {
      const garages = await garageFactory.count(5).createInDB();
      const user = await userFactory.createInDB({
        garageIds: garages.map((g) => g.id),
      });

      const user2 = await userFactory.createInDB({
        garageIds: [],
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

      const queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
      };
      let expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(kpiByPeriods);

      await assertQueryResponse(queryVariables, user, expectedResponse);

      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse([]);
      await assertQueryResponse(queryVariables, user2, expectedResponse);
    });
  });
  describe('Query Arg testing :: CockpitType', () => {
    it('CockpitType Arg :: should return appropriate response', async () => {
      const dealershipGarages = await garageFactory.count(5).createInDB({
        type: GarageTypes.DEALERSHIP,
      });
      const motorBikeGarages = await garageFactory.count(5).createInDB({
        type: GarageTypes.MOTORBIKE_DEALERSHIP,
      });

      const user = await userFactory.createInDB({
        garageIds: [...dealershipGarages, ...motorBikeGarages].map((g) => g.id),
      });

      const dealershipKpiByPeriods = await kpiByPeriodFactory
        .sequence(
          dealershipGarages.map((g) => ({
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

      const motorbikeKpiByPeriods = await kpiByPeriodFactory
        .sequence(
          motorBikeGarages.map((g) => ({
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
      let queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
      };
      let expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(dealershipKpiByPeriods);
      await assertQueryResponse(queryVariables, user, expectedResponse);

      queryVariables = {
        cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
        periodId: 'lastQuarter',
      };

      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(motorbikeKpiByPeriods);
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should return error with invalid cockpitType', async () => {
      const dealershipGarages = await garageFactory.count(5).createInDB({
        type: GarageTypes.DEALERSHIP,
      });
      const motorBikeGarages = await garageFactory.count(5).createInDB({
        type: GarageTypes.MOTORBIKE_DEALERSHIP,
      });

      const user = await userFactory.createInDB({
        garageIds: [...dealershipGarages, ...motorBikeGarages].map((g) => g.id),
      });
      await kpiByPeriodFactory
        .sequence(
          [...dealershipGarages, ...motorBikeGarages].map((g) => ({
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

      const queryVariables = {
        cockpitType: 'invalid',
        periodId: 'lastQuarter',
      };
      try {
        await assertQueryHasError(queryVariables, user);
      } catch (e) {
        expect(e).to.be.instanceof(UserInputError);
      }
    });
  });

  describe('Query Arg testing :: PeriodId', () => {
    it('should return appropriate response for different periodId', async () => {
      const garages = await garageFactory.count(5).createInDB();
      const user = await userFactory.createInDB({
        garageIds: garages.map((g) => g.id),
      });

      const lastQuarterKpiByPeriods = await kpiByPeriodFactory
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

      const january2022KpiByPeriods = await kpiByPeriodFactory
        .sequence(
          garages.map((g) => ({
            count: 1,
            fields: kpiGenerationHelpers.generateKpiByPeriodWithAllFields({
              garageId: g.id,
              frontDeskUserId: -1,
              kpiType: KpiTypes.GARAGE_KPI,
              garageType: garageTypes.getIntegerVersion(g.type),
              period: 202201,
            }),
          }))
        )
        .createInDB();

      let queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
      };
      let expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(lastQuarterKpiByPeriods);

      await assertQueryResponse(queryVariables, user, expectedResponse);

      queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: '2022-month01',
      };

      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(january2022KpiByPeriods);
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should return empty response for invalid period', async () => {
      const garages = await garageFactory.count(5).createInDB();
      const user = await userFactory.createInDB({
        garageIds: garages.map((g) => g.id),
      });

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
      const queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'invalidPeriodId',
      };
      const expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse([]);
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });
  });

  describe('Query Arg testing :: type', () => {
    it('should return correct response depending on type', async () => {
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

      let queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        type: DataTypes.MAINTENANCE,
      };
      let expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods,
        DataTypes.MAINTENANCE
      );
      await assertQueryResponse(queryVariables, user, expectedResponse);

      queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        type: DataTypes.USED_VEHICLE_SALE,
      };
      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods,
        DataTypes.USED_VEHICLE_SALE
      );
      await assertQueryResponse(queryVariables, user, expectedResponse);

      queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        type: DataTypes.NEW_VEHICLE_SALE,
      };
      expectedResponse = kpiGenerationHelpers.generateGetSingleExpectedResponse(
        kpiByPeriods,
        DataTypes.NEW_VEHICLE_SALE
      );
      await assertQueryResponse(queryVariables, user, expectedResponse);
    });

    it('should return error response with invalid type', async () => {
      const garages = await garageFactory.count(5).createInDB();
      const user = await userFactory.createInDB({
        garageIds: garages.map((g) => g.id),
      });
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
      let queryVariables = {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'lastQuarter',
        type: 'invalid type',
      };
      try {
        await assertQueryHasError(queryVariables, user);
      } catch (e) {
        expect(e).to.be.instanceof(UserInputError);
      }
    });
  });
});
