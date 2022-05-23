const contactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config');
const campaignTypes = require('../../../common/models/campaign.type.js');
const GarageTypes = require('../../../common/models/garage.type.js');
const SourceTypes = require('../../../common/models/data/type/source-types.js');

const _index = function (app, req, res) {
  try {
    app.models.CampaignScenario.find({}, (err, scenarios) => {
      if (err) {
        res.status(500).send({ status: 'ko', message: err.message });
        return;
      }
      res.render('darkbo/darkbo-campaigns/campaign-scenario.nunj', {
        scenarios: JSON.stringify(scenarios),
        campaignTypes: JSON.stringify(campaignTypes.translations()),
        contactsConfigs: JSON.stringify(contactsConfigs),
        GarageTypes: JSON.stringify(GarageTypes.translations()),
        CrossLeadsSourcesTypes: JSON.stringify(SourceTypes.supportedCrossLeadsSources()),
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', message: e.message });
  }
};

const _save = function (app, req, res) {
  if (!req.body.scenario) {
    res.send({ status: 'ko', message: 'Pas de scénario' });
    return;
  }
  app.models.CampaignScenario.upsert(req.body.scenario, (err, scenario) => {
    if (err) {
      res.send({ status: 'ko', message: err });
      return;
    }
    app.models.Garage.emptyScenariosCache();
    res.send({ status: 'ok', scenario });
  });
};

const _delete = function (app, req, res) {
  if (!req.body.scenarioId) {
    res.send({ status: 'ko', message: 'Pas de scenarioId' });
    return;
  }
  app.models.CampaignScenario.controlledDestroyById(req.body.scenarioId, (err) => {
    app.models.Garage.emptyScenariosCache();
    res.send({ status: err ? 'ko' : 'ok', message: err ? err.toString() : '' });
  });
};

module.exports = {
  // /backoffice/campaign/scenarios
  index: _index,
  // /backoffice/campaign/scenario
  save: _save,
  // /backoffice/campaign/scenario
  delete: _delete,
};
