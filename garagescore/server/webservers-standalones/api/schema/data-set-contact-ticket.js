/**
 * Query KPIs source list, aggregate created by Simon/keysim
 */
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const ContactTicketStatus = require('../../../../common/models/data/type/contact-ticket-status');
const LeadTypes = require('../../../../common/models/data/type/lead-types');
const Scheduler = require('../../../../common/lib/garagescore/scheduler/scheduler');
const { BANG, log } = require('../../../../common/lib/util/log');
const { ObjectID } = require('mongodb');

const typePrefix = 'dataSetContactTicket';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.dataSetContactTicket.type}: ${typePrefix}ContactTicket
  }

  type ${typePrefix}ContactTicket {
    status: String
    leadType: String
    leadToCreate: Boolean
    leadAssigner: String
    leadComment: String
    leadTiming: String
    leadFinancing: String
    leadSaleType: String
    leadTradeIn: String
    leadBudget: String
    leadBrandModel: String
    leadBodyType: [String]
    leadEnergy: [String]
    updatedAt: Date
    closedAt: Date
    message: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    dataSetContactTicket: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        const data = await app.models.Data.findById(args.id); // fetch data associated with the ticket
        if (!data) {
          return { message: 'data not found', status: 'KO' };
        }

        Object.keys(args).forEach((k) => data.set(`contactTicket.${k}`, args[k]));
        data.set('contactTicket.updatedAt', new Date());
        if (args.status === ContactTicketStatus.TERMINATED) {
          if (args.resolved === 0) {
            await data.addUnsatisfiedTicket(null, {
              source: 'contactTicket',
              rawManagerId: args.assigner,
              sourceData: {
                manualDataFromContactTicket: true,
                userId: user.id,
                ...(data.get('contactTicket') || {}),
              },
            });
          }
          if (LeadTypes.isLead(args.leadType)) {
            data.set('lead.potentialSale', true);
            await data.addLeadTicket(null, {
              source: 'contactTicket',
              rawManagerId: args.leadAssigner,
              sourceData: {
                userId: user.id,
                ...(data.get('contactTicket') || {}),
              },
            });

            const leadFields = {
              type: data.get('contactTicket.leadType'),
              brands: null,
              bodyType: data.get('contactTicket.leadBodyType'),
              energyType: data.get('contactTicket.leadEnergy'),
              financing: data.get('contactTicket.leadFinancing'),
              saleType: data.get('contactTicket.leadSaleType'),
              timing: data.get('contactTicket.leadTiming'),
              tradeIn: data.get('contactTicket.leadTradeIn'),
              vehicle: data.get('contactTicket.leadBrandModel'),
            };
            await data.addLead(leadFields);
          }
          data.set('contactTicket.closedAt', new Date());
          // Close survey when we close the ticket
          data.set('survey.acceptNewResponses', false);
          await Scheduler.upsertJob(
            JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION,
            { dataId: data.getId().toString() },
            new Date()
          );
          data.set('campaign.contactScenario.nextCampaignContact', null); // cancel next contact
          data.set('campaign.contactScenario.nextCampaignContactDay', null); // cancel next contact

          // Send contact to satisfaction if allowed in garage
          const garage = await app.models.Garage.getMongoConnector().findOne(
            { _id: new ObjectID(data.get('garageId')) },
            { projection: { _id: true, allowReviewCreationFromContactTicket: true } }
          );

          if (garage.allowReviewCreationFromContactTicket) {
            data.set('review.createdAt', data.get('contactTicket.closedAt'));
            data.set('review.rating.value', data.get('contactTicket.score'));
            // Set source of contact creation
            data.set('review.fromCockpitContact', true);
            data.set('service.providedAt', data.get('contactTicket.closedAt'));
            /**
             * Issue #4325
             * Set survey.firstRespondedAt for datas from Chanoine garages so that
             * datas are counted for the calculation of Satisfaction KPIs (GarageHistory)
             */
            data.set(
              'survey.firstRespondedAt',
              data.get('survey.firstRespondedAt') || data.get('contactTicket.closedAt')
            );
          }
        }
        await data.save();

        return data.get('contactTicket');
      } catch (error) {
        log.error(BANG, error);
        return { message: error.message, status: 'KO' };
      }
    },
  },
};
