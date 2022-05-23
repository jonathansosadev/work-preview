/**
 * A leadTicket
 */
const { TicketActionNames, LeadTicketMissedReasons } = require('../../../frontend/utils/enumV2');
const TicketStatus = require('../../../common/models/data/type/lead-ticket-status.js');
const ContactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config');
const TicketAction = require('./definition-helpers').TicketAction;
const _common = require('./_common-ticket');
const { log, JS } = require('../../lib/util/log');
const sendContactNow = require('../../../common/lib/garagescore/data-campaign/run/_send-contact-now.js');
const { promisify } = require('util');

const model = () => ({
  properties: {
    /* when the lead was reported */
    createdAt: {
      type: 'date',
      required: true,
    },
    touched: {
      type: 'boolean',
    },
    reactive: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      required: true,
    },
    requestType: {
      type: 'string',
    },
    wasTransformedToSale: {
      type: 'boolean',
      required: true,
    },
    missedSaleReason: [
      {
        type: LeadTicketMissedReasons.type,
        required: true,
      },
    ],
    closedAt: {
      type: 'date',
      required: true,
    },
    actions: [
      {
        type: TicketAction,
      },
    ],
    // it would be the first reminder day for all actions of lead Ticket
    // this day is useful for the script which will send reminding notification
    checkNotificationDay: {
      type: 'number',
      required: true,
    },
    // after 90 days of inactivity we close ticket and set this flag to true
    closedForInactivity: {
      type: 'boolean',
    },
    budget: {
      type: 'number',
      required: true,
    },
    manager: {
      type: 'string',
    },
    alertSuccessSent: {
      type: 'boolean',
    },
  },
});

const closeTicket = async function closeTicket() {
  const currentStatus = this.get('leadTicket.status');
  if (currentStatus === TicketStatus.CLOSED_WITHOUT_SALE || currentStatus === TicketStatus.CLOSED_WITH_SALE) {
    return;
  }
  await _common.addAction('lead', this, {
    createdAt: new Date(),
    name: TicketActionNames.LEAD_CLOSED,
    wasTransformedToSale: false,
    closedForInactivity: true,
  });
  await this.save();
};

// close tickets that were converted to sale
const closeTicketsConvertedToSale = async function closeConvertToSale() {
  const datas = await this.find({
    where: {
      'lead.isConvertedToSale': true,
      'lead.reportedAt': { gt: new Date('2018-04-20T22:00:00Z') },
      'leadTicket.status': { nin: [TicketStatus.CLOSED_WITH_SALE, null] },
    },
    order: 'lead.isConvertedToSale DESC',
  });
  log.debug(JS, `closeTicketsConvertedToSale - ${datas.length} data to process`);
  for (let i = 0; i < datas.length; i++) {
    if (datas[i].get('leadTicket.status') === TicketStatus.CLOSED_WITHOUT_SALE) {
      await _common.addAction('lead', datas[i], {
        createdAt: new Date(),
        name: TicketActionNames.LEAD_REOPENED,
        automaticReopen: true
      });
    }
    await _common.addAction('lead', datas[i], {
      createdAt: new Date(),
      name: TicketActionNames.LEAD_CLOSED,
      wasTransformedToSale: datas[i].get('lead.isConvertedToSale'),
      crossLeadConverted: datas[i].get('lead.isConvertedToSale'),
      automaticClose: true,
    });
    await datas[i].save();
  }
};
// destrooooy the ticket
const deleteTicket = async function deleteTicket() {
  this.set('leadTicket', null);
  await this.save();
  await _common._updateCloseTicketJob('leadTicket', this, null);
  return this;
};

async function sendFollowup() {
  const garage = await this.app().models.Garage.findById(this.garageId, { fields: { subscriptions: true } });
  if (!garage.isSubscribed('Lead')) return null; // If the garage is not subscribed to lead, we cancel the job
  const followupConfig = ContactsConfigs.email_followup_lead;
  const coordValidity = this.campaign_determineDataCoordsValidity(this);
  const onlyPhoneValid = coordValidity.phone && !coordValidity.email;
  const followupContactKey = onlyPhoneValid ? followupConfig.sms || followupConfig.key : followupConfig.key;
  return promisify(sendContactNow)(this, followupContactKey || null);
}

const prototypeMethods = {
  deleteTicket,
  closeTicket,
  sendFollowup,
};

const staticMethods = {
  closeTicketsConvertedToSale,
};
module.exports = { model, prototypeMethods, staticMethods };
