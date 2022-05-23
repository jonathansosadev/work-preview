/** Prefix the collection name of a model by the PR number
 * 
 * To use it you need to call this module in the model.js
 * Example:
 * function JobDefinition(Job) {
  _appReviewNamespace(Job);
 */
module.exports = (model) => {
  const { HEROKU_PR_NUMBER, DO_NO_USE_MODELS_NAMESPACES } = process.env;
  if (!HEROKU_PR_NUMBER || DO_NO_USE_MODELS_NAMESPACES) {
    return;
  }
  model.settings.mongodb.collection = `${model.settings.mongodb.collection}_${HEROKU_PR_NUMBER}`;
};
