const kpiDictionary = require('../../kpi/KpiDictionary');
const kpiEncoder = require('../../kpi/KpiEncoder');
const { KpiTypes } = require('../../../../../frontend/utils/enumV2');

module.exports = function _buildBulkWriteFromKpis(toUpsert = []) {
  const bulkWrite = [];
  let write = {};

  for (const kpi of toUpsert) {
    write = { updateOne: { filter: {}, update: { $set: {}, $unset: {} }, upsert: true } };
    write.updateOne.filter[kpiDictionary.garageId] = kpi.garageId;
    write.updateOne.filter[kpiDictionary.period] = kpi.period;
    write.updateOne.filter[kpiDictionary.kpiType] = kpi.kpiType;
    if ([KpiTypes.USER_KPI, KpiTypes.FRONT_DESK_USER_KPI].includes(kpi.kpiType)) {
      write.updateOne.filter[kpiDictionary.userId] = kpi.userId;
    }
    if (kpi.kpiType === KpiTypes.AUTOMATION_CAMPAIGN_KPI) {
      write.updateOne.filter[kpiDictionary.automationCampaignId] = kpi.automationCampaignId;
    }
    if (kpi.kpiType === KpiTypes.SOURCE_KPI) {
      write.updateOne.filter[kpiDictionary.sourceType] = kpi.sourceType;
    }
    for (const key of kpiDictionary.keysAsArray) {
      if (kpi[key] || (kpi[key] === 0 && kpiEncoder.dontEraseZero.includes(key))) {
        write.updateOne.update.$set[kpiDictionary[key]] = kpi[key];
      } else if (kpi[key] === 0) {
        // Not to erase previously stored results when saving partial KPIs
        write.updateOne.update.$unset[kpiDictionary[key]] = '';
      }
    }
    //set default value to -1 for all _dontEraseZero keys that are not present
    kpiEncoder.dontEraseZero.forEach((dontEraseZero) => {
      if (!(dontEraseZero in kpi)) {
        write.updateOne.update.$set[kpiDictionary[dontEraseZero]] = -1;
      }
    });
    if (write.updateOne.update.$unset && Object.keys(write.updateOne.update.$unset).length === 0) {
      delete write.updateOne.update.$unset;
    }
    bulkWrite.push(write);
  }
  return bulkWrite;
};
