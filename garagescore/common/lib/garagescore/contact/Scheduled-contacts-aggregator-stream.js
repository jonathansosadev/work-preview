const util = require('util');
const Writable = require('stream').Writable;
const ObjectUtil = require('../../../../common/lib/util/object');

/**
 * Transform campaignItems to scheduledContacts
 * @param options
 * @returns {ScheduledContactAggregetorStream}
 * @constructor
 */
function ScheduledContactAggregetorStream(options) {
  if (!(this instanceof ScheduledContactAggregetorStream)) {
    return new ScheduledContactAggregetorStream(options);
  }
  if (!options) options = {}; // eslint-disable-line no-param-reassign
  options.objectMode = true; // eslint-disable-line no-param-reassign
  this.aggregationResult = {};
  this.groupBy = 'campaign.contactScenario.nextCampaignContactDay';
  this.checkRecontact = options.checkRecontact;
  if (options.groupBy) {
    this.groupBy = options.groupBy;
  }
  Writable.call(this, options);
}

util.inherits(ScheduledContactAggregetorStream, Writable);

ScheduledContactAggregetorStream.prototype.getAggregationResult = function getAggregationResult() {
  return this.aggregationResult;
};

ScheduledContactAggregetorStream.recontacts = 'Recontact(s)';

ScheduledContactAggregetorStream.prototype._write = function _write(data, encoding, callback) {
  try {
    let a = null;
    // dataField (ie the field we will group the results by) can be the garageId or the contactDay
    const dataField =
      ObjectUtil.getDeepFieldValue(data, this.groupBy) || data.get('campaign.contactScenario.nextCampaignReContactDay');
    if (dataField) {
      if (!this.aggregationResult[dataField]) {
        this.aggregationResult[dataField] = {};
      }
      if (data.get('campaign.contactScenario.nextCampaignContact')) {
        a = this.aggregationResult[dataField];
        if (!a[data.get('campaign.contactScenario.nextCampaignContact')]) {
          a[data.get('campaign.contactScenario.nextCampaignContact')] = 0;
        }
        a[data.get('campaign.contactScenario.nextCampaignContact')]++;
      }
    }
    if (this.checkRecontact) {
      if (data.get('campaign.contactScenario.nextCampaignReContactDay')) {
        const nextCampaignReContactDay = data.get('campaign.contactScenario.nextCampaignReContactDay');
        const field =
          this.groupBy === 'campaign.contactScenario.nextCampaignContactDay' ? nextCampaignReContactDay : dataField;
        a = this.aggregationResult[field];
        if (!a) {
          this.aggregationResult[field] = {};
          a = this.aggregationResult[field];
        }
        if (!a[ScheduledContactAggregetorStream.recontacts]) {
          a[ScheduledContactAggregetorStream.recontacts] = 0;
        }
        a[ScheduledContactAggregetorStream.recontacts]++;
      }
    }
    callback();
  } catch (err) {
    callback(err);
  }
};
module.exports = ScheduledContactAggregetorStream;
