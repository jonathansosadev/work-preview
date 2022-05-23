const config = require('config');
const { ObjectId } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const DataFilters = require('../_common/data-generate-filters');
const { garagesWanted } = require('../_common/search-garages');
const { dataGetLeadsList } = require('../../../../frontend/api/graphql/definitions/queries.json');
const followupLeadStatus = require('../_common/followup-lead-status');

const { SourceTypes } = require('../../../../frontend/utils/enumV2');

const i18nRequire = require('../../../../common/lib/garagescore/i18n/i18n');
const prefix = 'dataGetLeadsList';
const resolveFunctions = {
  Date: GraphQLDate,
};
module.exports.typeDef = `
  extend type Query {
    ${dataGetLeadsList.type}: ${prefix}LeadsList
  }
  type ${prefix}LeadsList {
    datas: [${prefix}Data]
    hasMore: Boolean
    cursor: Date
    noResultGodMode: Boolean
  }
  type ${prefix}Data {
    id: ID
    garage: ${prefix}Garage # Custom type Garage
    source: ${prefix}Source
    review: ${prefix}Review
    customer: ${prefix}Customer
    lead: ${prefix}Lead
    leadTicket: ${prefix}LeadTicket
    surveyFollowupLead: ${prefix}SurveyFollowupLead
    followupLeadStatus: String # Custom type followupLeadStatus
  }

  type ${prefix}Garage {
    id: ID
    publicDisplayName: String
  }

  type ${prefix}Source {
    type: String
    by: String
    campaign: String
    agent: ${prefix}Agent
  }
  """Custom type Agent"""
  type ${prefix}Agent {
    id: ID
    publicDisplayName: String
  }

  type ${prefix}Review {
    rating: ${prefix}Rating
    comment: ${prefix}Comment
  }
  type ${prefix}Rating {
    value: Float
  }
  type ${prefix}Comment {
    text: String
  }

  type ${prefix}Customer {
    fullName: ${prefix}Revisable
    contact: ${prefix}Contact
    city: ${prefix}Revisable
  }
  type ${prefix}Contact {
    mobilePhone: ${prefix}Revisable
    email: ${prefix}Revisable
  }
  type ${prefix}Revisable {
    value: String
  }

  type ${prefix}Lead {
    type: String
  }

  type ${prefix}LeadTicket {
    saleType: String
    requestType: String
    createdAt: Date
    referenceDate: Date
    bodyType: [String]
    energyType: [String]
    cylinder: [String]
    sourceSubtype: String
    financing: String
    tradeIn: String
    timing: String
    manager: ${prefix}Manager # Custom type Manager
    brandModel: String
    status: String
    actions: [${prefix}Actions]
    followup: ${prefix}Followup
    vehicle: ${prefix}Vehicle
    budget: String
  }
  """Custom type Manager"""
  type ${prefix}Manager {
    id: ID
    firstName: String
    lastName: String
    email: String
  }
  type ${prefix}Actions {
    name: String
    createdAt: Date
    closedForInactivity: Boolean
    reminderDate: String
    reminderActionName: String
    reminderStatus: String
  }
  type ${prefix}Followup {
    recontacted: Boolean
    satisfied: Boolean
    satisfiedReasons: [String]
    notSatisfiedReasons: [String]
    appointment: String
  }
  """Custom type SurveyFollowupLead"""
  type ${prefix}SurveyFollowupLead {
    sendAt: Date
    firstRespondedAt: Date
  }
  type ${prefix}Vehicle {
    makeModel: String
  }
`;

