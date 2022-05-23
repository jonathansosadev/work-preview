const moment = require('moment');
const { exportGarages } = require('../../../common/lib/garagescore/exports/garages');
const {
  // getAvailableColumns: getAutomationExportColumns,
  exportAutomation,
  exportSentAutomation,
} = require('../../../common/lib/garagescore/exports/automation');
const garageSubscriptionTypes = require('../../../common/models/garage.subscription.type.js');
const boWorkers = require('../../workers/backoffice-workers');
const { getXLeadsStats } = require('../../../common/lib/garagescore/cross-leads/sources-stats.js');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const { getDeepFieldValue } = require('../../../common/lib/util/object.js');

const currentTab = 'application';

/**
 * List all exports
 */
const _index = function (app, req, res) {
  res.render('darkbo/darkbo-exports/index.nunjucks', {
    current_tab: currentTab,
  });
};

/**
 * exports data from db to file
 */
/**
 * [_indexExportGarages show all garages]
 * @param  {[type]} app [description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
const _indexExportGarages = function (app, req, res) {
  res.render('darkbo/darkbo-exports/garages.nunjucks', {
    current_tab: currentTab,
  });
};
/**
 * [_downloadExportGarages download all garages in CSV]
 * @param  {[type]} app [description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
const _downloadExportGarages = function (app, req, res) {
  exportGarages(app.models.Garage, app.models.User, (err, garages) => {
    res.set({ 'Content-Disposition': 'attachment; filename="exportGarages.csv"' });
    res.send(garages.toString('utf8'));
  });
};

/**
 * Export scenarios
 */
const _scenarios = function (app, req, res) {
  const scenars = {};
  let orphans = {};
  app.models.CampaignScenario.find({}, (err, scenarios) => {
    scenarios.forEach((s) => {
      scenars[s.getId().toString()] = s.name;
      orphans[s.name] = true;
    });
    let results = 'ID Garage;Nom Garage;Nom Scénario';
    app.models.Garage.find(
      { fields: { id: true, publicDisplayName: true, campaignScenarioId: true } },
      (err2, garages) => {
        garages.forEach((g) => {
          let sname = '|Défaut]';
          if (g.campaignScenarioId) {
            sname = scenars[g.campaignScenarioId.toString()] || '|Supprimé]';
            delete orphans[sname];
          }
          results += `\n${g.getId().toString()};${g.publicDisplayName};${sname || ''}`;
        });
        orphans = Object.keys(orphans);
        if (orphans.length > 0) {
          orphans.forEach((o) => {
            results += `\n-;Aucun garage assigné;${o}`;
          });
        }
        res.set('Content-Disposition', `attachment; filename="Scenarios-${new Date()}.csv"`);
        res.send(results.toString('utf8'));
      }
    );
  });
};

/**
 * Default ticket managers
 */
const _defaultManagers = async function (app, req, res) {
  const Garage = app.models.Garage.getMongoConnector();
  const garages = await Garage.find(
    {},
    {
      projection: { _id: true, publicDisplayName: true, ticketsConfiguration: true },
    }
  ).toArray();
  const usersById = (
    await app.models.User.getMongoConnector()
      .find({}, { projection: { email: true } })
      .toArray()
  ).reduce((acc, elem) => {
    acc[elem._id.toString()] = elem.email;
    return acc;
  }, {});
  let results =
    'ID Garage;Nom Garage;Email Mécontent APV;Email Mécontent VN; Email Mécontent VO; Email Mécontent CT; Email Lead APV; Email Lead VN; Email Lead VO\n'; // eslint-disable-line

  for (const garage of garages) {
    const conf = garage.ticketsConfiguration || {};
    results += `${garage._id.toString()};${garage.publicDisplayName};`;
    results += `${usersById[conf.Unsatisfied_Maintenance] || ''};${usersById[conf.Unsatisfied_NewVehicleSale] || ''};${
      usersById[conf.Unsatisfied_UsedVehicleSale] || ''
    };`;
    results += `${usersById[conf.VehicleInspection] || ''};`;
    results += `${usersById[conf.Lead_Maintenance] || ''};${usersById[conf.Lead_NewVehicleSale] || ''};${
      usersById[conf.Lead_UsedVehicleSale] || ''
    }\n`;
  }
  res.set('Content-Disposition', `attachment; filename="DefaultManagers-${new Date()}.csv"`);
  res.send(results.toString('utf8'));
};

/**
 * * comptes de factu
 */
const _exportsBillingGetCSV = async (app, req, res) => {
  const garagesToBeProcessed = await app.models.Garage.find({
    where: {},
    fields: { subscriptions: true, id: true },
  });
  let result = 'Id;cout contact;cout user;prix total abos\n';
  for (const g of garagesToBeProcessed) {
    let contacts = '';
    let users = '';
    let abos = '';
    if (g.subscriptions.active) {
      users = g.subscriptions.users.price;
      contacts = g.subscriptions.contacts.price;
      abos = 0;
      for (const item of garageSubscriptionTypes.values()) {
        if (g.subscriptions[item] && g.subscriptions[item].enabled) {
          abos += g.subscriptions[item].price;
        }
      }
    }
    result += `${g.getId().toString()};${contacts.toString().replace('.', ',')};${users
      .toString()
      .replace('.', ',')};${abos.toString().replace('.', ',')}\n`;
  }
  res.set('Content-Disposition', `attachment; filename="Billing-${new Date()}.csv"`);
  res.send(result.toString('utf8'));
};

