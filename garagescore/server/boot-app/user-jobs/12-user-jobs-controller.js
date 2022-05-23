class UserJobsController {
  // =====================================
  // =                                   =
  // =           CRUD Methods            =
  // =                                   =
  // =====================================

  static getAllUserJobs(app, req, res) {
    app.models.UserJob.find({}, (errFind, results) => {
      if (errFind) {
        this._sendResponse(res, 500, errFind);
      } else {
        this._sendResponse(res, 200, results);
      }
    });
  }

  static saveUserJobs(app, req, res) {
    const jobId = req.body.id;
    const name = req.body.name;
    const isManager = !!req.body.isManager || false;

    if (!name || name.length < 2 || name.length > 50) {
      this._sendResponse(res, 400, 'Wrong job name');
    } else {
      const garageType = req.body.garageType || 'Dealership';
      const defaultUserConfig = req.body.defaultUserConfig;
      if (defaultUserConfig && defaultUserConfig.reportConfigs) {
        ['daily', 'weekly', 'monthly', 'monthlySummary'].forEach((period) => {
          const config = defaultUserConfig.reportConfigs[period];
          if (config) {
            config.enable = !!Object.keys(config).find((c) => config[c] && c !== 'enable');
            config.generalVue = period === 'monthly';
          }
        });
      }
      if (jobId) {
        app.models.UserJob.findById(jobId, (errFind, job) => {
          if (errFind || !job) {
            this._sendResponse(res, 500, errFind || `job of id ${jobId} is not found in the DB`);
            return;
          }
          job.updateAttributes({ name, defaultUserConfig, garageType, isManager }, (errUpdate, updatedJob) => {
            if (errUpdate) {
              console.error('Error job.updateAttributes:', errUpdate);
              this._sendResponse(res, 500, errUpdate);
            } else {
              this._sendResponse(res, 200, updatedJob);
            }
          });
        });
        return;
      }
      app.models.UserJob.create({ name, defaultUserConfig, garageType, isManager }, (errCreate, createdJob) => {
        if (errCreate) {
          this._sendResponse(res, 500, errCreate);
        } else {
          this._sendResponse(res, 200, createdJob);
        }
      });
    }
  }

  static deleteUserJobs(app, req, res) {
    let job = '';

    if (!req.params.userJobName) {
      this._sendResponse(res, 400, 'Job name is missing');
    } else {
      job = req.params.userJobName;
      app.models.UserJob.findOne({ where: { name: job } }, (errFind, result) => {
        if (errFind) {
          this._sendResponse(res, 500, errFind);
        } else if (!result) {
          this._sendResponse(res, 404, 'Job does not exist');
        } else {
          result.destroy((errDestroy) => {
            if (errDestroy) {
              this._sendResponse(res, 500, errDestroy);
            } else {
              this._sendResponse(res, 200, 'job destroyed');
            }
          });
        }
      });
    }
  }

  // =====================================
  // =                                   =
  // =          Public Methods           =
  // =     To be used within the API     =
  // =   And not from the web via HTTP   =
  // =  Will not send any HTTP response  =
  // =                                   =
  // =====================================

  // =====================================
  // =                                   =
  // =         Privates Methods          =
  // =                                   =
  // =====================================

  /**
   * Send a HTTP response
   * @param res the 'res' entity provided by express
   * @param code the HTTP Status Code
   * @param data the data you wanna send, will be stringify
   * @private
   */
  static _sendResponse(res, code, data) {
    res.setHeader('Content-type', 'application/json');
    res.status(code);
    res.send(JSON.stringify(data));
  }
}

module.exports = UserJobsController;
