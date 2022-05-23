const Enum = require('../../../lib/util/enum.js');
const { jobsEnum } = require('../../types.js');

module.exports = new Enum(
  {
    ...jobsEnum,

    EXOGENOUS_REVIEW: 'ExogenousReview',
    MANUAL_LEAD: 'ManualLead',
    MANUAL_UNSATISFIED: 'ManualUnsatisfied',
    AUTOMATION_CAMPAIGN: 'AutomationCampaign',
    UNKNOWN: 'Unknown',
    VEHICLE_SALE: 'VehicleSale',
  },
  {
    getJobs() {
      // Used for garage-history for example
      return [this.MAINTENANCE, this.NEW_VEHICLE_SALE, this.USED_VEHICLE_SALE, this.VEHICLE_INSPECTION];
    },
    getAcronymFromJob(value) {
      // Used for garage-history
      switch (value) {
        case this.MAINTENANCE:
          return 'APV';
        case this.NEW_VEHICLE_SALE:
          return 'VN';
        case this.USED_VEHICLE_SALE:
          return 'VO';
        case this.VEHICLE_INSPECTION:
          return 'VI';
        default:
          console.error('getAcronymFromJob failed,', value, 'not found');
          return null;
      }
    },
    getAcronymFromJobPartial(value) {
      switch (value) {
        case this.MAINTENANCE:
          return 'Apv';
        case this.NEW_VEHICLE_SALE:
          return 'Vn';
        case this.USED_VEHICLE_SALE:
          return 'Vo';
        default:
          return '';
      }
    },
    getAcronyms() {
      return this.getJobs().map((job) => this.getAcronymFromJob(job)); // ['APV', 'VN', etc...
    },
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.MAINTENANCE:
          return 'Atelier';
        case this.NEW_VEHICLE_SALE:
          return 'V.Neuf';
        case this.USED_VEHICLE_SALE:
          return 'V.Occasion';
        case this.VEHICLE_INSPECTION:
          return 'Contrôle Technique';
        case this.EXOGENOUS_REVIEW:
          return '-';
        case this.MANUAL_LEAD:
          return '-';
        case this.MANUAL_UNSATISFIED:
          return '-';
        case this.UNKNOWN:
          return 'Non-défini';
        default:
          return value;
      }
    },
    displayName2(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.MAINTENANCE:
          return 'Atelier';
        case this.NEW_VEHICLE_SALE:
          return 'Achat neuf';
        case this.USED_VEHICLE_SALE:
          return "Achat d'occasion";
        case this.VEHICLE_INSPECTION:
          return 'Contrôle Technique';
        default:
          return '';
      }
    },
    getAcronymPartial(value) {
      switch (value) {
        case this.MAINTENANCE:
          return 'Apv';
        case this.NEW_VEHICLE_SALE:
          return 'Vn';
        case this.USED_VEHICLE_SALE:
          return 'Vo';
        default:
          return '';
      }
    },
  }
);
