const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    NOT_TO_SURFACE: '----',
    EMPTY: 'Empty',
    WRONG: 'Wrong',
    UNSUBSCRIBED: 'Unsubscribed',
    RECENTLY_CONTACTED: 'RecentlyContacted',
    VALID: 'Valid',
  },
  {
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.NOT_TO_SURFACE:
          return '----';
        case this.EMPTY:
          return 'Non renseigné';
        case this.WRONG:
          return 'Erroné';
        case this.UNSUBSCRIBED:
          return 'Désabonné';
        case this.RECENTLY_CONTACTED:
          return 'Déjà contacté';
        case this.VALID:
          return 'Valide';
        default:
          return value;
      }
    },
  }
);
