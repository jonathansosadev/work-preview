const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum({
  LESS_THAN_10K: 'LessThan10k',
  BETWEEN_10K_AND_15K: 'Between10kAnd15k',
  BETWEEN_15K_AND_20K: 'Between15kAnd20k',
  BETWEEN_20K_AND_25K: 'Between20kAnd25k',
  MORE_THAN_25K: 'MoreThan25k',
  UNKNOWN: 'Unknown',
});
