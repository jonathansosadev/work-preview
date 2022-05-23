'use strict';
var app = require('../../../../server/server');
const GarageTypes = require('../../../../common/models/garage.type.js');

/** get every urls for the sitemap for every garage, note that the urls depend of the env where you run this method*/
async function getSitemapURLs() {
  const garages = await app.models.Garage.garagesToIndex('fr_FR');
  if (!garages || !garages.length) {
    return new Error('no garages were found');
  }
  const urls = [];
  for (let g = 0; g < garages.length; g++) {
    urls.push(GarageTypes.getSlug(garages[g].type) + '/' + garages[g].slug);
  }
  return urls;
}
module.exports = {
  getSitemapURLs: getSitemapURLs,
};
