const { ObjectId } = require('mongodb');
const {
  AutomationCampaignStatuses,
  AutomationCampaignTargets,
  AutomationCampaignsEventsType,
  GaragesTest,
  JobTypes,
  AutomationCampaignTypes,
} = require('../../frontend/utils/enumV2');
const automationCampaignFrequency = require('./automation-campaign.frequency');
const AutomationCampaignChannelTypes = require('./automation-campaign-channel.type');
const i18nRequire = require('../lib/garagescore/i18n/i18n');
const slackClient = require('../lib/slack/client');
const timeHelper = require('../lib/util/time-helper');
const dataTypes = require('./data/type/data-types');
const Scheduler = require('../lib/garagescore/scheduler/scheduler.js');
const garageStatuses = require('./garage.status');
const { FED, log } = require('../lib/util/log');

const dateToInterval = (fromDate, monthsBefore) => {
  const date = timeHelper.addMonths(fromDate, -Math.abs(monthsBefore));
  const gte = timeHelper.setTimeToZero(date);
  let daysToAdd = 1;
  if (timeHelper.isLeapYear(gte)) {
    daysToAdd = 2;
  }
  let lt = timeHelper.setTimeToZero(date);
  lt = timeHelper.addDays(date, daysToAdd);
  return { gte: new Date(gte), lt: new Date(lt) };
};
// if the customer buy another vehicle, we don't target him before x time
const whereLastVehicleSaleAt = (gte) => {
  return {
    $or: [
      {
        index: {
          $elemMatch: {
            k: 'lastVehicleSaleAt',
            v: { $lt: gte },
          },
        },
      },
      {
        index: {
          $not: {
            $elemMatch: { k: 'lastVehicleSaleAt' },
          },
        },
      },
    ],
  };
};
/**
 *
 * @param { Date } gte
 * @param { Date } lt
 * @returns
 */
const createWhereMaintenanceToVehicleSale = (gte, lt) => {
  return {
    $and: [
      {
        index: {
          $elemMatch: {
            k: 'lastMaintenanceAt',
            v: {
              $gte: gte,
              $lt: lt,
            },
          },
        },
      },
      whereLastVehicleSaleAt(gte),
    ],
  };
};
/**
 *
 * @param { String } kValue like lastNewVehicleSaleAt or lastUsedVehicleSaleAt
 * @param { Date } gte
 * @param { Date } lt
 * @returns
 */
const createWhereVehicleSaleToMaintenance = (kValue, gte, lt) => {
  let noMaintenance = 'noMaintenanceSinceUsedVehicleSale';
  if (kValue === 'lastNewVehicleSaleAt') noMaintenance = 'noMaintenanceSinceNewVehicleSale';
  return {
    $and: [
      {
        index: {
          $elemMatch: {
            k: noMaintenance,
            v: true,
          },
        },
      },
      {
        index: {
          $elemMatch: {
            k: kValue,
            v: { $gte: gte, $lt: lt },
          },
        },
      },
    ],
  };
};
/**
 *
 * @param { String } kValue like lastNewVehicleSaleAt or lastUsedVehicleSaleAt
 * @param { Date } gte
 * @param { Date } lt
 * @returns
 */
