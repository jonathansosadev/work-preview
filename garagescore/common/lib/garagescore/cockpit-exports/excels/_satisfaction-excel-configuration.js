const { ObjectID } = require('mongodb');

const app = require('../../../../../server/server');
const UnsatisfiedFollowupStatus = require('../../../../models/data/type/unsatisfied-followup-status.js');
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
          return i18n.$t(data.get('customer.title.value') || '') || '';
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
          return data.get('customer.fullName.value') || '';
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
        width: 30,
        resolve(data) {
          return data.get('vehicle.make.value') || '';
        },
      },
      {
        header: i18n.$t('vehicleModelPublicDisplayName'),
        key: 'vehicleModelPublicDisplayName',
        width: 30,
        resolve(data) {
          return data.get('vehicle.model.value') || '';
        },
      },
      {
        header: i18n.$t('vehicleRegistrationPlate'),
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
        header: i18n.$t('customerPhone'),
        key: 'customerPhone',
        width: 20,
        resolve(data) {
          return (
            data.get('customer.contact.mobilePhone.value') || data.get('customer.contact.mobilePhone.original') || ''
          );
        },
      },
      {
        header: i18n.$t('customerEmail'),
        key: 'customerEmail',
        width: 30,
        resolve(data) {
          return data.get('customer.contact.email.value') || data.get('customer.contact.email.original') || '';
        },
      },
      {
        header: i18n.$t('type'),
        key: 'type',
        width: 20,
        resolve(data) {
          return data.get('type') ? i18n.$t(data.get('type')) : '';
        },
      },
      {
        header: i18n.$t('completedAt'),
        key: 'completedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.providedAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('garageProvidedCustomerId'),
        key: 'garageProvidedCustomerId',
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
        header: i18n.$t('surveyUpdatedAt'),
        key: 'surveyUpdatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('review.createdAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('surveyComment'),
        key: 'surveyComment',
        width: 50,
        resolve(data) {
          return data.get('review.comment.text') || '';
        },
      },
      {
        header: i18n.$t('surveyRecommandation'),
        key: 'surveyRecommandation',
        width: 20,
        resolve(data) {
          if (data.review_isPromoter()) {
            return i18n.$t('promoter');
          } else if (data.review_isDetractor()) {
            return i18n.$t('detractor');
          } else {
            return i18n.$t('neutral');
          }
        },
      },
      {
        header: i18n.$t('surveyScore'),
        key: 'surveyScore',
        style: { numFmt: '#####0' },
        width: 20,
        resolve(data) {
          return data.get('review.rating.value') === null ? '' : data.get('review.rating.value');
        },
      },
      {
        header: i18n.$t('publicReviewStatus'),
        key: 'publicReviewStatus',
        width: 20,
        resolve(data) {
          if (data.get('review.comment')) {
            return data.get('review.comment.status') === 'Approved' ? i18n.$t('published') : i18n.$t('rejected');
          } else {
            return i18n.$t('rejected');
          }
        },
      },
      {
        header: i18n.$t('publicReviewCommentBody'),
        key: 'publicReviewCommentBody',
        width: 20,
        resolve(data) {
          if (data.get('review.reply')) {
            return data.get('review.reply.text') || '';
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('publicReviewCommentCreatedAt'),
        key: 'publicReviewCommentCreatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          if (data.get('review.reply')) {
            return convertToTimezoneDate(data.get('review.reply.approvedAt'), rawGarage.timezone);
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
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('followupSurvey'),
        key: 'followupSurvey',
        width: 20,
        resolve(data) {
          if (data.get('unsatisfied.detectedAt')) {
            if (data.get('unsatisfied.followupStatus') === UnsatisfiedFollowupStatus.RESOLVED) {
              return i18n.$t('followupResolved');
            } else if (data.get('unsatisfied.followupStatus') === UnsatisfiedFollowupStatus.IN_PROGRESS) {
              return i18n.$t('followupInProgress');
            } else {
              return i18n.$t('followupNotResolved');
            }
          } else if (data.get('surveyFollowupUnsatisfied')) {
            return i18n.$t('noAnswer');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('hasBeenRecontacted'),
        key: 'hasBeenRecontacted',
        width: 20,
        resolve(data) {
          if (data.get('unsatisfied.detectedAt')) {
            return data.get('unsatisfied.isRecontacted') ? i18n.$t('yes') : i18n.$t('no');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('changedMind'),
        key: 'changedMind',
        width: 20,
        resolve(data) {
          if (data.get('unsatisfied.detectedAt')) {
            if (
              data.get('review.followupUnsatisfiedComment.text') &&
              data.get('review.followupUnsatisfiedComment.text').length
            ) {
              return i18n.$t('yes');
            } else {
              return i18n.$t('no');
            }
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLead'),
        key: 'surveyLead',
        width: 20,
        resolve(data) {
          if (!data.get('lead.potentialSale')) {
            return i18n.$t('no');
          } else if (data.get('lead.isConverted')) {
            return i18n.$t(LeadFollowupStatus.LEAD_CONVERTED);
          } else if (!data.get('surveyFollowupLead.sendAt')) {
            return i18n.$t(LeadFollowupStatus.NEW_LEAD);
          } else if (data.get('leadTicket.followup.recontacted') === false) {
            return i18n.$t(LeadFollowupStatus.NOT_RECONTACTED);
          } else if ([
            LeadFollowupStatus.NOT_PROPOSED,
            LeadFollowupStatus.YES_PLANNED,
            LeadFollowupStatus.YES_DONE,
            LeadFollowupStatus.NOT_WANTED
          ].includes(data.get('leadTicket.followup.appointment'))) {
            return i18n.$t(data.get('leadTicket.followup.appointment'));
          } else if (data.get('surveyFollowupLead.sendAt')) {
            return i18n.$t(LeadFollowupStatus.LEAD_WITHOUT_ANSWER);
          } else {
            return i18n.$t(LeadFollowupStatus.NEW_LEAD);
          }
        },
      },
      {
        header: i18n.$t('leadType'),
        key: 'leadType',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return i18n.$t(data.get('lead.type')) || '';
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadType'),
        key: 'surveyLeadType',
        width: 20,
        resolve() {
          return '';
        },
      },
      {
        header: i18n.$t('surveyLeadTime'),
        key: 'surveyLeadTime',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.saleType')
              ? i18n.$t(`leadSaleType_${data.get('lead.saleType')}`)
              : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadVehicle'),
        key: 'surveyLeadVehicle',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.knowVehicle') ? data.get('lead.vehicle') || '' : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadBrands'),
        key: 'surveyLeadBrands',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return Array.isArray(data.get('lead.brands'))
              ? commonTicket.formatBrandModel(data.get('lead.brands'), false)
              : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadBodyType'),
        key: 'surveyLeadBodyType',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.bodyType')
              ? data
                  .get('lead.bodyType')
                  .map((v) => i18n.$t(`leadBodyType_${v}`))
                  .join(', ')
              : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadEnergyType'),
        key: 'surveyLeadEnergyType',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.energyType')
              ? data
                  .get('lead.energyType')
                  .map((v) => i18n.$t(`leadEnergyType_${v}`))
                  .join(', ') || ''
              : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadFinancing'),
        key: 'surveyLeadFinancing',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.financing')
              ? i18n.$t(`leadFinancing_${data.get('lead.financing')}`)
              : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadTradeIn'),
        key: 'surveyLeadTradeIn',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            return data.get('lead.tradeIn') ? i18n.$t(`leadTradeIn_${data.get('lead.tradeIn')}`) : i18n.$t('undefined');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('surveyLeadConverted'),
        key: 'surveyLeadConverted',
        width: 20,
        resolve(data) {
          if (data.get('lead.potentialSale')) {
            const tradeIn = data.get('lead.isConvertedToTradeIn') ? i18n.$t('tradeIn') : '';
            let result = '';
            if (data.get('lead.isConvertedToSale')) {
              result = data.get('lead.convertedSaleType')
                ? i18n.$t(`leadSaleType_${data.get('lead.convertedSaleType')}`)
                : i18n.$t('undefined');
            }
            result += (result && tradeIn ? ' + ' : '') + tradeIn;
            return result;
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('leadConvertedBy'),
        key: 'leadConvertedBy',
        width: 20,
        resolve(data, garage, dataConverted) {
          if (data.get('lead.potentialSale') && data.get('lead.convertedSaleDataId')) {
            return (dataConverted && dataConverted.service && dataConverted.service.frontDeskUserName) || '';
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('leadConvertedByDate'),
        key: 'leadConvertedByDate',
        width: 20,
        resolve(data) {
          return data.get('lead.convertedToSaleAt') || '';
        },
      },
      {
        header: i18n.$t('leadConvertedByBrand'),
        key: 'leadConvertedByBrand',
        width: 20,
        resolve(data, garage, dataConverted) {
          return (
            (dataConverted &&
              dataConverted.vehicle &&
              dataConverted.vehicle.make &&
              dataConverted.vehicle.make.value) ||
            ''
          );
        },
      },
      {
        header: i18n.$t('tradeInSoldBy'),
        key: 'tradeInSoldBy',
        width: 20,
        resolve(data, garage, dataConverted, dataTradeIn) {
          if (data.get('lead.potentialSale') && data.get('lead.convertedTradeInDataId')) {
            return (dataTradeIn && dataTradeIn.service && dataTradeIn.service.frontDeskUserName) || '';
          } else {
            return '';
          }
        },
      },
    ];
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const mongoData = app.models.Data.getMongoConnector();
    const row = {};

    const [dataConverted, dataTradeIn] = await Promise.all([
      ...(data.get('lead.potentialSale') && data.get('lead.convertedSaleDataId')
        ? [
            mongoData.findOne(
              { _id: new ObjectID(data.get('lead.convertedSaleDataId')) },
              { projection: { service: true, vehicle: true } }
            ),
          ]
        : []),
      ...(data.get('lead.potentialSale') && data.get('lead.convertedTradeInDataId')
        ? [
            mongoData.findOne(
              { _id: new ObjectID(data.get('lead.convertedTradeInDataId')) },
              { projection: { service: true } }
            ),
          ]
        : []),
    ]);

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(data, rawGarage, dataConverted, dataTradeIn);
      })
    );

    return row;
  },
};
