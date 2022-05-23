const Enum = require('../../../lib/util/enum.js');

export default new Enum({ // OLD, NOT USED ANYMORE
  HOT: 'Hot',
  WARM: 'Warm',
  COLD: 'Cold',
  UNKNOWN: 'Unknown'
}, {
  displayName(value, language = 'fr') {
    if (language !== 'fr') {
      throw new Error(`Language ${language} is not supported`);
    }
    switch (value) {
      case this.HOT : return 'Elevé';
      case this.WARM : return 'Moyen';
      case this.COLD : return 'Faible';
      case this.UNKNOWN : return 'A qualifier';
      default: return value;
    }
  }
});