const createWhereVehicleSaleToVehicleSale = (kValue, gte, lt) => {
  return {
    $and: [
      {
        index: {
          $elemMatch: {
            k: kValue,
            v: {
              $gte: gte,
              $lt: lt,
            },
          },
        },
      },
    ],
  };
};
// See automation-campaign.target for more informations
const targetQueryFunctions = {
  M_NVS: (fromDate, monthsBefore = 11) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToMaintenance('lastNewVehicleSaleAt', gte, lt);
  },
  M_UVS: (fromDate, monthsBefore = 11) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToMaintenance('lastUsedVehicleSaleAt', gte, lt);
  },
  M_M: (fromDate, monthsBefore = 11) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereMaintenanceToVehicleSale(gte, lt);
  },
  VS_M_6: (fromDate, monthsBefore = 6) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereMaintenanceToVehicleSale(gte, lt);
  },
  VS_UVS_18: (fromDate, monthsBefore = 18) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToVehicleSale('lastUsedVehicleSaleAt', gte, lt);
  },
  VS_NVS_18: (fromDate, monthsBefore = 18) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToVehicleSale('lastNewVehicleSaleAt', gte, lt);
  },
  VS_M_12: (fromDate, monthsBefore = 12) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereMaintenanceToVehicleSale(gte, lt);
  },
  VS_UVS_24: (fromDate, monthsBefore = 24) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToVehicleSale('lastUsedVehicleSaleAt', gte, lt);
  },
  VS_NVS_24: (fromDate, monthsBefore = 24) => {
    const dateToScout = new Date(fromDate);
    dateToScout.setMonth(dateToScout.getMonth() - monthsBefore);
    const { gte, lt } = dateToInterval(fromDate, monthsBefore);
    return createWhereVehicleSaleToVehicleSale('lastNewVehicleSaleAt', gte, lt);
  },
  VS_M_11: (fromDate, monthsBefore = 0) => {
    const dateToScout = timeHelper.addDays(fromDate, -Math.abs(90));
    const { gte, lt } = dateToInterval(dateToScout, monthsBefore);
    return createWhereMaintenanceToVehicleSale(gte, lt);
  },
  // fromDate is not used here but for the sake of having all the targets processed the same way, we add it
  COVID: (fromDate, startDate = new Date('01/01/2020'), toDate = new Date('04/01/2020')) => {
    return createWhereMaintenanceToVehicleSale(startDate, toDate);
  },
};

// Variants from base targeting
for (const months of [14, 23, 26, 35]) {
  targetQueryFunctions[`M_NVS_${months}`] = (fromDate) => {
    return targetQueryFunctions.M_NVS(fromDate, months);
  };

  targetQueryFunctions[`M_UVS_${months}`] = (fromDate) => {
    return targetQueryFunctions.M_UVS(fromDate, months);
  };

  targetQueryFunctions[`M_M_${months}`] = (fromDate) => {
    return targetQueryFunctions.M_M(fromDate, months);
  };
}
targetQueryFunctions.COVID1 = () => {
  return targetQueryFunctions.COVID(null, new Date('01/01/2020'), new Date('01/15/2020'));
};
targetQueryFunctions.COVID2 = () => {
  return targetQueryFunctions.COVID(null, new Date('01/16/2020'), new Date('04/01/2020'));
};

