const timeHelper = require('../lib/util/time-helper');
const {
  AutomationCampaignsEventsType,
  TicketActionNames,
  JobTypes,
  DataTypes,
} = require('../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('./automation-campaign-channel.type.js');
const LeadTicketStatus = require('./data/type/lead-ticket-status');
const Scheduler = require('../lib/garagescore/scheduler/scheduler.js');

const { ObjectId } = require('mongodb');
const { BANG, log } = require('../lib/util/log');

const _getAutomationCampaignsEvents = async (AutomationCampaignsEvents, data, type) => {
  return AutomationCampaignsEvents.find({
    where: {
      campaignId: data.get('automation.campaignId'),
      'samples.customerId': data.get('automation.customerId'),
      campaignRunDay: data.get('automation.campaignRunDay'),
      type: type,
    },
    fields: { id: true },
  });
};

const throwError = (message) => {
  log.error(BANG, message);
  throw new Error(message);
};

module.exports = function AutomationCampaignsEventsDefinition(AutomationCampaignsEvents) {
  // AutomationCampaignsEvents.addLog = async (garageId, campaignId, customerId, eventType, contactType, campaignType, campaignRunDay, forceDate, leadFromMobile) => {
  AutomationCampaignsEvents.addLog = async (args, optional) => {
    // necessary arguments
    const { eventType, contactType, campaignType, target, campaignRunDay, billingDataId } = args;
    let { garageId, campaignId, customerId } = args;
    // optional arguments
    if (!optional) optional = {};
    const { forceDate, leadFromMobile, convertedFromCockpit } = optional;
    let { customContentId } = optional;
    if (!garageId) throwError('AutomationCampaignsEvents: garageId required');
    if (!campaignId) throwError('AutomationCampaignsEvents: campaignId required');
    if (!customerId) throwError('AutomationCampaignsEvents: customerId required');
    if (!eventType) throwError('AutomationCampaignsEvents: eventType required');
    if (!campaignType) throwError('AutomationCampaignsEvents: campaignType required');
    if (!contactType) throwError('AutomationCampaignsEvents: contactType required');
    if (!campaignRunDay) throwError('AutomationCampaignsEvents: campaignRunDay required');
    if (forceDate && (!forceDate instanceof Date || isNaN(forceDate.getTime())))
      throwError('AutomationCampaignsEvents: forceDate needs to be a date.');
    if (!target) throwError('AutomationCampaignsEvents: target required');
    if (eventType === AutomationCampaignsEventsType.CROSSED && !billingDataId)
      throwError('AutomationCampaignsEvents: billingDataId required for crossed events');
    if (ObjectId.isValid(garageId)) {
      garageId = new ObjectId(garageId.toString());
    } else if (garageId.length > 0) {
      garageId = garageId.map((gId) => new ObjectId(gId.toString()));
    }

    campaignId = new ObjectId(campaignId.toString());
    customerId = new ObjectId(customerId.toString());
    customContentId = customContentId ? new ObjectId(customContentId.toString()) : null;
    const eventDate = forceDate || new Date();
    const log = {
      time: eventDate.getTime(),
      customerId,
      isMobile: contactType === AutomationCampaignChannelTypes.MOBILE,
      leadFromMobile,
      convertedFromCockpit,
    };
    if (billingDataId) {
      log.billingDataId = billingDataId;
    }
    const update = { $push: { samples: log } };
    if (log.isMobile) {
      update.$inc = { nsamples: 1, nsamplesMobile: 1 };
    } else {
      update.$inc = { nsamples: 1, nsamplesDesktop: 1 };
    }
    const directMongoConnect = AutomationCampaignsEvents.getMongoConnector();
    await directMongoConnect.updateOne(
      {
        garageId,
        campaignId,
        type: eventType,
        campaignRunDay,
        campaignType,
        target,
        customContentId,
        eventDay: timeHelper.dayNumber(eventDate),
        nsamples: { $lt: 200 },
      },
      update,
      { upsert: true }
    );
    // We delay the consolidate so it doesn't trigger too many times in a row
    const consolidateDate = new Date();
    consolidateDate.setMinutes(consolidateDate.getMinutes() + 2);
    try {
      await Scheduler.upsertJob(
        JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER,
        { customerId: customerId.toString() },
        consolidateDate
      );
    } catch (e) {
      console.error(e);
    }
  };
  AutomationCampaignsEvents.prototype.addLog = AutomationCampaignsEvents.addLog;
  AutomationCampaignsEvents.externalEventNameParsing = (eventName) => {
    if (eventName && typeof eventName === 'string') {
      return eventName
        .split(/(?=[A-Z])/)
        .join('_')
        .toUpperCase();
    }
    return eventName;
  };
  AutomationCampaignsEvents.addEventsfromLeadTicketAction = async (data, action, type, newStatus, reactive) => {
    if (data.get('type') === DataTypes.AUTOMATION_CAMPAIGN && type === 'lead') {
      const ticket = data.get('leadTicket');
      if (!ticket) {
        throw new Error(`Data with dataId ${data.getId()} has no lead ticket, can't add events. Aborting.`);
      }
      const campaign = await AutomationCampaignsEvents.app.models.AutomationCampaign.getMongoConnector().findOne(
        { _id: new ObjectId(data.get('automation.campaignId')) },
        { projection: { type: 1, contactType: 1, target: 1 } }
      );
      // retrieve customContentId from events
      const customContentEvent = await AutomationCampaignsEvents.app.models.AutomationCampaignsEvents.getMongoConnector().findOne(
        {
          campaignId: new ObjectId(data.get('automation.campaignId')),
          'samples.customerId': new ObjectId(data.get('automation.customerId')),
          type: AutomationCampaignsEventsType.SENT,
        },
        { projection: { customContentId: 1 } }
      );
      const baseEventProps = {
        garageId: data.get('garageId'),
        campaignId: data.get('automation.campaignId'),
        customerId: data.get('automation.customerId'),
        contactType: campaign.contactType,
        campaignType: campaign.type,
        target: campaign.target,
        customContentId: customContentEvent && customContentEvent.customContentId,
        campaignRunDay: data.get('automation.campaignRunDay'),
      };
      // create empty array, push all events, use a loop for each event and cread addLog
      const allEventTypesToProcess = [];
      if (
        action.name === TicketActionNames.LEAD_FOLLOWUP_RESPONDED &&
        ticket.actions.filter(({ name }) => name === TicketActionNames.LEAD_FOLLOWUP_RESPONDED).length === 1
      ) {
        allEventTypesToProcess.push(AutomationCampaignsEventsType.FOLLOWUP_ANSWERED);
        if (action.followupIsRecontacted) {
          allEventTypesToProcess.push(AutomationCampaignsEventsType.FOLLOWUP_HAS_CALLED_BACK);
        }
        if (['YesPlanned', 'YesDone'].includes(data.get('leadTicket.followup.appointment'))) {
          allEventTypesToProcess.push(AutomationCampaignsEventsType.FOLLOWUP_HAS_NEW_APPOINTMENT);
        }
      }
      if (reactive) {
        allEventTypesToProcess.push(AutomationCampaignsEventsType.REACTIVE_LEAD);
      }
      if (newStatus) {
        const hasAlreadyReachedTheStatus = await _getAutomationCampaignsEvents(
          AutomationCampaignsEvents,
          data,
          AutomationCampaignsEvents.externalEventNameParsing(newStatus)
        );
        if (hasAlreadyReachedTheStatus.length === 0) {
          allEventTypesToProcess.push(AutomationCampaignsEvents.externalEventNameParsing(newStatus));
        }
        if (!action.automaticClose && newStatus === LeadTicketStatus.CLOSED_WITH_SALE) {
          const convertedEvent = await _getAutomationCampaignsEvents(
            AutomationCampaignsEvents,
            data,
            AutomationCampaignsEventsType.CONVERTED
          );
          if (!convertedEvent) {
            allEventTypesToProcess.push(AutomationCampaignsEventsType.CONVERTED);
          }
        }
      }
      // loop on every event and create addLog
      for (const eventType of allEventTypesToProcess) {
        let optionalArg = {};
        if (eventType === AutomationCampaignsEventsType.CONVERTED) {
          optionalArg = { convertedFromCockpit: true };
        }
        await AutomationCampaignsEvents.addLog({ ...baseEventProps, eventType }, optionalArg);
      }
    }
  };
};
