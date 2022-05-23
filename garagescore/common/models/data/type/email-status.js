const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    NOT_TO_SURFACE: '----',
    EMPTY: 'Empty',
    WRONG: 'Wrong',
    UNSUBSCRIBED: 'Unsubscribed',
    RECENTLY_CONTACTED: 'RecentlyContacted',
    VALID: 'Valid',
    DROPPED: 'Dropped'
  }
);
