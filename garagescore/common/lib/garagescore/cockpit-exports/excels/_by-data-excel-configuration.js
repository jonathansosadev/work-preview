const { ObjectID } = require('mongodb');

const app = require('../../../../../server/server');
const UnsatisfiedTicketStatus = require('../../../../models/data/type/unsatisfied-ticket-status');
const SourceTypes = require('../../../../models/data/type/source-types');
const LeadSaleTypes = require('../../../../models/data/type/lead-sale-types');
const LeadTradeInTypes = require('../../../../models/data/type/lead-trade-in-types');
const LeadTicketStatuses = require('../../../../models/data/type/lead-ticket-status');
const ContactTicketStatus = require('../../../../models/data/type/contact-ticket-status');
const CampaignStatus = require('../../../../models/data/type/campaign-contact-status');
const PhoneStatus = require('../../../../models/data/type/phone-status');
const LeadFollowupStatus = require('../../../../models/data/type/lead-followup-status.js');
const followupLeadStatus = require('../../../../../server/webservers-standalones/api/_common/followup-lead-status');
const followupUnsatisfiedStatus = require('../../../../../server/webservers-standalones/api/_common/followup-unsatisfied-status');

const commonTicket = require('../../../../models/data/_common-ticket');
const timeHelper = require('../../../util/time-helper');
const _common = require('./_common');
const unsatisfiedCriterias = require('./_unsatisfied_criterias');
const { convertToTimezoneDate } = require('../../../../../frontend/utils/exports/helper');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('SheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      //----------------------------------------------------
      //----------------------COMMON------------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_COM__GARAGE'),
        key: 'BD_COM__GARAGE',
        width: 50,
        resolve({ garage }) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('BD_COM__FRONT_DESK_USER'),
        key: 'BD_COM__FRONT_DESK_USER',
        width: 30,
        resolve({ data }) {
          return data.get('service.frontDeskUserName') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__INTERNAL_REFERENCE'),
        key: 'BD_COM__INTERNAL_REFERENCE',
        width: 20,
        resolve({ data }) {
          return data.get('service.frontDeskCustomerId') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__VEHICLE_BRAND'),
        key: 'BD_COM__VEHICLE_BRAND',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.make.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__VEHICLE_MODEL'),
        key: 'BD_COM__VEHICLE_MODEL',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.model.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__PLATE'),
        key: 'BD_COM__PLATE',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.plate.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__VIN'),
        key: 'BD_COM__VIN',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.vin.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__MILEAGE'),
        key: 'BD_COM__MILEAGE',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.mileage.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__REGISTRATION_DATE'),
        key: 'BD_COM__REGISTRATION_DATE',
        width: 20,
        resolve({ data }) {
          return data.get('vehicle.registrationDate.value') || '';
        },
      },
      {
        header: i18n.$t('BD_COM__DATA_TYPE'),
        key: 'BD_COM__DATA_TYPE',
        width: 20,
        resolve({ data }) {
          return i18n.$t(data.get('type')) || '';
        },
      },
      {
        header: i18n.$t('BD_COM__BILLING_DATE'),
        key: 'BD_COM__BILLING_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          return convertToTimezoneDate(data.get('service.providedAt'), garage.timezone);
        },
      },

      //----------------------------------------------------
      //-------------------SATISFACTION---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_SAT__SURVEY_DATE'),
        key: 'BD_SAT__SURVEY_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          return convertToTimezoneDate(data.get('survey.sendAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_SAT__SCORE'),
        key: 'BD_SAT__SCORE',
        width: 20,
        style: { numFmt: '#####0' },
        resolve({ data }) {
          return data.get('review.rating.value') === null ? '' : data.get('review.rating.value');
        },
      },
      {
        header: i18n.$t('BD_SAT__NPS_WORDING'),
        key: 'BD_SAT__NPS_WORDING',
        width: 20,
        resolve({ data }) {
          if (typeof data.get('review.rating.value') !== 'number') {
            return '';
          } else if (data.review_isPromoter()) {
            return i18n.$t('Promoter');
          } else if (data.review_isDetractor()) {
            return i18n.$t('Detractor');
          } else {
            return i18n.$t('Neutral');
          }
        },
      },
      {
        header: i18n.$t('BD_SAT__REVIEW'),
        key: 'BD_SAT__REVIEW',
        width: 20,
        resolve({ data }) {
          return data.get('review.comment.text') || '';
        },
      },
      {
        header: i18n.$t('BD_SAT__REVIEW_STATUS'),
        key: 'BD_SAT__REVIEW_STATUS',
        width: 20,
        resolve({ data }) {
          if (data.get('review.comment')) {
            return data.get('review.comment.status') === 'Approved' ? i18n.$t('Published') : i18n.$t('Rejected');
          }
          return i18n.$t('Rejected');
        },
      },
      {
        header: i18n.$t('BD_SAT__REVIEW_DATE'),
        key: 'BD_SAT__REVIEW_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          return convertToTimezoneDate(data.get('review.createdAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_SAT__ANSWER'),
        key: 'BD_SAT__ANSWER',
        width: 20,
        resolve({ data }) {
          if (data.get('review.reply')) {
            return data.get('review.reply.text') || '';
          }
          return '';
        },
      },
      {
        header: i18n.$t('BD_SAT__ANSWER_STATUS'),
        key: 'BD_SAT__ANSWER_STATUS',
        width: 20,
        resolve({ data }) {
          if (data.get('review.reply')) {
            return data.get('review.reply.status') === 'Approved' ? i18n.$t('Published') : i18n.$t('Rejected');
          }
          return i18n.$t('Rejected');
        },
      },
      {
        header: i18n.$t('BD_SAT__ANSWER_DATE'),
        key: 'BD_SAT__ANSWER_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          return convertToTimezoneDate(data.get('review.reply.approvedAt'), garage.timezone);
        },
      },

      //----------------------------------------------------
      //--------------------UNSATISFIED---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_UNS__STATUS'),
        key: 'BD_UNS__STATUS',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }

          return i18n.$t(`UNSAT_STATUS__${data.get('unsatisfiedTicket.status')}`) || '';
        },
      },
      {
        header: i18n.$t('BD_UNS__CLOSING_SUB_REASON'),
        key: 'BD_UNS__CLOSING_SUB_REASON',
        width: 20,
        resolve({ data }) {
          if (data.get('unsatisfiedTicket') && data.get('unsatisfiedTicket.status') === 'ClosedWithoutResolution') {
            const reasons = data.get('unsatisfiedTicket.claimReasons') || [];
            return reasons.map((reason) => i18n.$t(reason)).join(', ');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('BD_UNS__MANAGER'),
        key: 'BD_UNS__MANAGER',
        width: 20,
        resolve({ unsatisfiedManager, data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }

          if (unsatisfiedManager) {
            if (unsatisfiedManager.firstName) {
              const lastName = unsatisfiedManager.lastName;
              return `${unsatisfiedManager.firstName} ${lastName ? ` ${lastName.charAt(0)}.` : ''}`;
            }
            if (unsatisfiedManager.email) {
              return unsatisfiedManager.email;
            }
            return i18n.$t('UnAssigned');
          }
          return i18n.$t('UnAssigned');
        },
      },
      {
        header: i18n.$t('BD_UNS__ELAPSED_TIME'),
        key: 'BD_UNS__ELAPSED_TIME',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }

          return data.get('unsatisfiedTicket.createdAt')
            ? _common.countdown(data.get('unsatisfiedTicket.createdAt'), data.get('unsatisfiedTicket.closedAt') || null)
            : '';
        },
      },
      {
        header: i18n.$t('BD_UNS__CLOSING_COMMENT'),
        key: 'BD_UNS__CLOSING_COMMENT',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }

          return commonTicket.getLastClosingAction('unsatisfied', data)
            ? commonTicket.getLastClosingAction('unsatisfied', data).comment || ''
            : '';
        },
      },
      {
        header: i18n.$t('BD_UNS__CLOSING_DATE'),
        key: 'BD_UNS__CLOSING_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }
          const isClosed = UnsatisfiedTicketStatus.isClosed(data.get('unsatisfiedTicket.status'));
          return (isClosed && convertToTimezoneDate(data.get('review.reply.approvedAt'), garage.timezone)) || '';
        },
      },
      {
        header: i18n.$t('BD_UNS__FOLLOWUP_STATUS'),
        key: 'BD_UNS__FOLLOWUP_STATUS',
        width: 20,
        resolve({ data }) {
          return i18n.$t(followupUnsatisfiedStatus(data));
        },
      },
      {
        header: i18n.$t('BD_UNS__FOLLOWUP_DATE'),
        key: 'BD_UNS__FOLLOWUP_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }
          return convertToTimezoneDate(data.get('surveyFollowupUnsatisfied.sendAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_UNS__IS_RESOLVED'),
        key: 'BD_UNS__IS_RESOLVED',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }
          if (!data.get('surveyFollowupUnsatisfied.firstRespondedAt')) {
            return '';
          }

          if (data.get('unsatisfiedTicket.status') === UnsatisfiedTicketStatus.CLOSED_WITH_RESOLUTION) {
            return i18n.$t('Resolved');
          } else if (data.get('unsatisfiedTicket.status') === UnsatisfiedTicketStatus.CLOSED_WITHOUT_RESOLUTION) {
            return i18n.$t('Unresolved');
          }
          return i18n.$t('InProgress');
        },
      },
      {
        header: i18n.$t('BD_UNS__RECONTACTED'),
        key: 'BD_UNS__RECONTACTED',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }
          if (!data.get('surveyFollowupUnsatisfied.firstRespondedAt')) {
            return '';
          }

          if (data.get('unsatisfied.isRecontacted')) {
            return i18n.$t('Yes');
          }

          return data.get('unsatisfied.isRecontacted') === null ? '' : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BD_UNS__CHANGED_MIND'),
        key: 'BD_UNS__CHANGED_MIND',
        width: 20,
        resolve({ data }) {
          if (!data.get('unsatisfiedTicket.createdAt')) {
            return '';
          }
          if (!data.get('surveyFollowupUnsatisfied.firstRespondedAt')) {
            return '';
          }
          const foreignResponses = data.get('surveyFollowupUnsatisfied.foreignResponses');
          const { followupChangeMind } = (foreignResponses && foreignResponses[0] && foreignResponses[0].payload) || {};
          if (followupChangeMind && followupChangeMind === 'Yes') {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },

      ...unsatisfiedCriterias(i18n),

      //----------------------------------------------------
      //-----------------------LEADS------------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_LEA__IDENTIFICATION_DATE'),
        key: 'BD_LEA__IDENTIFICATION_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }
          return convertToTimezoneDate(data.get('lead.reportedAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_LEA__STATUS'),
        key: 'BD_LEA__STATUS',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          const { CLOSED_WITH_SALE, CLOSED_WITHOUT_SALE } = LeadTicketStatuses;
          const isMaintenance = data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE;
          const isTicketClosed = [CLOSED_WITH_SALE, CLOSED_WITHOUT_SALE].includes(data.get('leadTicket.status'));

          if (isMaintenance && isTicketClosed) {
            return i18n.$t(`LEAD_STATUS__APV_${data.get('leadTicket.status')}`);
          }
          if (!isMaintenance && data.get('lead.isConvertedToSale')) {
            return i18n.$t('LEAD_STATUS__ClosedWithSale');
          }
          if (!isTicketClosed && data.get('leadTicket.followup.appointment') === LeadFollowupStatus.YES_DONE) {
            return i18n.$t('LEAD_STATUS__RDVYesDone');
          }

          return (data.get('leadTicket.status') && i18n.$t(`LEAD_STATUS__${data.get('leadTicket.status')}`)) || '';
        },
      },
      {
        header: i18n.$t('BD_LEA__CLOSING_SUB_REASON'),
        key: 'BD_LEA__CLOSING_SUB_REASON',
        width: 20,
        resolve({ data }) {
          if (data.get('leadTicket') && data.get('leadTicket.status') === 'ClosedWithoutSale') {
            const reasons = data.get('leadTicket.missedSaleReason') || [];
            return reasons.map((reason) => i18n.$t(reason)).join(', ');
          } else {
            return '';
          }
        },
      },
      {
        header: i18n.$t('BD_LEA__MANAGER'),
        key: 'BD_LEA__MANAGER',
        width: 20,
        resolve({ garage, data, leadManager }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (leadManager) {
            if (leadManager.firstName) {
              const lastName = leadManager.lastName;
              return `${leadManager.firstName} ${lastName ? ` ${lastName.charAt(0)}.` : ''}`;
            }
            if (leadManager.email) {
              return leadManager.email;
            }
            return i18n.$t('UnAssigned');
          }
          return i18n.$t('UnAssigned');
        },
      },
      {
        header: i18n.$t('BD_LEA__LEAD_TYPE'),
        key: 'BD_LEA__LEAD_TYPE',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE) {
            return i18n.$t('ApvInterested');
          }
          return (data.get('lead.type') && i18n.$t(`LeadType_${data.get('lead.type')}`)) || '';
        },
      },
      {
        header: i18n.$t('BD_LEA__SOURCE'),
        key: 'BD_LEA__SOURCE',
        width: 20,
        resolve({ data, garage, automationCampaign, garageAgent }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          const sourceType = data.get('source.type');

          if (!garage.isSubscribed('Lead')) {
            return '';
          }

          if (garageAgent && sourceType === SourceTypes.AGENT) {
            return [i18n.$t(sourceType), garageAgent.publicDisplayName].filter((e) => e).join(' - ');
          }

          if (automationCampaign && sourceType === SourceTypes.AUTOMATION) {
            return [i18n.$t(sourceType), automationCampaign.displayName].filter((e) => e).join(' - ');
          }

          return [i18n.$t(sourceType), i18n.$t(data.get('source.by'))].filter((e) => e).join(' - ');
        },
      },
      {
        header: i18n.$t('BD_LEA__TIMING'),
        key: 'BD_LEA__TIMING',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return i18n.$t(data.get('leadTicket.timing')) || '';
        },
      },
      {
        header: i18n.$t('BD_LEA__WHISHED_BRAND'),
        key: 'BD_LEA__WHISHED_BRAND',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (Array.isArray(data.get('lead.brands'))) {
            return commonTicket.formatBrandModel(data.get('lead.brands'), false);
          }

          return data.get('lead.brands') || '';
        },
      },
      {
        header: i18n.$t('BD_LEA__WHISHED_MODEL'),
        key: 'BD_LEA__WHISHED_MODEL',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (data.get('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE) {
            return '';
          }
          if (data.get('lead.knowVehicle') || data.get('leadTicket.knowVehicle')) {
            return data.get('lead.vehicle') || data.get('leadTicket.brandModel') || '';
          }
          return i18n.$t('Unknown');
        },
      },
      {
        header: i18n.$t('BD_LEA__WHISHED_BODY_TYPE'),
        key: 'BD_LEA__WHISHED_BODY_TYPE',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
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
        header: i18n.$t('BD_LEA__WHISHED_ENERGY'),
        key: 'BD_LEA__WHISHED_ENERGY',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return Array.isArray(data.get('lead.energyType')) || Array.isArray(data.get('leadTicket.energyType'))
            ? (data.get('lead.energyType') || data.get('leadTicket.energyType')).map((e) => i18n.$t(e)).join(', ')
            : '';
        },
      },
      {
        header: i18n.$t('BD_LEA__BUDGET'),
        key: 'BD_LEA__BUDGET',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return data.get('leadTicket.budget') ? `${data.get('leadTicket.budget')} €` : '';
        },
      },
      {
        header: i18n.$t('BD_LEA__WISHED_FINANCING'),
        key: 'BD_LEA__WISHED_FINANCING',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return data.get('leadTicket.financing') ? i18n.$t(data.get('leadTicket.financing')) : '';
        },
      },
      {
        header: i18n.$t('BD_LEA__WISHED_TRADE_IN'),
        key: 'BD_LEA__WISHED_TRADE_IN',
        width: 20,
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
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
        header: i18n.$t('BD_LEA__CLOSING_COMMENT'),
        key: 'BD_LEA__CLOSING_COMMENT',
        width: 20,
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return commonTicket.getLastClosingAction('lead', data)
            ? commonTicket.getLastClosingAction('lead', data).comment || ''
            : '';
        },
      },
      {
        header: i18n.$t('BD_LEA__CLOSING_DATE'),
        key: 'BD_LEA__CLOSING_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          return data.get('leadTicket.closedAt') || '';
        },
      },
      {
        header: i18n.$t('BD_LEA__CONVERSION_DATE'),
        key: 'BD_LEA__CONVERSION_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (!garage.isSubscribed('Lead') || !data.get('lead.isConvertedToSale')) {
            return '';
          }
          return convertToTimezoneDate(data.get('lead.convertedToSaleAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_LEA__FOLLOWUP_STATUS'),
        key: 'BD_LEA__FOLLOWUP_STATUS',
        width: 20,
        resolve({ data }) {
          return i18n.$t(followupLeadStatus(data));
        },
      },
      {
        header: i18n.$t('BD_LEA__FOLLOWUP_DATE'),
        key: 'BD_LEA__FOLLOWUP_DATE',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }
          return convertToTimezoneDate(data.get('surveyFollowupLead.sendAt'), garage.timezone);
        },
      },
      {
        header: i18n.$t('BD_LEA__FOLLOWUP_RECONTACTED'),
        key: 'BD_LEA__FOLLOWUP_RECONTACTED',
        width: 20,
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (data.get('leadTicket.followup.recontacted')) {
            return i18n.$t('Yes');
          }

          return data.get('leadTicket.followup.recontacted') === null ? '' : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BD_LEA__FOLLOWUP_SATISFIED'),
        key: 'BD_LEA__FOLLOWUP_SATISFIED',
        width: 20,
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          }

          if (data.get('leadTicket.followup.satisfied')) {
            return i18n.$t('Yes');
          }
          return data.get('leadTicket.followup.satisfied') === null ? '' : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BD_LEA__FOLLOWUP_APPOINTMENT'),
        key: 'BD_LEA__FOLLOWUP_APPOINTMENT',
        width: 20,
        resolve({ garage, data }) {
          if (!garage.isSubscribed('Lead') || !data.get('leadTicket.createdAt')) {
            return '';
          } else if ([
            LeadFollowupStatus.NOT_PROPOSED,
            LeadFollowupStatus.YES_PLANNED,
            LeadFollowupStatus.YES_DONE,
            LeadFollowupStatus.NOT_WANTED
          ].includes(data.get('leadTicket.followup.appointment'))) {
            return i18n.$t(data.get('leadTicket.followup.appointment'));
          }

          return '';
        },
      },

      //----------------------------------------------------
      //---------------------CONTACTS-----------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_CON__GENDER'),
        key: 'BD_CON__GENDER',
        width: 20,
        resolve({ data }) {
          return i18n.$t(data.get('customer.title.value')) || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_GENDER'),
        key: 'BD_CON__MODIFIED_GENDER',
        width: 20,
        resolve({ data }) {
          return data.get('customer.title.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__FIRST_NAME'),
        key: 'BD_CON__FIRST_NAME',
        width: 20,
        resolve({ data }) {
          return data.get('customer.firstName.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_FIRST_NAME'),
        key: 'BD_CON__MODIFIED_FIRST_NAME',
        width: 20,
        resolve({ data }) {
          return data.get('customer.firstName.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__LAST_NAME'),
        key: 'BD_CON__LAST_NAME',
        width: 20,
        resolve({ data }) {
          return data.get('customer.lastName.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_LAST_NAME'),
        key: 'BD_CON__MODIFIED_LAST_NAME',
        width: 20,
        resolve({ data }) {
          return data.get('customer.lastName.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__FULLNAME'),
        key: 'BD_CON__FULLNAME',
        width: 20,
        resolve({ data }) {
          return data.get('customer.fullName.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__EMAIL'),
        key: 'BD_CON__EMAIL',
        width: 20,
        resolve({ data }) {
          return data.get('customer.contact.email.original') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_EMAIL'),
        key: 'BD_CON__MODIFIED_EMAIL',
        width: 20,
        resolve({ data }) {
          return data.get('customer.contact.email.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__LAST_KNOWN_EMAIL_STATUS'),
        key: 'BD_CON__LAST_KNOWN_EMAIL_STATUS',
        width: 20,
        resolve({ data }) {
          return i18n.$t(data.get('campaign.contactStatus.emailStatus'));
        },
      },
      {
        header: i18n.$t('BD_CON__PHONE'),
        key: 'BD_CON__PHONE',
        width: 20,
        resolve({ data }) {
          return data.get('customer.contact.mobilePhone.original') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_PHONE'),
        key: 'BD_CON__MODIFIED_PHONE',
        width: 20,
        resolve({ data }) {
          return data.get('customer.contact.mobilePhone.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__LAST_KNOWN_PHONE_STATUS'),
        key: 'BD_CON__LAST_KNOWN_PHONE_STATUS',
        width: 20,
        resolve({ data }) {
          return i18n.$t(data.get('campaign.contactStatus.phoneStatus'));
        },
      },
      {
        header: i18n.$t('BD_CON__ADDRESS'),
        key: 'BD_CON__ADDRESS',
        width: 20,
        resolve({ data }) {
          return data.get('customer.street.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_ADDRESS'),
        key: 'BD_CON__MODIFIED_ADDRESS',
        width: 20,
        resolve({ data }) {
          return data.get('customer.street.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__POSTAL_CODE'),
        key: 'BD_CON__POSTAL_CODE',
        width: 20,
        resolve({ data }) {
          return data.get('customer.postalCode.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_POSTAL_CODE'),
        key: 'BD_CON__MODIFIED_POSTAL_CODE',
        width: 20,
        resolve({ data }) {
          return data.get('customer.postalCode.revised') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__CITY'),
        key: 'BD_CON__CITY',
        width: 20,
        resolve({ data }) {
          return data.get('customer.city.value') || '';
        },
      },
      {
        header: i18n.$t('BD_CON__MODIFIED_CITY'),
        key: 'BD_CON__MODIFIED_CITY',
        width: 20,
        resolve({ data }) {
          return data.get('customer.city.revised') ? data.get('customer.city.revised') : '';
        },
      },
      {
        header: i18n.$t('BD_CON__CAMPAIGN_STATUS'),
        key: 'BD_CON__CAMPAIGN_STATUS',
        width: 20,
        resolve({ data }) {
          return i18n.$t(data.get('campaign.contactStatus.status'));
        },
      },
      {
        header: i18n.$t('BD_CON__TICKET_STATUS'),
        key: 'BD_CON__TICKET_STATUS',
        width: 20,
        resolve({ data }) {
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

      //----------------------------------------------------
      //--------------------EREPUTATION---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BD_ERE__SOURCE'),
        key: 'BD_ERE__SOURCE',
        width: 20,
        resolve({ data }) {
          return data.get('source.type') || '';
        },
      },
      {
        header: i18n.$t('BD_ERE__RECOMMEND'),
        key: 'BD_ERE__RECOMMEND',
        width: 20,
        resolve({ data }) {
          if (data.get('review.rating.recommend')) {
            return i18n.$t('Yes');
          }
          return data.get('review.rating.recommend') === null ? '' : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BD_ERE__SCORE'),
        key: 'BD_ERE__SCORE',
        width: 20,
        resolve({ data }) {
          const value = data.get('review.rating.value');
          if (!isNaN(value)) {
            return value;
          }
          return '';
        },
      },
      {
        header: i18n.$t('BD_ERE__REVIEW'),
        key: 'BD_ERE__REVIEW',
        width: 20,
        resolve({ data }) {
          if (data.get('review.comment.status') === 'Approved') {
            return data.get('review.comment.text');
          }
          return '';
        },
      },
      {
        header: i18n.$t('BD_ERE__ANSWER'),
        key: 'BD_ERE__ANSWER',
        width: 20,
        resolve({ data }) {
          if (data.get('review.reply.status') === 'Approved') {
            return data.get('review.reply.text');
          }
          return '';
        },
      },
      {
        header: i18n.$t('BD_ERE__DATE_REVIEW'),
        key: 'BD_ERE__DATE_REVIEW',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (data.get('review.comment.status') === 'Approved') {
            return convertToTimezoneDate(data.get('review.comment.approvedAt'), garage.timezone);
          }
          return '';
        },
      },
      {
        header: i18n.$t('BD_ERE__DATE_ANSWER'),
        key: 'BD_ERE__DATE_ANSWER',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ data, garage }) {
          if (data.get('review.reply.status') === 'Approved') {
            return convertToTimezoneDate(data.get('review.reply.approvedAt'), garage.timezone);
          }
          return '';
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const garage = new app.models.Garage(rawGarage);
    const mongoData = app.models.Data.getMongoConnector();
    const mongoGarage = app.models.Data.getMongoConnector();
    const mongoUser = app.models.User.getMongoConnector();
    const mongoAutomationCampaign = app.models.AutomationCampaign.getMongoConnector();
    const sourceType = data.get('source.type');
    const agentGarageId = data.get('source.garageId');
    const automationCampaignId = data.get('leadTicket.automationCampaignId');
    const row = {};

    const [
      dataConverted,
      dataTradeIn,
      unsatisfiedManager,
      leadManager,
      garageAgent,
      automationCampaign,
    ] = await Promise.all([
      ...(data.get('lead.potentialSale') && data.get('lead.convertedSaleDataId')
        ? [
            mongoData.findOne(
              { _id: new ObjectID(data.get('lead.convertedSaleDataId')) },
              { projection: { service: true, vehicle: true } }
            ),
          ]
        : [null]),
      ...(data.get('lead.potentialSale') && data.get('lead.convertedTradeInDataId')
        ? [
            mongoData.findOne(
              { _id: new ObjectID(data.get('lead.convertedTradeInDataId')) },
              { projection: { service: true } }
            ),
          ]
        : [null]),
      ...(data.get('unsatisfiedTicket.manager') && data.get('unsatisfiedTicket.manager') !== 'undefined'
        ? [
            mongoUser.findOne(
              { _id: new ObjectID(data.get('unsatisfiedTicket.manager')) },
              { projection: { firstName: true, lastName: true, email: true } }
            ),
          ]
        : [null]),
      ...(data.get('leadTicket.manager') && data.get('leadTicket.manager') !== 'undefined'
        ? [
            mongoUser.findOne(
              { _id: new ObjectID(data.get('leadTicket.manager')) },
              { projection: { firstName: true, lastName: true, email: true } }
            ),
          ]
        : [null]),
      ...(agentGarageId && sourceType === SourceTypes.AGENT
        ? [mongoGarage.findOne({ _id: new ObjectID(agentGarageId) }, { projection: { publicDisplayName: true } })]
        : [null]),
      ...(sourceType === SourceTypes.AUTOMATION
        ? [
            mongoAutomationCampaign.findOne(
              { _id: ObjectID(automationCampaignId) },
              { projection: { displayName: true } }
            ),
          ]
        : [null]),
    ]);

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve({
          data,
          garage,
          dataConverted,
          dataTradeIn,
          unsatisfiedManager,
          leadManager,
          garageAgent,
          automationCampaign,
        });
      })
    );

    return row;
  },
};
