const util = require('util');
const Writable = require('stream').Writable;
// const debug = require('debug')('garagescore:common:lib:garagescore:garage-history:UnsatisfiedAggregatorStream');
const ticketStatus = require('../../../models/data/type/unsatisfied-ticket-status');
const dataTypes = require('../../../models/data/type/data-types');
const unsatisfiedFollowUpStatus = require('../../../models/data/type/unsatisfied-followup-status');

/**
 * Transform data to garageHistory
 * @param options
 * @returns {UnsatisfiedAggregatorStream}
 * @constructor
 */
function UnsatisfiedAggregatorStream(options) {
  if (!(this instanceof UnsatisfiedAggregatorStream)) {
    return new UnsatisfiedAggregatorStream(options);
  }
  if (!options) options = {}; // eslint-disable-line no-param-reassign
  options.objectMode = true; // eslint-disable-line no-param-reassign
  this.aggregationResult = {};
  this.aggregationResult['ALL_USERS'] = this.getEmptyGarageHistory();
  Writable.call(this, options);
}

util.inherits(UnsatisfiedAggregatorStream, Writable);

UnsatisfiedAggregatorStream.prototype.getAggregationResult = function getAggregationResult() {
  return this.aggregationResult;
};
UnsatisfiedAggregatorStream.prototype.getEmptyGarageHistory = function getEmptyGarageHistory() {
  const history = {
    countUnsatisfiedToRecontact: 0,
    countUnsatisfiedClosedTicket: 0,
    countUnsatisfiedActiveTicket: 0,
    countUnsatisfiedTicketSatisfied: 0,
    countUnsatisfiedTicket: 0,
    countSurveyUnsatisfied: 0,
    total: 0,
  };
  const emptyGHistory = {
    historyByType: {},
  };
  Object.assign(emptyGHistory, history);
  dataTypes.getJobs().forEach((job) => {
    // aggregationResult by job
    emptyGHistory.historyByType[job] = {};
    Object.assign(emptyGHistory.historyByType[job], history);
  });
  emptyGHistory.historyByType.other = {};
  Object.assign(emptyGHistory.historyByType.other, history);
  return emptyGHistory;
};

UnsatisfiedAggregatorStream.prototype.increment = function increment(field, job, frontDesk) {
  const aggregationResult = this.aggregationResult;

  if (frontDesk && frontDesk !== 'ALL_USERS') {
    if (!aggregationResult[frontDesk]) aggregationResult[frontDesk] = this.getEmptyGarageHistory();
    if (job) {
      aggregationResult[frontDesk].historyByType[job][field]++;
    }
    aggregationResult[frontDesk][field]++;
  }
  if (job) {
    aggregationResult['ALL_USERS'].historyByType[job][field]++;
  }
  aggregationResult['ALL_USERS'][field]++;
};

UnsatisfiedAggregatorStream.prototype._fillAggregationResult = function _fillAggregationResult(
  job,
  singleData,
  frontDesk
) {
  this.increment('countUnsatisfiedTicket', job, frontDesk);
  if (
    (singleData.get('unsatisfiedTicket.unsatisfactionResolved') === true &&
      singleData.get('unsatisfied.followupStatus') !== unsatisfiedFollowUpStatus.NOT_RESOLVED) || // eslint-disable-line max-len
    singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowUpStatus.RESOLVED // eslint-disable-line max-len
  ) {
    this.increment('countUnsatisfiedTicketSatisfied', job, frontDesk);
  }
  switch (singleData.get('unsatisfiedTicket.status')) {
    case ticketStatus.WAITING_FOR_CONTACT:
      this.increment('countUnsatisfiedToRecontact', job, frontDesk);
      break;
    case ticketStatus.WAITING_FOR_VISIT:
      this.increment('countUnsatisfiedActiveTicket', job, frontDesk);
      break;
    case ticketStatus.CLOSED_WITHOUT_RESOLUTION:
      this.increment('countUnsatisfiedClosedTicket', job, frontDesk);
      break;
    default:
      break;
  }
};

UnsatisfiedAggregatorStream.prototype._write = function _write(singleData, encoding, callback) {
  const frontDesk = singleData.get('service.frontDeskUserName');
  if (!this.aggregationResult[frontDesk]) this.aggregationResult[frontDesk] = this.getEmptyGarageHistory();

  if (!singleData.get('shouldSurfaceInStatistics') || !singleData.get('unsatisfiedTicket')) {
    callback();
    return;
  }
  this.increment('countSurveyUnsatisfied', null, frontDesk);
  if (!singleData.get('unsatisfiedTicket.createdAt')) {
    callback();
    return;
  }
  if (dataTypes.getJobs().includes(singleData.type))
    this._fillAggregationResult(singleData.type, singleData, frontDesk);
  else this._fillAggregationResult('other', singleData, frontDesk);
  callback();
};
module.exports = UnsatisfiedAggregatorStream;
