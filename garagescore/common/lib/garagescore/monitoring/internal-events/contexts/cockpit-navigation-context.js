/**
 * Navigation in cockpit
 */
const ObjectId = require('mongodb').ObjectId;
const EVENTS = {
  CLICKS: 'CLICKS',
  TIME_SPENT_ON_PAGE: 'TIME_SPENT_ON_PAGE',
};
const correlatedFields = async function (app, keys) {
  const { key2: userId } = keys;
  try {
    const { job, email } = await app.models.User.getMongoConnector().findOne(
      {
        _id: new ObjectId(userId),
      },
      { projection: { job: true, email: true } }
    );
    return { key3: job || 'undefined', userEmail: email || 'undefined' };
  } catch (e) {
    // incorrect userId (can be normal in the login page)
  }
};
function create(pageName, userId, emitListener) {
  return {
    key1: pageName,
    key2: userId,
    emitListener,
    correlatedFields,
  };
}
module.exports = {
  create,
  EVENTS,
  correlatedFields,
};
