const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');

/* Two next functions will need to be put in an other directory cause they might be shared */
const smartSearch = (query, values) => {
  const results = [];
  const normalizedSearch = (query || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  for (const item of values) {
    if (!item.searchField) item.searchField = '';
    if (
      item.searchField
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(normalizedSearch)
    ) {
      results.push(item.id);
    }
  }
  return results;
};
const addSearchToMatch = async (app, $match, query, garageIds) => {
  /* TLDR; I can't use $text
    My first idea was to use the $text search built in Mongo but it doesn't work the way I want it to
    It matches only on full words and I would like, as in garages, to be able to match on parts of the word
    So I'm gonna the thing we're already doing for garages
  */
  if (query) {
    const where = garageIds ? { garageId: { $in: garageIds } } : {};
    const campaigns = await app.models.AutomationCampaign.getMongoConnector()
      .find(where, { _id: true, displayName: true })
      .toArray();
    const filteredCampaignIds = smartSearch(
      query,
      campaigns.map((e) => ({ searchField: e.displayName, id: e._id }))
    );
    if (filteredCampaignIds.length > 1) {
      $match[KpiDictionary.automationCampaignId] = { $in: filteredCampaignIds };
    } else if (filteredCampaignIds.length === 1) {
      $match[KpiDictionary.automationCampaignId] = filteredCampaignIds[0];
    } else {
      return false;
    }
  }
  return true;
};

module.exports = { addSearchToMatch };
