/** Optmized datastructure for the filters on top in Cockpit */
const objectHash = require('object-hash');
const CockpitTopFilterModel = require('../../../models/cockpit-top-filter-mongo');

function getDeepFieldValue(srcObject, fieldName) {
  let result = srcObject;
  const fieldParts = fieldName.split('.');
  for (let i = 0; i < fieldParts.length; i++) {
    if (typeof result !== 'object' || result === null) {
      return null;
    }
    result = result[fieldParts[i]];
  }
  return result;
}

async function getGarageInfos(app) {
  const Garage = app.models.Garage.getMongoConnector();
  const cursorG = await Garage.find({}, { projection: { _id: true, type: true, publicDisplayName: true } });
  const garageTypes = {};
  const garagePublicDisplayName = {};
  while (await cursorG.hasNext()) {
    const g = await cursorG.next();
    garageTypes[g._id.toString()] = g.type || 'Unknown';
    garagePublicDisplayName[g._id.toString()] = g.publicDisplayName || g._id.toString();
  }
  return { garageTypes, garagePublicDisplayName };
}

async function computeTopFiltersForData(connectors, garageTypes, garagePublicDisplayName) {
  const { Data, CockpitTopFilter } = connectors;
  const debugTotalCount = await Data.count();
  console.log(`${new Date()} - resetAndInit: ${debugTotalCount} documents to stream`);

  const cursor = await Data.find(
    { shouldSurfaceInStatistics: true },
    {
      projection: {
        type: true,
        garageId: true,
        'service.frontDeskUserName': true,
        'source.type': true,
        'leadTicket.saleType': true,
        'leadTicket.manager': true,
        'unsatisfiedTicket.manager': true,
        'unsatisfiedTicket.type': true,
      },
    }
  ); // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
  const hashes = {};
  let inserts = [];
  let debugCount = 0;
  let debugLastPct = -1;

  while (await cursor.hasNext()) {
    const data = await cursor.next();
    const d = {
      garageId: data.garageId.toString(),
      garageType: typeof garageTypes[data.garageId] !== 'undefined' ? garageTypes[data.garageId] : 'Unknown',
      type: data.type,
      garagePublicDisplayName:
        typeof garagePublicDisplayName[data.garageId] !== 'undefined'
          ? garagePublicDisplayName[data.garageId]
          : `${data.garageId}`,
    };
    const source = getDeepFieldValue(data, 'source.type');
    if (source && source !== 'null') {
      d.source = source;
    }
    if (source && source.includes('Manual')) {
      d.type = getDeepFieldValue(data, 'unsatisfiedTicket.type');
    }
    const frontDeskUserName = getDeepFieldValue(data, 'service.frontDeskUserName');
    if (frontDeskUserName && frontDeskUserName !== 'null') {
      d.frontDeskUserName = frontDeskUserName;
    }
    const leadSaleType = getDeepFieldValue(data, 'leadTicket.saleType');
    if (leadSaleType && leadSaleType !== 'null') {
      d.leadSaleType = leadSaleType;
    }
    const leadTicketManager = getDeepFieldValue(data, 'leadTicket.manager');
    if (leadTicketManager && leadTicketManager !== 'null') {
      d.leadTicketManager = leadTicketManager.toString();
    }
    const unsatisfiedTicketManager = getDeepFieldValue(data, 'unsatisfiedTicket.manager');
    if (unsatisfiedTicketManager && unsatisfiedTicketManager !== 'null') {
      d.unsatisfiedTicketManager = unsatisfiedTicketManager.toString();
    }

    // parse(stringify(data)) in order to convert the objectId in unsatisfied/lead ticketManger from an ObjectId to a String
    // with an objectId objectHash throws an error
    const h = objectHash(JSON.parse(JSON.stringify(d)));
    // dedup
    if (!hashes[h]) {
      hashes[h] = true;
      d.index = [];
      d.index.push({ k: 'garageId', v: d.garageId });
      d.index.push({ k: 'garageType', v: d.garageType });
      d.index.push({ k: 'type', v: d.type });
      if (d.source) {
        d.index.push({ k: 'source', v: d.source });
      }
      if (d.frontDeskUserName) {
        d.index.push({ k: 'frontDeskUserName', v: d.frontDeskUserName });
      }
      if (d.leadSaleType) {
        d.index.push({ k: 'leadSaleType', v: d.leadSaleType });
      }
      if (d.leadTicketManager) {
        d.index.push({ k: 'leadTicketManager', v: d.leadTicketManager });
      }
      if (d.unsatisfiedTicketManager) {
        d.index.push({ k: 'unsatisfiedTicketManager', v: d.unsatisfiedTicketManager });
      }
      inserts.push({ insertOne: { document: d } });
    }
    // inserts
    if (inserts.length === 500) {
      await CockpitTopFilter.bulkWrite(inserts);
      inserts = [];
    }
    // logging
    debugCount++;
    const pct = Math.round(100 * (debugCount / debugTotalCount));
    if (pct !== debugLastPct) {
      console.log(`${new Date()} - resetAndInit: ${debugCount}/${debugTotalCount} ${pct}%`);
      debugLastPct = pct;
    }
  }
  if (inserts.length > 0) {
    await CockpitTopFilter.bulkWrite(inserts);
  }
  console.log(`${Object.keys(hashes).length} docs`);
}

