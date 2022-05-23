const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { reportKpiGetMonthlySummary } = require('../../../../frontend/api/graphql/definitions/queries.json');

// COMMON
const _common = require('../_common/monthlySummary');
const dataTypes = require('../../../../common/models/data/type/data-types');

// HELPER
const util = require('../_common/monthlySummary/helpers/util');
const calculateKpiForPeriod = require('../_common/monthlySummary/helpers/calculateKpiForPeriod');
const calculateEmployeeRankings = require('../_common/monthlySummary/helpers/calculateEmployeeRankings');

const { FLO, log } = require('../../../../common/lib/util/log');

const typePrefix = 'reportKpiGetMonthlySummary';

module.exports.typeDef = `
  extend type Query {
    ${reportKpiGetMonthlySummary.type}: ${typePrefix}MonthlySummary
  }
  type ${typePrefix}MonthlySummary {    
      id: ID!
      month: Int
      year: Int
      garages: [${typePrefix}Garage]
      availableDataTypes: ${typePrefix}AvailableDataTypes
      bestLeadsPerf: Int
      bestSatisfactionPerf: Float
      bestProblemResolutionPerf: Float
      bestValidEmailsPerf: Float
      averageLeadsPerf: Float
      averageSatisfactionPerf: Float
      averageProblemResolutionPerf: Float
      averageValidEmailsPerf: Float
      leads: [${typePrefix}Leads]
      satisfaction: [${typePrefix}Satisfaction]
      problemResolution: [${typePrefix}ProblemResolution]
      validEmails: [${typePrefix}ValidEmails]
      employeesRanking: ${typePrefix}EmployeesRanking
  }


    """ Garage """ 
    type ${typePrefix}Garage {
        garageId: String
        garageName: String
        group: String
        authorizations: ${typePrefix}GarageAuthorizations
    }

    type ${typePrefix}GarageAuthorizations {
        leads: [String]
        satisfaction: [String]
        problemResolution: [String]
        validEmails: [String]
    }

    """ AvailableDataTypes """
    type ${typePrefix}AvailableDataTypes {
        leads: [String]
        satisfaction: [String]
        problemResolution: [String]
        validEmails: [String]
    }

    """ Leads """
    type ${typePrefix}Leads {
        garageId: String
        garageName: String
        convertedLeads12M: ${typePrefix}LeadsMonths
        convertedLeadsM: ${typePrefix}LeadsMonths
        convertedLeadsM1: ${typePrefix}LeadsMonths
        convertedLeadsM2: Int
        convertedLeadsM3: Int
        detailsUrl: String
    }

    type ${typePrefix}LeadsMonths {
        newProjects: Int
        knownProjects: Int
        wonFromCompetition: Int
    }

    """ Satisfaction """
    type ${typePrefix}Satisfaction {
        garageId: String
        garageName: String
        surveysResponded12M: Int
        surveysRespondedM: Int
        surveysRespondedM1: Int
        surveysRespondedM2: Int
        surveysRespondedM3: Int
        ponderatedScore12M: Float
        ponderatedScoreM: Float
        ponderatedScoreM1: Float
        ponderatedScoreM2: Float
        ponderatedScoreM3: Float
        satisfaction12M: ${typePrefix}SatisfactionMonths
        satisfactionM: ${typePrefix}SatisfactionMonths
        satisfactionM1: ${typePrefix}SatisfactionMonths
        detailsUrl: String
    }

    type ${typePrefix}SatisfactionMonths {
        promotors: Int
        passives: Int
        detractors: Int
    } 

    """ ProblemResolution """
    type ${typePrefix}ProblemResolution {
        garageId: String
        garageName: String
        countUnsatisfied12M: Int
        countUnsatisfiedM: Int
        countUnsatisfiedM1: Int
        countUnsatisfiedM2: Int
        countUnsatisfiedM3: Int
        unsatisfiedSolved12M: Int
        unsatisfiedSolvedM: Int
        unsatisfiedSolvedM1: Int
        unsatisfiedSolvedM2: Int
        unsatisfiedSolvedM3: Int
        problemProcessing12M: ${typePrefix}ProblemResolutionMonths
        problemProcessingM: ${typePrefix}ProblemResolutionMonths
        problemProcessingM1: ${typePrefix}ProblemResolutionMonths
        detailsUrl: String
      }

      type ${typePrefix}ProblemResolutionMonths {
          noAction: Int
          contacted: Int
          closedWithResolution: Int
      }

    """ ValidEmails """
    type ${typePrefix}ValidEmails {
        garageId: String
        garageName: String
        totalForEmails12M: Int
        totalForEmailsM: Int
        totalForEmailsM1: Int
        totalForEmailsM2: Int
        totalForEmailsM3: Int
        validEmails12M: Int
        validEmailsM: Int
        validEmailsM1: Int
        validEmailsM2: Int
        validEmailsM3: Int
        emailQuality12M: ${typePrefix}ValidEmailsQualityMonths
        emailQualityM: ${typePrefix}ValidEmailsQualityMonths
        emailQualityM1: ${typePrefix}ValidEmailsQualityMonths
        detailsUrl: String
      }

      type ${typePrefix}ValidEmailsQualityMonths {
          validEmails: Int
          wrongEmails: Int
          missingEmails: Int
      }  

    """ EmployeesRanking """
    type ${typePrefix}EmployeesRanking {
        leads: [${typePrefix}EmployeesRankingLeads]
        problemResolution: [${typePrefix}EmployeesRankingProblemResolution]
      }

    type ${typePrefix}EmployeesRankingLeads {
          employeeName: String
          garageName: String
          convertedLeads12M: Int
          convertedLeadsM: Int
          convertedLeadsM1: Int
    }

    type ${typePrefix}EmployeesRankingProblemResolution {
          employeeName: String
          garageName: String
          solvingRate12M: Float
          solvingRateM: Float
          solvingRateM1: Float
    }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const { app } = context;
        const { reportId, dataType } = args;

        const kpiMongoConnector = app.models.KpiByPeriod.getMongoConnector();

        // Getting dataType from arguments
        const isDataTypeDefined = dataTypes.getJobs().includes(dataType) ? dataType : null;
        // Getting report year & month information
        const reportYearMonth = await util.getPeriodFromReportId(app, reportId);
        if (!reportYearMonth.length) {
          throw new UserInputError(`Invalid reportId : ${reportId}`);
        }
        const periods = util.getPeriods(...reportYearMonth);
        // Getting report garages & authorizations
        const { garageList, userAccesses, garagesAccesses } = await util.getGaragesAndUserAccesses(app, reportId);
        // Getting top 20% & whole GS average performances
        const averageAndBestGaragesPerf = await util.getAverageAndBestGaragesPerf(app, ...reportYearMonth);
        // Getting employees ranking
        const employeesRanking = await calculateEmployeeRankings(
          garageList,
          periods,
          isDataTypeDefined,
          userAccesses,
          garagesAccesses,
          kpiMongoConnector
        );

        const rawData = {};
        // Now we'll compute the numbers for each period
        for (const token in periods) {
          rawData[token] = await calculateKpiForPeriod(
            garageList,
            periods[token],
            isDataTypeDefined,
            userAccesses,
            garagesAccesses,
            kpiMongoConnector
          );
        }
        // Set same email KPI from cockpit (different from the one from getAverageAndBestGaragesPerf)
        const [kpi] = await _common.emailKpi(app, periods.M);
        averageAndBestGaragesPerf.averageValidEmailsPerf = kpi && kpi.result && kpi.result.toFixed(2) * 100;

        return {
          id: reportId,
          year: reportYearMonth[1],
          month: reportYearMonth[0],
          garages: garageList,
          availableDataTypes: userAccesses,
          ...averageAndBestGaragesPerf,
          ...util.formatKpis(rawData, garageList),
          employeesRanking,
        };
      } catch (error) {
        log.error(FLO, error);
        return error;
      }
    },
  },
};
