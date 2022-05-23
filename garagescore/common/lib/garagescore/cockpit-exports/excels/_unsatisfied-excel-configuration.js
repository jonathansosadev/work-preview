const { ObjectID } = require('mongodb');

const app = require('../../../../../server/server');
const DataTypes = require('../../../../models/data/type/data-types');
const UnsatisfiedTicketStatus = require('../../../../models/data/type/unsatisfied-ticket-status');
const commonTicket = require('../../../../models/data/_common-ticket');
const common = require('./_common');
const { convertToTimezoneDate } = require('../../../../../frontend/utils/exports/helper');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('sheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      {
        header: i18n.$t('garagePublicDisplayName'),
        key: 'garagePublicDisplayName',
        width: 50,
        resolve(data, garage) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('customerTitle'),
        key: 'customerTitle',
        width: 10,
        resolve(data) {
          return i18n.$t(data.get('customer.title.value') || '');
        },
      },
      {
        header: i18n.$t('customerLastName'),
        key: 'customerLastName',
        width: 20,
        resolve(data) {
          return data.get('customer.lastName.value') || '';
        },
      },
      {
        header: i18n.$t('customerFirstName'),
        key: 'customerFirstName',
        width: 20,
        resolve(data) {
          return data.get('customer.firstName.value') || '';
        },
      },
      {
        header: i18n.$t('customerFullName'),
        key: 'customerFullName',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.customer.fullName') || '';
        },
      },
      {
        header: i18n.$t('customerStreetAddress'),
        key: 'customerStreetAddress',
        width: 20,
        resolve(data) {
          return data.get('customer.street.value') || '';
        },
      },
      {
        header: i18n.$t('customerCity'),
        key: 'customerCity',
        width: 20,
        resolve(data) {
          return data.get('customer.city.value') || '';
        },
      },
      {
        header: i18n.$t('customerPostcode'),
        key: 'customerPostcode',
        width: 20,
        resolve(data) {
          return data.get('customer.postalCode.value') || '';
        },
      },
      {
        header: i18n.$t('vehicleMakePublicDisplayName'),
        key: 'vehicleMakePublicDisplayName',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.vehicle.make') || '';
        },
      },
      {
        header: i18n.$t('vehicleModelPublicDisplayName'),
        key: 'vehicleModelPublicDisplayName',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.vehicle.model') || '';
        },
      },
      {
        header: i18n.$t('vehicleRegistrationPlate'),
        key: 'vehicleRegistrationPlate',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.vehicle.plate') || '';
        },
      },
      {
        header: i18n.$t('customerPhone'),
        key: 'customerPhone',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.customer.contact.mobilePhone') || '';
        },
      },
      {
        header: i18n.$t('customerEmail'),
        key: 'customerEmail',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.customer.contact.email') || '';
        },
      },
      {
        header: i18n.$t('prestation'),
        key: 'prestation',
        width: 10,
        resolve(data) {
          return data.get('unsatisfiedTicket.type') ? i18n.$t(data.get('unsatisfiedTicket.type')) : '';
        },
      },
      {
        header: i18n.$t('date'),
        key: 'date',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.providedAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('serviceProvidedCustomerId'),
        key: 'serviceProvidedCustomerId',
        width: 20,
        resolve(data) {
          return data.get('service.frontDeskCustomerId') || '';
        },
      },
      {
        header: i18n.$t('garageProvidedFrontDeskUserName'),
        key: 'garageProvidedFrontDeskUserName',
        width: 20,
        resolve(data) {
          return data.get('service.frontDeskUserName') || '';
        },
      },
      {
        header: i18n.$t('reviewCreatedAt'),
        key: 'reviewCreatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('review.createdAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('reviewComment'),
        key: 'reviewComment',
        width: 20,
        resolve(data) {
          return (data.get('review.comment.text') || data.get('unsatisfiedTicket.comment') || '').trim();
        },
      },
      {
        header: i18n.$t('ReviewNpsLabel'),
        key: 'ReviewNpsLabel',
        width: 20,
        resolve(data) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD && data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            if (data.review_isPromoter()) {
              return i18n.$t('promoter');
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
        header: i18n.$t('reviewRatingValue'),
        key: 'reviewRatingValue',
        style: { numFmt: '#####0' },
        width: 20,
        resolve(data) {
          return data.get('review.rating.value') || data.get('review.rating.value') === 0
            ? data.get('review.rating.value')
            : '';
        },
      },
      {
        header: i18n.$t('publicReviewStatus'),
        key: 'publicReviewStatus',
        width: 20,
        resolve(data) {
          if (data.get('review.comment')) {
            if (data.get('review.comment.status')) {
              return data.get('review.comment.status') === 'Approved' ? i18n.$t('published') : i18n.$t('rejected');
            } else {
              return '';
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('publicReviewCommentBody'),
        key: 'publicReviewCommentBody',
        width: 20,
        resolve(data) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD && data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            if (data.get('review.reply')) {
              return data.get('review.reply.text') || '';
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('publicReviewCommentCreatedAt'),
        key: 'publicReviewCommentCreatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD && data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            if (data.get('review.reply')) {
              return convertToTimezoneDate(data.get('review.reply.approvedAt'), rawGarage.timezone);
            }
          }
          return '';
        },
      },
      {
        header: i18n.$t('unsatisfiedCriteria'),
        key: 'unsatisfiedCriteria',
        width: 30,
        resolve(data) {
          if (data.get('unsatisfied.criteria') instanceof Array) {
            const unsatisfiedCriteria = data.get('unsatisfied.criteria');
            const formatSubCriteria = (subCriteria) => subCriteria.map((value) => i18n.$t(`_${value}`)).join(', ');
            return unsatisfiedCriteria
              .map((crit) => `${i18n.$t(crit.label)}: ${formatSubCriteria(crit.values)}`)
              .join('\n');
          }
          return '';
        },
      },
      {
        header: i18n.$t('hasLead'),
        key: 'hasLead',
        width: 20,
        resolve(data) {
          if (data.get('type') !== DataTypes.MANUAL_LEAD && data.get('type') !== DataTypes.MANUAL_UNSATISFIED) {
            return data.get('lead.timing') ? i18n.$t('yes') : i18n.$t('no');
          }
          return '';
        },
      },
      {
        header: i18n.$t('status'),
        key: 'status',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.status') ? i18n.$t(data.get('unsatisfiedTicket.status')) : '';
        },
      },
      {
        header: i18n.$t('manager'),
        key: 'manager',
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
        header: i18n.$t('elapsedTime'),
        key: 'elapsedTime',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.createdAt')
            ? common.countdown(
                data.get('unsatisfiedTicket.createdAt'),
                data.get('unsatisfiedTicket.closedAt') || null,
                i18n
              )
            : '';
        },
      },
      {
        header: i18n.$t('unsatisfiedTicketClosingComment'),
        key: 'unsatisfiedTicketClosingComment',
        width: 20,
        resolve(data) {
          return commonTicket.getLastClosingAction('unsatisfied', data)
            ? commonTicket.getLastClosingAction('unsatisfied', data).comment || ''
            : '';
        },
      },
      {
        header: i18n.$t('closedDate'),
        key: 'closedDate',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          const isClosed = UnsatisfiedTicketStatus.isClosed(data.get('unsatisfiedTicket.status'));
          return (isClosed && convertToTimezoneDate(data.get('unsatisfiedTicket.closedAt'), rawGarage.timezone)) || '';
        },
      },
      {
        header: i18n.$t('isSolved'),
        key: 'isSolved',
        width: 20,
        resolve(data) {
          return data.get('unsatisfiedTicket.status') === UnsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION
            ? i18n.$t('resolved')
            : data.get('unsatisfiedTicket.status') === UnsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION
            ? i18n.$t('unresolved')
            : '';
        },
      },
      {
        header: i18n.$t('hasProblemBeenSolved'),
        key: 'hasProblemBeenSolved',
        width: 20,
        resolve() {
          return '';
        },
      },
      {
        header: i18n.$t('hasBeenRecontacted'),
        key: 'hasBeenRecontacted',
        width: 20,
        resolve(data) {
          return data.get('unsatisfied.followupStatus') ? i18n.$t(data.get('unsatisfied.followupStatus')) : '';
        },
      },
      {
        header: i18n.$t('changedMind'),
        key: 'changedMind',
        width: 20,
        resolve(data) {
          return data.get('review.followupUnsatisfiedComment.text') ||
            data.get('review.followupUnsatisfiedRating.value') > data.get('review.rating.value')
            ? i18n.$t('yes')
            : '';
        },
      },
    ];
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const mongoUser = app.models.User.getMongoConnector();
    const row = {};

    const manager =
      data.get('unsatisfiedTicket.manager') && data.get('unsatisfiedTicket.manager') !== 'undefined'
        ? await mongoUser.findOne(
            { _id: new ObjectID(data.get('unsatisfiedTicket.manager')) },
            { projection: { firstName: true, lastName: true, email: true } }
          )
        : null;

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(data, rawGarage, manager);
      })
    );

    return row;
  },
};