async function computeTopFiltersForAutomation(connectors, garageTypes, garagePublicDisplayName) {
  const { AutomationCampaign, CockpitTopFilter } = connectors;
  const debugTotalCount = await AutomationCampaign.count();
  console.log(`${new Date()} - resetAndInit: ${debugTotalCount} documents to stream`);

  const cursor = await AutomationCampaign.find({}, { projection: { type: true, garageId: true, hidden: true } });
  // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
  const hashes = {};
  let inserts = [];
  let debugCount = 0;
  let debugLastPct = -1;

  while (await cursor.hasNext()) {
    const automationCampaign = await cursor.next();
    const garageId = automationCampaign.garageId.toString();
    const d = {
      garageId,
      garageType: typeof garageTypes[garageId] !== 'undefined' ? garageTypes[garageId] : 'Unknown',
      automationCampaignType: automationCampaign.type,
      source: 'automation',
      garagePublicDisplayName:
        typeof garagePublicDisplayName[garageId] !== 'undefined' ? garagePublicDisplayName[garageId] : `${garageId}`,
    };

    const h = objectHash(d);
    // dedup
    if (!hashes[h]) {
      hashes[h] = true;
      d.index = [];
      d.index.push({ k: 'garageId', v: d.garageId.toString() });
      d.index.push({ k: 'garageType', v: d.garageType });
      d.index.push({ k: 'automationCampaignType', v: d.automationCampaignType });
      d.index.push({ k: 'source', v: d.source });
      inserts.push({ insertOne: { document: d } });
    }
    // inserts
    if (inserts.length === 500) {
      await CockpitTopFilter.bulkWrite(inserts);
      inserts = [];
    }
    // logging
    debugCount++;
    const pct = Math.round(100 * (debugCount / debugTotalCount));
    if (pct !== debugLastPct) {
      console.log(`${new Date()} - resetAndInit: ${debugCount}/${debugTotalCount} ${pct}%`);
      debugLastPct = pct;
    }
  }
  if (inserts.length > 0) {
    await CockpitTopFilter.bulkWrite(inserts);
  }
  console.log(`${Object.keys(hashes).length} docs`);
}

// get the possible types for every garage
async function getTypesFromGarageIds(app, garageIds, frontDesk, garageType, forEachGarage) {
  const where = {};
  if (garageIds.length > 0) where.garageId = { $in: garageIds };
  if (frontDesk) where.frontDeskUserName = frontDesk;
  if (garageType) where.garageType = garageType;
  const groupDistinct = {
    _id: forEachGarage ? '$garageId' : null,
    types: { $addToSet: '$type' },
  };
  const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
  const res = await CockpitTopFilter.aggregate([{ $match: where }, { $group: groupDistinct }]).toArray();
  return forEachGarage ? res : res[0];
}

async function addManager(
  app,
  ticketType,
  { garageId, garageType, type, source, frontDeskUserName, leadSaleType, manager }
) {
  if (!manager || !manager.toString()) {
    throw new Error('addManager needs a given manager id');
  }

  const ticketManager = manager.toString();
  const managerKey = `${ticketType}TicketManager`;
  const d = { garageId, garageType, type, source, frontDeskUserName };
  d[managerKey] = ticketManager;

  if (leadSaleType) {
    d.leadSaleType = leadSaleType;
  }

  const items = await app.models.CockpitTopFilter.find({ where: d });
  let newEntry = null;
  if (!items || !items.length) {
    d.index = [];
    d.index.push({ k: 'garageId', v: d.garageId });
    d.index.push({ k: 'garageType', v: d.garageType });
    d.index.push({ k: 'type', v: d.type });
    if (d.source) {
      d.index.push({ k: 'source', v: d.source });
    }
    if (d.frontDeskUserName) {
      d.index.push({ k: 'frontDeskUserName', v: d.frontDeskUserName });
    }
    if (d.leadSaleType) {
      d.index.push({ k: 'leadSaleType', v: d.leadSaleType });
    }
    if (d.leadTicketManager) {
      d.index.push({ k: 'leadTicketManager', v: d.leadTicketManager });
    }
    if (d.unsatisfiedTicketManager) {
      d.index.push({ k: 'unsatisfiedTicketManager', v: d.unsatisfiedTicketManager });
    }
    newEntry = await CockpitTopFilterModel.create(app, d);
  }
  return newEntry;
}