module.exports.resolvers = {
  Query: {
    [prefix]: async (parent, args, context, { returnType }) => {
      console.time(returnType);

      const {
        app,
        scope: { logged, authenticationError, garageIds, user, locale = 'fr' },
      } = context;
      const {
        limit: limitArg,
        before: beforeArg = null,
        followed = false,
        periodId,
        garageId,
        cockpitType,
        search,
        leadBodyType,
        leadFinancing,
        leadTiming,
        leadSaleType,
        leadManager,
        leadStatus,
        leadSource,
        followupLeadStatus,
      } = args;
      if (!logged) throw new AuthenticationError(authenticationError);
      // [Scopes Poc] allow adelaide
      const isAdelaide = () => user.getId() && ObjectId('5bd339aa981fc80014a950c3').equals(user.getId());

      // PR #5255 Make user as manger if one of his garages as leadsVisibleToEveryone property to true
      const isOneGarageLeadsVisibleToEveryone = async () =>
        !!(await app.models.Garage.getMongoConnector().findOne(
          { _id: { $in: garageIds }, leadsVisibleToEveryone: true },
          { projection: { _id: true } }
        ));

      if (user.isGod() && !garageId && !isAdelaide()) {
        return {
          datas: [],
          hasMore: false,
          cursor: null,
          noResultGodMode: true,
        };
      }
      // Yeah even when we tell Apollo before is a Date... It give it us as a string
      const before = beforeArg && new Date(beforeArg);
      const isManager = user.isGod() || (await user.isManager()) || (await isOneGarageLeadsVisibleToEveryone());
      const userGarages = await garagesWanted(app, cockpitType, garageId, garageIds);
      let query = new DataFilters()
        .setBasicFilterForLeadsList()
        .setGarageId(userGarages, garageId, { followed })
        .setPeriodId(periodId, { dateField: 'leadTicket.referenceDate', filterDefaultDate: true, before })
        .setSearch(search)
        .setLeadBodyType(leadBodyType)
        .setLeadFinancing(leadFinancing)
        .setLeadTiming(leadTiming)
        .setLeadSaleType(leadSaleType)
        .setLeadManager(leadManager, { defaultManager: user, isManager, followed })
        .setLeadStatus(leadStatus)
        .setLeadSource(leadSource)
        .setFollowupLeadStatus(followupLeadStatus)
        .generateMatch();
      const projection = {
        id: '$_id',
        garageId: true, // for garage.id & garage.publicDisplayName
        source: {
          type: true,
          by: true,
          garageId: true, // for agent.id and agent.publicDisplayName
        },
        review: {
          rating: {
            value: true,
          },
          comment: {
            text: true,
          },
        },
        customer: {
          fullName: {
            value: true,
          },
          contact: {
            mobilePhone: true,
            email: true,
          },
          city: {
            value: true,
          },
        },
        lead: {
          type: true,
          potentialSale: true,
          isConverted: true,
        },
        leadTicket: {
          saleType: true,
          requestType: true,
          createdAt: true,
          referenceDate: true,
          bodyType: true,
          energyType: true,
          cylinder: true,
          sourceSubtype: true,
          financing: true,
          tradeIn: true,
          timing: true,
          manager: true, // for manager.(id, firstName, lastName, email)
          brandModel: true,
          followUpDelayDays: true,
          status: true,
          automationCampaignId: true,
          budget: {
            $cond: { if: { $gt: ['$leadTicket.budget', 0] }, then: 'leadTicket.budget', else: '-' },
          },
          actions: {
            name: true,
            createdAt: true,
            closedForInactivity: true,
            reminderDate: true,
            reminderActionName: true,
            reminderStatus: true,
          },
          followup: {
            recontacted: true,
            satisfied: true,
            satisfiedReasons: true,
            notSatisfiedReasons: true,
            appointment: true,
          },
          vehicle: {
            makeModel: true,
          },
        },
        surveyFollowupLead: {
          sendAt: true,
          firstRespondedAt: true,
        },
      };

      const sort = { 'leadTicket.referenceDate': -1 };
      // Todo => Replace skip by after param
      const limit = limitArg < 1 || limitArg > 100 ? config.get('server.queryLimits.list') + 1 : limitArg + 1;

      // [Scopes Poc] : new query for Adelaide
      // [Scopes Poc] : if a garageId is selected , do not use scopes
      if (user && user.scope && isAdelaide() && !garageId) {
        delete query.garageId;
        query = { scopes: ObjectId(user.scope), ...query };
      }
      // -------------------------------------
      const datas = await app.models.Data.getMongoConnector().find(query, { projection, sort, limit }).toArray();

      const hasMore = datas.length === limit;
      if (hasMore) {
        datas.pop();
      }
      const cursor = hasMore && datas[datas.length - 1].leadTicket && datas[datas.length - 1].leadTicket.referenceDate;

      const garageIdsToFetch = [
        ...datas.map(({ garageId }) => garageId),
        ...datas.map(({ source }) => source && source.garageId),
      ]
        .filter((gId, i, list) => gId && list.indexOf(gId) === i)
        .map((gId) => new ObjectId(gId));

      const garages = await app.models.Garage.getMongoConnector()
        .find({ _id: { $in: garageIdsToFetch } }, { projection: { id: '$_id', publicDisplayName: true } })
        .toArray();

      const userIdsToFetch = datas
        .map(({ leadTicket }) => leadTicket.manager.toString())
        .filter((uId, i, list) => ObjectId.isValid(uId) && list.indexOf(uId) === i)
        .map((uId) => new ObjectId(uId));
      const representedManagers = await app.models.User.getMongoConnector()
        .find(
          { _id: { $in: userIdsToFetch } },
          { projection: { id: '$_id', firstName: true, lastName: true, email: true } }
        )
        .toArray();

      const automationCampaignIds = datas
        .filter((data) => data.source && data.source.type === SourceTypes.AUTOMATION)
        .map((data) => ObjectId(data.leadTicket.automationCampaignId.toString()));
      const automationCampaigns = await app.models.AutomationCampaign.getMongoConnector()
        .find({ _id: { $in: automationCampaignIds } }, { projection: { _id: true, target: true } })
        .toArray();
      // for Automation, get campaignName
      datas.forEach((data) => {
        const campaign = automationCampaigns.find(({ _id }) => {
          return (
            data.leadTicket.automationCampaignId && data.leadTicket.automationCampaignId.toString() === _id.toString()
          );
        });
        if (campaign) {
          let tag = 'apv';
          if (/NVS/.test(campaign.target)) tag = 'vn';
          if (/UVS/.test(campaign.target)) tag = 'vo';

          const AutomationCampaignTargetNames = new i18nRequire('common/models/automation-campaign', { locale });
          const tagName = AutomationCampaignTargetNames.$t(tag);
          const campaignName = AutomationCampaignTargetNames.$t(campaign.target);
          data.source.campaign = `${campaignName} - ${tagName}`;
        }
      });

      context.garages = Object.fromEntries(garages.map((garage) => [garage.id, garage]));
      context.representedManagers = Object.fromEntries(representedManagers.map((user) => [user.id, user]));

      console.timeEnd(returnType);
      return { datas, hasMore, cursor };
    },
  },
  [`${prefix}Data`]: {
    garage: async ({ garageId }, args, { garages }) => {
      return garages[garageId] || null;
    },
    followupLeadStatus: async (data) => {
      return followupLeadStatus(data);
    },
  },
  [`${prefix}LeadTicket`]: {
    /** Get manager details */
    manager: async ({ manager: managerId }, args, { representedManagers }) => {
      if (!managerId) return null;
      return representedManagers[managerId.toString()] || null;
    },
  },
  [`${prefix}Source`]: {
    agent: async ({ garageId, type }, args, { garages }) => {
      if (!garageId || type !== 'Agent') return null;
      return garages[garageId.toString()] || null;
    },
  },
};
