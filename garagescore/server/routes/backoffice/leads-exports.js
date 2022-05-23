const SourceTypes = require('../../../common/models/data/type/source-types');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');

const config = (app, req, res) => {
  app.models.Configuration.getExportLeads(true, (e, leadsExportsConfigs) => {
    const garageFields = { id: true, publicDisplayName: true, group: true };
    app.models.Garage.find({ fields: garageFields }, (err, garageModelInstances) => {
      const garages = garageModelInstances.map(({ id, publicDisplayName, group }) => ({
        id,
        publicDisplayName,
        group,
      }));
      const SourceTypesArr = SourceTypes.values().filter((s) => SourceTypes.isLeadTicketSupported(s));
      const LeadSaleTypesArr = LeadSaleTypes.values().map((leadType) => ({
        leadType,
        displayName: leadType,
      }));
      res.render('darkbo/darkbo-api/leads-exports-config.nunjucks', {
        current_tab: 'api',
        garages: JSON.stringify(garages),
        configs: JSON.stringify(leadsExportsConfigs || []),
        SourceTypes: JSON.stringify(SourceTypesArr),
        LeadSaleTypes: JSON.stringify(LeadSaleTypesArr),
      });
    });
  });
};

const stats = (app, req, res) => {
  app.models.ExportLeadsStatistic.find({}, (err, exportStats) => {
    res.render('darkbo/darkbo-api/leads-exports-stats.nunjucks', {
      current_tab: 'api',
      exportStats: JSON.stringify(exportStats, null, 4),
    });
  });
};

const saveConfig = (app, req, res) => {
  // Saves the configuation
  // Either edits an existing config or creates a new one based on the name property
  if (!req.body) {
    res.status(404).send('No configuration set to be saved');
    return;
  }
  if (!req.body.name) {
    res.status(400).send('Unnamed configuration');
    return;
  }

  app.models.Configuration.getExportLeads(true, (err, leadsExportsConfigs) => {
    const update = err || !leadsExportsConfigs ? [] : leadsExportsConfigs;
    const configToEdit = update.findIndex((c) => c.name === req.body.name);
    req.body.name = req.body.newName;
    delete req.body.newName;

    if (~configToEdit) update[configToEdit] = req.body;
    else update.push(req.body);

    app.models.Configuration.setExportLeads(update, (e) => {
      if (e) {
        res.status(500).send(`Could not save the config: ${e.message}`);
        return;
      }
      res.status(200).send(update);
    });
  });
};
const deleteConfig = (app, req, res) => {
  // Deletes the configuration designated by its name
  if (!req.query.name) {
    res.status(400).send('Unnamed configuration');
    return;
  }
  app.models.Configuration.getExportLeads(true, (err, leadsExportsConfigs) => {
    const update = err || !leadsExportsConfigs ? [] : leadsExportsConfigs;
    const indexToDelete = update.findIndex((c) => c.name === req.query.name);
    if (indexToDelete === -1) {
      res.status(404).send('Configuration to delete not found');
      return;
    }
    update.splice(indexToDelete, 1);

    app.models.Configuration.setExportLeads(update, (e) => {
      if (e) {
        res.status(500).send(`Could not delete the config: ${e.message}`);
        return;
      }
      res.status(200).send(update);
    });
  });
};

module.exports = {
  config,
  stats,
  saveConfig,
  deleteConfig,
};
