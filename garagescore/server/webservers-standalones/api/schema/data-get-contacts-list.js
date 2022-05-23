// const { ObjectId } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const DataFilters = require('../_common/data-generate-filters');
const DataTypes = require('../../../../common/models/data/type/data-types');
const { garagesWanted } = require('../_common/search-garages');
const { BANG, log } = require('../../../../common/lib/util/log');
const EmailStatus = require('../../../../common/models/data/type/email-status');
const CampaignStatus = require('../../../../common/models/data/type/campaign-status');
const CampaignContactStatus = require('../../../../common/models/data/type/campaign-contact-status');
const {
  firstContactedAtOrfirstContactByEmailOrfirstContactByPhone,
  explainCampaignContactStatus,
  explainPhoneStatus,
  explainEmailStatus,
} = require('../_common/data-resolve');

const typePrefix = 'dataGetContactsList';
module.exports.typeDef = `
  extend type Query {
    ${queries.dataGetContactsList.type}: ${typePrefix}Contact
  }

  type ${typePrefix}Contact {
    list: [${typePrefix}List]
    hasMore: Boolean
    noResultGodMode: Boolean
  }
  type ${typePrefix}List {
    id: String
    customerTitle: String
    customerFullName: String
    customerPhone: String
    customerEmail: String
    customerEmailIsNc: Boolean
    customerStreet: String
    customerCity: String
    customerPostalCode: String
    customerOldTitle: String
    customerOldFullName: String
    customerOldPhone: String
    customerOldEmail: String
    customerOldStreet: String
    customerOldCity: String
    customerOldPostalCode: String
    garageProvidedCustomerId: String
    vehicleMake: String
    vehicleModel: String
    vehicleRegistrationPlate: String
    vehicleVin: String
    vehicleMileage: Int
    vehicleRegistrationFirstRegisteredAt: Date
    serviceProvidedAt: Date
    garageProvidedFrontDeskUserName: String
    garagePublicDisplayName: String
    garageType: String
    type: String
    isApv: Boolean
    isVn: Boolean
    isVo: Boolean
    surveyRespondedAt: Date
    campaignStatus: String
    customerCampaignContactStatus: String
    explainCampaignContactStatus: String
    customerEmailStatus: String
    customerPhoneStatus: String
    customerUnsubscribedByEmail: Boolean
    customerUnsubscribedByPhone: Boolean
    explainEmailStatus: String
    explainPhoneStatus: String
    isCampaignContactedByEmail: Boolean
    isCampaignContactedByPhone: Boolean
    campaignFirstSendAt: Date
    serviceFrontDeskUserName: String
    garageSubscriptions: ${typePrefix}GarageSubscriptions
    contactTicket: ${typePrefix}ContactTicket
    users: [${typePrefix}Users]
  }

  type ${typePrefix}GarageSubscriptions {
    Maintenance: Boolean
    NewVehicleSale: Boolean
    UsedVehicleSale: Boolean
    Lead: Boolean
    EReputation: Boolean
  }

  type ${typePrefix}Users {
    id: String
    job: String
    firstName: String
    lastName: String
    email: String
  }

  type ${typePrefix}ContactTicket {
    status: String
    comment: String
    score: Int
    unsatisfiedCriteria: [String]
    resolved: Int
    assigner: String
    leadType: String
    leadToCreate: Boolean
    leadAssigner: String
    leadComment: String
    leadTiming: String
    leadBodyType: [String]
    leadEnergy: [String]
    leadFinancing: String
    leadSaleType: String
    leadTradeIn: String
    leadBudget: String
    leadBrandModel: String
    updatedAt: Date
    closedAt: Date
  }
`;

