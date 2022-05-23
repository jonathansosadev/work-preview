const CronRunner = require('../../../common/lib/cron/runner');

const _index = function _index(app, req, res) {
  try {
    res.render('darkbo/darkbo-application/application-mode', {
      current_tab: 'application',
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

const _cronInformationIndex = function _cronInformationIndex(app, req, res) {
  try {
    app.models.CronInformation.find({}, (err, cronInformations) => {
      if (err) {
        res.status(500).send('Error');
        return;
      }
      res.render('darkbo/darkbo-application/cron-information', {
        current_tab: 'application',
        cronInformations: JSON.stringify(cronInformations),
        frequencies: JSON.stringify(CronRunner.supportedFrequencies),
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};
const _schedulerMonitoringIndex = function _schedulerMonitoringIndex(app, req, res) {
  try {
    app.models.Job.aggregateStatusAndDate((err, jobs) => {
      if (err) {
        res.status(500).send('Error');
        return;
      }
      res.render('darkbo/darkbo-application/scheduler-monitoring', {
        current_tab: 'application',
        jobs: JSON.stringify(jobs),
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

const _getMaintenanceMode = function _getMaintenanceMode(app, req, res) {
  try {
    app.models.Configuration.getMaintenanceMode((err, maintenanceMode) => {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(
        JSON.stringify(err ? { status: 'ko', error: err } : { status: 'ok', maintenanceMode: maintenanceMode || false })
      );
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};
const _setMaintenanceMode = function _setMaintenanceMode(app, req, res) {
  try {
    if (!req.body) {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ status: 'ko', error: 'no params !' }));
      return;
    }
    app.models.Configuration.setMaintenanceMode(req.body.maintenanceMode, (err, maintenanceMode) => {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(err ? { status: 'ko', error: err } : { status: 'ok', maintenanceMode: maintenanceMode }));
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};
module.exports = {
  // GET /backoffice/application/maintenance
  index: _index,
  // GET /backoffice/application/maintenance/config
  getMaintenanceMode: _getMaintenanceMode,
  // PUT /backoffice/application/maintenance/config
  setMaintenanceMode: _setMaintenanceMode,
  // GET /backoffice/application/cron-information
  cronInformationIndex: _cronInformationIndex,
  // GET /backoffice/application/scheduler-monitoring
  schedulerMonitoringIndex: _schedulerMonitoringIndex,
};
