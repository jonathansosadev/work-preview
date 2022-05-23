/**
 * this file contain the common arguments and filter for the list and the export query
 */
const graphql = require('graphql');
const config = require('config');
const queriesCommon = require('../_common');
const GarageHistoryPeriod = require('../../../../../../models/garage-history.period');
const CampaignContactStatus = require('../../../../../../models/data/type/campaign-contact-status');
const CampaignStatus = require('../../../../../../models/data/type/campaign-status');
const DataTypes = require('../../../../../../models/data/type/data-types');
const SourceTypes = require('../../../../../../models/data/type/source-types');
const ContactTicketStatus = require('../../../../../../../common/models/data/type/contact-ticket-status.js');

module.exports = {
  argumentsDefinition: {
    limit: {
      name: 'limit',
      default: 10, // for documentation only graphgl not support default attribute
      type: graphql.GraphQLInt,
    },
    skip: {
      name: 'skip',
      type: graphql.GraphQLInt,
    },
    contactsOrder: {
      name: 'periodId',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    periodId: {
      name: 'periodId',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    search: {
      name: 'search',
      type: graphql.GraphQLString,
    },
    garageId: {
      name: 'garageId',
      type: graphql.GraphQLString,
    },
    cockpitType: {
      name: 'cockpitType',
      type: graphql.GraphQLString,
    },
    type: {
      name: 'type',
      type: graphql.GraphQLString,
    },
    customerEmailStatus: {
      name: 'emailStatus',
      type: graphql.GraphQLString,
    },
    customerPhoneStatus: {
      name: 'phoneStatus',
      type: graphql.GraphQLString,
    },
    campaignStatus: {
      name: 'campaignStatus',
      type: graphql.GraphQLString,
    },
    revisionStatus: {
      name: 'revisionStatus',
      type: graphql.GraphQLString,
    },
    ticketStatus: {
      name: 'ticketStatus',
      type: graphql.GraphQLString,
    },
    dataId: {
      name: 'dataId',
      type: graphql.GraphQLString,
    },
    frontDeskUserName: {
      name: 'frontDeskUserName',
      type: graphql.GraphQLString,
    },
  },
  // FOR MIGRATION ADD YOUR METHODS IN : server/webservers-standalones/api/_common/data-generate-filters.js
  async generateFilters(args, req) {
    const filters = {
      limit: args.limit < 1 || args.limit > 100 ? config.get('server.queryLimits.list') : args.limit,
      where: { 'source.type': SourceTypes.DATAFILE },
      order: `service.providedAt ${args.contactsOrder}`,
    };
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    if (args.periodId !== GarageHistoryPeriod.ALL_HISTORY) {
      if (!filters.where.and) {
        filters.where.and = []; // eslint-disable-line no-param-reassign
      }
      filters.where.and.push({ 'service.providedAt': { gte: GarageHistoryPeriod.getPeriodMinDate(args.periodId) } });
      filters.where.and.push({ 'service.providedAt': { lte: GarageHistoryPeriod.getPeriodMaxDate(args.periodId) } });
    }
    await queriesCommon.addGarageIdToFilters(req, args, filters);
    if (args.type) {
      filters.where.type = args.type;
    }
    if (args.frontDeskUserName) {
      filters.where['service.frontDeskUserName'] = args.frontDeskUserName;
    }
    if (args.customerEmailStatus) {
      filters.where['campaign.contactStatus.emailStatus'] = args.customerEmailStatus;
    }
    if (args.customerPhoneStatus) {
      filters.where['campaign.contactStatus.phoneStatus'] = args.customerPhoneStatus;
    }
    if (args.campaignStatus) {
      if (args.campaignStatus === 'ReceivedResponded') {
        filters.where['campaign.contactStatus.status'] = CampaignContactStatus.RECEIVED;
        // this is optimisation to not use all the time the $exists filter in mongo and use the review.createdAt instead witch is indexed
        if (args.periodId !== GarageHistoryPeriod.ALL_HISTORY) {
          filters.where['review.createdAt'] = { gte: GarageHistoryPeriod.getPeriodMinDate(args.periodId) };
        } else {
          filters.where.review = { exists: true };
        }
      } else if (args.campaignStatus === 'ReceivedNotResponded') {
        filters.where['campaign.contactStatus.status'] = CampaignContactStatus.RECEIVED; // { inq: [ , CampaignContactStatus.SCHEDULED] };
        filters.where.review = { exists: false };
      } else {
        filters.where['campaign.contactStatus.status'] = args.campaignStatus;
      }
    } else if (!filters.where.type) {
      filters.where.type = { neq: DataTypes.UNKNOWN };
    }
    if (args.revisionStatus === 'Validated') {
      filters.where['customer.isValidated'] = true;
      filters.where['customer.isRevised'] = { neq: true };
    }
    if (args.revisionStatus === 'Revised') {
      filters.where['customer.isRevised'] = true;
    }
    if (args.revisionStatus === 'NotValidated') {
      filters.where['customer.isValidated'] = { neq: true };
    }
    if (args.ticketStatus) {
      if (args.ticketStatus === ContactTicketStatus.TO_RECONTACT) {
        if (
          (!filters.where['campaign.contactStatus.phoneStatus'] ||
            filters.where['campaign.contactStatus.phoneStatus'] === 'Valid') &&
          (!filters.where['campaign.contactStatus.status'] ||
            filters.where['campaign.contactStatus.status'] === CampaignContactStatus.RECEIVED)
        ) {
          filters.where.contactTicket = { exists: false };
          filters.where.review = { exists: false };
          filters.where['campaign.contactStatus.status'] = CampaignContactStatus.RECEIVED;
          filters.where['campaign.contactScenario.firstContactedAt'] = { lte: fiveDaysAgo };
          filters.where['campaign.contactStatus.phoneStatus'] = 'Valid';
        } else filters.where['service.providedAt'] = 42; // This is a trick to show NOTHING when we try to combine a phoneStatus/toRecontact
      } else if (args.ticketStatus === ContactTicketStatus.NOT_POSSIBLE) {
        filters.where.contactTicket = null;
        if (!filters.where.or) filters.where.or = [];
        filters.where.or.push({ 'campaign.contactStatus.status': { neq: CampaignContactStatus.RECEIVED } });
        filters.where.or.push({ 'review.createdAt': { gte: GarageHistoryPeriod.getPeriodMinDate(args.periodId) } });
        filters.where.or.push({ 'campaign.contactScenario.firstContactedAt': { gt: fiveDaysAgo } });
        filters.where.or.push({ 'campaign.contactStatus.phoneStatus': { neq: 'Valid' } });
      } else {
        filters.where['contactTicket.status'] = args.ticketStatus;
      }
    }
    filters.where['campaign.status'] = { neq: CampaignStatus.CANCELLED };

    if (args.search) {
      queriesCommon.addTextSearchToFilters(filters, args.search);
    }
    if (args.dataId) {
      filters.where = {
        id: args.dataId,
      };
    }
    filters.where.shouldSurfaceInStatistics = true;
    return filters;
  },
  getLocale(req) {
    let locale;
    if (req.headers && req.headers['gs-locale']) {
      locale = req.headers['gs-locale'].split(',')[0].toLocaleLowerCase().substring(0, 2);
    }
    return ['en', 'es', 'fr'].includes(locale) ? locale : 'fr';
  },
};
