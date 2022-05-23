const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    NOT_TO_SURFACE: '----',
    IMPOSSIBLE: 'Impossible',
    BLOCKED: 'Blocked',
    RECEIVED: 'Received',
    SCHEDULED: 'Scheduled',
    NOT_RECEIVED: 'NotReceived',
    NO_CAMPAIGN: 'NoCampaign',
  },
  {
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.NOT_TO_SURFACE:
          return '----';
        case this.IMPOSSIBLE:
          return 'Impossible';
        case this.BLOCKED:
          return 'Bloquée';
        case this.RECEIVED:
          return 'Reçue';
        case this.SCHEDULED:
          return 'Planifiée';
        case this.NOT_RECEIVED:
          return 'Non reçue';
        case this.NO_CAMPAIGN:
          return 'pas de campagne';
        default:
          return value;
      }
    },
  }
);
