const { ObjectId } = require('mongodb')

/** Creates a template
 * 
 * @param {Object}   app Application 
 * @param {Object}   template The template to create
 * @param {String}   template.title Title of the template 
 * @param {String}   template.content Content of the template
 * @param {Array}    template.garageIds Array of garage Ids
 * @param {Array}    template.sources Array of external sources
 * @param {Boolean}  template.automated Automated or Manual template
 * @param {Array}    template.ratingCategories Rating categories of the template
 * @param {Date}     template.createdAt Date of creation
 * @param {String}   template.createdBy Name of the user creating this template
 * @param {ObjectId} template.createdById Id of the creating user
 * @param {String}   template.updatedBy Name of the user updating
 * @param {Date}     template.updatedAt Date of update
 * @param {ObjectId} template.updatedById Id of the updating user
 */
async function createTemplate(app, template = {}) {
  if (Object.keys(template).length === 0) {
    throw new SyntaxError("the template can't be empty");
  }
  const properties = ['title', 'content', 'garageIds', 'sources', 'automated', 'ratingCategories', 'createdAt',
    'createdBy', 'createdById', 'updatedBy', 'updatedAt', 'updatedById'];

  if (!properties.every(prop => prop in template)) {
    throw new SyntaxError("missing field(s)");
  }
  const { title, content, garageIds, sources, automated,
    ratingCategories, createdAt, createdBy, createdById, updatedBy,
    updatedAt, updatedById } = template;
  const mongo = app.models.ReviewReplyTemplate.getMongoConnector();
  const result = await mongo.insertOne({
    title, content, garageIds, sources, automated,
    ratingCategories, createdAt, createdBy, createdById, updatedBy,
    updatedAt, updatedById
  });
  return result.ops[0];

}
// A default of 20 templates would be returned per page
async function getTemplatesByPage(app, query = {}, limit = 20, page = 0) {
  const mongo = app.models.ReviewReplyTemplate.getMongoConnector();
  const result = mongo.find(query);
  const count = await result.count();
  const hasMore = (limit * (page + 1)) < count;
  return{ 
    templates : await result.sort({ _id: -1 }).skip(page * limit).limit(limit).toArray(),
    hasMore: hasMore
  }
}
async function areAutomatedTemplatesAvailable(app, { garageId = "", source = "", ratingCategory = "" }) {
  const payload = {
    garageIds: ObjectId(garageId),
    sources: source.type,
    ratingCategories: ratingCategory,
    automated: true,
  }
  const mongo = app.models.ReviewReplyTemplate.getMongoConnector();
  return mongo.findOne(payload);
}

const userStamp = (userRequesting = {}) => {
  const { firstName, lastName, email} = userRequesting
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName;
  } 
  return email;
};

module.exports = {
  createTemplate,
  getTemplatesByPage,
  areAutomatedTemplatesAvailable,
  userStamp
}