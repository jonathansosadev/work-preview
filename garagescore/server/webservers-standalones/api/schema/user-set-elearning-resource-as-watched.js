/* Update user, set that a elearning resources has been watched */
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const MongoObjectID = require('mongodb').ObjectID;
const { ANASS, log } = require('../../../../common/lib/util/log');

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.ElearningResourceWatched.type}: ElearningResourceWatchedResult
  }
  type ElearningResourceWatchedResult {
    status: Boolean
  }
`;

async function _updateUser(user, url, app) {
  try {
    // create elearning if not exists
    await app.models.User.getMongoConnector().updateOne(
      { _id: new MongoObjectID(user.id.toString()), elearning: { $exists: false } },
      { $set: { 'elearning.resources': [] } }
    );
    // update

    /**
     * On a une tendance à stocker comme ceci
     * resources: {
     *   url1: true,
     *   url2: false,
     *   url3: true,
     * ....}
     *
     * C'est sympa mais le problème c'est si on demande de compter
     * On ne peut pas grouper automatiquement, il faut connaitre les urls à l'avance
     * en utilisant un tableau comme ci-dessous, les updates sont plus compliqués (il faut utiliser arrayfilters)
     * mais les groupements sont triviaux
     * Par exemple, pour savoir combien d'users ont vu chaque resources:
     * db.getCollection('User').aggregate([
     * {$match: { 'elearning.resources.lastWatchAt': { $exists: true } }},
     * {$unwind: '$elearning.resources' },
     * {$group: {_id: '$elearning.resources.url', count: {$sum: 1 } } }
     * ])
     */
    // update if not exist
    let where = { _id: new MongoObjectID(user.id.toString()), 'elearning.resources.url': { $ne: url } };
    const $push = {};
    $push['elearning.resources'] = { url, lastWatchAt: new Date() };
    const pushed = await app.models.User.getMongoConnector().updateOne(where, { $push });
    if (pushed.result && pushed.result.nModified === 0) {
      // update if exist
      where = { _id: new MongoObjectID(user.id.toString()) };
      const $set = {};
      $set['elearning.resources.$[i].lastWatchAt'] = new Date();
      const arrayFilters = [{ 'i.url': url }];
      await app.models.User.getMongoConnector().updateOne(where, { $set }, { arrayFilters });
    }
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
}
module.exports.resolvers = {
  Mutation: {
    ElearningResourceWatched: async (obj, args, context) => {
      try {
        const { app } = context;
        const { logged, authenticationError, user } = context.scope;
        const { url } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!url) {
          throw new Error('Missing argument: url');
        }
        const status = _updateUser(user, url, app);
        return { status };
      } catch (error1) {
        log.error(ANASS, error1);
        return error1;
      }
    },
  },
};
