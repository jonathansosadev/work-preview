const { ObjectID } = require('mongodb');

const app = require('../../../../../server/server');
const DataTypes = require('../../../../models/data/type/data-types');
const SourceTypes = require('../../../../models/data/type/source-types');
const LeadSaleTypes = require('../../../../models/data/type/lead-sale-types');
const LeadTradeInTypes = require('../../../../models/data/type/lead-trade-in-types');
const LeadTicketStatuses = require('../../../../models/data/type/lead-ticket-status');
const commonTicket = require('../../../../models/data/_common-ticket');
const { convertToTimezoneDate } = require('../../../../../frontend/utils/exports/helper');
const LeadFollowupStatus = require('../../../../models/data/type/lead-followup-status.js');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('sheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      {
        header: i18n.$t('Etablissement'),
        key: 'garagePublicDisplayName',
        width: 50,
        resolve(data, garage) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('Civilité'),
        key: 'customerTitle',
        width: 10,
        resolve(data) {
          return i18n.$t(data.get('customer.title.value')) || '';
        },
      },
      {
        header: i18n.$t('Nom'),
        key: 'customerLastName',
        width: 20,
        resolve(data) {
          return data.get('customer.lastName.value') || '';
        },
      },
      {
        header: i18n.$t('Prénom'),
        key: 'customerFirstName',
        width: 20,
        resolve(data) {
          return data.get('customer.firstName.value') || '';
        },
      },
      {
        header: i18n.$t('Nom complet'),
        key: 'customerFullName',
        width: 20,
        resolve(data) {
          return data.get('leadTicket.customer.fullName') || '';
        },
      },
      {
        header: i18n.$t('Adresse'),
        key: 'customerStreetAddress',
        width: 20,
        resolve(data) {
          return data.get('customer.street.value') || '';
        },
      },
      {
        header: i18n.$t('Ville'),
        key: 'customerCity',
        width: 20,
        resolve(data) {
          return data.get('customer.city.value') || '';
        },
      },
      {
        header: i18n.$t('Code Postal'),
        key: 'customerPostcode',
        width: 20,
        resolve(data) {
          return data.get('customer.postalCode.value') || '';
        },
      },
      {
        header: i18n.$t('Marque'),
        key: 'vehicleMakePublicDisplayName',
        width: 20,
        resolve(data) {
          return data.get('vehicle.make.value') || '';
        },
      },
      {
        header: i18n.$t('Modèle'),
        key: 'vehicleModelPublicDisplayName',
        width: 20,
        resolve(data) {
          return data.get('vehicle.model.value') || '';
        },
      },
      {
        header: i18n.$t('Immat'),
        key: 'vehicleRegistrationPlate',
        width: 20,
        resolve(data) {
          return data.get('vehicle.plate.value') || data.get('leadTicket.vehicle.plate') || '';
        },
      },
      {
        header: i18n.$t('Téléphone'),
        key: 'customerPhone',
        width: 20,
        resolve(data) {
          const mobilePhone = data.get('leadTicket.customer.contact.mobilePhone');
          return mobilePhone === 'Anonymous' ? i18n.$t('numPhoneAnonyme') : mobilePhone || '';
        },
      },
      {
        header: i18n.$t('Email'),
        key: 'customerEmail',
        width: 20,
        resolve(data) {
          return data.get('leadTicket.customer.contact.email') || '';
        },
      },
      {
        header: i18n.$t('Date de facturation'),
        key: 'date',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, garage) {
          return convertToTimezoneDate(data.get('service.providedAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('Réf.interne'),
        key: 'serviceProvidedCustomerId',
        width: 20,
        resolve(data) {
          return data.get('service.frontDeskCustomerId') || '';
        },
      },
      {
        header: i18n.$t('Gestionnaire'),
        key: 'garageProvidedFrontDeskUserName',
        width: 20,
        resolve(data) {
          return data.get('service.frontDeskUserName') || '';
        },
      },
      {
        header: i18n.$t("Date d'identification du projet"),
        key: 'identifiedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, garage) {
          return convertToTimezoneDate(data.get('lead.reportedAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('Commentaire'),
        key: 'reviewComment',
        width: 20,
        resolve(data) {
          return data.get('review.comment.text') || '';
        },
      },
      {
        header: i18n.$t('Segment NPS'),
        key: 'ReviewNpsLabel',
        width: 20,
        resolve(data) {
          if (data.get('source.type') === SourceTypes.DATAFILE) {
            if (data.review_isPromoter()) {
              return i18n.$t('promotor');
            } else if (data.review_isDetractor()) {
              return i18n.$t('detractor');
            } else {
              return i18n.$t('neutral');
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('Score'),
        key: 'reviewRatingValue',
        width: 20,
        style: { numFmt: '#####0' },
        resolve(data) {
          return data.get('review.rating.value') === null ? '' : data.get('review.rating.value');
        },
      },
      {
        header: i18n.$t('Publication'),
        key: 'publicReviewStatus',
        width: 20,
        resolve(data) {
          if (data.get('review.comment')) {
            if (data.get('review.comment.status')) {
              return data.get('review.comment.status') === 'Approved' ? i18n.$t('published') : i18n.$t('refused');
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('Réponse établissement'),
        key: 'publicReviewCommentBody',
        width: 20,
        resolve(data) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD || data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            if (data.get('review.reply')) {
              return data.get('review.reply.text') || '';
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('Date Réponse établissement'),
        key: 'publicReviewCommentCreatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD || data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            if (data.get('review.reply')) {
              return data.get('review.reply.approvedAt') ? data.publicReviewCommentCreatedAt : '';
              // data.get('review.reply.approvedAt') ? i18n.$dd(data.publicReviewCommentCreatedAt, 'short') : '';
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('Géré par'),
        key: 'leadManagerName',
        width: 20,
        resolve(data, garage, manager) {
          if (manager) {
            if (manager.firstName) {
              const lastName = manager.lastName;
              return `${manager.firstName} ${lastName ? ` ${lastName.charAt(0)}.` : ''}`;
            }
            if (manager.email) {
              return manager.email;
            }
            return i18n.$t('unAssigned');
          }
          return i18n.$t('unAssigned');
        },
      },
      {
        header: i18n.$t('Type de lead'),
        key: 'leadType',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }
          if (data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE) {
            return i18n.$t('ApvInterested');
          }
          return i18n.$t(data.get('lead.type')) || '';
        },
      },
      {
        header: i18n.$t('Métier'),
        key: 'leadSaleType',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return data.get('lead.saleType') || data.get('leadTicket.saleType')
            ? i18n.$t(data.get('lead.saleType') || data.get('leadTicket.saleType'))
            : '';
        },
      },
      {
        header: i18n.$t('Origine du lead'),
        key: 'leadSource',
        width: 20,
        async resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }
          const sourceType = data.get('source.type');
          // For Leads coming from Agent, display the Agent garage name
          const agentGarageId = data.get('source.garageId');
          if (agentGarageId && sourceType === SourceTypes.AGENT) {
            try {
              const garageAgent = await app.models.Garage.getMongoConnector().findOne(
                { _id: new ObjectID(agentGarageId) },
                { projection: { publicDisplayName: true } }
              );
              const agentPublicDisplayName = garageAgent && garageAgent.publicDisplayName;
              return [i18n.$t(sourceType), agentPublicDisplayName].filter((e) => e).join(' - ');
            } catch (e) {
              return i18n.$t(sourceType);
            }
          }
          // For Automation Leads display the Campaign name
          if (sourceType === SourceTypes.AUTOMATION) {
            try {
              const automationCampaignId = data.get('leadTicket.automationCampaignId');
              const automationCampaign = await app.models.AutomationCampaign.getMongoConnector().findOne(
                { _id: ObjectID(automationCampaignId) },
                { projection: { displayName: true } }
              );
              const automationCampaignName = automationCampaign && automationCampaign.displayName;
              return [i18n.$t(sourceType), automationCampaignName].filter((e) => e).join(' - ');
            } catch (e) {
              return i18n.$t(sourceType);
            }
          }

          return [i18n.$t(sourceType), i18n.$t(data.get('source.by'))].filter((e) => e).join(' - ');
        },
      },
      {
        header: i18n.$t('Echéance du projet'),
        key: 'leadTiming',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return i18n.$t(data.get('leadTicket.timing')) || '';
        },
      },
      {
        header: i18n.$t('Marque souhaitée'),
        key: 'leadBrands',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          if (Array.isArray(data.get('lead.brands'))) {
            return commonTicket.formatBrandModel(data.get('lead.brands'), false);
          }
          return data.get('lead.brands') || '';
        },
      },
      {
        header: i18n.$t('Modèle souhaité'),
        key: 'leadVehicle',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }
          if (data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE) {
            return '';
          }
          if (data.get('lead.knowVehicle') || data.get('leadTicket.knowVehicle')) {
            return data.get('lead.vehicle') || data.get('leadTicket.brandModel') || '';
          }
          return i18n.$t('unknown');
        },
      },
      {
        header: i18n.$t('Carrosserie souhaitée'),
        key: 'bodyType',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return (
            (data.get('lead.bodyType') &&
              data
                .get('lead.bodyType')
                .map((e) => i18n.$t(e))
                .join(', ')) ||
            ''
          );
        },
      },
      {
        header: i18n.$t('Energie souhaitée'),
        key: 'leadEnergyType',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return Array.isArray(data.get('lead.energyType')) || Array.isArray(data.get('leadTicket.energyType'))
            ? (data.get('lead.energyType') || data.get('leadTicket.energyType')).map((e) => i18n.$t(e)).join(', ')
            : '';
        },
      },
      {
        header: i18n.$t('Budget souhaité'),
        key: 'leadTicketBudget',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return data.get('leadTicket.budget') ? `${data.get('leadTicket.budget')} €` : '';
        },
      },
      {
        header: i18n.$t('Financement souhaité'),
        key: 'leadFinancing',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          return data.get('leadTicket.financing') ? i18n.$t(data.get('leadTicket.financing')) : '';
        },
      },
      {
        header: i18n.$t('Reprise souhaitée'),
        key: 'leadTradeIn',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          const leadTicketTradeIn = data.get('leadTicket.tradeIn');
          const leadTicketVehicleMakeModel = data.get('leadTicket.vehicle.makeModel');
          if (leadTicketTradeIn === LeadTradeInTypes.YES && leadTicketVehicleMakeModel) {
            return i18n.$t('YesVehicle', { vehicle: leadTicketVehicleMakeModel });
          }
          if (LeadTradeInTypes.hasValue(leadTicketTradeIn)) {
            return i18n.$t(leadTicketTradeIn);
          }
          return leadTicketTradeIn || '';
        },
      },
      {
        header: i18n.$t('Géré par'),
        key: 'leadManagerName',
        width: 20,
        resolve(data, garage, manager) {
          if (manager) {
            if (manager.firstName) {
              const lastName = manager.lastName;
              return `${manager.firstName} ${lastName ? ` ${lastName.charAt(0)}.` : ''}`;
            }
            if (manager.email) {
              return manager.email;
            }
            return i18n.$t('unAssigned');
          }
          return i18n.$t('unAssigned');
        },
      },
      {
        header: i18n.$t('Statut dossier'),
        key: 'leadTicketStatus',
        width: 20,
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }
          const { CLOSED_WITH_SALE, CLOSED_WITHOUT_SALE } = LeadTicketStatuses;
          const isMaintenance = data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE;
          const isTicketClosed = [CLOSED_WITH_SALE, CLOSED_WITHOUT_SALE].includes(data.get('leadTicket.status'));

          if (isMaintenance && isTicketClosed) {
            return i18n.$t(`APV_${data.get('leadTicket.status')}`);
          }
          if (!isMaintenance && data.get('lead.isConvertedToSale')) {
            return i18n.$t(LeadTicketStatuses.CLOSED_WITH_SALE);
          }
          if (!isTicketClosed && data.get('leadTicket.followup.appointment') === LeadFollowupStatus.YES_DONE) {
            return i18n.$t(LeadFollowupStatus.YES_DONE); //#3870 set status with same status
          }

          return i18n.$t(data.get('leadTicket.status')) || '';
        },
      },
      {
        header: i18n.$t('Commentaire clôture'),
        key: 'leadTicketClosingComment',
        width: 20,
        resolve(data) {
          return commonTicket.getLastClosingAction('lead', data)
            ? commonTicket.getLastClosingAction('lead', data).comment || ''
            : '';
        },
      },
      {
        header: i18n.$t('Date fermeture dossier'),
        key: 'leadTicketClosedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, garage) {
          if (!garage.isSubscribed('Lead')) {
            return '';
          }
          return convertToTimezoneDate(data.get('leadTicket.closedAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('Motif de fermeture'),
        key: 'leadTicketClosingMotive',
        width: 20,
        resolve(data) {
          return data.get('leadTicket.status') === LeadTicketStatuses.CLOSED_WITH_SALE
            ? i18n.$t('sold')
            : data.get('leadTicket.status') === LeadTicketStatuses.CLOSED_WITHOUT_SALE
            ? i18n.$t('notSold')
            : '';
        },
      },
      {
        header: i18n.$t('Enquête de suivi'),
        key: 'followupLead',
        width: 20,
        resolve(data) {
          if (data.get('lead.isConverted')) return i18n.$t(LeadFollowupStatus.LEAD_CONVERTED);
          else if (data.get('leadTicket.followup.recontacted') === false) return i18n.$t(LeadFollowupStatus.NOT_RECONTACTED);
          else if ([
            LeadFollowupStatus.NOT_PROPOSED,
            LeadFollowupStatus.YES_PLANNED,
            LeadFollowupStatus.YES_DONE,
            LeadFollowupStatus.NOT_WANTED
          ].includes(data.get('leadTicket.followup.appointment'))) {
            return i18n.$t(data.get('leadTicket.followup.appointment'));
          }
          else if (data.get('surveyFollowupLead.sendAt')) return i18n.$t(LeadFollowupStatus.LEAD_WITHOUT_ANSWER);
          return i18n.$t(LeadFollowupStatus.NEW_LEAD);
        },
      },
    ];
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const mongoUser = app.models.User.getMongoConnector();
    const row = {};

    const manager =
      data.get('leadTicket.manager') && data.get('leadTicket.manager') !== 'undefined'
        ? await mongoUser.findOne(
            { _id: new ObjectID(data.get('leadTicket.manager')) },
            { projection: { firstName: true, lastName: true, email: true } }
          )
        : null;

    const garage = new app.models.Garage(rawGarage);

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = await col.resolve(data, garage, manager);
      })
    );

    return row;
  },
};
