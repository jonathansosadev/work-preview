// External Modules
const {Promise} = require('es6-promise');
const moment = require('moment');
const MongoObjectID = require('mongodb').ObjectID;

// GarageScore Modules
const app = require('../../../server/server');
const { ANASS, JS, time, timeEnd, log } = require('../../../common/lib/util/log');
const garageType = require('../../../common/models/garage.type');
const KpiTypes = require('../../../common/models/kpi-type');
const kpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const kpiPeriods = require('../../../common/lib/garagescore/kpi/KpiPeriods');
const kpiEncoder = require('../../../common/lib/garagescore/kpi/KpiEncoder');
const kpiAggregator = require('../../../common/lib/garagescore/kpi/kpiAggregator');
const SourceTypes = require('../../../common/models/data/type/source-types');

// Local Constants
const start = moment.utc();
const bufferSize = 100;
const kpiBuffer = { byPeriod: [] };
const extractKpiError = {};
const argv = process.argv.slice(2);
const authorizedArgv = ['help', 'drop', 'userIds', 'frontDeskUsers', 'garageIds', 'periodId'];

// Local Variables
let directMongoKpiByPeriod = null;
let directMongoKpiByPeriodBackup = null;
let toProcess = 0;
let processed = 0;
let docCreated = 0;
let docUpdated = 0;
const interval = null;

app.on('booted', async () => {
  try {
    // We set our direct mongo global variable, we will need it for aggregate and bulk upsert queries
    directMongoKpiByPeriod = app.models.KpiByPeriod.getMongoConnector();
    directMongoKpiByPeriodBackup = app.models.KpiByPeriod.getDataSource().connector.collection(
      `${app.models.KpiByPeriod.modelName}Backup`
    );

    // We calculate all the periods we have to generate
    const periods = kpiPeriods.getPeriodsAffectedByGivenDate(new Date());

    // We clean
    await _dropDocuments(directMongoKpiByPeriod, periods);

    // We fetch garages and users
    const garages = await _fetchGarages();
    const users = (await _fetchUsers()).filter((u) => !u.email.match(/@garagescore\.com|@custeed\.com/));
    const entities = await _prepareEntities(garages, users);

    // We prepare our counters and displays
    toProcess = periods.length;
    console.log(`${toProcess} Periods to process, for ${garages.length} Garages and ${users.length} Users`);
    // We loop through each period and calculate the KPIs
    time(ANASS, '========== CALCULATE AND SAVE KPIS');
    for (const period of periods) {
      console.log(`========== START CALCULATING KPIS FOR PERIOD: ${period.token} (${processed + 1}/${toProcess})`);
      time(ANASS, `========== CALCULATE KPIS FOR PERIOD: ${period.token} (${processed + 1}/${toProcess})`);
      const kpiResult = await _calculateKpiForGivenPeriod(period, entities);
      kpiBuffer['byPeriod'].push(...kpiResult.kpis);
      await _flushBuffer(kpiBuffer);
      timeEnd(ANASS, `========== CALCULATE KPIS FOR PERIOD: ${period.token} (${processed + 1}/${toProcess})`);
      ++processed;
    }
    await _flushBuffer(kpiBuffer, true);
    console.log(
      `${Math.round(
        (processed / toProcess) * 100
      )}% Done : ${processed} / ${toProcess} - ${docCreated} Documents Inserted, ${docUpdated} Documents Updated`
    );

    /*
    TODO complete this code if front response time is not good enough
    time(ANASS, '========== CALCULATE AGGREGATED PERIODS');
    const kpiResult = await _calculateAggregatedKpi(periods, entities);
    async function _calculateAggregatedKpi(periods, entities) {
      const monthlyTokens = periods.filter(p=>p.isMonthly).map(p=>p.token);
      for (let entity of entities) {
      // TODO generateAggregatedKpis(entity.id, entity.kpiType);
      }
      process.exit()
      }
    time(ANASS, '========== CALCULATE AGGREGATED PERIODS');*/
    timeEnd(ANASS, '========== CALCULATE AND SAVE KPIS');
  } catch (e) {
    console.error(e);
  }
  return await _saveAndExit(kpiBuffer);
});

