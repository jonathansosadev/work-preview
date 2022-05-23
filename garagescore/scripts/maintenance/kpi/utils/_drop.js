const { KpiTypes } = require('../../../../frontend/utils/enumV2');
const kpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const Logger = require('./_logger');
const { ObjectId } = require('mongodb');

module.exports = async function _dropDocuments(
  tmpCollectionConnector,
  { userIds = null, garageIds = null, frontDeskUsers = null, periodIds = null } = {}
) {
  try {
    const queries = {
      garage: { [kpiDictionary.kpiType]: KpiTypes.GARAGE_KPI },
      agent: { [kpiDictionary.kpiType]: KpiTypes.AGENT_GARAGE_KPI },
      source: { [kpiDictionary.kpiType]: KpiTypes.SOURCE_KPI },
      user: { [kpiDictionary.kpiType]: KpiTypes.USER_KPI },
      frontDeskUser: { [kpiDictionary.kpiType]: KpiTypes.FRONT_DESK_USER_KPI },
      automationCampaign: { [kpiDictionary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI },
    };

    Logger.info('The --drop argument was specified, cleaning documents...');
    // It is easier to split the destroying operation between userKpis and garageKpis even if it means more requests
    if (userIds) {
      queries.user[kpiDictionary.userId] = { $in: userIds.map(ObjectId) };
    }
    if (frontDeskUsers) {
      queries.frontDeskUser[kpiDictionary.userId] = { $in: userIds };
    }
    if (garageIds) {
      for (const query in queries) {
        queries[query][kpiDictionary.garageId] = { $in: garageIds.map(ObjectId) };
      }
    }

    if (periodIds) {
      for (const query in queries) {
        queries[query][kpiDictionary.period] = { $in: periodIds.map(Number) };
      }
    }

    let countDestroyed = 0;
    for (const query in queries) {
      countDestroyed += (await tmpCollectionConnector.deleteMany(queries[query])).deletedCount;
    }

    Logger.success(`Finished cleaning: ${countDestroyed} documents were destroyed`);
  } catch (error) {
    Logger.error('Error occured', error.stack);
    process.exit(1);
  }
};
