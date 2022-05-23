const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    cash: 'cash',
    leasing: 'leasing',
    credit: 'credit',
    unknown: 'unknown',
  }
);
