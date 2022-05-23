const { ObjectId } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const hint = require('../../../../common/lib/garagescore/kpi/hint');
const KpiEncoder = require('../../../../common/lib/garagescore/kpi/KpiEncoder');
const GarageTypes = require('../../../../common/models/garage.type');
const KpiTypes = require('../../../../common/models/kpi-type');
const { m_divide } = require('../../../../common/lib/util/mongo-helper');

const typePrefix = 'kpiByPeriodGetErepKpis';
module.exports.typeDef = `
  extend type Query {
    ${queries.ErepKpis.type}: [${typePrefix}KPIBySource]
  }
  type ${typePrefix}KPIBySource {
    source: String
    countReviews: Int
    rating: Float
    countRecommend: Int
    countDetractorsWithoutResponse: Int
    countDetractors: Int
  }
`;
module.exports.resolvers = {
  Query: {
    ErepKpis: async (obj, args, context) => {
      const { period, garageId, cockpitType, source } = args;
      let needGrouping = !garageId || garageId.length > 1;

      // "garageId":"5b43215454ac650013cd8232",
      const {
        app,
        scope: { logged, authenticationError, godMode, garageIds },
      } = context;
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const $match = {
        [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
      };
      // filter by cockpit type
      if (cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : {
                $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)),
              };
      }
      // filter by garageId
      if (garageId) {
        $match[KpiDictionary.garageId] =
          garageId.length === 1 ? new ObjectId(garageId[0]) : { $in: garageId.map((id) => new ObjectId(id)) };
      } else if (godMode && !cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
      } else if (!godMode) {
        $match[KpiDictionary.garageId] = {
          $in: garageIds.map((id) => new ObjectId(id)),
        };
      }
      // filter by period
      if (period) {
        const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period, {
          convertToMonthlyList: true,
        });
        if (Array.isArray(periods)) {
          $match[KpiDictionary.period] = { $in: periods };
          needGrouping = true;
        } else {
          $match[KpiDictionary.period] = periods;
        }
      }
      // project only necessary fields
      const $project = {
        satisfactionCountReviews: true,
        satisfactionSumRating: true,
        satisfactionCountDetractors: true,
        satisfactionCountDetractorsWithoutResponse: true,
        erepCountReviewsGoogle: true,
        erepSumRatingGoogle: true,
        erepCountHasRatingGoogle: true,
        erepCountDetractorsGoogle: true,
        erepCountDetractorsWithoutResponseGoogle: true,
        erepCountReviewsPagesJaunes: true,
        erepSumRatingPagesJaunes: true,
        erepCountHasRatingPagesJaunes: true,
        erepCountDetractorsPagesJaunes: true,
        erepCountDetractorsWithoutResponsePagesJaunes: true,
        erepCountReviewsFacebook: true,
        erepCountDetractorsFacebook: true,
        erepCountRecommendFacebook: true,
        erepCountDetractorsWithoutResponseFacebook: true,
      };
      KpiEncoder.encodeObject($project);
      // our aggregate
      const aggregate = [{ $match }, { $project }];
      // if many garages, add a group to our aggregate to sum everything in Mongo
      if (needGrouping) {
        const $group = {
          _id: 'ALL',
          satisfactionCountReviews: { $sum: '$satisfactionCountReviews' },
          satisfactionSumRating: { $sum: '$satisfactionSumRating' },
          satisfactionCountDetractors: { $sum: '$satisfactionCountDetractors' },
          satisfactionCountDetractorsWithoutResponse: { $sum: '$satisfactionCountDetractorsWithoutResponse' },
          erepCountReviewsGoogle: { $sum: '$erepCountReviewsGoogle' },
          erepSumRatingGoogle: { $sum: '$erepSumRatingGoogle' },
          erepCountHasRatingGoogle: { $sum: '$erepCountHasRatingGoogle' },
          erepCountDetractorsGoogle: { $sum: '$erepCountDetractorsGoogle' },
          erepCountDetractorsWithoutResponseGoogle: { $sum: '$erepCountDetractorsWithoutResponseGoogle' },
          erepCountReviewsPagesJaunes: { $sum: '$erepCountReviewsPagesJaunes' },
          erepSumRatingPagesJaunes: { $sum: '$erepSumRatingPagesJaunes' },
          erepCountDetractorsPagesJaunes: { $sum: '$erepCountDetractorsPagesJaunes' },
          erepCountHasRatingPagesJaunes: { $sum: '$erepCountHasRatingPagesJaunes' },
          erepCountDetractorsWithoutResponsePagesJaunes: { $sum: '$erepCountDetractorsWithoutResponsePagesJaunes' },
          erepCountReviewsFacebook: { $sum: '$erepCountReviewsFacebook' },
          erepCountRecommendFacebook: { $sum: '$erepCountRecommendFacebook' },
          erepCountDetractorsFacebook: { $sum: '$erepCountDetractorsFacebook' },
          erepCountDetractorsWithoutResponseFacebook: { $sum: '$erepCountDetractorsWithoutResponseFacebook' },
        };
        KpiEncoder.encodeObject($group);
        aggregate.push({ $group });
      }

      // Fields that need to be computed (rating)
      const $addFields = {
        erepRating: m_divide(
          `$${KpiDictionary['satisfactionSumRating']}`,
          `$${KpiDictionary['satisfactionCountReviews']}`
        ),
        erepRatingGoogle: m_divide(
          `$${KpiDictionary['erepSumRatingGoogle']}`,
          `$${KpiDictionary['erepCountHasRatingGoogle']}`
        ),
        erepRatingPagesJaunes: m_divide(
          `$${KpiDictionary['erepSumRatingPagesJaunes']}`,
          `$${KpiDictionary['erepCountHasRatingPagesJaunes']}`
        ),
        erepRatingFacebook: m_divide(
          `$${KpiDictionary['erepCountRecommendFacebook']}`,
          `$${KpiDictionary['erepCountReviewsFacebook']}`
        ),
      };
      aggregate.push({ $addFields });

      let datas = await app.models.KpiByPeriod.getMongoConnector()
        .aggregate(aggregate, { hint: hint($match) })
        .toArray();

      datas = datas[0] || {};
      // translate fields
      KpiEncoder.decodeObj(datas);
      const GarageScore = {
        source: 'GarageScore',
        countReviews: datas.satisfactionCountReviews,
        rating: datas.erepRating,
        countDetractors: datas.satisfactionCountDetractors,
        countDetractorsWithoutResponse: datas.satisfactionCountDetractorsWithoutResponse,
      };
      const Google = {
        source: 'Google',
        countReviews: datas.erepCountReviewsGoogle,
        rating: datas.erepRatingGoogle,
        countDetractors: datas.erepCountDetractorsGoogle,
        countDetractorsWithoutResponse: datas.erepCountDetractorsWithoutResponseGoogle,
      };
      const PagesJaunes = {
        source: 'PagesJaunes',
        countReviews: datas.erepCountReviewsPagesJaunes,
        rating: datas.erepRatingPagesJaunes,
        countDetractors: datas.erepCountDetractorsPagesJaunes,
        countDetractorsWithoutResponse: datas.erepCountDetractorsWithoutResponsePagesJaunes,
      };
      const Facebook = {
        source: 'Facebook',
        countReviews: datas.erepCountReviewsFacebook,
        countRecommend: datas.erepCountRecommendFacebook,
        countDetractors: datas.erepCountDetractorsFacebook,
        countDetractorsWithoutResponse: datas.erepCountDetractorsWithoutResponseFacebook,
      };
      const results = [GarageScore, Google, Facebook, PagesJaunes];
      if (source) {
        return results.filter((a) => a.source === source);
      }
      return results;
    },
  },
};
