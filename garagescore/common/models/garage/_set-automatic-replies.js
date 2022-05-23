const { ObjectID } = require('mongodb');
const { ANASS, log } = require('../../lib/util/log');

module.exports = (app, garageId, automaticReplies) => {
  const _id = typeof garageId === 'string' ? new ObjectID(garageId) : garageId;
  // Little transformation of the automaticReplies object so as not to override untouched sources
  const automaticRepliesToSet = Object.fromEntries(
    Object.entries(automaticReplies).map(([key, config]) => {
      const setKey = `automaticReplies.${key}`;
      return [setKey, config];
    })
  );

  if (process.argv.includes('--debug')) {
    log.debug(ANASS, `_id: ${typeof(_id)} ${_id.toString()}`);
    log.debug(ANASS, `$set : ${JSON.stringify(automaticRepliesToSet, null, 2)}`);
  }

  return app.models.Garage.getMongoConnector().updateOne({ _id }, { $set: automaticRepliesToSet });
}