const $project = {
  id: '$_id',
  garageId: '$garageId',
  customer: '$customer',
  customerTitle: '$customer.title.value',
  customerFullName: '$customer.fullName.value',
  customerPhone: '$customer.contact.mobilePhone.value',
  customerEmail: '$customer.contact.email.value',
  customerEmailIsNc: '$customer.contact.email.isNC',
  customerStreet: '$customer.street.value',
  customerCity: '$customer.city.value',
  customerPostalCode: '$customer.postalCode.value',
  customerOldTitle: '$customer.title.revised',
  customerOldFullName: '$customer.fullName.original',
  customerOldPhone: '$customer.contact.mobilePhone.original',
  customerOldEmail: '$customer.contact.email.original',
  customerOldStreet: '$customer.street.original',
  customerOldCity: '$customer.city.original',
  customerOldPostalCode: '$customer.postalCode.original',
  garageProvidedCustomerId: '$service.frontDeskCustomerId',
  vehicleMake: '$vehicle.make.value',
  vehicleModel: '$vehicle.model.value',
  vehicleRegistrationPlate: '$vehicle.plate.value',
  vehicleVin: '$vehicle.vin.value',
  vehicleMileage: '$vehicle.mileage.value',
  vehicleRegistrationFirstRegisteredAt: '$vehicle.registrationDate.value',
  serviceProvidedAt: '$service.providedAt',
  manager: '$service.frontDeskUserName',
  type: '$type',
  isApv: { $cond: [{ $eq: ['$type', DataTypes.MAINTENANCE] }, true, false] },
  isVn: { $cond: [{ $eq: ['$type', DataTypes.NEW_VEHICLE_SALE] }, true, false] },
  isVo: { $cond: [{ $eq: ['$type', DataTypes.USED_VEHICLE_SALE] }, true, false] },
  surveyRespondedAt: '$review.createdAt',
  campaignStatus: '$campaign.status',
  customerCampaignContactStatus: {
    $cond: [
      {
        $eq: ['$campaign.status', CampaignStatus.WITHOUTCAMPAIGN],
      },
      CampaignContactStatus.NO_CAMPAIGN,
      '$campaign.contactStatus.status',
    ],
  },
  customerEmailStatus: {
    $cond: [
      { $eq: ['$campaign.contactStatus.previouslyUnsubscribedByEmail', true] },
      EmailStatus.UNSUBSCRIBED,
      '$campaign.contactStatus.emailStatus',
    ],
  },
  customerPhoneStatus: '$campaign.contactStatus.phoneStatus',
  customerUnsubscribedByEmail: '$campaign.contactStatus.previouslyUnsubscribedByEmail',
  customerUnsubscribedByPhone: '$campaign.contactStatus.previouslyUnsubscribedByPhone',
  campaignFirstContactedAt: '$campaign.contactScenario.firstContactedAt',
  campaignFirstContactByEmailDay: '$campaign.contactScenario.firstContactByEmailDay',
  campaignFirstContactByPhoneDay: '$campaign.contactScenario.firstContactByPhoneDay',
  serviceFrontDeskUserName: '$service.frontDeskUserName',
  campaign: '$campaign',
  service: '$service',
  contactTicket: {
    status: '$contactTicket.status',
    comment: '$contactTicket.comment',
    score: '$contactTicket.score',
    unsatisfiedCriteria: '$contactTicket.unsatisfiedCriteria',
    resolved: '$contactTicket.resolved',
    assigner: '$contactTicket.assigner',
    leadType: '$contactTicket.leadType',
    leadToCreate: '$contactTicket.leadToCreate',
    leadAssigner: '$contactTicket.leadAssigner',
    leadComment: '$contactTicket.leadComment',
    leadTiming: '$contactTicket.leadTiming',
    leadBodyType: '$contactTicket.leadBodyType',
    leadEnergy: '$contactTicket.leadEnergy',
    leadFinancing: '$contactTicket.leadFinancing',
    leadSaleType: '$contactTicket.leadSaleType',
    leadTradeIn: '$contactTicket.leadTradeIn',
    leadBudget: '$contactTicket.leadBudget',
    leadBrandModel: '$contactTicket.leadBrandModel',
    updatedAt: '$contactTicket.updatedAt',
    closedAt: '$contactTicket.closedAt',
  },
  isCampaignContactedByEmail: {
    $cond: [
      {
        $or: [
          { $eq: ['$campaign.contactStatus.hasBeenContactedByEmail', true] },
          { $eq: ['$campaign.contactStatus.hasOriginalBeenContactedByEmail', true] },
        ],
      },
      true,
      false,
    ],
  },
  isCampaignContactedByPhone: {
    $cond: [
      {
        $or: [
          { $eq: ['$campaign.contactStatus.hasBeenContactedByPhone', true] },
          { $eq: ['$campaign.contactStatus.hasOriginalBeenContactedByPhone', true] },
        ],
      },
      true,
      false,
    ],
  },
};

