/** Loopback fails (cannot validate objectId fields) when another version of bson is used
 * So instead of including bson in our packages, we find the one used by loopback
 */
// eslint-disable-next-line
const loopbackConnectorMongodb = require('loopback-connector-mongodb'); // we need this import to fill the cache
const lc = require.cache[require.resolve('loopback-connector-mongodb')];
const Bson = lc.require('bson');
module.exports = new Bson(); // as it would be with bson 4.x
