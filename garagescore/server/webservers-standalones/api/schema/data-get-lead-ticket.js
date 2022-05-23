/* Get lead ticket for manager */
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { dataGetLeadTicket } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { ObjectId } = require('mongodb');
const followupLeadStatus = require('../_common/followup-lead-status');
const i18nRequire = require('../../../../common/lib/garagescore/i18n/i18n');

const prefix = 'dataGetLeadTicket';
module.exports.typeDef = `
  extend type Query {
    ${dataGetLeadTicket.type}: ${prefix}Data
  }
  type ${prefix}Data {
    id: ID
    type: String
    source: ${prefix}Source
    review: ${prefix}Review
    lead: ${prefix}Lead
    garage: ${prefix}Garage # Custom type Garage
    leadTicket: ${prefix}LeadTicket
    surveyFollowupLead: ${prefix}SurveyFollowupLead
    customer: ${prefix}Customer
    followupLeadStatus: String # Custom type followupLeadStatus
  }
  type ${prefix}Customer {
    city: ${prefix}City
  }
  type ${prefix}City {
    value: String
  }
  type ${prefix}SurveyFollowupLead {
    sendAt: Date
    firstRespondedAt: Date
  }
  type ${prefix}Lead {
    reportedAt: Date
    type: String
    brands: [String]
  }
  type ${prefix}Source {
    type: String
    by: String
    agent: ${prefix}Agent
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
  type ${prefix}LeadTicket {
    knowVehicle: Boolean
    leadVehicle: String
    tradeIn: String
    energyType: [String]
    cylinder: [String]
    bodyType: [String]
    financing: String
    timing: String
    saleType: String
    requestType: String
    status: String
    budget: Float
    comment: String
    message: String
    adUrl: String
    wasTransformedToSale: String
    vehicle: ${prefix}Vehicle
    sourceSubtype: String
    temperature: String
    brandModel: String
    closedAt: Date
    createdAt: Date
    followup: ${prefix}Followup
    customer: ${prefix}TicketCustomer
    actions: [${prefix}Actions]
    manager: ${prefix}Manager # Custom value
    automationCampaign: ${prefix}AutomationCampaign # Custom value
  }
  type ${prefix}Actions {
    name: String
    createdAt: Date
    comment: String
    selfAssigned: Boolean
    sourceType: String
    phone: String
    message: String
    adUrl: String
    missedSaleReason: [String]
    wasTransformedToSale: Boolean
    isManual: Boolean
    crossLeadConverted: Boolean
    closedForInactivity: Boolean
    automaticReopen: Boolean
    reminderFirstDay: Int
    reminderStatus: String
    reminderDate: String
    reminderNextDay: Int
    reminderActionName: String
    newValue: String
    previousValue: String
    newArrayValue: [String]
    previousArrayValue: [String]
    field: String
    followupLeadSendDate: Date
    followupLeadResponseDate: Date
    followupLeadRecontacted: Boolean
    followupLeadSatisfied: Boolean
    followupLeadSatisfiedReasons: [String]
    followupLeadNotSatisfiedReasons: [String]
    followupLeadAppointment: String
    reminderTriggeredBy: ${prefix}ActionUser
    assigner: ${prefix}ActionUser
    ticketManager: ${prefix}ActionUser
    previousTicketManager: ${prefix}ActionUser
  }
  type ${prefix}TicketCustomer {
    fullName: String
    contact: ${prefix}Contact
  }
  type ${prefix}Contact {
    mobilePhone: String
    email: String
  }
  type ${prefix}Followup {
    recontacted: Boolean
    satisfied: Boolean
    satisfiedReasons: [String]
    notSatisfiedReasons: [String]
    appointment: String
  }
  type ${prefix}Vehicle {
    makeModel: String
    plate: String
    mileage: Int
  }
  """Custom type Garage"""
  type ${prefix}Garage {
    id: ID
    type: String
    ratingType : String
    publicDisplayName: String
    users: [${prefix}User] # Custom type Users
  }
  """Custom type User"""
  type ${prefix}User {
    id: ID
    firstName: String
    lastName: String
    email: String
    job: String
    hasOnlyThisGarage: Boolean
  }
  """Custom type Action User"""
  type ${prefix}ActionUser {
    id: ID
    firstName: String
    lastName: String
    email: String
  }
  """Custom type Manager"""
  type ${prefix}Manager {
    id: ID
    firstName: String
    lastName: String
    email: String
  }
  """Custom type AutomationCampaign"""
  type ${prefix}AutomationCampaign {
    id: ID
    displayName: String
    contactType: String
    target: String
  }
  """Custom type Agent"""
  type ${prefix}Agent {
    id: ID
    publicDisplayName: String
  }
`;
module.exports.resolvers = {
  Query: {
    [prefix]: async (parent, args, context, { returnType }) => {
      console.time(returnType);
      const {
        app,
        scope: { logged, authenticationError, garageIds },
      } = context;
      const { dataId } = args;
      if (!logged) throw new AuthenticationError(authenticationError);
      const data = await app.models.Data.getMongoConnector().findOne(
        { _id: ObjectId(dataId) },
        {
          projection: {
            id: '$_id',
            type: true,
            garageId: true,
            source: {
              type: true,
              by: true,
              garageId: true, // used for AgentType (It's the agent garageId)
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
              city: {
                value: true,
              },
            },
            leadTicket: {
              actions: true, // Used for actionType
              manager: true, // Used for manager type
              knowVehicle: true,
              leadVehicle: true,
              tradeIn: true,
              energyType: true,
              cylinder: true,
              bodyType: true,
              financing: true,
              timing: true,
              saleType: true,
              requestType: true,
              brandModel: true,
              followUpDelayDays: true,
              closedAt: true,
              createdAt: true,
              temperature: true,
              sourceSubtype: true,
              status: true,
              budget: true,
              comment: true,
              message: true,
              adUrl: true,
              wasTransformedToSale: true,
              vehicle: {
                makeModel: true,
                plate: true,
                mileage: true,
              },
              followup: {
                recontacted: true,
                satisfied: true,
                satisfiedReasons: true,
                notSatisfiedReasons: true,
                appointment: true,
              },
              customer: {
                fullName: true,
                contact: {
                  mobilePhone: true,
                  email: true,
                },
              },
              automationCampaignId: true,
            },
            lead: {
              reportedAt: true,
              type: true,
              brands: true,
              potentialSale: true,
              isConverted: true,
            },
            surveyFollowupLead: {
              sendAt: true,
              firstRespondedAt: true,
            },
          },
        }
      );
      if (!garageIds.map((id) => id.toString()).includes(data.garageId)) {
        throw new ForbiddenError('Not authorized to access this resource');
      }
      if (data && data.leadTicket && !data.leadTicket.budget && data.leadTicket.budget !== 0) {
        data.leadTicket.budget = null;
      }
      console.timeEnd(returnType);
      return data;
    },
  },
  [`${prefix}Data`]: {
    garage: async ({ garageId }, args, context, { returnType }) => {
      console.time(returnType);
      const { app } = context;
      const garage = await app.models.Garage.getMongoConnector().findOne(
        { _id: ObjectId(garageId) },
        {
          projection: {
            id: '$_id',
            type: true,
            ratingType: true,
            publicDisplayName: true,
            parent: true, // Needed when it's a R2 and we need users from the R1 (users type)
          },
        }
      );
      console.timeEnd(returnType);
      return garage;
    },
    followupLeadStatus: async (data) => {
      return followupLeadStatus(data);
    },
  },
  [`${prefix}Garage`]: {
    /** Get users for the transfer action: TODO: lazy load when the action is made */
    users: async ({ id, parent }, args, { app }, { returnType }) => {
      console.time(returnType);
      let garageIds = { $in: [id] };
      /** If the garage has a parent (R1), we send the users of the parent garage into the ticket of the R2 **/
      if (parent && parent.garageId && parent.shareLeadTicket.enabled) garageIds.$in.push(parent.garageId);
      else garageIds = id;
      const users = await app.models.User.getMongoConnector()
        .find(
          { garageIds, email: { $not: /@garagescore\.com|@custeed\.com/ } },
          { projection: { id: '$_id', garageIds: true, email: true, firstName: true, lastName: true, job: true } }
        )
        .toArray();
      const filteredUsers = users.map((u) => ({ ...u, hasOnlyThisGarage: (u.garageIds || []).length <= 1 }));
      console.timeEnd(returnType);
      return filteredUsers;
    },
  },
  [`${prefix}LeadTicket`]: {
    actions: async ({ actions }, args, { app }, { returnType }) => {
      console.time(returnType);
      const User = app.models.User.getMongoConnector();
      const usersCached = {};
      const findUser = async (id) => {
        if (!id) return null;
        if (!usersCached[id.toString()]) {
          usersCached[id] = await User.findOne(
            { _id: new ObjectId(id) },
            { projection: { id: '$_id', firstName: true, lastName: true, email: true } }
          );
        }
        return usersCached[id.toString()];
      };
      for (const action of actions) {
        action.assigner = await findUser(action.assignerUserId);
        action.ticketManager = await findUser(action.ticketManagerId);
        action.previousTicketManager = await findUser(action.previousTicketManagerId);
        action.reminderTriggeredBy = await findUser(action.reminderTriggeredByUserId);
      }
      console.timeEnd(returnType);
      return actions || [];
    },
    /** Get manager details */
    manager: async ({ manager: managerId }, args, { app }, { returnType }) => {
      if (!managerId) return null;
      console.time(returnType);
      const manager = await app.models.User.getMongoConnector().findOne(
        { _id: ObjectId(managerId) },
        { projection: { id: '$_id', firstName: true, lastName: true, email: true } }
      );
      console.timeEnd(returnType);
      return manager;
    },
    automationCampaign: async ({ automationCampaignId }, args, { app, locale = 'fr' }, { returnType }) => {
      if (!automationCampaignId) return null;
      console.time(returnType);
      const automationCampaign = await app.models.AutomationCampaign.getMongoConnector().findOne(
        { _id: ObjectId(automationCampaignId) },
        { projection: { id: '$_id', displayName: true, contactType: true, target: true } }
      );
      let tag = 'apv';
      if (/NVS/.test(automationCampaign.target)) tag = 'vn';
      if (/UVS/.test(automationCampaign.target)) tag = 'vo';

      const AutomationCampaignTargetNames = new i18nRequire('common/models/automation-campaign', { locale });
      const tagName = AutomationCampaignTargetNames.$t(tag);
      const campaignName = AutomationCampaignTargetNames.$t(automationCampaign.target);
      automationCampaign.displayName = `${campaignName} - ${tagName}`;
      console.timeEnd(returnType);
      return automationCampaign;
    },
  },
  [`${prefix}Source`]: {
    agent: async ({ garageId, type }, args, { app }, { returnType }) => {
      if (!garageId || type !== 'Agent') return null;
      console.time(returnType);
      const agent = await app.models.Garage.getMongoConnector().findOne(
        { _id: ObjectId(garageId.toString()) },
        { projection: { id: '$_id', publicDisplayName: true } }
      );
      console.timeEnd(returnType);
      return agent;
    },
  },
};
