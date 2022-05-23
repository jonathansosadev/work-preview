const app = require('../../../../server/server');
const { ObjectId } = require('mongodb');
const timeHelper = require('../../../lib/util/time-helper');

const { AutomationCampaignsEventsType, TicketActionNames } = require('../../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../models/automation-campaign-channel.type.js');
const AutomationCampaignsType = require('../../../models/automation-campaign.type');
const SourceTypes = require('../../../models/data/type/source-types');
const TicketStatus = require('../../../models/data/type/lead-ticket-status.js');

const { concurrentpromiseAll } = require('../../util/concurrentpromiseAll');
const _common = require('../../../models/data/_common-ticket');

const { TIBO, log } = require('../../../lib/util/log');
const prefix = '[AutomationCrossedLeadsHandler]';

// useless comment

module.exports = {
  _consolidatedAutomationCampaignCanBeCrossed(campaign) {
    if (campaign.crossed) {
      return false;
    }
    const { CROSSED_DELAY_SALE, CROSSED_DELAY_APV } = app.models.Customer;
    const todayNumber = timeHelper.todayDayNumber();
    if (campaign.campaignType === AutomationCampaignsType.AUTOMATION_MAINTENANCE) {
      const isExpireApv = campaign.targetedDay <= todayNumber - CROSSED_DELAY_APV;
      return campaign.openedDayToBillingDay <= CROSSED_DELAY_APV && !isExpireApv;
    }
    const isExpireSale = campaign.targetedDay <= todayNumber - CROSSED_DELAY_SALE;
    return campaign.leadDayToBillingDay <= CROSSED_DELAY_SALE && !isExpireSale;
  },

  _getCustomContentId(customer, { campaignId, campaignRunDay }) {
    if (customer.automationCampaignsEvents) {
      const result = customer.automationCampaignsEvents.find(
        (event) =>
          event.type === AutomationCampaignsType.SENT &&
          event.campaignId === campaignId &&
          event.campaignRunDay === campaignRunDay
      );
      return result && result.customContentId;
    }
  },

  async _removeAllAutomaticConvertedEvents() {
    const bulkWrite = [];
    const events = await app.models.AutomationCampaignsEvents.getMongoConnector()
      .find({
        type: AutomationCampaignsEventsType.CONVERTED,
        samples: {
          $elemMatch: {
            convertedFromCockpit: {
              $ne: true,
            },
          },
        },
      })
      .toArray();

    for (const event of events) {
      event.samples = event.samples.filter((sample) => sample.convertedFromCockpit);
      event[event.nsamplesDesktop >= 0 ? 'nsamplesDesktop' : 'nsamplesMobile'] = event.samples.length;
      if (!event.samples.length) {
        bulkWrite.push({
          deleteOne: {
            filter: {
              _id: event._id,
            },
          },
        });
      } else {
        bulkWrite.push({
          updateOne: {
            filter: {
              _id: event._id,
            },
            update: {
              $set: {
                samples: event.samples,
                ...(event.nsamplesDesktop >= 0
                  ? { nsamplesDesktop: event.nsamplesDesktop }
                  : { nsamplesMobile: event.nsamplesMobile }),
              },
            },
          },
        });
      }
    }

    if (bulkWrite.length) {
      await app.models.AutomationCampaignsEvents.getMongoConnector().bulkWrite(bulkWrite);
    }
  },

  async _removeAllEventsForSpecificEvent(eventType) {
    return app.models.AutomationCampaignsEvents.getMongoConnector().deleteMany({ type: eventType });
  },

  async _cleanEveryCustomersFromCrossedEvents() {
    return app.models.Customer.getMongoConnector().updateMany(
      {
        $or: [
          { automationCampaigns: { $elemMatch: { crossed: true } } },
          { automationCampaignsEvents: { $elemMatch: { eventType: AutomationCampaignsEventsType.CROSSED } } },
        ],
      },
      {
        $pull: {
          automationCampaignsEvents: {
            eventType: AutomationCampaignsEventsType.CROSSED,
          },
        },
        $set: {
          'automationCampaigns.$[campaign].crossed': false,
        },
      },
      {
        arrayFilters: [
          {
            'campaign.crossed': true,
          },
        ],
      }
    );
  },

  async _cleanEveryCustomersFromConvertedEvents() {
    return app.models.Customer.getMongoConnector().updateMany(
      {
        $or: [
          { automationCampaigns: { $elemMatch: { converted: true } } },
          { automationCampaignsEvents: { $elemMatch: { eventType: AutomationCampaignsEventsType.CONVERTED } } },
        ],
      },
      {
        $pull: {
          automationCampaignsEvents: {
            eventType: AutomationCampaignsEventsType.CONVERTED,
          },
        },
        $set: {
          'automationCampaigns.$[campaign].converted': false,
        },
      },
      {
        arrayFilters: [
          {
            'campaign.converted': true,
          },
        ],
      }
    );
  },

  async _resetAllCrossedAndConvertedEvents() {
    const [
      removeCrossedEventsResult,
      removeConvertedEventsResult,
      cleanCustomerFromCrossedResult,
      cleanCustomerFromConvertedResult,
    ] = await Promise.all([
      this._removeAllEventsForSpecificEvent(AutomationCampaignsEventsType.CROSSED),
      this._removeAllEventsForSpecificEvent(AutomationCampaignsEventsType.CONVERTED),
      this._cleanEveryCustomersFromCrossedEvents(),
      this._cleanEveryCustomersFromConvertedEvents(),
    ]);

    return {
      removeCrossedEventsResult,
      removeConvertedEventsResult,
      cleanCustomerFromCrossedResult,
      cleanCustomerFromConvertedResult,
    };
  },

  async _generateEvent(customer, campaign, eventType, billingDataId) {
    const event = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne(
      {
        campaignId: ObjectId(campaign.campaignId.toString()),
        'samples.customerId': ObjectId(customer._id.toString()),
        campaignRunDay: campaign.campaignRunDay,
        type: eventType,
      },
      {
        projection: {
          _id: true,
        },
      }
    );
    // campaignId et
    const customContentId = this._getCustomContentId(customer, campaign);
    if (!event) {
      const dayToBillingDay =
        campaign.campaignType === AutomationCampaignsType.AUTOMATION_MAINTENANCE
          ? campaign.openedDayToBillingDay
          : campaign.leadDayToBillingDay;
      const campaignStartDay =
        campaign.campaignType === AutomationCampaignsType.AUTOMATION_MAINTENANCE
          ? campaign.openedDay
          : campaign.leadDay;
      await app.models.AutomationCampaignsEvents.addLog(
        {
          garageId: campaign.garageId,
          campaignId: campaign.campaignId,
          customerId: customer._id,
          eventType: eventType,
          contactType: campaign.isMobile ? AutomationCampaignChannelTypes.MOBILE : AutomationCampaignChannelTypes.EMAIL,
          campaignType: campaign.campaignType,
          target: campaign.target,
          campaignRunDay: campaign.campaignRunDay,
          billingDataId,
        },
        {
          forceDate: timeHelper.dayNumberToDate(campaignStartDay + dayToBillingDay),
          customContentId: customContentId ? customContentId : null,
        }
      );
    }
  },

  async _closeLeadTicket(customer, campaign) {
    const leadTicketData = await app.models.Data.findOne({
      where: {
        garageId: campaign.garageId.toString(),
        'leadTicket.createdAt': { gte: timeHelper.dayNumberToDate(campaign.campaignRunDay) },
        'source.type': SourceTypes.AUTOMATION,
        'automation.customerId': customer._id,
        'automation.campaignId': campaign.campaignId,
        'automation.campaignRunDay': campaign.campaignRunDay,
      },
    });

    if (leadTicketData && leadTicketData.get('leadTicket.status') === TicketStatus.CLOSED_WITHOUT_SALE) {
      await _common.addAction('lead', leadTicketData, {
        createdAt: new Date(),
        name: TicketActionNames.LEAD_REOPENED,
        automaticReopen: true,
      });
    }

    if (leadTicketData && leadTicketData.get('leadTicket.status') !== TicketStatus.CLOSED_WITH_SALE) {
      await _common.addAction('lead', leadTicketData, {
        createdAt: new Date(),
        name: TicketActionNames.LEAD_CLOSED,
        wasTransformedToSale: true,
        crossLeadConverted: true,
        automaticClose: true,
      });
      await leadTicketData.save();
    }
  },

  async _processOneSpecificCustomer(customer) {
    try {
      log.info(TIBO, `${prefix} Processing Customer ${customer._id}`);
      await Promise.all(
        customer.automationCampaigns.map(async (campaign) => {
          if (this._consolidatedAutomationCampaignCanBeCrossed(campaign)) {
            await this._closeLeadTicket(customer, campaign);
            await this._generateEvent(customer, campaign, AutomationCampaignsEventsType.CONVERTED);
            await this._generateEvent(
              customer,
              campaign,
              AutomationCampaignsEventsType.CROSSED,
              campaign.billingDataId
            );
          }
        })
      );
    } catch (e) {
      log.error(TIBO, `[AutomationCrossedLeadsHandler] Error While Processing Customer ${customer._id} : ${e}`);
    }
  },

  async _generateConvertedEventsFromCockpit() {
    const datas = (
      await app.models.Data.getMongoConnector()
        .find(
          {
            'leadTicket.createdAt': { $gte: new Date(0) },
            'source.type': SourceTypes.AUTOMATION,
            'leadTicket.status': TicketStatus.CLOSED_WITH_SALE,
            'leadTicket.actions': {
              $elemMatch: {
                name: TicketActionNames.LEAD_CLOSED,
                automaticClose: { $ne: true },
              },
            },
          },
          {
            projection: {
              _id: true,
              garageId: true,
              leadTicket: true,
              automation: true,
            },
          }
        )
        .toArray()
    ).filter((data) => {
      return (
        data.leadTicket.actions && data.leadTicket.actions[data.leadTicket.actions.length - 1].automaticClose !== true
      );
    });

    return Promise.all(
      datas.map(async (data) => {
        const convertedAndSentEvents = await app.models.AutomationCampaignsEvents.getMongoConnector()
          .find(
            {
              campaignId: data.automation.campaignId,
              'samples.customerId': data.automation.customerId,
              campaignRunDay: data.automation.campaignRunDay,
              type: { $in: [AutomationCampaignsEventsType.CONVERTED, AutomationCampaignsEventsType.SENT] },
            },
            {
              projection: {
                _id: true,
                customContentId: true,
              },
            }
          )
          .toArray();
        const convertedEvent = convertedAndSentEvents.find(
          (event) => event.type === AutomationCampaignsEventsType.CONVERTED
        );
        const sentEvent = convertedAndSentEvents.find((event) => event.type === AutomationCampaignsEventsType.SENT);
        if (!convertedEvent) {
          const campaign = await app.models.AutomationCampaign.getMongoConnector().findOne(
            { _id: ObjectId(data.automation.campaignId) },
            { projection: { type: true, target: true } }
          );
          await app.models.AutomationCampaignsEvents.addLog(
            {
              garageId: data.garageId,
              campaignId: data.automation.campaignId,
              customerId: data.automation.customerId,
              eventType: AutomationCampaignsEventsType.CONVERTED,
              contactType: data.automation.contactType,
              campaignType: campaign.type,
              target: campaign.target,
              campaignRunDay: data.automation.campaignRunDay,
            },
            {
              forceDate: data.leadTicket.closedAt,
              convertedFromCockpit: true,
              customContentId: sentEvent && sentEvent.customContentId,
            }
          );
        }
      })
    );
  },

  async _fetchBatchOfCustomers(nextId, batchSize) {
    const options = {
      projection: {
        _id: true,
        automationCampaigns: true,
      },
      limit: batchSize + 1,
      sort: {
        _id: 1,
      },
    };

    const query = {
      ...(nextId ? { _id: { $gte: nextId } } : {}),
      $or: [
        {
          automationCampaigns: {
            $elemMatch: {
              campaignType: AutomationCampaignsType.AUTOMATION_MAINTENANCE,
              crossed: { $ne: true },
              openedDayToBillingDay: { $lte: app.models.Customer.CROSSED_DELAY_APV },
            },
          },
        },
        {
          automationCampaigns: {
            $elemMatch: {
              campaignType: {
                $ne: AutomationCampaignsType.AUTOMATION_MAINTENANCE,
              },
              crossed: { $ne: true },
              leadDayToBillingDay: { $lte: app.models.Customer.CROSSED_DELAY_SALE },
            },
          },
        },
      ],
    };

    const customers = await app.models.Customer.getMongoConnector().find(query, options).toArray();
    const hasMore = customers.length > batchSize;
    let lastId = null;
    let lastCustomer = null;
    if (hasMore) {
      lastCustomer = customers.pop();
      lastId = lastCustomer._id;
    }

    return { customers, hasMore, nextId: lastId };
  },

  async _reopenAutomaticallyClosedLeadTickets() {
    const datas = (
      await app.models.Data.getMongoConnector()
        .find({
          'leadTicket.createdAt': { $gte: new Date(0) },
          'source.type': SourceTypes.AUTOMATION,
          'leadTicket.status': TicketStatus.CLOSED_WITH_SALE,
          'leadTicket.actions': {
            $elemMatch: {
              name: TicketActionNames.LEAD_CLOSED,
              automaticClose: true,
            },
          },
        })
        .toArray()
    ).filter((data) => {
      return (
        data.leadTicket.actions && data.leadTicket.actions[data.leadTicket.actions.length - 1].automaticClose === true
      );
    });

    return concurrentpromiseAll(
      datas.map((rawData) => {
        return () => {
          const data = new app.models.Data(rawData);

          data.id = data._id;
          return _common.addAction('lead', data, {
            createdAt: new Date(),
            name: TicketActionNames.LEAD_REOPENED,
            automaticReopen: true,
          });
        };
      }),
      500
    );
  },

  async _resetEventsAndRegenerateConverted() {
    const {
      removeCrossedEventsResult,
      removeConvertedEventsResult,
      cleanCustomerFromCrossedResult,
      cleanCustomerFromConvertedResult,
    } = await this._resetAllCrossedAndConvertedEvents();
    const convertedEventsRegenerationResult = await this._generateConvertedEventsFromCockpit();
    const reopenedLeadTickeds = await this._reopenAutomaticallyClosedLeadTickets();
    log.info(TIBO, `${prefix} RESET : ${removeCrossedEventsResult.deletedCount} Crossed Events Removed`);
    log.info(TIBO, `${prefix} RESET : ${removeConvertedEventsResult.deletedCount} Converted Events Removed`);
    log.info(
      TIBO,
      `${prefix} RESET : ${cleanCustomerFromCrossedResult.modifiedCount} Crossed Events Pulled From Customers`
    );
    log.info(
      TIBO,
      `${prefix} RESET : ${cleanCustomerFromConvertedResult.modifiedCount} Converted Events Pulled From Customers`
    );
    log.info(TIBO, `${prefix} RESET : ${convertedEventsRegenerationResult.length} Cockpit Converted Event Regenerated`);
    log.info(TIBO, `${prefix} RESET : ${reopenedLeadTickeds.length} Automatically Closed Laad Tickets Reopened`);
  },

  async generateConvertedAndCrossedEvents(reset = false) {
    const customersBatchSize = 10000;
    let customersBatch = { nextId: null };
    let totalCustomers = 0;

    if (reset) {
      log.warning(TIBO, `${prefix} WARNING /!\\ RESET MODE IS ON`);
      log.info(TIBO, `${prefix} Reset Option Is Activated, Starting Cleaning...`);
      await this._resetEventsAndRegenerateConverted();
      log.info(TIBO, `${prefix} Cleaning Done !`);
    }

    do {
      customersBatch = await this._fetchBatchOfCustomers(customersBatch.nextId, customersBatchSize);
      totalCustomers += customersBatch.customers.length;
      log.info(TIBO, `${prefix} Processing Batch Of ${customersBatch.customers.length} Customers...`);
      await Promise.all(customersBatch.customers.map(async (customer) => this._processOneSpecificCustomer(customer)));
    } while (customersBatch.hasMore);

    log.info(TIBO, `${prefix} Done Processing Customer ! ${totalCustomers} Customer Processed.`);
  },
};