// GetSingleFilter
// Takes a propertyName and arrays of properties into account
// propertyName: string
// filters: [
//    {
//      label: 'frontDeskUserName',
//      values: ['JeanJean']
//    }
//    ,{
//      label: 'garageIds',
//      values: ['5gregrzeygrezu', '8herzhrezhjbsdfq']
//    }
// ]
async function getSingleFilter(app, propertyName, filters, source = null, groupDistinctOnType = false) {
  const where = {};
  for (const filter of filters) {
    if (filter.values.length === 1) {
      where[filter.label] = filter.values[0];
    } else if (filter.values.length > 1) {
      where[filter.label] = { $in: filter.values };
    }
  }
  if (source) {
    where.source = source;
  } else {
    where.source = { $ne: 'automation' };
  }
  const groupDistinct = {
    _id: null,
    values: { $addToSet: `$${propertyName}` },
  };
  // we need the garageId associated with the frontDesk
  if (propertyName === 'frontDeskUserName') {
    groupDistinct.values = {
      $addToSet: {
        frontDeskUserName: '$frontDeskUserName',
        garageId: '$garageId',
        ...(groupDistinctOnType && { type: '$type' }),
      },
    };
  }
  const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
  const res = await CockpitTopFilter.aggregate([{ $match: where }, { $group: groupDistinct }]).toArray();
  return res[0];
}

// stream the Data collection to reset and fill our datastructure
async function resetAndInit(app, cb) {
  try {
    console.log(`${new Date()} - resetAndInit: Stockage temporaire du type de garages`);
    const { garageTypes, garagePublicDisplayName } = await getGarageInfos(app);

    const Data = app.models.Data.getMongoConnector();
    const AutomationCampaign = app.models.AutomationCampaign.getMongoConnector();
    const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
    await CockpitTopFilter.remove();

    await computeTopFiltersForData({ Data, CockpitTopFilter }, garageTypes, garagePublicDisplayName);
    await computeTopFiltersForAutomation(
      { AutomationCampaign, CockpitTopFilter },
      garageTypes,
      garagePublicDisplayName
    );
    cb();
  } catch (e) {
    cb(e);
  }
}

// take a where as { garageId, garageType, type, source, frontDeskUserName, leadSaleType, leadTicketManager, unsatisfiedTicketManager }
// (all fields are optional)
// and return the same object with the missing fields correponding to the search`
// ie, if you give a pair garageId/source it will give you the type, frontDeskUserName etc. associted with them
async function getFilters(app, filters) {
  const matches = [];
  Object.keys(filters).forEach((k) => {
    let v = filters[k];
    if (Array.isArray(v)) {
      v = { $in: v };
    }
    if (v) {
      matches.push({ $elemMatch: { k, v } });
    }
  });
  const where = matches.length === 0 ? {} : { index: { $all: matches } };
  const groupDistinct = {
    _id: null,
    garageId: { $addToSet: '$garageId' },
    garageType: { $addToSet: '$garageType' },
    type: { $addToSet: '$type' },
    source: { $addToSet: '$source' },
    frontDeskUserName: { $addToSet: { frontDeskUserName: '$frontDeskUserName', garageId: '$garageId', type: '$type' } },
    leadSaleType: { $addToSet: '$leadSaleType' },
    leadTicketManager: { $addToSet: '$leadTicketManager' },
    unsatisfiedTicketManager: { $addToSet: '$unsatisfiedTicketManager' },
  };

  const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
  const res = await CockpitTopFilter.aggregate([{ $match: where }, { $group: groupDistinct }]).toArray();
  if (res[0] && res[0].frontDeskUserName && res[0].frontDeskUserName.length) {
    const consolidation = {};
    const finalArray = [];
    for (const item of res[0].frontDeskUserName) {
      if (!consolidation[item.garageId]) {
        consolidation[item.garageId] = {};
      }
      if (!consolidation[item.garageId][item.frontDeskUserName]) {
        consolidation[item.garageId][item.frontDeskUserName] = [];
      }
      consolidation[item.garageId][item.frontDeskUserName].push(item.type);
    }
    for (const gId of Object.keys(consolidation)) {
      for (const fd of Object.keys(consolidation[gId])) {
        finalArray.push({
          frontDeskUserName: fd,
          garageId: gId,
          types: consolidation[gId][fd],
        });
      }
    }
    res[0].frontDeskUserName = finalArray;
  }
  return res[0];
}
// Mise en RAM + REFRESH avec redis ? une valeur pour donner la date de dernier update et un check constant pour une mise en RAM
module.exports = { resetAndInit, getFilters, getTypesFromGarageIds, getSingleFilter, addManager };