/*
 * Automation
 */
async function _indexExportAutomation(app, req, res) {
  // Get garages
  const garageFields = { id: '$_id', publicDisplayName: true, group: true };
  const garages = await app.models.Garage.getMongoConnector().find({}, { projection: garageFields }).toArray();
  const groups = Object.entries(Object.fromEntries(garages.map(({ group }) => [group, true]))).map(([group]) => group);

  // const availableColumns = getAutomationExportColumns(true);

  // Render
  res.render('darkbo/darkbo-exports/automation.nunjucks', {
    current_tab: currentTab,
    garages: JSON.stringify(garages),
    groups: JSON.stringify(groups),
    // availableColumns: JSON.stringify(availableColumns),
  });
}

async function _downloadExportAutomation(app, req, res) {
  const { filters /* columns */ } = req.body;
  const exportResults = await exportAutomation(app, filters);
  res.set({ 'Content-Disposition': 'attachment; filename="exportAutomation.csv"' });
  res.send(exportResults.toString('utf8'));
}

async function _downloadExportSentAutomation(app, req, res) {
  const { month } = req.body;
  const monthSelected = typeof month === 'number' ? month : new Date().getMonth();
  const exportResults = await exportSentAutomation(app, monthSelected);
  res.set({ 'Content-Disposition': 'attachment; filename="exportAutomation.csv"' });
  res.send(exportResults.toString('utf8'));
}

/*
 * Cross leads
 */
function sourceFields(sourceType) {
  return [
    {
      name: `${sourceType}.createdAt`,
      value: `${sourceType}Config.createdAt`,
      query: (d) => (d ? moment(d).format('DD/MM/YYYY') : ''),
    },
    { name: `${sourceType}.createdBy`, value: `${sourceType}Config.createdBy` },
    { name: `${sourceType}.Email.Parsed`, value: `${sourceType}.Email.Parsed` },
    { name: `${sourceType}.Email.Error`, value: `${sourceType}.Email.Error` },
    { name: `${sourceType}.Email.Transferred`, value: `${sourceType}.Email.Transferred` },
    { name: `${sourceType}.Call.Parsed`, value: `${sourceType}.Call.Parsed` },
    { name: `${sourceType}.Call.Error`, value: `${sourceType}.Call.Error` },
    { name: `${sourceType}.Call.Transferred`, value: `${sourceType}.Call.Transferred` },
    { name: `${sourceType}.total`, value: `${sourceType}.total` },
  ];
}

function fields() {
  return [
    { name: 'garageId', value: 'garageId' },
    { name: 'publicDisplayName', value: 'publicDisplayName' },
    { name: 'subscriptionDate', value: 'subscriptionDate' },
    ...sourceFields(SourceTypes.LA_CENTRALE),
    ...sourceFields(SourceTypes.LE_BON_COIN),
    ...sourceFields(SourceTypes.L_ARGUS),
    ...sourceFields(SourceTypes.PARU_VENDU),
    ...sourceFields(SourceTypes.PROMONEUVE),
    ...sourceFields(SourceTypes.OUEST_FRANCE_AUTO),
    ...sourceFields(SourceTypes.CUSTOM_VO),
    ...sourceFields(SourceTypes.CUSTOM_VN),
    ...sourceFields(SourceTypes.CUSTOM_APV),
    ...sourceFields(SourceTypes.ZOOMCAR),
    ...sourceFields(SourceTypes.EKONSILIO_VO),
    ...sourceFields(SourceTypes.EKONSILIO_VN),
  ];
}

async function _crossLeadsStats(app, req, res) {
  const stats = await getXLeadsStats();
  let results = fields()
    .map((f) => f.name)
    .join(';');
  for (const stat of stats) {
    results += `\n${fields()
      .map((f) => (f.query ? f.query(getDeepFieldValue(stat, f.value)) : getDeepFieldValue(stat, f.value)))
      .join(';')}`;
  }
  res.set('Content-Disposition', `attachment; filename="XLeads-stats-${moment(new Date()).format('DD-MM-YYYY')}.csv"`);
  res.send(results.toString('utf8'));
}

/**
 * Ideas
 */
const _ideasbox = function (app, req, res) {
  let results = 'ID;Auteur;Statut;Catégorie;Idée;Score';
  app.models.Idea.find({}, (err, ideas) => {
    ideas.forEach((idea) => {
      results += `\n${idea.getId().toString()};${idea.author};${idea.open ? 'Ouvert' : 'Fermé'};${idea.category};"
      ${idea.title.replace(/"/g, "'")}";${idea.likes ? idea.likes.length : 0}`;
    });
    res.set('Content-Disposition', `attachment; filename="Ideas-${new Date()}.csv"`);
    res.send(results.toString('utf8'));
  });
};

module.exports = {
  index: _index,
  indexExportGarages: _indexExportGarages,
  downloadExportGarages: _downloadExportGarages,
  scenarios: _scenarios,
  defaultManagers: _defaultManagers,
  exportsBillingGetCSV: _exportsBillingGetCSV,
  indexExportAutomation: _indexExportAutomation,
  downloadExportAutomation: _downloadExportAutomation,
  downloadExportSentAutomation: _downloadExportSentAutomation,
  crossLeadsStats: _crossLeadsStats,
  ideasbox: _ideasbox,
};