async function _dropDocuments(directMongoKpiByPeriod, periods) {
  const garageKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const agentKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.AGENT_GARAGE_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const sourceKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.SOURCE_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const userKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.USER_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const frontDeskUserKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.FRONT_DESK_USER_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const automationCampaignKpisQuery = {
    [kpiDictionary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
    [kpiDictionary.period]: { $in: periods.map((e) => e.token) },
  };
  const countDestroyed = 0;

  await directMongoKpiByPeriod.deleteMany(garageKpisQuery);
  await directMongoKpiByPeriod.deleteMany(agentKpisQuery);
  await directMongoKpiByPeriod.deleteMany(sourceKpisQuery);
  await directMongoKpiByPeriod.deleteMany(userKpisQuery);
  await directMongoKpiByPeriod.deleteMany(frontDeskUserKpisQuery);
  await directMongoKpiByPeriod.deleteMany(automationCampaignKpisQuery);
  console.log('Finished cleaning');
}

async function _fetchGarages() {
  const where = {};
  const fields = { id: true, type: true };
  return await app.models.Garage.find({ where, fields });
}

async function _fetchUsers() {
  const where = {};
  const fields = { id: true, garageIds: true, parentId: true, email: true };

  return await app.models.User.find({ where, fields });
}

async function _prepareEntities(garages, users) {
  const allGarages = garages;
  const entities = [
    ...garages.map((g) => ({
      id: g.id,
      kpiType: KpiTypes.GARAGE_KPI,
      garageType: garageType.getIntegerVersion(g.type),
    })),
  ];

  for (const user of users) {
    const garageIds = user.garageIds.map((id) => {
      const matchingGarage = allGarages.find((g) => g.id.toString() === id.toString());
      if (!matchingGarage) {
        console.error(`The garage ${id} in user ${user.email} was not found in allGarages !`);
        return { id, garageType: 0 };
      } 
        return { id, garageType: garageType.getIntegerVersion(matchingGarage.type) };
      
    });
    entities.push({ id: user.id, kpiType: KpiTypes.USER_KPI, garageIds });
  }

  return entities;
}

async function _calculateKpiForGivenPeriod(period, entities) {
  log.info(JS, `tempAggregateDataKpi(${JSON.stringify(period)})`);
  const byGarage_tempData = await kpiAggregator.tempAggregateDataKpi(app, { period });
  log.info(JS, `aggregateUnsatisfiedKpi(${JSON.stringify(period)})`);
  const byGarage_unsatisfied = await kpiAggregator.aggregateUnsatisfiedKpi(app, { period });
  log.info(JS, `aggregateLeadsKpi(${JSON.stringify(period)})`);
  const byGarage_leads = await kpiAggregator.aggregateLeadsKpi(app, { period });
  log.info(JS, `aggregateConversionKpi(${JSON.stringify(period)})`);
  const byGarage_conversion = await kpiAggregator.aggregateConversionKpi(app, { period });
  log.info(JS, `aggregateErepKpi(${JSON.stringify(period)})`);
  const byGarage_erep = await kpiAggregator.aggregateErepKpi(app, { period });
  log.info(JS, `aggregateSatisfactionKpi(${JSON.stringify(period)})`);
  const byGarage_satisfaction = await kpiAggregator.aggregateSatisfactionKpi(app, { period });
  log.info(JS, `aggregateAutomationKpi(${JSON.stringify(period)})`);
  const byGarage_automation = await kpiAggregator.aggregateAutomationKpi(app, { period });
  log.info(JS, `aggregateLeadsKpi(${JSON.stringify(period)})`);
  const byFollowedGarage_leads = await kpiAggregator.aggregateLeadsKpi(app, { period, kpiType: KpiTypes.AGENT_GARAGE_KPI });
  log.info(JS, `aggregateUnsatisfiedKpi(${JSON.stringify(period)})`);
  const byUser_unsatisfied = await kpiAggregator.aggregateUnsatisfiedKpi(app, { period, kpiType: KpiTypes.USER_KPI });
  log.info(JS, `aggregateLeadsKpi(${JSON.stringify(period)})`);
  const byUser_leads = await kpiAggregator.aggregateLeadsKpi(app, { period, kpiType: KpiTypes.USER_KPI });
  log.info(JS, `aggregateConversionKpi(${JSON.stringify(period)})`);
  const byFrontDeskUser_conversion = await kpiAggregator.aggregateConversionKpi(
    app,
    { period, kpiType : KpiTypes.FRONT_DESK_USER_KPI }
  );
  log.info(JS, `aggregateLeadsKpi(${JSON.stringify(period)})`);
  const bySource_leads = await kpiAggregator.aggregateLeadsKpi(app, period, KpiTypes.SOURCE_KPI);
  log.info(JS, `aggregateAutomationKpi(${JSON.stringify(period)})`);
  const byAutomationCampaign_automation = await kpiAggregator.aggregateAutomationKpi(
    app,
    { period, kpiType : KpiTypes.AUTOMATION_CAMPAIGN_KPI }
  );
  const aggregateOutputs = {
    byGarage: {
      tempData: byGarage_tempData,
      unsatisfied: byGarage_unsatisfied,
      leads: byGarage_leads,
      conversion: byGarage_conversion,
      erep: byGarage_erep,
      satisfaction: byGarage_satisfaction,
      automation: byGarage_automation,
    },
    byFollowedGarage: {
      leads: byFollowedGarage_leads,
    },
    byUser: {
      // tempData: await kpiAggregator.tempAggregateDataKpi(app, period, KpiTypes.USER_KPI),
      unsatisfied: byUser_unsatisfied,
      leads: byUser_leads,
    },
    byFrontDeskUser: {
      // tempData: await kpiAggregator.tempAggregateDataKpi(app, period, KpiTypes.FRONT_DESK_USER_KPI),
      conversion: byFrontDeskUser_conversion,
    },
    bySource: {
      leads: bySource_leads,
    },
    byAutomationCampaign: {
      automation: byAutomationCampaign_automation,
    },
  };

  // Function to save format the final KPIs
  const finalKpis = prepareFinalKpis(aggregateOutputs, period, entities);
  return { period, kpis: finalKpis, wasEmpty: finalKpis.length === 0 };
}

function prepareFinalKpis(aggregateOutputs, period, entities) {
  const finalKpis = [];
  const deletedUsersKpis = { unsatisfied: {}, leads: {}, conversion: {} };
  const unassignedUsersKpis = { unsatisfied: {}, leads: {}, conversion: {} };

  /** Easy ones, for garage and followed garages and conversion kpis */
  if (aggregateOutputs.byGarage) {
    for (const category in aggregateOutputs.byGarage) {
      for (const kpi of aggregateOutputs.byGarage[category]) {
        const garageInfo = entities.find((g) => kpi._id.toString() === g.id.toString());
        if (garageInfo) {
          delete kpi._id;
          finalKpis.push({
            ...kpi,
            garageId: new MongoObjectID(garageInfo.id),
            kpiType: KpiTypes.GARAGE_KPI,
            garageType: garageInfo.garageType,
            period: period.token,
          });
        }
      }
    }
  }
  if (aggregateOutputs.byFollowedGarage.leads) {
    for (const kpi of aggregateOutputs.byFollowedGarage.leads) {
      const garageInfo = entities.find((g) => kpi._id.toString() === g.id.toString());
      if (garageInfo) {
        delete kpi._id;
        finalKpis.push({
          ...kpi,
          garageId: new MongoObjectID(garageInfo.id),
          kpiType: KpiTypes.AGENT_GARAGE_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
      }
    }
  }
  if (aggregateOutputs.byFrontDeskUser.conversion) {
    for (const kpi of aggregateOutputs.byFrontDeskUser.conversion) {
      let { userId, garageId } = kpi._id;
      delete kpi._id;
      const garageInfo = entities.find((entity) => garageId.toString() === entity.id.toString());
      if (garageInfo) {
        garageId = new MongoObjectID(garageId);
        finalKpis.push({
          ...kpi,
          garageId,
          userId,
          kpiType: KpiTypes.FRONT_DESK_USER_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
      }
    }
  }
  for (const kpi of aggregateOutputs.bySource.leads) {
    const garageInfo = entities.find((g) => kpi._id.garageId.toString() === g.id.toString());
    const {sourceType} = kpi._id;
    if (garageInfo) {
      delete kpi._id;
      finalKpis.push({
        ...kpi,
        garageId: new MongoObjectID(garageInfo.id),
        kpiType: KpiTypes.SOURCE_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
        sourceType, // SourceTypes.typeToInt(sourceType),
      });
    }
  }

  for (const kpi of aggregateOutputs.byAutomationCampaign.automation) {
    const garageInfo = entities.find((g) => kpi.garageId.toString() === g.id.toString());
    const automationCampaignId = kpi._id;
    if (garageInfo) {
      delete kpi._id;
      finalKpis.push({
        ...kpi,
        garageId: new MongoObjectID(garageInfo.id),
        kpiType: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        garageType: garageInfo.garageType,
        period: period.token,
        automationCampaignId,
      });
    }
  }
  /** That's where it gets tricky
   * See, we gotta save KPIs for the users but... Only the users that exist and have access to the garage the KPIs claim to be
   * But, in the meantime, we don't want any difference between the sum of USER_KPI and the sum of GARAGE_KPI
   * So, we have to gather all "invalid" users to put them in 2 special users, deletedUser & unassigned
   */
  for (const category in aggregateOutputs.byUser) {
    for (const kpi of aggregateOutputs.byUser[category]) {
      let { userId, garageId } = kpi._id;
      delete kpi._id;
      const garageInfo = entities.find((entity) => garageId.toString() === entity.id.toString());
      const userInfo = entities.find((entity) => userId && userId.toString() == entity.id.toString());
      // Checking whether the user has the garage in its garages list
      const isCorrectUser = Boolean(userInfo && userInfo.garageIds.find((g) => g.id.toString() === garageId.toString()));

      if (garageInfo && isCorrectUser) {
        garageId = new MongoObjectID(garageId);
        userId = new MongoObjectID(userId);
        finalKpis.push({
          ...kpi,
          garageId,
          userId,
          kpiType: KpiTypes.USER_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
      } else {
        userId = userId ? userId.toString() : userId;
        if (userId === 'Unassigned') {
          unassignedUsersKpis[category][garageId] = [kpi, ...(unassignedUsersKpis[category][garageId] || [])];
        } else {
          deletedUsersKpis[category][garageId] = [kpi, ...(deletedUsersKpis[category][garageId] || [])];
        }
        if (!extractKpiError[userId]) {
          extractKpiError[userId] = [garageId.toString()];
        } else if (!extractKpiError[userId].includes(garageId.toString())) {
          extractKpiError[userId].push(garageId.toString());
        }
      }
    }
  }

  /* Saving a special KPI by User document to display "Utilisateur supprimé" */
  for (const category in deletedUsersKpis) {
    for (let garageId in deletedUsersKpis[category]) {
      const kpiToSave = deletedUsersKpis[category][garageId].reduce((res, kpi) => {
        Object.keys(kpi).forEach((key) => {
          res[key] = (res[key] || 0) + kpi[key];
        });
        return res;
      }, {});

      userId = 'deletedUser';
      garageId = new MongoObjectID(garageId);
      const garageInfo = entities.find((entity) => garageId.toString() === entity.id.toString());
      if (garageInfo) {
        finalKpis.push({
          ...kpiToSave,
          garageId,
          userId,
          kpiType: KpiTypes.USER_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
      }
    }
  }

  /* Saving a special KPI by User to document to display "Non assigné" */
  for (const category in unassignedUsersKpis) {
    for (let garageId in unassignedUsersKpis[category]) {
      const kpiToSave = unassignedUsersKpis[category][garageId].reduce((res, kpi) => {
        Object.keys(kpi).forEach((key) => {
          res[key] = (res[key] || 0) + kpi[key];
        });
        return res;
      }, {});

      userId = 'unassigned';
      garageId = new MongoObjectID(garageId);
      const garageInfo = entities.find((entity) => garageId.toString() === entity.id.toString());
      if (garageInfo) {
        finalKpis.push({
          ...kpiToSave,
          garageId,
          userId,
          kpiType: KpiTypes.USER_KPI,
          garageType: garageInfo.garageType,
          period: period.token,
        });
      }
    }
  }
  return finalKpis;
}

async function _flushBuffer(buffer, force = false) {
  while (buffer.byPeriod.length >= bufferSize || (force && buffer.byPeriod.length)) {
    const toUpsert = buffer.byPeriod.splice(0, bufferSize);
    const bulkWrite = _buildBulkWriteFromKpis(toUpsert);
    const result = await new Promise((res, rej) =>
      directMongoKpiByPeriod.bulkWrite(bulkWrite, (e, r) => (e ? rej(e) : res(r)))
    );
    docCreated += result.upsertedCount;
    docUpdated += result.modifiedCount;
  }
}

/**
 * _buildBulkWriteFromKpis will choose which KpiBy(Period) to override
 */
function _buildBulkWriteFromKpis(toUpsert) {
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
    if (kpi.kpiType === KpiTypes.SOURCE_KPI) {write.updateOne.filter[kpiDictionary.sourceType] = kpi.sourceType;}
    for (const key of kpiDictionary.keysAsArray) {
      if (kpi[key] || (kpi[key] === 0 && kpiEncoder.dontEraseZero.includes(key))) {
        write.updateOne.update.$set[kpiDictionary[key]] = kpi[key];
      } else if (kpi[key] === 0) {
        // Not to erase previously stored results when saving partial KPIs
        write.updateOne.update.$unset[kpiDictionary[key]] = '';
      }
    }
    if (write.updateOne.update.$unset && Object.keys(write.updateOne.update.$unset).length === 0) {
      delete write.updateOne.update.$unset;
    }
    bulkWrite.push(write);
  }
  return bulkWrite;
}

async function _generateBackupCollections() {
  try {
    await directMongoKpiByPeriodBackup.drop();
  } catch (e) {
    if (e.code === 26) {
      console.log(`KpiByPeriod Backup Collection Does Not Exist Yet, Skipping Drop...`);
    }
  }
  await new Promise((res, rej) =>
    directMongoKpiByPeriod.aggregate([{ $match: {} }, { $out: 'kpiByPeriodBackup' }], (e) => (e ? rej(e) : res()))
  );
  console.log('[KPI/RESET] KPIs Collections Backups Saved !');
}

async function _saveAndExit() {
  clearInterval(interval);
  const duration = moment.duration(moment().valueOf() - start.valueOf());
  await _generateBackupCollections();
  console.log(
    `Done Generating All KPIs In ${duration.hours()} Hours, ${duration.minutes()} Minutes, ${duration.seconds()} Seconds`
  );
  for (const user of Object.keys(extractKpiError)) {
    let text = `User ${user} : `;
    for (const g of extractKpiError[user]) {
      text += `${g}; `;
    }
    console.log(text);
  }
  return process.exit(0);
}
