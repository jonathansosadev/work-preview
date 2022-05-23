const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum({
  LESS_THAN_15K: 'LessThan15k',
  BETWEEN_15K_AND_25K: 'Between15kAnd25k',
  BETWEEN_25K_AND_35K: 'Between25kAnd35k',
  BETWEEN_35K_AND_45K: 'Between35kAnd45k',
  MORE_THAN_45K: 'MoreThan45k',
  UNKNOWN: 'Unknown',
});
