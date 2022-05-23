const debug = require('debug')('garagescore:common:models:campaign-filter'); // eslint-disable-line max-len,no-unused-vars
const gsCampaignFilterSource = require('./campaign-filter.source');
const gsCampaignFilterType = require('./campaign-filter.type');
const moment = require('moment');

module.exports = function CampaignFilterDefinition(CampaignFilter) {
  CampaignFilter.findOrCreateFromMailgunBounceDump = function findOrCreateFromMailgunBounceDump(
    mailgunBounceDump,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Expect a Mailgun bounce dump such as returned by the Mailgun API:
     * {
     *   "address": "alice@example.com",
     *   "code": "550",
     *   "error": "No such mailbox",
     *   "created_at": "Fri, 21 Oct 2011 11:02:55 GMT"
     * }
     */
    if (typeof mailgunBounceDump === 'undefined' || typeof mailgunBounceDump.address === 'undefined') {
      callback('No e-mail address in mailgunBounceDump argument');
      return;
    }

    /*
     * Attempt to find a filter with same base properties
     * Loopback can currently not filter on nested properties
     * Therefore the query has to be made directly using the Mongo connection.
     * See: https://github.com/strongloop/loopback/issues/517
     */
    const _mongoFindQuery = {
      type: gsCampaignFilterType.NO_CONTACT,
      source: gsCampaignFilterSource.MAILGUN_BOUNCES,
      'matchQuery.customer.contactChannel.email.address': mailgunBounceDump.address,
    };
    CampaignFilter._mongoFindOne(_mongoFindQuery, (err, foundCampaignFilter) => {
      if (err) {
        callback(err);
        return;
      }

      if (foundCampaignFilter !== null) {
        // Just return Campaign Filter if found
        callback(null, foundCampaignFilter);
        return;
      }

      const campaignFilter = {};
      campaignFilter.type = gsCampaignFilterType.NO_CONTACT;
      campaignFilter.description =
        typeof mailgunBounceDump.error !== 'undefined'
          ? mailgunBounceDump.error
          : `Bounced on ${moment(new Date(mailgunBounceDump.created_at)).toDate()}.`;
      campaignFilter.source = gsCampaignFilterSource.MAILGUN_BOUNCES;
      campaignFilter.matchQuery = {
        customer: {
          contactChannel: {
            email: {
              address: mailgunBounceDump.address,
            },
          },
        },
      };

      CampaignFilter.create(campaignFilter, callback);
    });
  };

  CampaignFilter.findOrCreateFromMailgunBouncedEvent = function findOrCreateFromMailgunBouncedEvent(
    mailgunBouncedEvent,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Expect a Mailgun 'bounced' event such as returned by the Mailgun Events API:
     * {
     *   "recipient": "alice@example.com",
     *   "code": "550",
     *   "error": "No such mailbox",
     *   "timestamp": 1441294707.629592
     * }
     */
    if (typeof mailgunBouncedEvent === 'undefined' || typeof mailgunBouncedEvent.recipient === 'undefined') {
      callback('No e-mail address in mailgunBouncedEvent argument');
      return;
    }

    /*
     * Attempt to find a filter with same base properties
     * Loopback can currently not filter on nested properties
     * Therefore the query has to be made directly using the Mongo connection.
     * See: https://github.com/strongloop/loopback/issues/517
     */
    const _mongoFindQuery = {
      type: gsCampaignFilterType.NO_CONTACT,
      source: gsCampaignFilterSource.MAILGUN_BOUNCES,
      'matchQuery.customer.contactChannel.email.address': mailgunBouncedEvent.recipient,
    };
    CampaignFilter._mongoFindOne(_mongoFindQuery, (err, foundCampaignFilter) => {
      if (err) {
        callback(err);
        return;
      }

      if (foundCampaignFilter !== null) {
        // Just return Campaign Filter if found
        callback(null, foundCampaignFilter);
        return;
      }

      const campaignFilter = {};
      campaignFilter.type = gsCampaignFilterType.NO_CONTACT;
      campaignFilter.description =
        typeof mailgunBouncedEvent.error !== 'undefined'
          ? mailgunBouncedEvent.error
          : `Bounced on ${moment(mailgunBouncedEvent.timestamp, 'X').toDate()}}.`;
      campaignFilter.source = gsCampaignFilterSource.MAILGUN_BOUNCES;
      campaignFilter.matchQuery = {
        customer: {
          contactChannel: {
            email: {
              address: mailgunBouncedEvent.recipient,
            },
          },
        },
      };

      CampaignFilter.create(campaignFilter, callback);
    });
  };

  CampaignFilter.findOrCreateFromMailgunComplaintDump = function findOrCreateFromMailgunComplaintDump(
    mailgunComplaintDump,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Expect a mailgunComplaintDump parameter such as returned by the Mailgun API:
     * {
     *   "address": "alice@example.com",
     *   "created_at": "Fri, 21 Oct 2011 11:02:55 GMT"
     * }
     */
    if (typeof mailgunComplaintDump === 'undefined' || typeof mailgunComplaintDump.address === 'undefined') {
      callback('No e-mail address in mailgunComplaintDump argument');
      return;
    }

    /*
     * Attempt to find a filter with same base properties
     * Loopback can currently not filter on nested properties
     * Therefore the query has to be made directly using the Mongo connection.
     * See: https://github.com/strongloop/loopback/issues/517
     */
    const _mongoFindQuery = {
      type: gsCampaignFilterType.NO_CONTACT,
      source: gsCampaignFilterSource.MAILGUN_COMPLAINTS,
      'matchQuery.customer.contactChannel.email.address': mailgunComplaintDump.address,
    };
    CampaignFilter._mongoFindOne(_mongoFindQuery, (err, foundCampaignFilter) => {
      if (err) {
        callback(err);
        return;
      }

      if (foundCampaignFilter !== null) {
        // Just return Campaign Filter if found
        callback(null, foundCampaignFilter);
        return;
      }

      const campaignFilter = {};
      campaignFilter.type = gsCampaignFilterType.NO_CONTACT;
      campaignFilter.description = `Customer complained on ${moment(
        new Date(mailgunComplaintDump.created_at)
      ).toDate()}.`;
      campaignFilter.source = gsCampaignFilterSource.MAILGUN_COMPLAINTS;
      campaignFilter.matchQuery = {
        customer: {
          contactChannel: {
            email: {
              address: mailgunComplaintDump.address,
            },
          },
        },
      };

      CampaignFilter.create(campaignFilter, callback);
    });
  };

  CampaignFilter.findOrCreateFromMailgunUnsubscribeDump = function findOrCreateFromMailgunUnsubscribeDump(
    mailgunUnsubscribeDump,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Expect a Mailgun unsubscribe dump such as returned by the Mailgun API:
     * {
     *   "address": "alice@example.com",
     *   "tag": "*",
     *   "created_at": "Fri, 21 Oct 2011 11:02:55 GMT"
     * }
     */
    if (typeof mailgunUnsubscribeDump === 'undefined' || typeof mailgunUnsubscribeDump.address === 'undefined') {
      callback('No e-mail address in Mailgun UnsubscribeDump argument');
      return;
    }

    /*
     * Attempt to find a filter with same base properties
     * Loopback can currently not filter on nested properties
     * Therefore the query has to be made directly using the Mongo connection.
     * See: https://github.com/strongloop/loopback/issues/517
     */
    const _mongoFindQuery = {
      type: gsCampaignFilterType.NO_CONTACT,
      source: gsCampaignFilterSource.MAILGUN_UNSUBSCRIBES,
      'matchQuery.customer.contactChannel.email.address': mailgunUnsubscribeDump.address,
    };
    CampaignFilter._mongoFindOne(_mongoFindQuery, (err, foundCampaignFilter) => {
      if (err) {
        callback(err);
        return;
      }

      if (foundCampaignFilter !== null) {
        // Just return Campaign Filter if found
        callback(null, foundCampaignFilter);
        return;
      }

      const campaignFilter = {};
      campaignFilter.type = gsCampaignFilterType.NO_CONTACT;
      campaignFilter.description = `Customer unsubscribed on ${moment(
        new Date(mailgunUnsubscribeDump.created_at)
      ).toDate()}.`;
      campaignFilter.source = gsCampaignFilterSource.MAILGUN_UNSUBSCRIBES;
      campaignFilter.matchQuery = {
        customer: {
          contactChannel: {
            email: {
              address: mailgunUnsubscribeDump.address,
            },
          },
        },
      };

      CampaignFilter.create(campaignFilter, callback);
    });
  };

  CampaignFilter.findOrCreateFromMailgunUnsubscribedEvent = function findOrCreateFromMailgunUnsubscribedEvent(
    mailgunUnsubscribedEvent,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Expect a Mailgun 'unsubscribed' event such as returned by the Mailgun Events API:
     * {
     *   "recipient": "alice@example.com",
     *   "timestamp": 1441294707.629592
     * }
     */
    if (typeof mailgunUnsubscribedEvent === 'undefined' || typeof mailgunUnsubscribedEvent.recipient === 'undefined') {
      callback('No e-mail address in mailgunUnsubscribedEvent argument');
      return;
    }

    /*
     * Attempt to find a filter with same base properties
     * Loopback can currently not filter on nested properties
     * Therefore the matchQuery has to be made directly using the Mongo connection.
     * See: https://github.com/strongloop/loopback/issues/517
     */
    const _mongoFindQuery = {
      type: gsCampaignFilterType.NO_CONTACT,
      source: gsCampaignFilterSource.MAILGUN_UNSUBSCRIBES,
      'matchQuery.customer.contactChannel.email.address': mailgunUnsubscribedEvent.recipient,
    };
    CampaignFilter._mongoFindOne(_mongoFindQuery, (err, foundCampaignFilter) => {
      if (err) {
        callback(err);
        return;
      }

      if (foundCampaignFilter !== null) {
        // Just return Campaign Filter if found
        callback(null, foundCampaignFilter);
        return;
      }

      const campaignFilter = {};
      campaignFilter.type = gsCampaignFilterType.NO_CONTACT;
      campaignFilter.description =
        typeof mailgunUnsubscribedEvent.error !== 'undefined'
          ? mailgunUnsubscribedEvent.error
          : `Unsubscribed on ${moment(mailgunUnsubscribedEvent.timestamp, 'X').toDate()}.`;
      campaignFilter.source = gsCampaignFilterSource.MAILGUN_UNSUBSCRIBES;
      campaignFilter.matchQuery = {
        customer: {
          contactChannel: {
            email: {
              address: mailgunUnsubscribedEvent.recipient,
            },
          },
        },
      };

      CampaignFilter.create(campaignFilter, callback);
    });
  };
};
