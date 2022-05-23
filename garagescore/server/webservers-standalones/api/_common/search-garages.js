const { ObjectID } = require('mongodb');
const DataTypes = require('../../../../common/models/data/type/data-types');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const { filterGaragesByType } = require('../../../../common/lib/garagescore/cache/garage-type');
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

const searchGarages = async (app, query, garageIds) => {
  /**
   * Searches for a garage against publicDisplayName and externalId given an input query
   * Returns :
   *  - Array of found garages
   *  - false if nothing found
   *  - true if no query
   */
  if (!query) return true;

  const garageToQuery = [];
  garageToQuery.push(...garageIds.map((gId) => new ObjectID(gId)));
  const garages = await app.models.Garage.getMongoConnector()
    .find({ _id: { $in: garageToQuery } }, { project: { _id: true, publicDisplayName: true, externalId: true } })
    .toArray();
  const tmp = [
    ...smartSearch(
      query,
      garages.map((e) => ({ searchField: e.publicDisplayName, id: e._id }))
    ),
    ...smartSearch(
      query,
      garages.map((e) => ({ searchField: e.externalId, id: e._id }))
    ),
  ];
  const filteredGarageIds = [...new Set(tmp)];

  return filteredGarageIds.length ? filteredGarageIds : false;
};

const addSearchToMatch = async (app, $match, query, garageIds) => {
  const filteredGarageIds = await searchGarages(app, query, garageIds);
  if (Array.isArray(filteredGarageIds)) {
    if (!filteredGarageIds.length) return false;
    if (filteredGarageIds.length === 1) {
      $match[KpiDictionary.garageId] = filteredGarageIds[0];
    } else {
      $match[KpiDictionary.garageId] = { $in: filteredGarageIds };
    }
    return true;
  }
  // Handle Boolean output
  return filteredGarageIds;
};

const garagesWanted = async (app, cockpitType, garageId, garageIds, type) => {
  let result = [];
  let erepGarages = null;
  let userGarages = garageIds ? garageIds.map((g) => g.toString()) : null;
  if (cockpitType && userGarages && !garageId) {
    userGarages = await filterGaragesByType(userGarages, cockpitType);
  }
  if (type === DataTypes.EXOGENOUS_REVIEW) {
    erepGarages = await app.models.Garage.getMongoConnector()
      .find({ 'subscriptions.EReputation.enabled': true, 'subscriptions.active': true })
      .project({ _id: 1 })
      .toArray()
      .map((g) => g._id.toString());
  }
  // results with no garageId filter in url
  // no erep, user has some garages
  if (userGarages && !erepGarages) {
    result = userGarages;
  }
  // with erep, user has every garages
  if (!userGarages && erepGarages) {
    result = erepGarages;
  }
  // with erep, user has some garages
  if (userGarages && erepGarages) {
    const erepAndUserGarages = userGarages.filter((id) => erepGarages.indexOf(id) !== -1);
    result = erepAndUserGarages;
  }
  // results with a garageId filter in url
  // garageId in url but the user doesn't own the garage
  if (garageId) {
    if (garageId.length <= 1){
      if (userGarages && !userGarages.includes(garageId.toString())) {
        return Promise.reject(new Error('Not authorized to access garage'));
      }
    }else if (userGarages && !garageId.every(el => userGarages.includes(el))) {
        return Promise.reject(new Error('Not authorized to access garage'));
    }
    // garageId in url but the garage doesnt have erep
    if (erepGarages && !erepGarages.includes(garageId.toString())) {
      return Promise.reject(new Error('Garage has not erep'));
    }
  }
  return result;
};

module.exports = {
  addSearchToMatch,
  searchGarages,
  garagesWanted,
};
