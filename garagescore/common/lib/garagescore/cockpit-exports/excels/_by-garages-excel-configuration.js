const _common = require('./_common');
const serviceMiddleMans = require('./_service_middle_mans');
const serviceCategories = require('./_service_categories');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('SheetName');
  },

  getColumns({ i18n, fields, onError }) {
    return [
      //----------------------------------------------------
      //----------------------COMMON------------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_COM__GARAGE'),
        key: 'BG_COM__GARAGE',
        width: 50,
        resolve({ garage }) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('BG_COM__EXTERNALID'),
        key: 'BG_COM__EXTERNALID',
        width: 50,
        resolve({ garage }) {
          return (garage && garage.externalId) || '';
        },
      },

      //----------------------------------------------------
      //-------------------SATISFACTION---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_SAT__REVIEWS_COUNT'),
        key: 'BG_SAT__REVIEWS_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountReviews',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__NPS'),
        key: 'BG_SAT__NPS',
        width: 20,
        resolve({ document, dataTypes }) {
          const res = _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionNPS',
            avg: true,
            round: false,
            columnName: this.key,
            onError,
          });
          return Number(res.toFixed(2));
        },
      },
      {
        header: i18n.$t('BG_SAT__SCORE'),
        key: 'BG_SAT__SCORE',
        width: 20,
        resolve({ document, dataTypes }) {
          const countReviews = _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountReviews',
          });

          if (!countReviews) {
            return '';
          }

          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionRating',
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__SCORE_MAINTENANCE'),
        key: 'BG_SAT__SCORE_MAINTENANCE',
        width: 20,
        resolve({ document }) {
          const countReviews = _common.extractKpiFromKey({
            document,
            key: 'satisfactionCountReviewsApv',
          });

          if (!countReviews) {
            return '';
          }

          return _common.extractKpiFromKey({
            document,
            key: 'satisfactionRatingApv',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__SCORE_NEW_VEHICLE_SALE'),
        key: 'BG_SAT__SCORE_NEW_VEHICLE_SALE',
        width: 20,
        resolve({ document }) {
          const countReviews = _common.extractKpiFromKey({
            document,
            key: 'satisfactionCountReviewsVn',
          });

          if (!countReviews) {
            return '';
          }
          return _common.extractKpiFromKey({
            document,
            key: 'satisfactionRatingVn',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__SCORE_USED_VEHICLE_SALE'),
        key: 'BG_SAT__SCORE_USED_VEHICLE_SALE',
        width: 20,
        resolve({ document }) {
          const countReviews = _common.extractKpiFromKey({
            document,
            key: 'satisfactionCountReviewsVo',
          });

          if (!countReviews) {
            return '';
          }

          return _common.extractKpiFromKey({
            document,
            key: 'satisfactionRatingVo',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__ANSWERING_COUNT'),
        key: 'BG_SAT__ANSWERING_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountSurveysResponded',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__ANSWERING_PCT'),
        key: 'BG_SAT__ANSWERING_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'respondents',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__PROMOTORS_COUNT'),
        key: 'BG_SAT__PROMOTORS_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountPromoters',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__PROMOTORS_PCT'),
        key: 'BG_SAT__PROMOTORS_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountPromoters',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__DETRACTORS_COUNT'),
        key: 'BG_SAT__DETRACTORS_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountDetractors',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_SAT__DETRACTORS_PCT'),
        key: 'BG_SAT__DETRACTORS_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'satisfactionCountDetractors',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },

      //----------------------------------------------------
      //--------------------UNSATISFIED---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_UNS__UNSATISFIED_COUNT'),
        key: 'BG_UNS__UNSATISFIED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfied',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__UNPROCESSED_COUNT'),
        key: 'BG_UNS__UNPROCESSED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedUntouched',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__UNPROCESSED_PCT'),
        key: 'BG_UNS__UNPROCESSED_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedUntouched',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__PROCESSING_COUNT'),
        key: 'BG_UNS__PROCESSING_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedTouched',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__PROCESSING_PCT'),
        key: 'BG_UNS__PROCESSING_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedTouched',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__SAVED_COUNT'),
        key: 'BG_UNS__SAVED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedClosedWithResolution',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__SAVED_PCT'),
        key: 'BG_UNS__SAVED_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedClosedWithResolution',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__24H_REACTIVITY'),
        key: 'BG_UNS__24H_REACTIVITY',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedReactive',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_UNS__24H_REACTIVITY_PCT'),
        key: 'BG_UNS__24H_REACTIVITY_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countUnsatisfiedReactive',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },

      //----------------------------------------------------
      //-----------------------LEADS------------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_LEA__LEADS_COUNT'),
        key: 'BG_LEA__LEADS_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeads',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__UNPROCESSED_COUNT'),
        key: 'BG_LEA__UNPROCESSED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsUntouched',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__UNPROCESSED_PCT'),
        key: 'BG_LEA__UNPROCESSED_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsUntouched',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__PROCESSING_COUNT'),
        key: 'BG_LEA__PROCESSING_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsTouched',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__PROCESSING_PCT'),
        key: 'BG_LEA__PROCESSING_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsTouched',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__CONVERTED_COUNT'),
        key: 'BG_LEA__CONVERTED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsClosedWithSale',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__CONVERTED_PCT'),
        key: 'BG_LEA__CONVERTED_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsClosedWithSale',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__24H_REACTIVITY'),
        key: 'BG_LEA__24H_REACTIVITY',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsReactive',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_LEA__24H_REACTIVITY_PCT'),
        key: 'BG_LEA__24H_REACTIVITY_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'countLeadsReactive',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },

      ...serviceMiddleMans(i18n),
      ...serviceCategories(i18n),

      //----------------------------------------------------
      //---------------------CONTACTS-----------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_CON__IMPORTED_COUNT'),
        key: 'BG_CON__IMPORTED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountTotalShouldSurfaceInCampaignStats',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__SURVEYED_COUNT'),
        key: 'BG_CON__SURVEYED_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return (
            _common.extractKpiFromKey({
              document,
              dataTypes,
              key: 'contactsCountReceivedSurveys',
              columnName: this.key,
              onError,
            }) +
            _common.extractKpiFromKey({
              document,
              dataTypes,
              key: 'contactsCountScheduledContacts',
              columnName: this.key,
              onError,
            })
          );
        },
      },
      {
        header: i18n.$t('BG_CON__ANSWERING_COUNT'),
        key: 'BG_CON__ANSWERING_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountSurveysResponded',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__ANSWERING_PCT'),
        key: 'BG_CON__ANSWERING_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'respondents',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__VALID_EMAILS_COUNT'),
        key: 'BG_CON__VALID_EMAILS_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          const countValidEmails = _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountValidEmails',
            columnName: this.key,
            onError,
          });

          const countBlockedByEmail = _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountBlockedByEmail',
            columnName: this.key,
            onError,
          });

          return countValidEmails + countBlockedByEmail;
        },
      },
      {
        header: i18n.$t('BG_CON__VALID_EMAILS_PCT'),
        key: 'BG_CON__VALID_EMAILS_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'validEmails',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__VALID_PHONES_COUNT'),
        key: 'BG_CON__VALID_PHONES_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountValidPhones',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__VALID_PHONES_PCT'),
        key: 'BG_CON__VALID_PHONES_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'validPhones',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__NON_CONTACTABLE_COUNT'),
        key: 'BG_CON__NON_CONTACTABLE_COUNT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'contactsCountNotContactable',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_CON__NON_CONTACTABLE_PCT'),
        key: 'BG_CON__NON_CONTACTABLE_PCT',
        width: 20,
        resolve({ document, dataTypes }) {
          return _common.extractKpiFromKey({
            document,
            dataTypes,
            key: 'unreachables',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },

      //----------------------------------------------------
      //--------------------EREPUTATION---------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BG_ERE__REVIEWS_COUNT'),
        key: 'BG_ERE__REVIEWS_COUNT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountReviews',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__NPS'),
        key: 'BG_ERE__NPS',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepNPS',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__SCORE'),
        key: 'BG_ERE__SCORE',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepRating',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__RECOMMENDATION_PCT'),
        key: 'BG_ERE__RECOMMENDATION_PCT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountRecommend',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__PROMOTORS_COUNT'),
        key: 'BG_ERE__PROMOTORS_COUNT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountPromoters',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__PROMOTORS_PCT'),
        key: 'BG_ERE__PROMOTORS_PCT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountPromoters',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__PASSIVE_COUNT'),
        key: 'BG_ERE__PASSIVE_COUNT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountPassives',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__PASSIVE_PCT'),
        key: 'BG_ERE__PASSIVE_PCT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountPassives',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__DETRACTORS_COUNT'),
        key: 'BG_ERE__DETRACTORS_COUNT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountDetractors',
            columnName: this.key,
            onError,
          });
        },
      },
      {
        header: i18n.$t('BG_ERE__DETRACTORS_PCT'),
        key: 'BG_ERE__DETRACTORS_PCT',
        width: 20,
        resolve({ document }) {
          return _common.extractKpiFromKey({
            document,
            key: 'erepCountDetractors',
            pct: true,
            avg: true,
            columnName: this.key,
            onError,
          });
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, document, dataTypes, garage, onError }) {
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields, onError }).map(async (col) => {
        row[col.key] = col.resolve({ document, garage, dataTypes });
      })
    );

    return row;
  },
};
