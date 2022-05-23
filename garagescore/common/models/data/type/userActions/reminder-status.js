const Enum = require('../../../../lib/util/enum.js');

module.exports = new Enum(
  {
    RESOLVED: 'Resolved',
    CANCELLED: 'Cancelled',
    NOT_RESOLVED: 'NotResolved',
  },
  {
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.RESOLVED:
          return 'Résolue';
        case this.CANCELLED:
          return 'Annulée';
        case this.NOT_RESOLVED:
          return 'Non résolue';
        default:
          return 'Inconnu';
      }
    },
  }
);
