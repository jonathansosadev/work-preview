const util = require('util');
const Writable = require('stream').Writable;
// const debug = require('debug')('garagescore:common:lib:garagescore:garage-history:LeadAggregatorStream');
const ticketStatus = require('../../../models/data/type/lead-ticket-status');

/**
 * Transform data to garageHistory
 * @param options
 * @returns {LeadAggregatorStream}
 * @constructor
 */
function LeadAggregatorStream(options) {
  if (!(this instanceof LeadAggregatorStream)) {
    return new LeadAggregatorStream(options);
  }
  if (!options) options = {}; // eslint-disable-line no-param-reassign
  options.objectMode = true; // eslint-disable-line no-param-reassign
  this.aggregationResult = {};
  this.aggregationResult['ALL_USERS'] = this.getEmptyGarageHistory();
  Writable.call(this, options);
}

util.inherits(LeadAggregatorStream, Writable);

LeadAggregatorStream.prototype.getAggregationResult = function getAggregationResult() {
  return this.aggregationResult;
};
LeadAggregatorStream.prototype.getEmptyGarageHistory = function getEmptyGarageHistory() {
  return {
    countLeadWaitingForContact: 0,
    countLeadWaitingForMeeting: 0,
    countLeadWaitingForProposition: 0,
    countLeadWaitingForClosing: 0,
    countLeadClosedTicket: 0,
    countLeadActiveTicket: 0,
    countLeadTicketTransformedToSale: 0,
    countLeadTicket: 0,
    countSurveyLead: 0,
    total: 0,
  };
};

LeadAggregatorStream.prototype.increment = function increment(field, frontDesk) {
  const aggregationResult = this.aggregationResult;

  if (frontDesk && frontDesk !== 'ALL_USERS') {
    if (!aggregationResult[frontDesk]) aggregationResult[frontDesk] = this.getEmptyGarageHistory();
    aggregationResult[frontDesk][field]++;
  }
  aggregationResult['ALL_USERS'][field]++;
};

LeadAggregatorStream.prototype._write = function _write(singleData, encoding, callback) {
  const frontDesk = singleData.get('service.frontDeskUserName');
  if (!this.aggregationResult[frontDesk]) this.aggregationResult[frontDesk] = this.getEmptyGarageHistory();

  if (!singleData.get('shouldSurfaceInStatistics') || !singleData.get('lead.potentialSale')) {
    callback();
    return;
  }
  this.increment('countSurveyLead');
  if (!singleData.get('leadTicket.createdAt')) {
    callback();
    return;
  }
  this.increment('countLeadTicket', frontDesk);
  if (singleData.get('leadTicket.wasTransformedToSale')) {
    this.increment('countLeadTicketTransformedToSale', frontDesk);
  }
  switch (singleData.get('leadTicket.status')) {
    case ticketStatus.NEW:
      this.increment('countLeadWaitingForContact', frontDesk);
      break;
    case ticketStatus.WAITING_FOR_CONTACT:
      this.increment('countLeadWaitingForContact', frontDesk);
      break;
    case ticketStatus.WAITING_FOR_MEETING:
      this.increment('countLeadWaitingForMeeting', frontDesk);
      this.increment('countLeadActiveTicket', frontDesk);
      break;
    case ticketStatus.WAITING_FOR_PROPOSITION:
      this.increment('countLeadWaitingForProposition', frontDesk);
      this.increment('countLeadActiveTicket', frontDesk);
      break;
    case ticketStatus.WAITING_FOR_CLOSING:
      this.increment('countLeadWaitingForClosing', frontDesk);
      this.increment('countLeadActiveTicket', frontDesk);
      break;
    case ticketStatus.CLOSED:
      this.increment('countLeadClosedTicket', frontDesk);
      break;
    default:
      break;
  }
  callback();
};
module.exports = LeadAggregatorStream;
