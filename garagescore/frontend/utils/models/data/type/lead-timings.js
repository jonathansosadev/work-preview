import Enum from '~/utils/enum.js'

export default new Enum(
  {
    NOW: 'Now',
    SHORT_TERM: 'ShortTerm',
    MID_TERM: 'MidTerm',
    LONG_TERM: 'LongTerm',
    BETWEEN_NOW_TO_MID_TERM: 'BetweenNowToMidTerm',
  },
  {
    getValuesWithoutSgsValues() {
      return this.values().filter(value => value !== this.BETWEEN_NOW_TO_MID_TERM);
    },
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`)
      }
      switch (value) {
        case this.NOW:
          return 'Dans les 30 jours'
        case this.SHORT_TERM:
          return '1-3 mois'
        case this.MID_TERM:
          return '3-6 mois'
        case this.LONG_TERM:
          return '6-12 mois'
        case this.BETWEEN_NOW_TO_MID_TERM:
          return '0-6 mois'
        default:
          return value || 'Non défini'
      }
    },
    //migration enum
    isSpecificToVI(value) {
      switch (value) {
        case this.NOW:
          return false
        case this.SHORT_TERM:
          return false
        case this.MID_TERM:
          return false
        case this.LONG_TERM:
          return false
        case this.BETWEEN_NOW_TO_MID_TERM:
          return true
        default:
          return false
      }
    }
  }
)
