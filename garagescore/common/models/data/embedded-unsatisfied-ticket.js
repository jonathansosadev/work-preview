const {
  TicketActionNames,
  UnsatisfiedTicketClaimReasons,
  UnsatisfiedTicketProvidedSolutions,
  JobTypes,
} = require('../../../frontend/utils/enumV2');
const ticketStatus = require('./type/unsatisfied-ticket-status');
const DelayStatus = require('../../../common/models/data/type/delay-status.js');
const ContactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config');
const sendContactNow = require('../../../common/lib/garagescore/data-campaign/run/_send-contact-now.js');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler');
const TicketAction = require('./definition-helpers').TicketAction;
const _common = require('./_common-ticket');
const { promisify } = require('util');

/**
 * Unsatisfied support
 */
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
    unsatisfactionResolved: {
      type: 'boolean',
      required: true,
    },
    providedSolutions: [
      {
        type: UnsatisfiedTicketProvidedSolutions.type,
        required: true,
      },
    ],
    claimReasons: [
      {
        type: UnsatisfiedTicketClaimReasons.type,
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
    manager: {
      type: 'string',
    },
    alertSuccessSent: {
      type: 'boolean',
    },
  },
});

/**
 * update the unsatisfiedTicket DelayStatus which is used to determine the elapse time "status", ex: NEW, IMMINENT, EXCEEDED
 * @returns {Promise<void>}
 */
const updateDelayStatus = async function updateDelayStatus() {
  // Doesn't save the data, you should do it after calling this function
  if (!this.get('unsatisfiedTicket')) return;
  const closedAt = this.get('unsatisfiedTicket.closedAt')
    ? new Date(this.get('unsatisfiedTicket.closedAt'))
    : new Date();
  const createdAt = new Date(this.get('unsatisfiedTicket.createdAt'));
  let elapseTime = closedAt - createdAt;
  elapseTime /= 1000 * 60 * 60 * 24; // milli to days
  const expectedDelayStatus = DelayStatus.daysToDelayStatus(elapseTime);
  if (this.get('unsatisfiedTicket.delayStatus') === expectedDelayStatus) return;
  this.set('unsatisfiedTicket.delayStatus', expectedDelayStatus);
  const nextJobDelay = DelayStatus.getNextStepDelay(expectedDelayStatus);
  if (nextJobDelay) {
    // Calculate next job date
    const jobDate = new Date(createdAt);
    jobDate.setDate(jobDate.getDate() + nextJobDelay);
    await Scheduler.upsertJob(JobTypes.UPDATE_UNSATISFIED_DELAY_STATUS, { dataId: this.getId().toString() }, jobDate);
  }
};

const closeTicket = async function closeTicket() {
  const currentStatus = this.get('unsatisfiedTicket.status');
  if (
    currentStatus === ticketStatus.CLOSED_WITHOUT_RESOLUTION ||
    currentStatus === ticketStatus.CLOSED_WITH_RESOLUTION
  ) {
    return;
  }
  await _common.addAction('unsatisfied', this, {
    createdAt: new Date(),
    name: TicketActionNames.UNSATISFIED_CLOSED,
    unsatisfactionResolved: false,
    closedForInactivity: true,
  });
  await this.save();
};

// destrooooy the ticket
const deleteTicket = async function deleteTicket() {
  this.set('unsatisfiedTicket', null);
  await this.save();
  await _common._updateCloseTicketJob('unsatisfiedTicket', this, null);
  return this;
};

async function sendFollowup() {
  if (!this.review_isDetractor()) return null; // Shouldn't send the followup if the user changed his rating
  if (this.get('review.rating.value') !== 10 && this.get('review.rating.value') > 6) {
    // Filter 10, <6 so we don't take time to findById
    const garage = await this.app().models.Garage.findById(this.garageId);
    if (!garage) throw new Error(`Garage: ${this.garageId} of dataId: ${this.id} not found.`);
    if (!this.review_isSensitive(garage)) return null; // Shouldn't send the followup if the user changed his rating
  }
  const followupConfig = ContactsConfigs.getFollowup(this.type);
  const coordValidity = this.campaign_determineDataCoordsValidity(this);
  const onlyPhoneValid = coordValidity.phone && !coordValidity.email;
  const followupContactKey = onlyPhoneValid ? followupConfig.sms || followupConfig.key : followupConfig.key;
  return promisify(sendContactNow)(this, followupContactKey || null);
}

const prototypeMethods = {
  // setFollowUpDelay,
  updateDelayStatus,
  closeTicket,
  deleteTicket,
  sendFollowup,
};

const staticMethods = {};

module.exports = { model, prototypeMethods, staticMethods };
