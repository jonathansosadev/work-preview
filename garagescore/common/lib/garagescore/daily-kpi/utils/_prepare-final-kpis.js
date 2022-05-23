const { KpiTypes } = require('../../../../../frontend/utils/enumV2');
const { ObjectId } = require('mongodb');
const KpiEncoder = require('../../kpi/KpiEncoder');
const { AggregateOutputsBaseModel } = require('./_aggregators');

const AggregateOutputs = AggregateOutputsBaseModel();

const Handlers = {
  byGarage({ type, period, singleAggregateOutputs, garageEntities, kpiType = KpiTypes.GARAGE_KPI }) {
    const finalKpis = [];
    for (const kpi of singleAggregateOutputs) {
      const garageInfo = garageEntities[kpi._id];
      if (!garageInfo) {
        continue;
      }
      delete kpi._id;
      finalKpis.push({
        ...kpi,
        garageId: new ObjectId(garageInfo.id),
        kpiType: kpiType,
        garageType: garageInfo.garageType,
        period: period.token,
      });
    }

    // generate the ALL_USERS here since it's the same as the garage
    if (Object.keys(AggregateOutputs.byFrontDeskUser).includes(type)) {
      const kpi_ALL_USERS = finalKpis.map((kpi) => ({
        ...kpi,
        kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        userId: 'ALL_USERS',
      }));
      finalKpis.push(...kpi_ALL_USERS);
    }

    return finalKpis;
  },
  byFollowedGarage({ period, singleAggregateOutputs, garageEntities }) {
    return this.byGarage({ period, singleAggregateOutputs, garageEntities, kpiType: KpiTypes.AGENT_GARAGE_KPI });
  },
  byFrontDeskUser({ period, singleAggregateOutputs, garageEntities }) {
    const finalKpis = [];
    for (const kpi of singleAggregateOutputs) {
      const { userId, garageId } = kpi._id;
      const garageInfo = garageEntities[garageId];
      if (!garageInfo) {
        continue;
      }
      delete kpi._id;

      if (!Object.values(kpi).some((value) => Number.isInteger(value) && value !== 0)) {
        continue;
      }

      finalKpis.push({
        ...kpi,
        garageId: new ObjectId(garageInfo.id),
        userId: userId || 'FRONT_DESK_USERNAME_UNDEFINED',
        kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
      });
    }
    return finalKpis;
  },
  bySource({ period, singleAggregateOutputs, garageEntities }) {
    const finalKpis = [];
    for (const kpi of singleAggregateOutputs) {
      const { garageId, sourceType } = kpi._id;
      const garageInfo = garageEntities[garageId];
      if (!garageInfo) {
        continue;
      }
      delete kpi._id;
      finalKpis.push({
        ...kpi,
        garageId: new ObjectId(garageInfo.id),
        kpiType: KpiTypes.SOURCE_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
        sourceType,
      });
    }
    return finalKpis;
  },
  byAutomationCampaign({ period, singleAggregateOutputs, garageEntities }) {
    const finalKpis = [];
    for (const kpi of singleAggregateOutputs) {
      const automationCampaignId = kpi._id;
      const garageInfo = garageEntities[kpi.garageId.toString()];
      if (!garageInfo) {
        continue;
      }
      delete kpi._id;
      finalKpis.push({
        ...kpi,
        garageId: new ObjectId(garageInfo.id),
        kpiType: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
        automationCampaignId,
      });
    }
    return finalKpis;
  },
  byUser({
    type,
    period,
    singleAggregateOutputs,
    garageEntities,
    userEntities,
    deletedUsersKpis,
    unassignedUsersKpis,
  }) {
    /** That's where it gets tricky
     * See, we gotta save KPIs for the users but... Only the users that exist and have access to the garage the KPIs claim to be
     * But, in the meantime, we don't want any difference between the sum of USER_KPI and the sum of GARAGE_KPI
     * So, we have to gather all "invalid" users to put them in 2 special users, deletedUser & unassigned
     */

    const finalKpis = [];
    const specialUserKpisByType = {
      deletedUser: { ...deletedUsersKpis },
      unassigned: { ...unassignedUsersKpis },
    };

    for (const kpi of singleAggregateOutputs) {
      const { userId, garageId } = kpi._id;
      delete kpi._id;
      const garageInfo = garageEntities[garageId];
      const userInfo = userEntities[userId];

      // Checking whether the user has the garage in its garages list
      const isCorrectUser = Boolean(
        userInfo && userInfo.garageIds.find((gId) => gId.toString() === garageId.toString())
      );

      if (!garageInfo) {
        continue;
      }

      if (isCorrectUser) {
        finalKpis.push({
          ...kpi,
          garageId: new ObjectId(garageId),
          userId: new ObjectId(userId),
          kpiType: KpiTypes.USER_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
        continue;
      }

      // Saving a special KPI by User document to display "Non assigné" or "Utilisateur supprimé"
      // the Unassigned with an uppercase is coming from the aggregator (should be changed to lowercase)

      const userSpecialType = userId && userId.toString() === 'Unassigned' ? 'unassigned' : 'deletedUser';
      specialUserKpisByType[userSpecialType][type][garageId] = [
        kpi,
        ...(specialUserKpisByType[userSpecialType][type][garageId] || []),
      ];
      const kpiToSave = specialUserKpisByType[userSpecialType][type][garageId].reduce((res, kpiDocument) => {
        Object.keys(kpiDocument).forEach((key) => {
          res[key] = (res[key] || 0) + kpiDocument[key];
        });
        return res;
      }, {});

      finalKpis.push({
        ...kpiToSave,
        garageId: new ObjectId(garageId),
        userId: userSpecialType,
        kpiType: KpiTypes.USER_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
      });
    }

    return {
      kpis: finalKpis,
      specialUserKpisByType,
    };
  },
};

module.exports = function prepareFinalKpis({ period, aggregateOutputs, garageEntities, userEntities }) {
  const finalKpis = [];
  const deletedUsersKpis = { unsatisfied: {}, leads: {} };
  const unassignedUsersKpis = { unsatisfied: {}, leads: {} };

  for (const category in aggregateOutputs) {
    for (const type in aggregateOutputs[category]) {
      // the byUser is tricky, check the comments in the handler
      if (category === 'byUser') {
        const {
          kpis,
          specialUserKpisByType: { unassigned, deletedUser },
        } = Handlers[category]({
          type,
          period,
          singleAggregateOutputs: aggregateOutputs[category][type],
          garageEntities,
          userEntities,
          deletedUsersKpis,
          unassignedUsersKpis,
        });
        finalKpis.push(...kpis);
        deletedUsersKpis[type] = { ...deletedUser[type] };
        unassignedUsersKpis[type] = { ...unassigned[type] };
        continue;
      }
      // others categories
      finalKpis.push(
        ...Handlers[category]({
          type,
          period,
          singleAggregateOutputs: aggregateOutputs[category][type],
          garageEntities,
          userEntities,
        })
      );
    }
  }

  // we remove every document that doesn't have at least 1 non dontEraseZero kpi key > 0
  return finalKpis.filter((kpi) =>
    Object.keys(kpi).some((key) => !KpiEncoder.dontEraseZero.includes(key) && kpi[key] !== 0)
  );
};
