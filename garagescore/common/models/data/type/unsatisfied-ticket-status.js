const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    // DO NOT CHANGE ORDER, SOME CODE IS BASED ON Object.keys().indexOf()
    WAITING_FOR_CONTACT: 'WaitingForContact',
    CONTACT_PLANNED: 'ContactPlanned',

    WAITING_FOR_VISIT: 'WaitingForVisit',
    VISIT_PLANNED: 'VisitPlanned',

    WAITING_FOR_CLOSING: 'WaitingForClosing',
    CLOSED_WITHOUT_RESOLUTION: 'ClosedWithoutResolution',
    CLOSED_WITH_RESOLUTION: 'ClosedWithResolution',
  },
  {
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.WAITING_FOR_CONTACT:
          return 'Client à contacter';
        case this.WAITING_FOR_VISIT:
          return 'Visite client à planifier';
        case this.WAITING_FOR_CLOSING:
          return 'A clôturer';
        case this.CONTACT_PLANNED:
          return 'Contact planifié';
        case this.VISIT_PLANNED:
          return 'Visite client planifiée';
        case this.CLOSED_WITHOUT_RESOLUTION:
          return 'Fermé, problème non résolu';
        case this.CLOSED_WITH_RESOLUTION:
          return 'Fermé, problème résolu';
        default:
          return value;
      }
    },
    isClosed(status) {
      return status === this.CLOSED_WITHOUT_RESOLUTION || status === this.CLOSED_WITH_RESOLUTION;
    },
  }
);
