const app = require('../../../server/server');

const intro = '[Automation - Affect lone leadTickets to existing customers] :';

const { ObjectID } = require('mongodb');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../common/models/automation-campaign-channel.type');
const timeHelper = require('../../../common/lib/util/time-helper');

const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const leadTicketConnector = app.models.DatasAsyncviewLeadTicket.getMongoConnector();
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const acConnector = app.models.AutomationCampaign.getMongoConnector();
  const customerConnector = app.models.Customer.getMongoConnector();
  const dataConnector = app.models.Data.getMongoConnector();
  const datas = await leadTicketConnector
    .find(
      { 'source.type': 'Automation' },
      {
        projection: {
          automation: true,
          garageId: true,
          'customer.contact.email.original': true,
          'customer.contact.mobilePhone.original': true,
          'leadTicket.status': true,
          'leadTicket.reactive': true,
          'leadTicket.actions': true,
          'leadTicket.createdAt': true,
        },
      }
    )
    .toArray();
  log.info(FED, `${intro} processing for ${datas.length} tickets.`);
  log.info(FED, `${intro} getting lone tickets...`);
  const customerIdsToCheck = datas.map((data) => data.automation.customerId);
  const alreadyExistingCustomers = await customerConnector
    .find(
      {
        $or: [{ _id: { $in: customerIdsToCheck } }, { fusedCustomerIds: { $in: customerIdsToCheck } }],
      },
      { projection: { _id: true } }
    )
    .toArray();
  const customerIds = {};
  for (const ticketInformation of datas) {
    customerIds[ticketInformation.automation.customerId.toString()] = {
      email: ticketInformation.customer.contact.email && ticketInformation.customer.contact.email.original,
      phone: ticketInformation.customer.contact.mobilePhone && ticketInformation.customer.contact.mobilePhone.original,
      garageId: new ObjectID(ticketInformation.garageId),
      campaignId: ticketInformation.automation.campaignId,
      contactType: ticketInformation.automation.contactType,
      campaignRunDay: ticketInformation.automation.campaignRunDay,
      customerId: ticketInformation.automation.customerId,
      dataId: ticketInformation._id,
      ticketStatus: ticketInformation.leadTicket.status,
      ticketReactive: ticketInformation.leadTicket.reactive,
      ticketActions: ticketInformation.leadTicket.actions,
      ticketCreatedAt: ticketInformation.leadTicket.createdAt,
    };
  }
  for (const customer of alreadyExistingCustomers) {
    customerIds[customer._id.toString()] = 'OK';
  }
  const notFoundCustomersOccurences = customerIdsToCheck
    .filter((customerId) => customerIds[customerId.toString()] !== 'OK')
    .map((customerId) => customerIds[customerId.toString()]);
  log.info(FED, `${intro} ${notFoundCustomersOccurences.length} found.`);
  let processed = 0;
  let removedDatas = 0;
  for (const notFoundOccurence of notFoundCustomersOccurences) {
    log.info(
      FED,
      `${intro} ${notFoundOccurence.customerId.toString()} being corrected (${processed}/${
        notFoundCustomersOccurences.length
      }).`
    );
    // We first find the real customer associated to the occurence
    const realCustomer = await customerConnector.findOne({
      garageId: notFoundOccurence.garageId,
      ...(notFoundOccurence.email ? { emailList: notFoundOccurence.email } : { phoneList: notFoundOccurence.phone }),
    });
    // For the two test data bugged, we remove them
    if (!realCustomer) {
      log.info(FED, `Data to delete : ${notFoundOccurence.dataId.toString()}`);
      removedDatas++;
      processed++;
      continue;
    }
    // We get the campaign for the addLogs
    const automationCampaign = await acConnector.findOne({ _id: notFoundOccurence.campaignId });
    // We get all the events from the deleted customer concerning this precise campaign run
    const deletedCustomerEvents = await aceConnector
      .find({
        'samples.customerId': notFoundOccurence.customerId,
        campaignRunDay: notFoundOccurence.campaignRunDay,
        campaignId: notFoundOccurence.campaignId,
      })
      .toArray();
    // We check if all events leading to a ticket are available : TARGETED, SENT, RECEIVED, OPEN, LEAD
    // If one of them is missing, we add it back with the campaign run day
    const mandatoryEvents = [
      AutomationCampaignsEventsType.TARGETED,
      AutomationCampaignsEventsType.SENT,
      AutomationCampaignsEventsType.RECEIVED,
      AutomationCampaignsEventsType.OPENED,
      AutomationCampaignsEventsType.LEAD,
    ];
    for (const mandatoryEvent of mandatoryEvents) {
      const eventToCheck = deletedCustomerEvents.find((event) => event.type === mandatoryEvent);
      if (!eventToCheck) {
        await app.models.AutomationCampaignsEvents.addLog(
          {
            garageId: notFoundOccurence.garageId,
            campaignId: notFoundOccurence.campaignId,
            customerId: realCustomer._id,
            eventType: mandatoryEvent,
            contactType: automationCampaign.isMobile
              ? AutomationCampaignChannelTypes.MOBILE
              : AutomationCampaignChannelTypes.EMAIL,
            campaignType: automationCampaign.type,
            target: automationCampaign.target,
            campaignRunDay: notFoundOccurence.campaignRunDay,
          },
          {
            forceDate: timeHelper.dayNumberToDate(notFoundOccurence.campaignRunDay),
          }
        );
      }
    }
    // We add the events from the ticket actions
    if (
      notFoundOccurence.ticketReactive &&
      !deletedCustomerEvents.includes((event) => event.type === AutomationCampaignsEventsType.REACTIVE_LEAD)
    ) {
      await app.models.AutomationCampaignsEvents.addLog(
        {
          garageId: notFoundOccurence.garageId,
          campaignId: notFoundOccurence.campaignId,
          customerId: realCustomer._id,
          eventType: AutomationCampaignsEventsType.REACTIVE_LEAD,
          contactType: automationCampaign.isMobile
            ? AutomationCampaignChannelTypes.MOBILE
            : AutomationCampaignChannelTypes.EMAIL,
          campaignType: automationCampaign.type,
          target: automationCampaign.target,
          campaignRunDay: notFoundOccurence.campaignRunDay,
        },
        {
          forceDate: new Date(notFoundOccurence.ticketCreatedAt),
        }
      );
    }
    if (
      notFoundOccurence.ticketStatus.includes('Closed') &&
      !deletedCustomerEvents.includes(
        (event) =>
          event.type === app.models.AutomationCampaignsEvents.externalEventNameParsing(notFoundOccurence.ticketStatus)
      )
    ) {
      const closingAction = notFoundOccurence.ticketActions.find((action) => action.name === 'leadClosed');
      await app.models.AutomationCampaignsEvents.addLog(
        {
          garageId: notFoundOccurence.garageId,
          campaignId: notFoundOccurence.campaignId,
          customerId: realCustomer._id,
          eventType: app.models.AutomationCampaignsEvents.externalEventNameParsing(notFoundOccurence.ticketStatus),
          contactType: automationCampaign.isMobile
            ? AutomationCampaignChannelTypes.MOBILE
            : AutomationCampaignChannelTypes.EMAIL,
          campaignType: automationCampaign.type,
          target: automationCampaign.target,
          campaignRunDay: notFoundOccurence.campaignRunDay,
        },
        {
          forceDate: new Date(closingAction.createdAt),
        }
      );
      if (
        notFoundOccurence.ticketStatus === 'ClosedWithSale' &&
        !deletedCustomerEvents.includes((event) => event.type === AutomationCampaignsEventsType.CONVERTED)
      ) {
        await app.models.AutomationCampaignsEvents.addLog(
          {
            garageId: notFoundOccurence.garageId,
            campaignId: notFoundOccurence.campaignId,
            customerId: realCustomer._id,
            eventType: app.models.AutomationCampaignsEvents.externalEventNameParsing(
              AutomationCampaignsEventsType.CONVERTED
            ),
            contactType: automationCampaign.isMobile
              ? AutomationCampaignChannelTypes.MOBILE
              : AutomationCampaignChannelTypes.EMAIL,
            campaignType: automationCampaign.type,
            target: automationCampaign.target,
            campaignRunDay: notFoundOccurence.campaignRunDay,
          },
          {
            convertedFromCockpit: true,
            forceDate: new Date(closingAction.createdAt),
          }
        );
      }
    }

    // Then we make all the events from the previous customer found go to the new one
    for (const eventToCheck of deletedCustomerEvents) {
      for (const sample of eventToCheck.samples) {
        if (sample.customerId.toString() === notFoundOccurence.customerId.toString()) {
          sample.customerId = realCustomer._id;
        }
      }
      await aceConnector.updateOne({ _id: eventToCheck._id }, { $set: { samples: eventToCheck.samples } });
    }
    // And then we update the data with the new customer
    await dataConnector.updateOne(
      { _id: notFoundOccurence.dataId },
      { $set: { 'automation.customerId': realCustomer._id, 'automation.fixes': '4451' } }
    );
    processed++;
  }
  log.info(FED, `${intro} done, ${processed} datas processed, ${removedDatas} removed datas (should be 2)`);
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
