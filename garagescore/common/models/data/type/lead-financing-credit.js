const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum({
  LESS_THAN_200: 'LessThan200',
  BETWEEN_200_AND_300: 'Between200And300',
  BETWEEN_300_AND_500: 'Between300And500',
  BETWEEN_500_AND_700: 'Between500And700',
  MORE_THAN_700: 'MoreThan700',
  UNKNOWN: 'Unknown',
});
