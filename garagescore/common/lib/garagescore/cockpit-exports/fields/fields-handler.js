const {
  ExportCategories,
  ShortcutExportTypes,
  DataTypes,
  ExportTypes,
  PredefinedExportTypes,
  ServiceMiddleMans,
  ServiceCategories,
} = require('../../../../../frontend/utils/enumV2');

module.exports = {
  [ExportCategories.BY_GARAGES]: {
    SATISFACTION: [
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__NPS',
      'BG_SAT__SCORE',
      'BG_SAT__SCORE_MAINTENANCE',
      'BG_SAT__SCORE_NEW_VEHICLE_SALE',
      'BG_SAT__SCORE_USED_VEHICLE_SALE',
      // 'BG_SAT__ANSWERING_COUNT', //duplicate of BG_SAT__REVIEWS_COUNT : https://github.com/garagescore/garagescore/issues/4812
      'BG_SAT__ANSWERING_PCT',
      'BG_SAT__PROMOTORS_COUNT',
      'BG_SAT__PROMOTORS_PCT',
      'BG_SAT__DETRACTORS_COUNT',
      'BG_SAT__DETRACTORS_PCT',
      // ...ServiceMiddleMans.keys().map((key) => ServiceMiddleMans.getProperty(key, 'exportColumnKey')),
      // ...ServiceCategories.keys().map((key) => ServiceCategories.getProperty(key, 'exportColumnKey')),
    ],
    UNSATISFIED: [
      'BG_UNS__UNSATISFIED_COUNT',
      'BG_UNS__UNPROCESSED_COUNT',
      'BG_UNS__UNPROCESSED_PCT',
      'BG_UNS__PROCESSING_COUNT',
      'BG_UNS__PROCESSING_PCT',
      'BG_UNS__SAVED_COUNT',
      'BG_UNS__SAVED_PCT',
      'BG_UNS__24H_REACTIVITY',
      'BG_UNS__24H_REACTIVITY_PCT',
    ],
    LEADS: [
      'BG_LEA__LEADS_COUNT',
      'BG_LEA__UNPROCESSED_COUNT',
      'BG_LEA__UNPROCESSED_PCT',
      'BG_LEA__PROCESSING_COUNT',
      'BG_LEA__PROCESSING_PCT',
      'BG_LEA__CONVERTED_COUNT',
      'BG_LEA__CONVERTED_PCT',
      'BG_LEA__24H_REACTIVITY',
      'BG_LEA__24H_REACTIVITY_PCT',
    ],
    CONTACTS: [
      'BG_CON__IMPORTED_COUNT',
      'BG_CON__SURVEYED_COUNT',
      'BG_CON__ANSWERING_COUNT',
      'BG_CON__ANSWERING_PCT',
      'BG_CON__VALID_EMAILS_COUNT',
      'BG_CON__VALID_EMAILS_PCT',
      'BG_CON__VALID_PHONES_COUNT',
      'BG_CON__VALID_PHONES_PCT',
      'BG_CON__NON_CONTACTABLE_COUNT',
      'BG_CON__NON_CONTACTABLE_PCT',
    ],
    EREPUTATION: [
      'BG_ERE__REVIEWS_COUNT',
      'BG_ERE__NPS',
      'BG_ERE__SCORE',
      'BG_ERE__RECOMMENDATION_PCT',
      'BG_ERE__PROMOTORS_COUNT',
      'BG_ERE__PROMOTORS_PCT',
      'BG_ERE__PASSIVE_COUNT',
      'BG_ERE__PASSIVE_PCT',
      'BG_ERE__DETRACTORS_COUNT',
      'BG_ERE__DETRACTORS_PCT',
    ],
    COMMON: ['BG_COM__GARAGE', 'BG_COM__EXTERNALID'],
  },
  [ExportCategories.BY_FRONT_DESK_USERS]: {
    [ExportTypes.FRONT_DESK_USERS_DMS]: {
      SATISFACTION: [
        'BF_SAT__REVIEWS_COUNT',
        'BF_SAT__NPS',
        'BF_SAT__SCORE',
        'BF_SAT__SCORE_MAINTENANCE',
        'BF_SAT__SCORE_NEW_VEHICLE_SALE',
        'BF_SAT__SCORE_USED_VEHICLE_SALE',
        'BF_SAT__ANSWERING_COUNT',
        'BF_SAT__ANSWERING_PCT',
        'BF_SAT__PROMOTORS_COUNT',
        'BF_SAT__PROMOTORS_PCT',
        'BF_SAT__DETRACTORS_COUNT',
        'BF_SAT__DETRACTORS_PCT',
      ],
      CONTACTS: [
        'BF_CON__IMPORTED_COUNT',
        'BF_CON__SURVEYED_COUNT',
        'BF_CON__ANSWERING_COUNT',
        'BF_CON__ANSWERING_PCT',
        'BF_CON__VALID_EMAILS_COUNT',
        'BF_CON__VALID_EMAILS_PCT',
        'BF_CON__VALID_PHONES_COUNT',
        'BF_CON__VALID_PHONES_PCT',
        'BF_CON__NON_CONTACTABLE_COUNT',
        'BF_CON__NON_CONTACTABLE_PCT',
      ],
      COMMON: ['BF_COM__GARAGE', 'BF_COM__FRONT_DESK_USER'],
    },
    [ExportTypes.FRONT_DESK_USERS_CUSTEED]: {
      UNSATISFIED: [
        'BF_UNS__UNSATISFIED_COUNT',
        'BF_UNS__UNPROCESSED_COUNT',
        'BF_UNS__UNPROCESSED_PCT',
        'BF_UNS__PROCESSING_COUNT',
        'BF_UNS__PROCESSING_PCT',
        'BF_UNS__SAVED_COUNT',
        'BF_UNS__SAVED_PCT',
        'BF_UNS__24H_REACTIVITY',
        'BF_UNS__24H_REACTIVITY_PCT',
      ],
      LEADS: [
        'BF_LEA__LEADS_COUNT',
        'BF_LEA__UNPROCESSED_COUNT',
        'BF_LEA__UNPROCESSED_PCT',
        'BF_LEA__PROCESSING_COUNT',
        'BF_LEA__PROCESSING_PCT',
        'BF_LEA__CONVERTED_COUNT',
        'BF_LEA__CONVERTED_PCT',
        'BF_LEA__24H_REACTIVITY',
        'BF_LEA__24H_REACTIVITY_PCT',
      ],
      COMMON: ['BF_COM__GARAGE', 'BF_COM__FRONT_DESK_USER'],
    },
  },
  [ExportCategories.BY_DATA]: {
    SATISFACTION: [
      'BD_SAT__SURVEY_DATE',
      'BD_SAT__SCORE',
      'BD_SAT__NPS_WORDING',
      'BD_SAT__REVIEW',
      'BD_SAT__REVIEW_STATUS',
      'BD_SAT__REVIEW_DATE',
      'BD_SAT__ANSWER',
      'BD_SAT__ANSWER_STATUS',
      'BD_SAT__ANSWER_DATE',
    ],
    UNSATISFIED: [
      'BD_UNS__STATUS',
      'BD_UNS__CLOSING_SUB_REASON',
      'BD_UNS__MANAGER',
      'BD_UNS__ELAPSED_TIME',
      'BD_UNS__CLOSING_COMMENT',
      'BD_UNS__CLOSING_DATE',
      'BD_UNS__FOLLOWUP_STATUS',
      'BD_UNS__FOLLOWUP_DATE',
      'BD_UNS__IS_RESOLVED',
      'BD_UNS__RECONTACTED',
      'BD_UNS__CHANGED_MIND',

      {
        id: 'BD_UNS__MAINTENANCE_CRITERIA_1',
        subfields: [
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_1',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_2',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_3',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_4',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_24',
        ],
      },

      {
        id: 'BD_UNS__MAINTENANCE_CRITERIA_2',
        subfields: [
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_5',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_6',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_7',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_8',
        ],
      },

      {
        id: 'BD_UNS__MAINTENANCE_CRITERIA_3',
        subfields: [
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_10',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_11',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_12',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_13',
        ],
      },

      {
        id: 'BD_UNS__MAINTENANCE_CRITERIA_4',
        subfields: [
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_15',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_16',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_17',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_18',
        ],
      },

      {
        id: 'BD_UNS__MAINTENANCE_CRITERIA_5',
        subfields: [
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_20',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_21',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_22',
          'BD_UNS__MAINTENANCE_SUB_CRITERIA_23',
        ],
      },

      {
        id: 'BD_UNS__SALE_NEW_CRITERIA_1',
        subfields: [
          'BD_UNS__SALE_NEW_SUB_CRITERIA_1',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_2',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_3',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_4',
        ],
      },

      {
        id: 'BD_UNS__SALE_NEW_CRITERIA_2',
        subfields: [
          'BD_UNS__SALE_NEW_SUB_CRITERIA_5',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_6',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_7',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_8',
        ],
      },

      {
        id: 'BD_UNS__SALE_NEW_CRITERIA_3',
        subfields: [
          'BD_UNS__SALE_NEW_SUB_CRITERIA_10',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_11',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_12',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_13',
        ],
      },

      {
        id: 'BD_UNS__SALE_NEW_CRITERIA_4',
        subfields: [
          'BD_UNS__SALE_NEW_SUB_CRITERIA_15',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_16',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_17',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_18',
        ],
      },

      {
        id: 'BD_UNS__SALE_NEW_CRITERIA_5',
        subfields: [
          'BD_UNS__SALE_NEW_SUB_CRITERIA_20',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_21',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_22',
          'BD_UNS__SALE_NEW_SUB_CRITERIA_23',
        ],
      },

      {
        id: 'BD_UNS__SALE_USED_CRITERIA_1',
        subfields: [
          'BD_UNS__SALE_USED_SUB_CRITERIA_1',
          'BD_UNS__SALE_USED_SUB_CRITERIA_2',
          'BD_UNS__SALE_USED_SUB_CRITERIA_3',
          'BD_UNS__SALE_USED_SUB_CRITERIA_4',
        ],
      },

      {
        id: 'BD_UNS__SALE_USED_CRITERIA_3',
        subfields: [
          'BD_UNS__SALE_USED_SUB_CRITERIA_10',
          'BD_UNS__SALE_USED_SUB_CRITERIA_11',
          'BD_UNS__SALE_USED_SUB_CRITERIA_12',
          'BD_UNS__SALE_USED_SUB_CRITERIA_13',
        ],
      },

      {
        id: 'BD_UNS__SALE_USED_CRITERIA_4',
        subfields: [
          'BD_UNS__SALE_USED_SUB_CRITERIA_15',
          'BD_UNS__SALE_USED_SUB_CRITERIA_16',
          'BD_UNS__SALE_USED_SUB_CRITERIA_17',
          'BD_UNS__SALE_USED_SUB_CRITERIA_18',
        ],
      },

      {
        id: 'BD_UNS__SALE_USED_CRITERIA_5',
        subfields: [
          'BD_UNS__SALE_USED_SUB_CRITERIA_20',
          'BD_UNS__SALE_USED_SUB_CRITERIA_21',
          'BD_UNS__SALE_USED_SUB_CRITERIA_22',
          'BD_UNS__SALE_USED_SUB_CRITERIA_23',
        ],
      },

      {
        id: 'BD_UNS__SALE_USED_CRITERIA_6',
        subfields: [
          'BD_UNS__SALE_USED_SUB_CRITERIA_25',
          'BD_UNS__SALE_USED_SUB_CRITERIA_26',
          'BD_UNS__SALE_USED_SUB_CRITERIA_27',
          'BD_UNS__SALE_USED_SUB_CRITERIA_28',
        ],
      },

      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_1',
      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_2',
      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_3',
      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_4',
      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_5',
      'BD_UNS__VEHICLE_INSPECTION_CRITERIA_6',
    ],
    LEADS: [
      'BD_LEA__IDENTIFICATION_DATE',
      'BD_LEA__STATUS',
      'BD_LEA__CLOSING_SUB_REASON',
      'BD_LEA__MANAGER',
      'BD_LEA__LEAD_TYPE',
      'BD_LEA__SOURCE',
      'BD_LEA__TIMING',
      'BD_LEA__WHISHED_BRAND',
      'BD_LEA__WHISHED_MODEL',
      'BD_LEA__WHISHED_BODY_TYPE',
      'BD_LEA__WHISHED_ENERGY',
      'BD_LEA__BUDGET',
      'BD_LEA__WISHED_FINANCING',
      'BD_LEA__WISHED_TRADE_IN',
      'BD_LEA__CLOSING_COMMENT',
      'BD_LEA__CLOSING_DATE',
      'BD_LEA__CONVERSION_DATE',
      'BD_LEA__FOLLOWUP_STATUS',
      'BD_LEA__FOLLOWUP_DATE',
      'BD_LEA__FOLLOWUP_RECONTACTED',
      'BD_LEA__FOLLOWUP_SATISFIED',
      'BD_LEA__FOLLOWUP_APPOINTMENT',
    ],
    CONTACTS: [
      'BD_CON__GENDER',
      'BD_CON__MODIFIED_GENDER',
      'BD_CON__FIRST_NAME',
      'BD_CON__MODIFIED_FIRST_NAME',
      'BD_CON__LAST_NAME',
      'BD_CON__MODIFIED_LAST_NAME',
      'BD_CON__FULLNAME',
      'BD_CON__EMAIL',
      'BD_CON__MODIFIED_EMAIL',
      'BD_CON__LAST_KNOWN_EMAIL_STATUS',
      'BD_CON__PHONE',
      'BD_CON__MODIFIED_PHONE',
      'BD_CON__LAST_KNOWN_PHONE_STATUS',
      'BD_CON__ADDRESS',
      'BD_CON__MODIFIED_ADDRESS',
      'BD_CON__POSTAL_CODE',
      'BD_CON__MODIFIED_POSTAL_CODE',
      'BD_CON__CITY',
      'BD_CON__MODIFIED_CITY',
      'BD_CON__CAMPAIGN_STATUS',
      'BD_CON__TICKET_STATUS',
    ],
    EREPUTATION: [
      'BD_ERE__SOURCE',
      'BD_ERE__RECOMMEND',
      'BD_ERE__SCORE',
      'BD_ERE__REVIEW',
      'BD_ERE__ANSWER',
      'BD_ERE__DATE_REVIEW',
      'BD_ERE__DATE_ANSWER',
    ],
    AUTOMATION: {
      CAMPAIGN: [
        'BA_CAMPAIGN__NAME',
        'BA_CAMPAIGN__DATE',
        'BA_CAMPAIGN__TYPE',
        'BA_CAMPAIGN__STATUS',
        //'BA_COM__DATE_LAST_STATUS', hide but not delete because Romain
        //'BA_COM__LAST_STATUS',
        'BA_COM__DATE_EVENT_CANNOT_CONTACT',
        'BA_COM__IS_DATE_CURRENT_PERIOD_CANNOT_CONTACT',
        'BA_COM__DATE_EVENT_RECEIVED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_RECEIVED',
        'BA_COM__DATE_EVENT_OPENED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_OPENED',
        'BA_COM__DATE_EVENT_LEAD',
        'BA_COM__IS_DATE_CURRENT_PERIOD_LEAD',
        'BA_COM__DATE_EVENT_CONVERTED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_CONVERTED',
      ],
      RGPD: ['BA_RGPD__STATUS', 'BA_RGPD__DATE_OPT_OUT'],
      COMMON: [
        'BA_COM__PUBLIC_DISPLAY_NAME',
        'BA_COM__GENDER',
        'BA_COM__FULLNAME',
        'BA_COM__EMAIL',
        'BA_COM__PHONE',
        'BA_COM__CITY',
        'BA_COM__VEHICLE_PLATE',
      ],
    },
    COMMON: [
      'BD_COM__GARAGE',
      'BD_COM__FRONT_DESK_USER',
      'BD_COM__INTERNAL_REFERENCE',
      'BD_COM__VEHICLE_BRAND',
      'BD_COM__VEHICLE_MODEL',
      'BD_COM__PLATE',
      'BD_COM__VIN',
      'BD_COM__MILEAGE',
      'BD_COM__REGISTRATION_DATE',
      'BD_COM__DATA_TYPE',
      'BD_COM__BILLING_DATE',
    ],
  },
  [ExportCategories.BY_ADMIN_USERS]: {
    COMMON: [
      'BAU_COM__GENDER',
      'BAU_COM__FULLNAME',
      'BAU_COM__FIRSTNAME',
      'BAU_COM__LASTNAME',
      'BAU_COM__EMAIL',
      'BAU_COM__PHONE',
      'BAU_COM__MOBILE',
      'BAU_COM__JOB',
      'BAU_COM__ROLE',
      'BAU_COM__GARAGES_COUNT',
      'BAU_COM__GARAGES',
      'BAU_COM__BUSINESS_NAME',
      'BAU_COM__ADDRESS',
      'BAU_COM__POSTCODE',
      'BAU_COM__CITY',
      'BAU_COM__ADDRESS2',
      'BAU_COM__LAST_COCKPIT_OPEN_AT',
      'BAU_COM__CREATED_AT',
      'BAU_COM__ACCESS_HOME',
      'BAU_COM__ACCESS_SATISFACTION',
      'BAU_COM__ACCESS_LEADS',
      'BAU_COM__ACCESS_AUTOMATION',
      'BAU_COM__ACCESS_CONTACTS',
      'BAU_COM__ACCESS_EREPUTATION',
      'BAU_COM__ACCESS_ESTABLISHMENT',
      'BAU_COM__ACCESS_TEAM',
      'BAU_COM__ACCESS_ADMIN',
      'BAU_COM__ALERTS_UNSATISFIED_VI',
      'BAU_COM__ALERTS_UNSATISFIED_MAINTENANCE',
      'BAU_COM__ALERTS_UNSATISFIED_VN',
      'BAU_COM__ALERTS_UNSATISFIED_VO',
      'BAU_COM__ALERTS_LEAD_APV',
      'BAU_COM__ALERTS_LEAD_VN',
      'BAU_COM__ALERTS_LEAD_VO',
      'BAU_COM__ALERTS_EREPUTATION',
      'BAU_COM__ALERTS_DAILY_UNSATISFIED_VI',
      'BAU_COM__ALERTS_DAILY_UNSATISFIED_MAINTENANCE',
      'BAU_COM__ALERTS_DAILY_UNSATISFIED_VN',
      'BAU_COM__ALERTS_DAILY_UNSATISFIED_VO',
      'BAU_COM__ALERTS_DAILY_LEAD_VN',
      'BAU_COM__ALERTS_DAILY_LEAD_VO',
      'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VI',
      'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_MAINTENANCE',
      'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VN',
      'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VO',
      'BAU_COM__ALERTS_WEEKLY_LEAD_VN',
      'BAU_COM__ALERTS_WEEKLY_LEAD_VO',
      'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VI',
      'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_MAINTENANCE',
      'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VN',
      'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VO',
      'BAU_COM__ALERTS_MONTHLY_LEAD_VN',
      'BAU_COM__ALERTS_MONTHLY_LEAD_VO',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VI',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_MAINTENANCE',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VN',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VO',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VN',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VO',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_APV',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VN',
      'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VO',
    ],
  },
  [ExportCategories.BY_ADMIN_GARAGES]: {
    COMMON: [
      'BAG_COM__BUSINESS_NAME',
      'BAG_COM__GENDER',
      'BAG_COM__FULLNAME',
      'BAG_COM__FIRSTNAME',
      'BAG_COM__LASTNAME',
      'BAG_COM__EMAIL',
      'BAG_COM__PHONE',
      'BAG_COM__MOBILE',
      'BAG_COM__JOB',
      'BAG_COM__ROLE',
      'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_MAINTENANCE',
      'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VN',
      'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VO',
      'BAG_COM__TICKET_CONFIGURATION_LEAD_MAINTENANCE',
      'BAG_COM__TICKET_CONFIGURATION_LEAD_VN',
      'BAG_COM__TICKET_CONFIGURATION_LEAD_VO',
    ],
  },
  /**
   * Is the field valid for a given category ?
   * @param {string} field
   * @param {{value: string, properties: {exportTypes: string[]}}} category
   * @param {string} exportType
   * @returns {boolean} isValid ?
   */
  fieldIsValid(field, category, exportType = null) {
    if (!field || !category) {
      console.error('Missing or invalid arguments');
      return false;
    }

    if (category === ExportCategories.BY_FRONT_DESK_USERS) {
      const frontDeskUsersType = exportType || ExportTypes.FRONT_DESK_USERS_DMS;
      return !!Object.keys(this[category][frontDeskUsersType]).find((e) =>
        this[category][frontDeskUsersType][e].find((f) => f === field)
      );
    }

    if ([ExportTypes.AUTOMATION_RGPD, ExportTypes.AUTOMATION_CAMPAIGN].includes(exportType)) {
      return !!Object.keys(this[category]['AUTOMATION']).find((key) =>
        this[category]['AUTOMATION'][key].find((f) => f === field)
      );
    }

    return !!Object.keys(this[category]).find((e) => {
      return (
        this[category][e].length &&
        this[category][e].find(
          (f) =>
            (typeof f === 'string' && f === field) ||
            (typeof f === 'object' && (f.id === field || f.subfields.includes(field)))
        )
      );
    });
  },
  /**
   * Get parent unsatisfied criterias from data types.
   * @param {{value: string, properties: object}[]} dataTypes
   * @param {boolean} isVehicleInspection
   * @returns {string[]} Array of fields
   */
  getUnsatisfiedParentCriteriasFields(dataTypes, isVehicleInspection) {
    if (isVehicleInspection) {
      return [
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_1',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_2',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_3',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_4',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_5',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_6',
      ];
    }

    const hasDataType = (dataType) => dataTypes.includes(dataType) || dataTypes.includes('All');
    const getCriteriaByDataType = (dataTypeCriteria) =>
      this[ExportCategories.BY_DATA].UNSATISFIED.filter(
        (key) => typeof key === 'object' && key.id.includes(dataTypeCriteria)
      ).map((v) => v.id);

    return [
      ...(hasDataType(DataTypes.MAINTENANCE) ? getCriteriaByDataType('MAINTENANCE_CRITERIA') : []),
      ...(hasDataType(DataTypes.NEW_VEHICLE_SALE) ? getCriteriaByDataType('SALE_NEW_CRITERIA') : []),
      ...(hasDataType(DataTypes.USED_VEHICLE_SALE) ? getCriteriaByDataType('SALE_USED_CRITERIA') : []),
    ];
  },
  /**
   * Get all unsatisfied criterias from data types.
   * @param {{value: string, properties: object}[]} dataTypes
   * @param {boolean} isVehicleInspection
   * @returns {string[]} Array of fields
   */
  getUnsatisfiedCriteriasFields(dataTypes, isVehicleInspection) {
    if (isVehicleInspection) {
      return [
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_1',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_2',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_3',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_4',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_5',
        'BD_UNS__VEHICLE_INSPECTION_CRITERIA_6',
      ];
    }

    const hasDataType = (dataType) => dataTypes.includes(dataType) || dataTypes.includes('All');
    const getCriteriaByDataType = (dataTypeCriteria) =>
      this[ExportCategories.BY_DATA].UNSATISFIED.filter(
        (key) => typeof key === 'object' && key.id.includes(dataTypeCriteria)
      ).map((v) => [v.id, ...v.subfields]);

    return [].concat(
      ...[
        ...(hasDataType(DataTypes.MAINTENANCE) ? getCriteriaByDataType('MAINTENANCE_CRITERIA') : []),
        ...(hasDataType(DataTypes.NEW_VEHICLE_SALE) ? getCriteriaByDataType('SALE_NEW_CRITERIA') : []),
        ...(hasDataType(DataTypes.USED_VEHICLE_SALE) ? getCriteriaByDataType('SALE_USED_CRITERIA') : []),
      ]
    );
  },
  /**
   * Get all fields for a shortcutExportType
   * @param {{value: string, properties: {category: string, exportType: string}}} shortcutExportType
   * @param {{value: string, properties: object}[]} dataTypes
   * @param {boolean} isVehicleInspection
   * @returns {string[]} Array of fields
   */
  getFieldsByShortcutExportType(shortcutExportType, dataTypes, isVehicleInspection) {
    if (shortcutExportType === ShortcutExportTypes.SATISFACTION_GARAGES) {
      return [
        'BG_COM__GARAGE',
        'BG_SAT__NPS',
        'BG_SAT__SCORE_MAINTENANCE',
        'BG_SAT__SCORE_NEW_VEHICLE_SALE',
        'BG_SAT__SCORE_USED_VEHICLE_SALE',
        'BG_SAT__ANSWERING_COUNT',
        'BG_SAT__ANSWERING_PCT',
        'BG_SAT__PROMOTORS_COUNT',
        'BG_SAT__PROMOTORS_PCT',
        'BG_SAT__DETRACTORS_COUNT',
        'BG_SAT__DETRACTORS_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.SATISFACTION_FRONT_DESK_USERS) {
      return [
        'BF_COM__GARAGE',
        'BF_COM__FRONT_DESK_USER',
        'BF_SAT__NPS',
        'BF_SAT__SCORE_MAINTENANCE',
        'BF_SAT__SCORE_NEW_VEHICLE_SALE',
        'BF_SAT__SCORE_USED_VEHICLE_SALE',
        'BF_SAT__ANSWERING_COUNT',
        'BF_SAT__ANSWERING_PCT',
        'BF_SAT__PROMOTORS_COUNT',
        'BF_SAT__PROMOTORS_PCT',
        'BF_SAT__DETRACTORS_COUNT',
        'BF_SAT__DETRACTORS_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.SATISFACTION_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_COM__FRONT_DESK_USER',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_CON__GENDER',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_COM__VIN',
        'BD_COM__MILEAGE',
        'BD_COM__REGISTRATION_DATE',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__SCORE',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__REVIEW',
        'BD_SAT__REVIEW_STATUS',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
        'BD_LEA__IDENTIFICATION_DATE',
        'BD_LEA__LEAD_TYPE',
        'BD_LEA__SOURCE',
        'BD_LEA__TIMING',
        'BD_LEA__WHISHED_BRAND',
        'BD_LEA__WHISHED_MODEL',
        'BD_LEA__WHISHED_BODY_TYPE',
        'BD_LEA__WHISHED_ENERGY',
        'BD_LEA__BUDGET',
        'BD_LEA__WISHED_FINANCING',
        'BD_LEA__WISHED_TRADE_IN',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.UNSATISFIED_GARAGES) {
      return [
        'BG_COM__GARAGE',
        'BG_UNS__UNSATISFIED_COUNT',
        'BG_UNS__UNPROCESSED_COUNT',
        'BG_UNS__UNPROCESSED_PCT',
        'BG_UNS__PROCESSING_COUNT',
        'BG_UNS__PROCESSING_PCT',
        'BG_UNS__SAVED_COUNT',
        'BG_UNS__SAVED_PCT',
        'BG_UNS__24H_REACTIVITY',
        'BG_UNS__24H_REACTIVITY_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.UNSATISFIED_FRONT_DESK_USERS) {
      return [
        'BF_COM__GARAGE',
        'BF_COM__FRONT_DESK_USER',
        'BF_UNS__UNSATISFIED_COUNT',
        'BF_UNS__UNPROCESSED_COUNT',
        'BF_UNS__UNPROCESSED_PCT',
        'BF_UNS__PROCESSING_COUNT',
        'BF_UNS__PROCESSING_PCT',
        'BF_UNS__SAVED_COUNT',
        'BF_UNS__SAVED_PCT',
        'BF_UNS__24H_REACTIVITY',
        'BF_UNS__24H_REACTIVITY_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.UNSATISFIED_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_COM__FRONT_DESK_USER',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_CON__GENDER',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_COM__VIN',
        'BD_COM__MILEAGE',
        'BD_COM__REGISTRATION_DATE',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__SCORE',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__REVIEW',
        'BD_SAT__REVIEW_STATUS',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        'BD_LEA__IDENTIFICATION_DATE',
        ...this.getUnsatisfiedParentCriteriasFields(dataTypes, isVehicleInspection),
        'BD_UNS__STATUS',
        'BD_UNS__CLOSING_SUB_REASON',
        'BD_UNS__MANAGER',
        'BD_UNS__ELAPSED_TIME',
        'BD_UNS__CLOSING_COMMENT',
        'BD_UNS__CLOSING_DATE',
        'BD_UNS__FOLLOWUP_STATUS',
        'BD_UNS__FOLLOWUP_DATE',
        'BD_UNS__IS_RESOLVED',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.LEADS_GARAGES) {
      return [
        'BG_COM__GARAGE',
        'BG_LEA__LEADS_COUNT',
        'BG_LEA__UNPROCESSED_COUNT',
        'BG_LEA__UNPROCESSED_PCT',
        'BG_LEA__PROCESSING_COUNT',
        'BG_LEA__PROCESSING_PCT',
        'BG_LEA__CONVERTED_COUNT',
        'BG_LEA__CONVERTED_PCT',
        'BG_LEA__24H_REACTIVITY',
        'BG_LEA__24H_REACTIVITY_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.LEADS_FRONT_DESK_USERS) {
      return [
        'BF_COM__GARAGE',
        'BF_COM__FRONT_DESK_USER',
        'BF_LEA__LEADS_COUNT',
        'BF_LEA__UNPROCESSED_COUNT',
        'BF_LEA__UNPROCESSED_PCT',
        'BF_LEA__PROCESSING_COUNT',
        'BF_LEA__PROCESSING_PCT',
        'BF_LEA__CONVERTED_COUNT',
        'BF_LEA__CONVERTED_PCT',
        'BF_LEA__24H_REACTIVITY',
        'BF_LEA__24H_REACTIVITY_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.LEADS_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_COM__FRONT_DESK_USER',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_CON__GENDER',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_COM__VIN',
        'BD_COM__MILEAGE',
        'BD_COM__REGISTRATION_DATE',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__SCORE',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__REVIEW',
        'BD_SAT__REVIEW_STATUS',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        'BD_LEA__IDENTIFICATION_DATE',
        'BD_LEA__STATUS',
        'BD_LEA__CLOSING_SUB_REASON',
        'BD_LEA__MANAGER',
        'BD_LEA__LEAD_TYPE',
        'BD_LEA__SOURCE',
        'BD_LEA__TIMING',
        'BD_LEA__WHISHED_BRAND',
        'BD_LEA__WHISHED_MODEL',
        'BD_LEA__WHISHED_BODY_TYPE',
        'BD_LEA__WHISHED_ENERGY',
        'BD_LEA__BUDGET',
        'BD_LEA__WISHED_FINANCING',
        'BD_LEA__WISHED_TRADE_IN',
        'BD_LEA__CLOSING_COMMENT',
        'BD_LEA__CLOSING_DATE',
        'BD_LEA__CONVERSION_DATE',
        'BD_LEA__FOLLOWUP_DATE',
        'BD_LEA__FOLLOWUP_STATUS',
        'BD_LEA__FOLLOWUP_RECONTACTED',
        'BD_LEA__FOLLOWUP_SATISFIED',
        'BD_LEA__FOLLOWUP_APPOINTMENT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.LEADS_FORWARDED_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_COM__FRONT_DESK_USER',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_CON__GENDER',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_COM__VIN',
        'BD_COM__MILEAGE',
        'BD_COM__REGISTRATION_DATE',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__SCORE',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__REVIEW',
        'BD_SAT__REVIEW_STATUS',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        'BD_LEA__IDENTIFICATION_DATE',
        'BD_LEA__STATUS',
        'BD_LEA__CLOSING_SUB_REASON',
        'BD_LEA__MANAGER',
        'BD_LEA__LEAD_TYPE',
        'BD_LEA__SOURCE',
        'BD_LEA__TIMING',
        'BD_LEA__WHISHED_BRAND',
        'BD_LEA__WHISHED_MODEL',
        'BD_LEA__WHISHED_BODY_TYPE',
        'BD_LEA__WHISHED_ENERGY',
        'BD_LEA__BUDGET',
        'BD_LEA__WISHED_FINANCING',
        'BD_LEA__WISHED_TRADE_IN',
        'BD_LEA__CLOSING_COMMENT',
        'BD_LEA__CLOSING_DATE',
        'BD_LEA__CONVERSION_DATE',
        'BD_LEA__FOLLOWUP_DATE',
        'BD_LEA__FOLLOWUP_STATUS',
        'BD_LEA__FOLLOWUP_RECONTACTED',
        'BD_LEA__FOLLOWUP_SATISFIED',
        'BD_LEA__FOLLOWUP_APPOINTMENT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.CONTACTS_GARAGES) {
      return [
        'BG_COM__GARAGE',
        'BG_CON__IMPORTED_COUNT',
        'BG_CON__SURVEYED_COUNT',
        'BG_CON__ANSWERING_COUNT',
        'BG_CON__ANSWERING_PCT',
        'BG_CON__VALID_EMAILS_COUNT',
        'BG_CON__VALID_EMAILS_PCT',
        'BG_CON__VALID_PHONES_COUNT',
        'BG_CON__VALID_PHONES_PCT',
        'BG_CON__NON_CONTACTABLE_COUNT',
        'BG_CON__NON_CONTACTABLE_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.CONTACTS_FRONT_DESK_USERS) {
      return [
        'BF_COM__GARAGE',
        'BF_COM__FRONT_DESK_USER',
        'BF_CON__IMPORTED_COUNT',
        'BF_CON__SURVEYED_COUNT',
        'BF_CON__ANSWERING_COUNT',
        'BF_CON__ANSWERING_PCT',
        'BF_CON__VALID_EMAILS_COUNT',
        'BF_CON__VALID_EMAILS_PCT',
        'BF_CON__VALID_PHONES_COUNT',
        'BF_CON__VALID_PHONES_PCT',
        'BF_CON__NON_CONTACTABLE_COUNT',
        'BF_CON__NON_CONTACTABLE_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.CONTACTS_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_COM__FRONT_DESK_USER',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_CON__GENDER',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_COM__VIN',
        'BD_COM__MILEAGE',
        'BD_COM__REGISTRATION_DATE',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__SCORE',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__REVIEW',
        'BD_SAT__REVIEW_STATUS',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        'BD_CON__MODIFIED_FIRST_NAME',
        'BD_CON__MODIFIED_LAST_NAME',
        'BD_CON__EMAIL',
        'BD_CON__PHONE',
        'BD_CON__MODIFIED_CITY',
        'BD_CON__MODIFIED_ADDRESS',
        'BD_CON__MODIFIED_POSTAL_CODE',
        'BD_CON__MODIFIED_EMAIL',
        'BD_CON__MODIFIED_PHONE',
        'BD_CON__LAST_KNOWN_EMAIL_STATUS',
        'BD_CON__LAST_KNOWN_PHONE_STATUS',
        'BD_CON__CAMPAIGN_STATUS',
        'BD_CON__TICKET_STATUS',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.EREPUTATION_GARAGES) {
      return [
        'BG_COM__GARAGE',
        'BG_ERE__REVIEWS_COUNT',
        'BG_ERE__NPS',
        'BG_ERE__SCORE',
        'BG_ERE__RECOMMENDATION_PCT',
        'BG_ERE__PROMOTORS_COUNT',
        'BG_ERE__PROMOTORS_PCT',
        'BG_ERE__PASSIVE_COUNT',
        'BG_ERE__PASSIVE_PCT',
        'BG_ERE__DETRACTORS_COUNT',
        'BG_ERE__DETRACTORS_PCT',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.EREPUTATION_REVIEWS) {
      return [
        'BD_COM__GARAGE',
        'BD_CON__FULLNAME',
        'BD_ERE__SOURCE',
        'BD_ERE__RECOMMEND',
        'BD_ERE__SCORE',
        'BD_ERE__REVIEW',
        'BD_ERE__ANSWER',
        'BD_ERE__DATE_REVIEW',
        'BD_ERE__DATE_ANSWER',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.AUTOMATION_RGPD) {
      return [
        'BA_RGPD__STATUS',
        'BA_RGPD__DATE_OPT_OUT',
        'BA_COM__PUBLIC_DISPLAY_NAME',
        'BA_COM__GENDER',
        'BA_COM__FULLNAME',
        'BA_COM__EMAIL',
        'BA_COM__PHONE',
        'BA_COM__CITY',
        'BA_COM__VEHICLE_PLATE',
      ];
    }

    if (shortcutExportType === ShortcutExportTypes.AUTOMATION_CAMPAIGN) {
      return [
        'BA_CAMPAIGN__NAME',
        'BA_CAMPAIGN__DATE',
        'BA_CAMPAIGN__TYPE',
        'BA_CAMPAIGN__STATUS',
        'BA_COM__PUBLIC_DISPLAY_NAME',
        'BA_COM__GENDER',
        'BA_COM__FULLNAME',
        'BA_COM__EMAIL',
        'BA_COM__PHONE',
        'BA_COM__CITY',
        'BA_COM__VEHICLE_PLATE',
        //'BA_COM__DATE_LAST_STATUS', hide but not delete because Romain
        //'BA_COM__LAST_STATUS',
        'BA_COM__DATE_EVENT_CANNOT_CONTACT',
        'BA_COM__IS_DATE_CURRENT_PERIOD_CANNOT_CONTACT',
        'BA_COM__DATE_EVENT_RECEIVED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_RECEIVED',
        'BA_COM__DATE_EVENT_OPENED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_OPENED',
        'BA_COM__DATE_EVENT_LEAD',
        'BA_COM__IS_DATE_CURRENT_PERIOD_LEAD',
        'BA_COM__DATE_EVENT_CONVERTED',
        'BA_COM__IS_DATE_CURRENT_PERIOD_CONVERTED',
      ];
    }
  },
  /**
   * Get all fields for a ExportType
   * @param {{value: string, properties: {category: string}}} exportType
   * @param {{value: string, properties: object}[]} dataTypes
   * @param {boolean} isVehicleInspection
   * @returns {string[]} Array of fields
   */
  getFieldsByPredefinedExportType(predefinedExportType, dataType = {}, isVehicleInspection = false) {
    const exportDataTypes = {
      [PredefinedExportTypes.GARAGES]: () => {
        return [
          'BG_COM__GARAGE',
          'BG_CON__SURVEYED_COUNT',
          'BG_SAT__REVIEWS_COUNT',
          'BG_SAT__REVIEWS_COUNT',
          'BG_SAT__ANSWERING_PCT',
          'BG_SAT__NPS',
          'BG_SAT__SCORE',
          'BG_SAT__PROMOTORS_COUNT',
          'BG_SAT__PROMOTORS_PCT',
          'BG_SAT__DETRACTORS_COUNT',
          'BG_SAT__DETRACTORS_PCT',
          'BG_CON__IMPORTED_COUNT',
          'BG_CON__VALID_EMAILS_COUNT',
          'BG_CON__VALID_EMAILS_PCT',
          'BG_UNS__SAVED_COUNT',
          'BG_UNS__SAVED_PCT',
        ];
      },
      [PredefinedExportTypes.FRONT_DESK_USERS_DMS]: () => {
        return [
          'BF_COM__GARAGE',
          'BF_COM__FRONT_DESK_USER',
          'BF_CON__SURVEYED_COUNT',
          'BF_SAT__REVIEWS_COUNT',
          'BF_SAT__ANSWERING_PCT',
          'BF_SAT__NPS',
          'BF_SAT__SCORE',
          'BF_SAT__PROMOTORS_COUNT',
          'BF_SAT__PROMOTORS_PCT',
          'BF_SAT__DETRACTORS_COUNT',
          'BF_SAT__DETRACTORS_PCT',
          'BF_CON__IMPORTED_COUNT',
          'BF_CON__VALID_EMAILS_COUNT',
          'BF_CON__VALID_EMAILS_PCT',
        ];
      },
      [PredefinedExportTypes.CONTACTS_MODIFIED]: () => {
        return [
          'BD_COM__GARAGE',
          'BD_SAT__SURVEY_DATE',
          'BD_CON__GENDER',
          'BD_CON__MODIFIED_GENDER',
          'BD_CON__FIRST_NAME',
          'BD_CON__MODIFIED_FIRST_NAME',
          'BD_CON__LAST_NAME',
          'BD_CON__MODIFIED_LAST_NAME',
          'BD_CON__FULLNAME',
          'BD_CON__CITY',
          'BD_CON__ADDRESS',
          'BD_CON__MODIFIED_ADDRESS',
          'BD_CON__POSTAL_CODE',
          'BD_CON__MODIFIED_POSTAL_CODE',
          'BD_CON__EMAIL',
          'BD_CON__MODIFIED_EMAIL',
          'BD_CON__LAST_KNOWN_EMAIL_STATUS',
          'BD_CON__PHONE',
          'BD_CON__MODIFIED_PHONE',
          'BD_CON__LAST_KNOWN_PHONE_STATUS',
          'BD_COM__DATA_TYPE',
          'BD_CON__CAMPAIGN_STATUS',
          'BD_COM__VEHICLE_BRAND',
          'BD_COM__VEHICLE_MODEL',
          'BD_COM__PLATE',
          'BD_COM__VIN',
          'BD_COM__FRONT_DESK_USER',
          'BD_COM__INTERNAL_REFERENCE',
          'BD_SAT__ANSWER',
          'BD_CON__TICKET_STATUS',
          'BD_UNS__STATUS',
          'BD_UNS__IS_RESOLVED',
          'BD_UNS__MANAGER',
          'BD_LEA__STATUS',
          'BD_LEA__MANAGER',
        ];
      },
      [PredefinedExportTypes.LEADS]: () => {
        return [
          'BD_COM__GARAGE',
          'BD_CON__FIRST_NAME',
          'BD_CON__LAST_NAME',
          'BD_CON__FULLNAME',
          'BD_CON__CITY',
          'BD_CON__POSTAL_CODE',
          'BD_COM__VEHICLE_BRAND',
          'BD_COM__VEHICLE_MODEL',
          'BD_COM__PLATE',
          'BD_CON__PHONE',
          'BD_CON__EMAIL',
          'BD_COM__BILLING_DATE',
          'BD_COM__INTERNAL_REFERENCE',
          'BD_COM__FRONT_DESK_USER',
          'BD_LEA__IDENTIFICATION_DATE',
          'BD_SAT__NPS_WORDING',
          'BD_SAT__SCORE',
          'BD_SAT__REVIEW',
          'BD_SAT__ANSWER',
          'BD_SAT__ANSWER_DATE',
          'BD_LEA__MANAGER',
          'BD_LEA__LEAD_TYPE',
          'BD_COM__DATA_TYPE',
          'BD_LEA__SOURCE',
          'BD_LEA__TIMING',
          'BD_LEA__WHISHED_BRAND',
          'BD_LEA__WHISHED_MODEL',
          'BD_LEA__WHISHED_BODY_TYPE',
          'BD_LEA__WHISHED_ENERGY',
          'BD_LEA__BUDGET',
          'BD_LEA__WISHED_FINANCING',
          'BD_LEA__WISHED_TRADE_IN',
          'BD_LEA__MANAGER',
          'BD_LEA__STATUS',
          'BD_LEA__CLOSING_COMMENT',
          'BD_LEA__CLOSING_DATE',
          'BD_LEA__CONVERSION_DATE',
          'BD_LEA__FOLLOWUP_DATE',
          'BD_LEA__FOLLOWUP_STATUS',
          'BD_LEA__FOLLOWUP_RECONTACTED',
          'BD_LEA__FOLLOWUP_SATISFIED',
          'BD_LEA__FOLLOWUP_APPOINTMENT',
        ];
      },
      [PredefinedExportTypes.UNSATISFIED]: () => {
        return [
          'BD_COM__GARAGE',
          'BD_CON__FIRST_NAME',
          'BD_CON__LAST_NAME',
          'BD_CON__FULLNAME',
          'BD_CON__CITY',
          'BD_CON__POSTAL_CODE',
          'BD_COM__VEHICLE_BRAND',
          'BD_COM__VEHICLE_MODEL',
          'BD_COM__PLATE',
          'BD_CON__PHONE',
          'BD_CON__EMAIL',
          'BD_COM__DATA_TYPE',
          'BD_COM__BILLING_DATE',
          'BD_COM__INTERNAL_REFERENCE',
          'BD_UNS__MANAGER',
          'BD_SAT__REVIEW_DATE',
          'BD_SAT__REVIEW',
          'BD_SAT__NPS_WORDING',
          'BD_SAT__SCORE',
          'BD_SAT__REVIEW',
          'BD_SAT__ANSWER',
          'BD_SAT__ANSWER_DATE',
          ...this.getUnsatisfiedParentCriteriasFields([dataType], isVehicleInspection),
          'BD_UNS__STATUS',
          'BD_UNS__MANAGER',
          'BD_UNS__ELAPSED_TIME',
          'BD_UNS__CLOSING_COMMENT',
          'BD_UNS__CLOSING_DATE',
          'BD_UNS__IS_RESOLVED',
          'BD_UNS__RECONTACTED',
          'BD_UNS__CHANGED_MIND',
        ];
      },
    };
    return exportDataTypes[predefinedExportType]();
  },
};