module.exports.resolvers = {
  Query: {
    dataGetContactsList: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, garageIds },
        } = context;

        const {
          limit,
          skip,
          contactsOrder,
          periodId,
          search,
          garageId,
          cockpitType,
          type,
          emailStatus,
          phoneStatus,
          campaignStatus,
          revisionStatus,
          ticketStatus,
          dataId,
          frontDeskUserName,
        } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (user.isGod() && !garageId) return { list: [], hasMore: false, noResultGodMode: true };
        
        // generate $match for aggregate
        const userGarages = await garagesWanted(app, cockpitType, garageId, garageIds, type);
        let $match = new DataFilters()
          .setBasicFilterForContactList()
          .setGarageId(userGarages, garageId)
          .setPeriodId(periodId)
          .setType(type)
          .setFrontDeskUserName(frontDeskUserName)
          .setEmailStatus(emailStatus)
          .setPhoneStatus(phoneStatus)
          .setCampaignStatus(campaignStatus, periodId)
          .setRevisionStatus(revisionStatus)
          .setTicketStatus(ticketStatus, periodId)
          .setSearch(search)
          .setDataId(dataId)
          .generateMatch();

        // [Scopes Poc]
        if ($match.garageId.$in && user.scope && ObjectId('5bd339aa981fc80014a950c3').equals(user.getId())) {
          delete $match.garageId;
          $match = { scopes: ObjectId(user.scope), ...$match };
        }
        //---------------------------------------

        // fetch data
        const datas = await app.models.Data.getMongoConnector()
          .aggregate([
            { $match },
            { $sort: { 'service.providedAt': contactsOrder === 'DESC' ? -1 : 1 } },
            { $skip: skip },
            { $limit: limit + 1 },
            { $project },
          ])
          .toArray();
        // fetch garages
        const garages = await app.models.Garage.getMongoConnector()
          .find({ _id: { $in: datas.map((d) => ObjectId(d.garageId)) } })
          .project({
            _id: 1,
            publicDisplayName: 1,
            type: 1,
            subscriptions: 1,
          })
          .toArray();
        // add extra informations
        const fields = { id: true, email: true, firstName: true, lastName: true, job: true };
        const list = datas.slice(0, limit).map(async (result) => {
          const garage = garages.find((g) => g._id.toString() === result.garageId);
          result.explainEmailStatus = explainEmailStatus(result);
          result.explainPhoneStatus = explainPhoneStatus(result);
          result.explainCampaignContactStatus = explainCampaignContactStatus(result);
          result.campaignFirstSendAt = firstContactedAtOrfirstContactByEmailOrfirstContactByPhone(result);
          result.garagePublicDisplayName = garage.publicDisplayName;
          result.garageType = garage.type;
          result.garageSubscriptions = {
            Maintenance: garage.subscriptions.Maintenance.enabled,
            NewVehicleSale: garage.subscriptions.NewVehicleSale.enabled,
            UsedVehicleSale: garage.subscriptions.UsedVehicleSale.enabled,
            Lead: garage.subscriptions.Lead.enabled,
            EReputation: garage.subscriptions.EReputation.enabled,
          };
          result.users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(result.garageId, fields);
          return result;
        });
        // send response
        return { list, hasMore: datas.length === limit + 1 };
      } catch (err) {
        log.error(BANG, `[APOLLO / dataGetContactsList] ERROR :: ${err.toString()}`);
        return err;
      }
    },
  },
};