module.exports = function AutomationCampaignDefinition(AutomationCampaign) {
  AutomationCampaign.targetQueryFunctions = targetQueryFunctions;
  AutomationCampaign.campaignDuration = 30;
  AutomationCampaign.dateToInterval = dateToInterval;
  // Function used in the daily cron
  // garageId is optional
  AutomationCampaign.runCampaigns = async (runDate, garageId = null, campaignId = null) => {
    if (!runDate || !(runDate instanceof Date && !isNaN(runDate.valueOf()))) {
      throw new Error(`AutomationCampaign.runCampaigns : runDate absent or invalid : ${runDate}`);
    }
    log.info(FED, `AutomationCampaign.runCampaigns : running for dayNumber : ${timeHelper.dayNumber(runDate)}`);
    // We check for all campaigns that havent been run since today, with the status running.
    const where = {
      ...(campaignId ? { id: ObjectId(campaignId.toString()) } : {}),
      runDayNumber: timeHelper.dayNumber(runDate),
      status: AutomationCampaignStatuses.RUNNING,
      hidden: { neq: true },
      garageId: { nin: GaragesTest.values().map((id) => ObjectId(id)) },
    };
    if (garageId) {
      where.garageId = ObjectId(garageId.toString());
    }
    const campaignsToBeRun = await AutomationCampaign.find({ where });
    log.info(FED, `AutomationCampaign.runCampaigns : ${campaignsToBeRun.length} campaigns running.`);
    // we sort the campaigns  array to run first the email campaigns then the sms (sms more expensive than emails,
    // and we bill both the same price, so we'd rather send email and see our sms being blocked by customer's pressure limit.)
    campaignsToBeRun.sort((a, b) => {
      return a.contactType === AutomationCampaignChannelTypes.EMAIL ? -1 : 1;
    });
    // We run each campaign for today's dayNumber
    let i = 0;
    const displayInterval = setInterval(
      () =>
        log.info(
          FED,
          `AutomationCampaign.runCampaigns : executed : ${i}/${campaignsToBeRun.length} : ${Math.round(
            (i / campaignsToBeRun.length) * 100
          )}% done.`
        ),
      3000
    );
    let ranCampaigns = 0;
    let customersTargeted = 0;
    for (const campaign of campaignsToBeRun) {
      try {
        const result = await campaign.run(timeHelper.dayNumber(runDate));
        if (result || result === 0) {
          ranCampaigns += 1;
          customersTargeted += result;
        }
        i++;
      } catch (e) {
        const slackText = `AutomationCampaign.runCampaigns : Erreur lors du lancement des campagnes Automation : ${e}`;
        await new Promise((res, rej) =>
          slackClient.postMessage(
            {
              username: 'Johnny Automation',
              icon_url:
                'https://www.leparisien.fr/resizer/_z9AcUJPWgx9eUPBNuXnb-ps6jY=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/BV2BOK2CS6GLRHM5BUZSD7FF5Q.jpg',
              channel: 'çavapas',
              text: slackText,
            },
            (ans) => (ans ? rej(ans) : res())
          )
        );
        console.error(slackText);
        return;
      }
    }
    clearInterval(displayInterval);
    log.info(
      FED,
      `AutomationCampaign.runCampaigns : ${ranCampaigns}/${i} campaigns effectively ran. ${customersTargeted} total customers targeted.`
    );
  };

  AutomationCampaign.toggleStatus = async ({ id, _id, status, hidden, frequency }) => {
    const togglableStatuses = [AutomationCampaignStatuses.IDLE, AutomationCampaignStatuses.RUNNING];
    if (!togglableStatuses.includes(status)) throw new Error(`Bad campaign status: ${status}`);
    if (hidden) {
      throw new Error('Campaign is hidden');
    }
    const updateData = {};
    updateData.status =
      status === AutomationCampaignStatuses.IDLE ? AutomationCampaignStatuses.RUNNING : AutomationCampaignStatuses.IDLE;
    if (updateData.status === AutomationCampaignStatuses.RUNNING) {
      updateData.runDayNumber = AutomationCampaign.getNextRunDayNumber(frequency);
    }
    await AutomationCampaign.findByIdAndUpdateAttributes(id || _id, updateData);
    return {
      status: updateData.status,
      runDayNumber: updateData.runDayNumber,
    };
  };

  AutomationCampaign.setCampaigns = async (garageId, subs, dataFirstDays, locale, status) => {
    const directMongoAC = AutomationCampaign.getMongoConnector();
    const legitCampaigns = await AutomationCampaign.initDefaultCampaigns(garageId, subs, dataFirstDays, locale, status);
    const garageCampaigns = await AutomationCampaign.find({
      where: { garageId: ObjectId(garageId.toString()) },
      fields: {
        id: true,
        status: true,
        target: true,
        contactType: true,
        frequency: true,
        runDayNumber: true,
      },
    });
    for (const campaign of garageCampaigns) {
      const subscriptionsNeeded = AutomationCampaignTargets.getPropertyFromValue(
        campaign.target,
        'subscriptionsNeeded'
      );

      let isCampaignDisable = false;
      if (subscriptionsNeeded) {
        isCampaignDisable = !!subscriptionsNeeded.every((sub) => sub.every((s) => subs[s] && !subs[s].enabled));
      }

      if (
        !legitCampaigns.find((e) => {
          if (/COVID/.test(campaign.target)) {
            // for current COVID campaign, hide if the campaign is not complete
            return campaign.status === AutomationCampaignStatuses.COMPLETE;
          }
          return (
            e.target === campaign.target &&
            e.contactType === campaign.contactType &&
            campaign.status !== AutomationCampaignStatuses.COMPLETE
          );
        }) ||
        isCampaignDisable
      ) {
        await directMongoAC.updateOne({ _id: campaign.getId() }, { $set: { hidden: true } });
      } else {
        const runDayNumber = AutomationCampaign.getNextRunDayNumber(campaign.frequency);
        if (runDayNumber && campaign.runDayNumber < timeHelper.dayNumber(new Date())) {
          await directMongoAC.updateOne({ _id: campaign.getId() }, { $set: { runDayNumber, hidden: false } });
        } else {
          await directMongoAC.updateOne({ _id: campaign.getId() }, { $set: { hidden: false } });
        }
      }
    }
  };

  // Function used in the init cron
  AutomationCampaign.initDefaultCampaigns = async (garageId, subs, dataFirstDays, locale, status) => {
    const campaigns = [];
    const isLocaleHandled = locale && /fr_|es_|ca_/.test(locale);
    const firstMaintenanceDay = (dataFirstDays && dataFirstDays.firstMaintenanceDay) || null;
    const firstNewVehicleSaleDay = (dataFirstDays && dataFirstDays.firstNewVehicleSaleDay) || null;
    const firstUsedVehicleSaleDay = (dataFirstDays && dataFirstDays.firstUsedVehicleSaleDay) || null;
    const hasEnoughHistoric = (firstDay, historicNeededInMonth) => {
      const date = new Date();
      date.setMonth(date.getMonth() - historicNeededInMonth);
      return firstDay && firstDay <= timeHelper.dayNumber(date);
    };

    const addToCampaigns = (campaigns, garageId, target, locale, status = null) => {
      campaigns.push(
        AutomationCampaign.getNewCampaignObject(garageId, target, AutomationCampaignChannelTypes.EMAIL, locale, status),
        AutomationCampaign.getNewCampaignObject(garageId, target, AutomationCampaignChannelTypes.MOBILE, locale, status)
      );
    };

    if (
      (isLocaleHandled || GaragesTest.hasValue(garageId.toString())) &&
      [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL].includes(status) &&
      subs.Automation &&
      subs.Automation.enabled
    ) {
      for (const target of AutomationCampaignTargets.values()) {
        const active = AutomationCampaignTargets.getPropertyFromValue(target, 'active');
        const historicNeededInMonth = AutomationCampaignTargets.getPropertyFromValue(target, 'historicNeededInMonth');
        const subscriptionsNeeded = AutomationCampaignTargets.getPropertyFromValue(target, 'subscriptionsNeeded');
        if (active && subscriptionsNeeded.every((sub) => sub.some((s) => subs[s] && subs[s].enabled))) {
          const historic = {
            Maintenance: firstMaintenanceDay,
            NewVehicleSale: firstNewVehicleSaleDay,
            UsedVehicleSale: firstUsedVehicleSaleDay,
          };
          const historicNeededValue = historicNeededInMonth && historicNeededInMonth[1];
          const actualhistoricValue = historicNeededInMonth && historic[historicNeededInMonth[0]];
          let status = AutomationCampaignStatuses.IDLE;

          if (
            historicNeededInMonth &&
            historicNeededValue &&
            !hasEnoughHistoric(actualhistoricValue, historicNeededValue)
          ) {
            status = AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC;
          }

          addToCampaigns(campaigns, garageId, target, locale, status);
        }
      }

      // We fetch already existing campaigns for a given garage so we won't create duplicates
      const garageCampaigns = await AutomationCampaign.find({
        where: { garageId: ObjectId(garageId.toString()) },
        fields: { id: true, target: true, contactType: true, status: true },
      });

      // Create campaigns if they don't exist
      for (const campaign of campaigns) {
        const alreadyExistingCampaign = garageCampaigns.find(
          (e) => e.target === campaign.target && e.contactType === campaign.contactType
        );
        // Now saving also if the status changed, for isntance if the campaign is not BLOCKED anymore
        if (!alreadyExistingCampaign) {
          await campaign.save();
        } else if (
          alreadyExistingCampaign.status !== campaign.status &&
          [AutomationCampaignStatuses.IDLE, AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC].includes(
            alreadyExistingCampaign.status
          )
        ) {
          await AutomationCampaign.app.models.AutomationCampaign.getMongoConnector().updateOne(
            { _id: ObjectId(alreadyExistingCampaign.id) },
            { $set: { status: campaign.status } }
          );
        }
      }
    }
    return campaigns;
  };

  AutomationCampaign.getDefaultCampaignName = (target, contactType, locale = 'fr_FR') => {
    const AutomationCampaignTargetNames = new i18nRequire('common/models/automation-campaign', { locale });
    const defaultName = AutomationCampaignTargetNames.$t(target);

    if (defaultName) {
      return defaultName;
    }
    // we should not get here
    return `${target}_${contactType}`;
  };

  AutomationCampaign.getCustomContentPayload = async (customContentId) => {
    if (!customContentId) {
      return;
    }
    const todayDayNumber = timeHelper.dayNumber(new Date());
    const customContent = await AutomationCampaign.app.models.AutomationCampaignsCustomContent.getMongoConnector().findOne(
      {
        _id: ObjectId(customContentId.toString()),
        dayNumberStart: { $lte: todayDayNumber },
        dayNumberEnd: { $gte: todayDayNumber },
      },
      {
        projection: {
          promotionalMessage: true,
          themeColor: true,
          customUrl: true,
          customButtonText: true,
        },
      }
    );
    if (!customContent) {
      return;
    }
    return customContent;
  };
  // Function used in initDefaultCampaigns to make campaign creation easier
  AutomationCampaign.getNewCampaignObject = (garageId, target, contactType, locale, forcedStatus = null) => {
    let status;
    if (forcedStatus) {
      status = forcedStatus;
    } else if (
      target === AutomationCampaignTargets.COVID ||
      target === AutomationCampaignTargets.COVID1 ||
      target === AutomationCampaignTargets.COVID2
    ) {
      status = AutomationCampaignStatuses.IDLE;
    } else {
      status = AutomationCampaignStatuses.RUNNING;
    }
    const campaign = new AutomationCampaign({
      displayName: AutomationCampaign.getDefaultCampaignName(target, contactType, locale),
      type: AutomationCampaign.getCampaignType(target),
      contactType,
      garageId,
      status,
      frequency: AutomationCampaign.getFrequency(target),
      target,
    });
    campaign.runDayNumber = AutomationCampaign.getNextRunDayNumber(campaign.frequency);
    return campaign;
  };

  AutomationCampaign.getFrequency = (target) => {
    try {
      return AutomationCampaignTargets.getPropertyFromValue(target, 'frequency');
    } catch (err) {
      throw new Error(`Target ${target} is invalid. Can't get frequency type.`);
    }
  };

  // determine the campaign.type using the target
  AutomationCampaign.getCampaignType = (target) => {
    try {
      return AutomationCampaignTargets.getPropertyFromValue(target, 'leadDataType');
    } catch (err) {
      throw new Error(`Target ${target} is invalid. Can't get campaign type.`);
    }
  };

  AutomationCampaignTypes;
  AutomationCampaign.campaignTypeToDataTypes = (campaignType) => {
    switch (campaignType) {
      //AutomationCampaignTypes
      case AutomationCampaignTypes.AUTOMATION_MAINTENANCE:
        return [dataTypes.MAINTENANCE];
      case AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE:
        return [dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE];
      default:
        throw new Error(`campaignType ${campaignType} is invalid. Can't get data types.`);
    }
  };

  AutomationCampaignTypes;
  AutomationCampaign.campaignTypeToDataTypeLeadTicket = (campaignType) => {
    switch (campaignType) {
      //AutomationCampaignTypes
      case AutomationCampaignTypes.AUTOMATION_MAINTENANCE:
        return dataTypes.MAINTENANCE;
      //AutomationCampaignTypesCE;
      case AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE:
        return dataTypes.NEW_VEHICLE_SALE;
      //AutomationCampaignTypesLE_SALE;
      case AutomationCampaignTypes.AUTOMATION_NEW_VEHICLE_SALE:
        return dataTypes.NEW_VEHICLE_SALE;
      case AutomationCampaignTypes.AUTOMATION_USED_VEHICLE_SALE:
        return dataTypes.USED_VEHICLE_SALE;
      default:
        throw new Error(`campaignType ${campaignType} is invalid. Can't get data types.`);
    }
  };

  // We get the next day number. If there is no next day, we return null, and the campaign need to be set to complete.
  AutomationCampaign.prototype.getNextRunDayNumber = function getNextRunDayNumber(dayNumber) {
    return AutomationCampaign.getNextRunDayNumber(this.frequency, dayNumber);
  };

  AutomationCampaign.getNextRunDayNumber = function getNextRunDayNumber(frequency, dayNumber) {
    const todayRunDayNumber = dayNumber || timeHelper.dayNumber(new Date());
    let nextRunDayNumber = todayRunDayNumber;
    while (nextRunDayNumber && nextRunDayNumber <= todayRunDayNumber) {
      switch (frequency) {
        case automationCampaignFrequency.ONESHOT:
          nextRunDayNumber += 1;
          break;
        case automationCampaignFrequency.DAILY:
          nextRunDayNumber += 1;
          break;
        default:
          nextRunDayNumber = null;
      }
    }
    return nextRunDayNumber;
  };

  AutomationCampaign.getStatusPostRun = function getStatusPostRun(frequency) {
    switch (frequency) {
      case automationCampaignFrequency.ONESHOT:
        return AutomationCampaignStatuses.COMPLETE;
      default:
        return null;
    }
  };

  AutomationCampaign.prototype.getTargetedCustomers = async function getTargetedCustomers(forcedDayNumber) {
    // TODO: remove EMAIL from fields
    const fields = { projection: { _id: true, email: true, phone: true, automationCampaignsEvents: true } };
    // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
    const where = AutomationCampaign.targetQueryFunctions[this.target](
      timeHelper.dayNumberToDate(forcedDayNumber || this.runDayNumber)
    );

    if (!where.index) {
      where.index = { $all: [] };
    }
    where.index.$all.push({ $elemMatch: { k: 'garageId', v: ObjectId(this.garageId.toString()) } });
    where.unsubscribed = false;
    if (this.contactType === AutomationCampaignChannelTypes.EMAIL) {
      where.index.$all.push({ $elemMatch: { k: 'hasEmail', v: true } });
    } else {
      where.index.$all.push({ $elemMatch: { k: 'hasPhone', v: true } });
    }
    // exclude recent lastConvertedAt/lastLeadAt
    const checkLastEvent = AutomationCampaignTargets.getProperty(this.target, 'checkLastEvent');
    if (checkLastEvent) {
      if (!where.$and) where.$and = [];
      const dateRunDay = timeHelper.dayNumberToDate(forcedDayNumber || this.runDayNumber);
      const dayNumber = timeHelper.dayNumber(dateRunDay);
      where.$and.push({
        index: {
          $not: {
            $elemMatch: {
              k: checkLastEvent.name,
              v: { $gte: dayNumber - checkLastEvent.delay },
            },
          },
        },
      });
    }

    return await AutomationCampaign.app.models.Customer.mongoFind(where, fields);
  };

  AutomationCampaign.prototype.sendToTargetedCustomers = async function sendToTargetedCustomers(customers, dayNumber) {
    const garages = await AutomationCampaign.app.models.Garage.find({
      where: { id: this.garageId },
      fields: { locale: true },
    });
    const locale = garages[0].locale || 'fr_FR';
    const sendDate = new Date();
    // Delay SMS 60 minutes to prevent them from being sent before emails
    if (this.contactType === AutomationCampaignChannelTypes.MOBILE) {
      sendDate.setMinutes(sendDate.getMinutes() + 60);
    }

    const constraints = {
      noWeekEnd: true,
      workingHours: true,
    };
    let countAlreadyTargeted = 0;

    for (const customer of customers) {
      // check if customer already targete
      let isAlreadyTargeted = false;
      if (customer.automationCampaignsEvents && customer.automationCampaignsEvents.length) {
        isAlreadyTargeted = !!customer.automationCampaignsEvents.find((event) => {
          return event.campaignId.toString() === this.getId().toString() && event.campaignRunDay === dayNumber;
        });
      }
      countAlreadyTargeted += isAlreadyTargeted ? 1 : 0;

      if (!isAlreadyTargeted) {
        const campaignRunDay = dayNumber || timeHelper.dayNumber(sendDate);
        await Scheduler.upsertJob(
          JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
          {
            customerId: customer._id.toString(),
            campaignId: this.getId().toString(),
            campaignType: this.type,
            garageId: this.garageId.toString(),
            contactType: this.contactType,
            target: this.target,
            email: customer.email, // to be deleted when the investigation is complete
            phone: customer.phone, // to determine why the customer is not found like this job _id: "AUTOMATION_SEND_CONTACT_TO_CUSTOMER_93817b12de64e9d00e136d168113b0ab18413c1a"
            campaignRunDay,
          },
          sendDate,
          constraints
        );
        await AutomationCampaign.app.models.AutomationCampaignsEvents.addLog({
          garageId: this.garageId,
          campaignId: this.getId(),
          customerId: customer._id,
          eventType: AutomationCampaignsEventsType.TARGETED,
          contactType: this.contactType,
          target: this.target,
          campaignType: this.type,
          campaignRunDay,
        });
      }
    }
    log.info(
      FED,
      `AutomationCampaign.run : ${this.getId()} : ${
        customers.length
      } targeted Customers, remove ${countAlreadyTargeted} already targeted`
    );
  };

  AutomationCampaign.prototype.run = async function run(dayNumber) {
    // We check if the runDayNumber equals to the today's day number and if the campaign is running. If it's the case, then the campaign should be run.
    if (this.runDayNumber !== dayNumber || this.status !== AutomationCampaignStatuses.RUNNING || this.hidden) {
      return false;
    }
    // We handle the 28th fev by getting the customers associated to it during the 27th fev. Meaning we don't want to do anything on the 28th fev.
    const executionDay = timeHelper.dayNumberToDate(dayNumber);
    let customers = [];
    if (executionDay.getMonth() !== 1 || executionDay.getDate() !== 29) {
      // EXEC
      customers = await this.getTargetedCustomers();
      await this.sendToTargetedCustomers(customers, dayNumber);
      // EXEC DONE
    }
    const updateData = {};
    const statusPostRun = AutomationCampaign.getStatusPostRun(this.frequency);
    updateData.runDayNumber = AutomationCampaign.getNextRunDayNumber(this.frequency, this.runDayNumber);
    if (!this.firstRunDayNumber) updateData.firstRunDayNumber = this.runDayNumber;
    if (statusPostRun) updateData.status = statusPostRun;
    updateData.lastRunDayNumber = this.runDayNumber;
    await AutomationCampaign.findByIdAndUpdateAttributes(this.getId(), updateData);
    return customers.length;
  };
};
