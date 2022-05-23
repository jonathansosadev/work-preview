const app = require('../../server/server');
const _ = require('underscore');
const debug = require('debug')('garagescore:common:models:campaign'); // eslint-disable-line max-len,no-unused-vars
const gsCampaignStatus = require('./campaign.status');
const locks = require('locks');
const async = require('async');

const runCampaign = require('../lib/garagescore/campaign/run-schema/run-campaign');
const cancelCampaign = require('../lib/garagescore/campaign/run-schema/cancel-campaign');
const deleteCampaign = require('../lib/garagescore/campaign/run-schema/delete-campaign');
const completeCampaign = require('../lib/garagescore/campaign/run-schema/complete-campaign');
const { JS, log } = require('../lib/util/log');

// a mutex to run only one campaignat a time
const campaignsRunMutex = locks.createMutex();

module.exports = function CampaignDefinition(Campaign) {
  // eslint-disable-line no-unused-vars
  /*
   * Static Methods
   */

  Campaign.run = function run(campaignId, callback) {
    // eslint-disable-line no-param-reassign
    campaignsRunMutex.lock(() => {
      runCampaign(campaignId, (errRun) => {
        campaignsRunMutex.unlock();
        callback(errRun);
      });
    });
  };

  /*
   * Remote Methods
   */

  Campaign.requestRun = function requestRun(campaignId, callback) {
    // eslint-disable-line no-param-reassign
    if (!callback) {
      callback = function () {}; // eslint-disable-line
    }
    Campaign.findById(campaignId, (err, campaign) => {
      if (err) {
        callback(err);
        return;
      }

      Campaign.emitEvent(campaign, 'run.request', { campaignId }, (emitEventErr, emittedEvent) => {
        if (emitEventErr) {
          console.error(emitEventErr);
          callback(emitEventErr);
          return;
        }
        debug(emittedEvent);
        callback(null, 'requested');

        /*
         * Fire-and-forget run
         */
        Campaign.run(campaignId, (runCampaignErr) => {
          if (runCampaignErr) {
            console.error(runCampaignErr.stack);
            console.error(runCampaignErr);
          }
          return;
        });
      });
    });
  };
  Campaign.remoteMethod('requestRun', {
    http: {
      path: '/:campaignId/request-run',
      verb: 'post',
    },
    accepts: [
      {
        arg: 'campaignId',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        arg: 'status',
        type: 'string',
      },
    ],
  });
  // execute 'retry' on all campaignItems of a campaign
  Campaign.retry = function (campaignId, callback) {
    // eslint-disable-line no-param-reassign
    campaignsRunMutex.lock(() => {
      const cb = function cbEndRetry(err) {
        campaignsRunMutex.unlock();
        callback(err);
      };
      Campaign.findById(campaignId, (err, campaign) => {
        if (err) {
          cb(err);
          return;
        }
        campaign.status = gsCampaignStatus.RETRY; // eslint-disable-line no-param-reassign
        campaign.save((saveErr, campaign2) => {
          if (saveErr) {
            cb(saveErr);
            return;
          }
          Campaign.emitEvent(campaign, 'retry', { campaignId }, (emitEventErr, emittedEvent) => {
            if (emitEventErr) {
              console.error(emitEventErr);
              cb(emitEventErr);
              return;
            }
            debug(emittedEvent);
            app.models.CampaignItem.find({ where: { campaignId } }, (errList, items) => {
              if (errList) {
                cb(errList);
                return;
              }
              if (!items) {
                items = [];
              } // eslint-disable-line
              debug(`Retry on ${items.length} campaignItems`);
              async.forEachOfSeries(
                items,
                (campaignItem, i, next) => {
                  app.models.CampaignItem.retry(campaignItem.getId().toString(), (e) => {
                    if (e) {
                      console.error(e.message);
                    }
                    next();
                  });
                },
                (errFinal) => {
                  if (errFinal) {
                    console.error(errFinal);
                  }
                  campaign2.status = gsCampaignStatus.RUNNING; // eslint-disable-line no-param-reassign
                  campaign2.save(cb);
                }
              );
            });
          });
        });
      });
    });
  };
  // request a 'retry' on all campaignItems of a campaign
  Campaign.requestRetry = function requestRetry(campaignId, callback) {
    // eslint-disable-line no-param-reassign
    Campaign.findById(campaignId, (err, campaign) => {
      if (err) {
        callback(err);
        return;
      }
      Campaign.emitEvent(campaign, 'retry.request', { campaignId }, (emitEventErr, emittedEvent) => {
        if (emitEventErr) {
          console.error(emitEventErr);
          callback(emitEventErr);
          return;
        }
        debug(emittedEvent);
        callback(null, 'requested');
        Campaign.retry(campaignId, (errRetry) => {
          if (errRetry) {
            console.error(errRetry);
          }
        });
      });
    });
  };
  Campaign.remoteMethod('requestRetry', {
    http: {
      path: '/:campaignId/request-retry',
      verb: 'post',
    },
    description: "request a 'retry' on all campaignItems of a campaign",
    accepts: [
      {
        arg: 'campaignId',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        arg: 'status',
        type: 'string',
      },
    ],
  });

  /*
   * RE-Run of all Campaigns with a specified status
   */
  Campaign.updateToNewAndRestartAll = function updateToNewAndRestartAll(status, callback) {
    // eslint-disable-line no-param-reassign
    Campaign.find({ where: { status } }, (findErr, campaigns) => {
      if (findErr) {
        callback(findErr);
        return;
      }
      if (campaigns.length === 0) {
        callback(null, [], []);
      }
      const campaignIds = [];
      _.each(campaigns, (campaign) => {
        campaignIds.push(campaign.getId().toString());
      });
      const campaignsOK = [];
      const campaignsKO = [];
      async.forEachOfSeries(
        campaignIds,
        (campaignId, i, next) => {
          Campaign.updateStatus(campaignId, gsCampaignStatus.NEW, (updateErr) => {
            if (updateErr) {
              console.error(updateErr);
              campaignsKO.push(campaignId);
              next();
              return;
            }
            Campaign.run(campaignId, (requestRunErr) => {
              if (requestRunErr) {
                console.error(requestRunErr);
                campaignsKO.push(campaignId);
              } else {
                campaignsOK.push(campaignId);
              }
              next();
            });
          });
        },
        (errFinal) => {
          if (errFinal) {
            console.error(errFinal);
          }
          callback(null, campaignsOK, campaignsKO);
        }
      );
    });
  };

  /*
   * Run of all Campaigns with a specified status
   */
  Campaign.startAll = function startAll(status, callback) {
    // eslint-disable-line no-param-reassign
    Campaign.find({ where: { status } }, (findErr, newCampaigns) => {
      if (findErr) {
        callback(findErr);
        return;
      }
      if (newCampaigns.length === 0) {
        callback(null, [], []);
        return;
      }
      const campaignIds = [];
      _.each(newCampaigns, (campaign) => {
        campaignIds.push(campaign.getId().toString());
      });
      const campaignsOK = [];
      const campaignsKO = [];
      async.forEachOfSeries(
        campaignIds,
        (campaignId, i, next) => {
          Campaign.run(campaignId, (requestRunErr) => {
            if (requestRunErr) {
              console.error(requestRunErr);
              campaignsKO.push(campaignId);
            } else {
              campaignsOK.push(campaignId);
            }
            next();
          });
        },
        (errFinal) => {
          if (errFinal) {
            console.error(errFinal);
          }
          callback(null, campaignsOK, campaignsKO);
        }
      );
    });
  };
  /*
   * Run only one Campaign with a specified status
   */
  Campaign.startOne = function startOne(status, campaignId, callback) {
    // eslint-disable-line no-param-reassign
    const where = { status };
    if (!callback) {
      // if we call without the campaignId argument, we run a random campaign
      callback = campaignId; // eslint-disable-line
    } else {
      where.id = campaignId;
    }
    Campaign.findOne({ where }, (findErr, newCampaign) => {
      if (findErr) {
        callback(findErr);
        return;
      }
      if (!newCampaign) {
        callback(null, null);
      }
      Campaign.run(newCampaign.getId().toString(), (requestRunErr) => {
        if (requestRunErr) {
          console.error(requestRunErr);
        }
        callback(null, newCampaign.getId().toString());
        return;
      });
    });
  };
  Campaign.complete = function complete(id, callback) {
    // eslint-disable-line no-param-reassign
    completeCampaign(id, callback);
  };
  Campaign.prototype.complete = function complete(callback) {
    // eslint-disable-line no-param-reassign
    completeCampaign(this.getId().toString(), callback);
  };
  Campaign.remoteMethod('complete', {
    http: {
      path: '/:id/complete',
      verb: 'post',
    },
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        arg: 'campaign',
        type: 'Campaign',
      },
    ],
  });
  Campaign.checkCampaignsToComplete = function checkCampaignsToComplete(day, callback) {
    // eslint-disable-line no-param-reassign
    Campaign.find({ where: { completeScheduledAt: day } }, (errFind, campaigns) => {
      if (errFind) {
        callback(errFind, 0);
        return;
      }
      if (campaigns.length === 0) {
        callback(null, 0);
        return;
      }
      async.eachSeries(
        campaigns,
        (campaign, next) => {
          completeCampaign(campaign.id, (errComplete) => {
            if (errComplete) {
              const msg = errComplete.message || '';
              if (msg.indexOf('Cancelled') < 0) {
                // silence common errors
                log.error(JS, msg);
              }
            }
            next();
          });
        },
        (err) => callback(err, campaigns.length)
      );
    });
  };
  Campaign.cancel = function cancel(id, callback) {
    // eslint-disable-line no-param-reassign
    cancelCampaign(id, callback);
  };
  Campaign.prototype.cancel = function cancel(callback) {
    // eslint-disable-line no-param-reassign
    cancelCampaign(this.getId().toString(), callback);
  };
  Campaign.remoteMethod('cancel', {
    http: {
      path: '/:id/cancel',
      verb: 'post',
    },
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        arg: 'campaign',
        type: 'Campaign',
      },
    ],
  });
  Campaign.delete = function deleteFn(id, callback) {
    // eslint-disable-line no-param-reassign
    deleteCampaign(id, callback);
  };
  Campaign.prototype.delete = function deleteFn(callback) {
    // eslint-disable-line no-param-reassign
    deleteCampaign(this.getId().toString(), callback);
  };
  Campaign.hide = function hide(id, callback) {
    // eslint-disable-line no-param-reassign
    let updated = 0;
    app.models.Data.getDataFromCampaign(id, (errData, datas) => {
      if (errData) {
        callback(errData);
        return;
      }
      async.forEachOfSeries(
        datas,
        (data, i, next) => {
          app.models.Data.findByIdAndUpdateAttributes(
            data.id,
            { shouldSurfaceInStatistics: false },
            (err, dataChanged) => {
              if (err) {
                next(err);
                return;
              }
              if (dataChanged && datas[i].shouldSurfaceInStatistics !== dataChanged.shouldSurfaceInStatistics)
                updated++;
              next();
            }
          );
        },
        (err) => {
          if (err) {
            callback(err);
            return;
          }
          if (updated !== datas.length) {
            callback(err, { total: datas.length, updated });
            return;
          }
          app.models.Campaign.findByIdAndUpdateAttributes(
            id,
            { shouldSurfaceInStatistics: false, status: gsCampaignStatus.CANCELLED },
            (errUpdateCampaign, campaignChanged) => {
              if (errUpdateCampaign) {
                callback(errUpdateCampaign);
                return;
              }
              if (campaignChanged) {
                callback(err, { total: datas.length, updated, message: 'campaign hidden' });
              }
            }
          );
        }
      );
    });
  };
  Campaign.getCreatedCampaignItems = function getCreatedCampaignItems(campaignId, callback) {
    // eslint-disable-line no-param-reassign
    app.models.CampaignItem.find({ where: { campaignId } }, callback);
  };
  Campaign.prototype.getCreatedCampaignItems = function getCreatedCampaignItems(callback) {
    // eslint-disable-line no-param-reassign
    Campaign.getCreatedCampaignItems(this.getId().toString(), callback);
  };
  Campaign.remoteMethod('getCreatedCampaignItems', {
    http: {
      path: '/:id/get-created-campaign-items',
      verb: 'post',
    },
    description: 'List of campaignItems created from this campaign',
    accepts: [
      {
        arg: 'campaignId',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        root: true,
        type: 'object',
      },
    ],
  });
  // all datas with this campaign id
  Campaign.prototype.datas = function datas(callback) {
    // eslint-disable-line no-param-reassign
    Campaign.app.models.Data.getDataFromCampaign(this.getId().toString(), callback);
  };
};
