const app = require('../../../../../server/server');
const ContactTicketStatus = require('../../../../models/data/type/contact-ticket-status');
const CampaignStatus = require('../../../../models/data/type/campaign-contact-status');
const PhoneStatus = require('../../../../models/data/type/phone-status');
const timeHelper = require('../../../util/time-helper');
const { convertToTimezoneDate } = require('../../../../../frontend/utils/exports/helper');

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
        header: i18n.$t('Date'),
        key: 'date',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.providedAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('surveyUpdatedAt'),
        key: 'surveyUpdatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.createdAt'), rawGarage.timezone) || i18n.$t('NotAnswered');
        },
      },
      {
        header: i18n.$t('Civilité'),
        key: 'customerTitle',
        width: 10,
        resolve(data) {
          return i18n.$t(data.get('customer.title.original')) || '';
        },
      },
      {
        header: i18n.$t('Civilité modifiée'),
        key: 'customerTitleEdited',
        width: 10,
        resolve(data) {
          return i18n.$t(data.get('customer.title.revised')) || '';
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
          return data.get('customer.fullName.original') || '';
        },
      },
      {
        header: i18n.$t('Nom Prénom modifié'),
        key: 'customerFullNameEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.fullName.revised') || '';
        },
      },
      {
        header: i18n.$t('Ville'),
        key: 'customerCity',
        width: 20,
        resolve(data) {
          return data.get('customer.city.original') || '';
        },
      },
      {
        header: i18n.$t('Ville modifiée'),
        key: 'customerCityEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.city.revised') ? data.get('customer.city.revised') : '';
        },
      },
      {
        header: i18n.$t('Adresse'),
        key: 'customerStreetAddress',
        width: 20,
        resolve(data) {
          return data.get('customer.street.original') || '';
        },
      },
      {
        header: i18n.$t('Adresse modifiée'),
        key: 'customerStreetAddressEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.street.revised') || '';
        },
      },
      {
        header: i18n.$t('Code Postal'),
        key: 'customerPostcode',
        width: 20,
        resolve(data) {
          return data.get('customer.postalCode.original') || '';
        },
      },
      {
        header: i18n.$t('Code Postal modifié'),
        key: 'customerPostcodeEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.postalCode.revised') || '';
        },
      },
      {
        header: i18n.$t('Email'),
        key: 'customerEmail',
        width: 20,
        resolve(data) {
          return data.get('customer.contact.email.original') || '';
        },
      },
      {
        header: i18n.$t('Email modifié'),
        key: 'customerEmailEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.contact.email.revised') || '';
        },
      },
      {
        header: i18n.$t('Statut du dernier email connu'),
        key: 'customerEmailStatus',
        width: 30,
        resolve(data) {
          return i18n.$t(data.get('campaign.contactStatus.emailStatus'));
        },
      },
      {
        header: i18n.$t('Mobile'),
        key: 'customerPhone',
        width: 20,
        resolve(data) {
          return data.get('customer.contact.mobilePhone.original') || '';
        },
      },
      {
        header: i18n.$t('Mobile modifié'),
        key: 'customerPhoneEdited',
        width: 20,
        resolve(data) {
          return data.get('customer.contact.mobilePhone.revised') || '';
        },
      },
      {
        header: i18n.$t('Statut du dernier mobile connu'),
        key: 'customerPhoneStatus',
        width: 20,
        resolve(data) {
          return i18n.$t(data.get('campaign.contactStatus.phoneStatus'));
        },
      },
      {
        header: i18n.$t('Prestation'),
        key: 'type',
        width: 20,
        resolve(data) {
          return data.get('type') ? i18n.$t(data.get('type')) : '';
        },
      },
      {
        header: i18n.$t('Statut de la campagne'),
        key: 'campaignStatus',
        width: 20,
        resolve(data) {
          return i18n.$t(data.get('campaign.contactStatus.status'));
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
          return data.get('vehicle.plate.value') || '';
        },
      },
      {
        header: i18n.$t('Vin'),
        key: 'vehicleVin',
        width: 20,
        resolve(data) {
          return data.get('vehicle.vin.value') || '';
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
        header: i18n.$t('Référence interne'),
        key: 'garageProvidedCustomerId',
        width: 20,
        resolve(data) {
          return data.get('service.frontDeskCustomerId') || '';
        },
      },
      {
        header: i18n.$t('Réponse'),
        key: 'hasReview',
        width: 20,
        style: { numFmt: '#####0' },
        resolve(data) {
          return data.get('review.rating.value') || data.get('review.rating.value') === 0
            ? i18n.$t('withAnswer')
            : i18n.$t('withoutAnswer');
        },
      },
      {
        header: i18n.$t('ticketStatus'),
        key: 'ticketStatus',
        width: 20,
        resolve(data) {
          const fiveDaysAgo = new Date().getTime() - 1000 * 24 * 60 * 60 * 5;
          const ticket = data.get('contactTicket');
          let status = (ticket && ticket.status) || ContactTicketStatus.TO_RECONTACT;

          let date = data.get('campaign.contactScenario.firstContactedAt');

          if (!date) {
            const firstEmailDay = data.get('campaign.contactScenario.firstContactByEmailDay');
            const firstPhoneDay = data.get('campaign.contactScenario.firstContactByPhoneDay');

            if (!firstEmailDay && !firstPhoneDay) {
              date = null;
            } else if (firstEmailDay && !firstPhoneDay) {
              date = timeHelper.dayNumberToDate(firstEmailDay);
            } else if (!firstEmailDay && firstPhoneDay) {
              date = timeHelper.dayNumberToDate(firstPhoneDay);
            }
            date =
              firstPhoneDay > firstEmailDay
                ? timeHelper.dayNumberToDate(firstEmailDay)
                : timeHelper.dayNumberToDate(firstPhoneDay);
          }

          date = date || null;

          let notPossible = null;

          if (data.get('review.createdAt') && (!ticket || !ticket.status)) notPossible = 'Answered';
          if (data.get('campaign.contactStatus.status') === CampaignStatus.SCHEDULED) notPossible = 'Planned';
          if (data.get('campaign.contactStatus.status') === CampaignStatus.BLOCKED) notPossible = 'Blocked';
          if (data.get('campaign.contactStatus.status') !== CampaignStatus.RECEIVED) notPossible = 'Impossible';
          if (data.get('campaign.contactStatus.phoneStatus') !== PhoneStatus.VALID) notPossible = 'PhoneError';
          if (fiveDaysAgo < new Date(date).getTime()) notPossible = 'TooSoon';

          if (notPossible) {
            status = ContactTicketStatus.NOT_POSSIBLE;
          }

          return i18n.$t(status) || '';
        },
      },
      {
        header: i18n.$t('unsatisfied'),
        key: 'unsatisfied',
        width: 20,
        resolve(data) {
          const contactTicket = data.get('contactTicket');
          const unsatisfied = (contactTicket && data.get('contactTicket.score') <= 6) || null;

          return i18n.$t(unsatisfied ? 'Yes' : 'No') || '';
        },
      },
      {
        header: i18n.$t('unsatisfiedResolved'),
        key: 'unsatisfiedResolved',
        width: 20,
        resolve(data) {
          const contactTicket = data.get('contactTicket');
          const unsatisfied = (contactTicket && data.get('contactTicket.score') <= 6) || null;
          const unsatisfiedResolved = data.get('contactTicket.resolved');

          return unsatisfied ? i18n.$t(unsatisfiedResolved ? 'Yes' : 'No') : '';
        },
      },
      {
        header: i18n.$t('unsatisfiedAssignedTo'),
        key: 'unsatisfiedAssignedTo',
        width: 20,
        resolve(data) {
          return data.get('contactTicket.assigner') || '';
        },
      },
      {
        header: i18n.$t('lead'),
        key: 'lead',
        width: 20,
        resolve(data) {
          const contactTicket = data.get('contactTicket');
          const lead = (contactTicket && data.get('contactTicket.leadType')) || null;

          return i18n.$t(lead || 'No') || '';
        },
      },
      {
        header: i18n.$t('leadAssignedTo'),
        key: 'leadAssignedTo',
        width: 20,
        resolve(data) {
          return data.get('contactTicket.leadAssigner') || '';
        },
      },
    ];
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(data, rawGarage);
      })
    );

    return row;
  },
};
