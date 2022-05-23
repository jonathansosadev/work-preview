const { getDeepFieldValue } = require('../lib/util/object.js');
const { SIMON, log } = require('../lib/util/log.js');

/**
 * This collection is made for the blacklisting of incoming emails (ex: "Rapport de vos appels manqués")
 */

module.exports = function XLeadsBlacklist(XLeadsBlacklist) {
  // eslint-disable-line
  XLeadsBlacklist.testEmail = async function testEmail(email) {
    let blacklistedBy = null;
    if (!email) return null;
    try {
      const connector = XLeadsBlacklist.getMongoConnector();
      const blacklist = await connector.find().toArray();
      for (const item of blacklist) {
        if (item.field && getDeepFieldValue(email, item.field) && item.match) {
          if (getDeepFieldValue(email, item.field).match(item.match)) {
            blacklistedBy = `Blacklisted by ${item.field}.match(${item.match})`;
          }
        }
      }
    } catch (e) {
      log.error(SIMON, `XLeadsBlacklist error: ${e.message}`);
      return null;
    }
    return blacklistedBy;
  };
};
