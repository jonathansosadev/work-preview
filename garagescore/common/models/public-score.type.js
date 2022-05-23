const Enum = require('../lib/util/enum.js');
const { jobsEnum } = require('../../common/models/types.js');

module.exports = new Enum({
  ...jobsEnum,
});
