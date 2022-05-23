const debug = require('debug')('garagescore:common:models:alert'); // eslint-disable-line max-len,no-unused-vars
const lruCache = require('lru-cache');
const async = require('async');
const _ = require('lodash');
const { log } = require('../lib/util/log');

const AlertSubscriber = require('../lib/garagescore/alert/subscriber');
const AlertConfig = require('../lib/garagescore/alert/configuration.js');
const timeHelper = require('../lib/util/time-helper.js');
const AlertStatus = require('./alert.status');
const AlertTypes = require('./alert.types');
const ContactService = require('../lib/garagescore/contact/service');
const ContactType = require('./contact.type');
const commonTicket = require('./data/_common-ticket');
const DataTypes = require('./data/type/data-types');
const SourceTypes = require('./data/type/source-types.js');
const _appReviewNamespace = require('./_app-review-namespace');
const { SurveyPageTypes } = require('../../frontend/utils/enumV2');

const AlertCache = lruCache(500);

module.exports = function AlertDefinition(Alert) {
  _appReviewNamespace(Alert);
  /**
   * Test if an alert of type `alertType` has been emitted for survey for data of `singleDataId`
   * @param singleDataId
   * @param alertType must be one of common/models/alert.types.js
   * @param callback
   */
  Alert.wasSend = function wasSend(singleDataId, alertType, callback) {
    // eslint-disable-line no-param-reassign
    if (AlertCache.has(singleDataId.toString()) && AlertCache.get(singleDataId.toString())[alertType]) {
      callback(null, AlertCache.get(singleDataId.toString())[alertType]);
      return;
    }
    const filter = {
      where: {
        dataId: singleDataId.toString(),
        type: alertType,
      },
    };
    if (alertType === AlertTypes.LEAD_VN || alertType === AlertTypes.LEAD_VO) {
      filter.where.type = { inq: [AlertTypes.LEAD, alertType] };
    }
    Alert.findOne(filter, callback);
  };
  /**
   * Send alert emails effectively from alertInstance
   * @param alert AlertModel
   * @param singleData DataModel
   * @param callback Function
   */
  Alert.sendAlertFromAlert = function sendAlertFromAlert(alert, singleData, callback) {
    // eslint-disable-line no-param-reassign
    const User = Alert.app.models.User;
    const where = { id: { inq: alert.foreign.userIds } };
    const fields = { id: true, email: true, fullName: true };
    User.find({ where, fields }, (errUser, users) => {
      if (errUser) {
        callback(errUser);
        return;
      }
      Alert.sendAlert(alert, singleData, users, callback);
    });
  };

  Alert.getAlertType = function (data, garage) {
    const isDetractor = data.review_isDetractor();
    const isSensitive = data.review_isSensitive(garage);
    switch (data.get('type')) {
      case DataTypes.MAINTENANCE:
        if (!(garage.isSubscribed('Lead') && data.get('lead.potentialSale')) && isDetractor) {
          return AlertTypes.UNSATISFIED_MAINTENANCE;
        } else if (garage.isSubscribed('Lead') && data.get('lead.potentialSale') && isDetractor) {
          return AlertTypes.UNSATISFIED_MAINTENANCE_WITH_LEAD;
        } else if (!(garage.isSubscribed('Lead') && data.get('lead.potentialSale')) && isSensitive) {
          return AlertTypes.SENSITIVE_MAINTENANCE;
        } else if (garage.isSubscribed('Lead') && data.get('lead.potentialSale') && isSensitive) {
          return AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD;
        } else if (garage.isSubscribed('Lead') && data.get('lead.potentialSale')) {
          return AlertTypes.SATISFIED_MAINTENANCE_WITH_LEAD;
        } else {
          return AlertTypes.SATISFIED_MAINTENANCE;
        }
      case DataTypes.NEW_VEHICLE_SALE:
        if (isDetractor) {
          return AlertTypes.UNSATISFIED_VN;
        } else if (isSensitive) {
          return AlertTypes.SENSITIVE_VN;
        } else {
          return AlertTypes.SATISFIED_VN;
        }
      case DataTypes.USED_VEHICLE_SALE:
        if (isDetractor) {
          return AlertTypes.UNSATISFIED_VO;
        } else if (isSensitive) {
          return AlertTypes.SENSITIVE_VO;
        } else {
          return AlertTypes.SATISFIED_VO;
        }
      case DataTypes.VEHICLE_INSPECTION:
        if (isDetractor) {
          return AlertTypes.UNSATISFIED_VI;
        } else if (isSensitive) {
          return AlertTypes.SENSITIVE_VI;
        } else {
          return AlertTypes.SATISFIED_VI;
        }
    }
  };

  /**
   * Send alert emails effectively
   * @param alert1 AlertModel
   * @param singleData DataModel
   * @param users Array[UserModel]
   * @param callback Function
   */
  Alert.sendAlert = async function sendAlert(alert1, singleData, users, callback) {
    // eslint-disable-line no-param-reassign
    const tasks = [];
    /** If it's a LEAD_VN or LEAD_VO we send the alert to the parent (R1) users */
    if (alert1.type === AlertTypes.LEAD_VN || alert1.type === AlertTypes.LEAD_VO) {
      const garage = await Alert.app.models.Garage.findById(singleData.get('garageId'));
      if (garage.parent && garage.parent.garageId && garage.parent.shareLeadTicket) {
        if (
          (alert1.type === AlertTypes.LEAD_VN && garage.parent.shareLeadTicket.NewVehicleSale) || // check if the garage allow the share
          (alert1.type === AlertTypes.LEAD_VO && garage.parent.shareLeadTicket.UsedVehicleSale)
        ) {
          const realTimeParentSubscribers = await Alert.app.models.Garage.getRealTimeSubscribers(
            garage.parent.garageId,
            alert1.type
          );
          users = [...users, ...realTimeParentSubscribers]; // Add parent users subscribed to lead Alert Type.
        }
      }
    }

    const foreignResponses = singleData.survey && singleData.survey.foreignResponses || null;
    // check if user have validated first page for Contact (Alert) on common/lib/garagescore/contact/service.js
    const surveyReviewPagePass = (foreignResponses && foreignResponses.slice().find(response =>
        response.payload && response.payload.currentPageName === SurveyPageTypes.REVIEW_PAGE)
    ) || null;

    const basePayload = {
      alertId: alert1.id,
      alertType: alert1.type,
      garageId: singleData.get('garageId'),
      dataId: singleData.getId().toString(),
      garageType: singleData.get('garageType'),
      surveyReviewPagePass,
    };
    if (
      singleData.get('source.type') === SourceTypes.AUTOMATION &&
      [
        AlertTypes.AUTOMATION_LEAD_APV,
        AlertTypes.AUTOMATION_LEAD_VN,
        AlertTypes.AUTOMATION_LEAD_VO,
        AlertTypes.LEAD_FOLLOWUP_APV_NOT_RECONTACTED,
        AlertTypes.LEAD_FOLLOWUP_VN_NOT_RECONTACTED,
        AlertTypes.LEAD_FOLLOWUP_VO_NOT_RECONTACTED,
        AlertTypes.LEAD_FOLLOWUP_APV_RDV_NOT_PROPOSED,
        AlertTypes.LEAD_FOLLOWUP_VN_RDV_NOT_PROPOSED,
        AlertTypes.LEAD_FOLLOWUP_VO_RDV_NOT_PROPOSED,
      ].includes(alert1.type)
    ) {
      basePayload.automationCampaignId = singleData.get('leadTicket.automationCampaignId').toString();
    }
    _.each(users, (user) => {
      tasks.push((cb) => {
        if (singleData.get('source.type') === SourceTypes.AUTOMATION) {
          console.log(`============= Sending alert ${alert1.type} to ${user.email}`);
        }
        ContactService.prepareForSend(
          {
            to: user.email,
            recipient: user.fullName,
            from: 'no-reply@custeed.com',
            sender: 'GarageScore',
            type: ContactType.ALERT_EMAIL,
            payload: {
              ...basePayload,
              addresseeId: user.getId().toString(),
            },
          },
          (err4) => {
            // cf https://github.com/garagescore/garagescore/issues/2954
            // if ContactService.prepareForSend return an error it break the async.serie of tasks
            // furthermore this alert is not flagged as send (AlertStatus.SEND)
            // next time the script will try to send it again and it will happend again and block the whole alert sending process
            // * fix : log the error but do not pass it to the callback
            if (err4) {
              log.error(`Error while preparing contact ${user.email} for alert ${ContactType.ALERT_EMAIL}`, err4);
            }
            cb();
          }
        );
      });
    });
    async.series(tasks, (err4, contacts) => {
      // https://caolan.github.io/async/v3/docs.html#series
      // If any functions in the series pass an error to its callback, no more functions are run, and callback is immediately called with the value of the error.
      if (err4) {
        callback(err4);
        return;
      }
      alert1.alertMails = contacts; // eslint-disable-line no-param-reassign
      /* save alert in cache */
      const cachedAlert = AlertCache.has(singleData.getId().toString())
        ? AlertCache.get(singleData.getId().toString())
        : {};
      cachedAlert[alert1.type] = alert1;
      AlertCache.set(singleData.getId().toString(), cachedAlert);

      alert1.updateAttributes(
        {
          status: AlertStatus.SEND,
        },
        (updateAttributeErr) => {
          if (updateAttributeErr) {
            callback(updateAttributeErr);
            return;
          }
          Alert.emitEvent(
            alert1,
            'alert.send',
            {
              alert: {
                id: alert1.id,
                type: alert1.type,
                dataId: alert1.dataId,
              },
            },
            (errEmit) => {
              if (errEmit) {
                callback(errEmit);
                return;
              }
              if (!singleData.get('alert.alerts.sent')) {
                singleData.set('alert.alerts.sent', []);
              }
              singleData.get('alert.alerts.sent').push(alert1.id.toString());
              singleData.set('alert.checkAlertHour', null);
              singleData.save((err8) => {
                if (err8) {
                  callback(err8);
                  return;
                }
                callback(null, alert1);
              });
            }
          );
        }
      );
    });
  };
  /**
   * Create Alert model object and send it if must be send  immediately
   * Emit alert.send event once all mails will be send
   * @param singleData DataModel
   * @param options AlertConfigurationOptions
   * @param callback Function
   */
  Alert.saveAndSend = function saveAndSend(singleData, options, callback) {
    // eslint-disable-line no-param-reassign
    const alertSubscriber = new AlertSubscriber(Alert.app);
    async.auto(
      {
        wasSend(cb) {
          Alert.wasSend(singleData.getId(), options.type, cb);
        },
        users: [
          'wasSend',
          (cb) =>
            alertSubscriber
              .getSubscribedUsers(singleData.get('garageId'), options.type)
              .then((users) => cb(null, users))
              .catch((e) => cb(e)),
        ],
        alert: [
          'wasSend',
          'users',
          (cb, rs) => {
            if (!rs.users.length) {
              cb(
                new Error(`No configuerd user for garage ${singleData.get('garageId')} to send ${options.type} alert.`)
              );
              return;
            }
            if (rs.wasSend) {
              cb(new Error(`Alert was Sent for garage ${singleData.get('garageId')} : ${options.type} alert.`));
              return;
            }
            try {
              const alertObj = {
                type: options.type,
                dataId: singleData.getId().toString(),
                isDeferred: options.isDeferred,
                foreign: {
                  userIds: _.map(rs.users, (user) => user.id.toString()),
                },
                executionDate: new Date(Date.now() + (options.interval ? options.interval * 1000 : 0)),
              };
              Alert.create(alertObj, cb);
            } catch (e) {
              cb(e);
            }
          },
        ],
        send_alert: [
          'users',
          'alert',
          (cb, rs) => {
            if (rs.alert.isDeferred) {
              Alert.emitEvent(
                rs.alert,
                'alert.pending',
                {
                  alert: {
                    id: rs.alert.id,
                    type: rs.alert.type,
                    dataId: rs.alert.dataId,
                  },
                },
                (errEmit) => {
                  if (errEmit) {
                    cb(errEmit);
                    return;
                  }
                  cb(null, rs.alert);
                }
              );
            } else {
              Alert.sendAlert(rs.alert, singleData, rs.users, cb);
            }
          },
        ],
      },
      (err, results) => {
        callback(err, results.send_alert ? results.send_alert : null);
      }
    );
  };
  /**
   * Fetch pending deferred Alerts and send them
   * This function debug errors only and don't stop if an error occurs
   * @param ignorExecutionDate optional, if true, then we send every deferred alerts without checking the executionDate
   */
  Alert.sendDeferred = function sendDeferred(ignoreExecutionDate, cback) {
    // eslint-disable-line no-param-reassign
    const where = {
      isDeferred: true,
      status: AlertStatus.NEW,
    };
    let callback = ignoreExecutionDate;
    const filterOnExecutionTime = typeof ignoreExecutionDate === 'function';
    if (filterOnExecutionTime) {
      where.executionDate = { lt: Date.now() };
    } else {
      callback = cback;
    }
    Alert.find({ where, order: 'isDeferred ASC' }, (err, alerts) => {
      const tasks = [];
      _.each(alerts, (alert) => {
        tasks.push((cb) => {
          try {
            const alertConfig = alert.createdInRealTime
              ? { createdInRealTime: true, type: alert.type }
              : _.find(AlertConfig, (cfg) => cfg.type === alert.type); // eslint-disable-line
            /* recheck if we have always alert */
            async.auto(
              {
                singleData(cb3) {
                  Alert.app.models.Data.findById(alert.dataId, cb3);
                },
                garage: [
                  'singleData',
                  (cb3, res) => {
                    if (!res.singleData) {
                      cb3(new Error(`Alert.sendDeferred - Unknown data ${JSON.stringify(alert)}`));
                      return;
                    }
                    Alert.app.models.Garage.findById(res.singleData.garageId, cb3);
                  },
                ],
                checkHasAlert: [
                  'garage',
                  (cb3, res) => {
                    if (!res.garage) {
                      cb3(new Error(`Alert.sendDeferred - Unknown garage ${res.singleData.garageId}`));
                      return;
                    }
                    Alert.checkHasAlert(res.singleData, res.garage, alertConfig, cb3);
                  },
                ],
                sendAlert: [
                  'checkHasAlert',
                  (cb3, res) => {
                    if (res.checkHasAlert && res.singleData) {
                      Alert.sendAlertFromAlert(alert, res.singleData, cb3);
                      return;
                    }
                    cb3();
                  },
                ],
                cancelAlert: [
                  'checkHasAlert',
                  (cb3, res) => {
                    if (!res.checkHasAlert) {
                      alert.updateAttributes({ status: AlertStatus.CANCELED }, cb3);
                      return;
                    }
                    cb3();
                  },
                ],
                sendCancelEvent: [
                  'cancelAlert',
                  (cb3, res) => {
                    if (res.cancelAlert) {
                      Alert.emitEvent(
                        alert,
                        'alert.cancel',
                        {
                          alert: { id: alert.id, type: alert.type, dataId: alert.dataId },
                        },
                        cb3
                      );
                      return;
                    }
                    cb3();
                  },
                ],
              },
              (errSurevy) => {
                if (errSurevy) {
                  debug(`data ${alert.dataId} error ${errSurevy}`);
                  Alert.emitEvent(
                    alert,
                    'alert.send.error',
                    {
                      alert: { id: alert.id, type: alert.type, dataId: alert.dataId },
                      error: errSurevy.toString(),
                    },
                    (errEmitEv) => {
                      if (errSurevy) {
                        debug(`Error emitting event alert.send.error : ${errEmitEv}`);
                      }
                      cb(null);
                    }
                  );
                  return;
                }
                cb(null, alert.getId().toString());
              }
            );
          } catch (e) {
            debug(`Exception : ${e}`);
            cb(null);
          }
        });
      });
      async.series(tasks, callback);
    });
  };

  Alert.fetchAndSend = function fetchAndSend(hourNumber, callback) {
    // eslint-disable-line no-param-reassign
    async.auto(
      {
        datas(cb) {
          // const refDate = moment().subtract((parseInt(process.env.FETCH_ALERT_FREQUENCY, 10) || 3600) + 60, 'seconds').toDate();
          // /** It must not send a very old alerts so we must pick only recent survey on data wich created in the last 30 days */
          debug(`Fetch Reference Date ${timeHelper.displayHour(hourNumber)}`);
          Alert.app.models.Data.find(
            {
              where: {
                'alert.checkAlertHour': hourNumber,
              },
              order: 'updatedAt ASC',
            },
            cb
          );
        },
        fetchAndSend: [
          'datas',
          (cb, res) => {
            async.eachSeries(res.datas, (singleData, cb2) => Alert.fetchAndSendAlert(singleData, cb2), cb);
          },
        ],
        sendDeffred: ['fetchAndSend', (cb) => Alert.sendDeferred(cb)],
      },
      callback
    );
  };

  Alert.fetchAndSendAlert = function fetchAndSendAlert(singleData, callback, force = false) {
    // eslint-disable-line no-param-reassign
    const tasks = [];
    let foundAlerts = 0;
    _.each(AlertConfig, (alertCfg) => {
      tasks.push((cb) => {
        Alert.checkHasAlert(singleData, null, alertCfg, (err, hasAlert) => {
          if (err) {
            debug(`Error search data ${singleData.getId()} for config ${alertCfg.type} : ${err}`);
            cb();
            return;
          }
          if (hasAlert) {
            foundAlerts++;
            Alert.saveAndSend(singleData, force ? { ...alertCfg, isDeferred: false } : alertCfg, (errSave) => {
              if (errSave) {
                debug(`Error send Alert data ${singleData.getId()} for config ${alertCfg.type} : ${errSave}`);
              }
              cb();
            });
            return;
          }
          cb();
        });
      });
    });
    async.series(tasks, (err) => {
      debug('Found "%s" alert', foundAlerts);
      if (err) {
        debug(err);
      }
      callback();
    });
  };
  /**
   * Search if data has an alert for `alertConfig`
   * @param singleData instance of DataModel
   * @param alertConfig AlertConfiguration must be one from lib/garagescore/alert/configuration.js
   * @param callback Function
   */
  Alert.checkHasAlert = function checkHasAlert(singleData, garage, alertConfig, callback) {
    // eslint-disable-line no-param-reassign
    if (!alertConfig) {
      callback(new Error(`AlertConfig not found for data of id ${singleData.getId()}`));
      return;
    }
    if (alertConfig.disabled) {
      callback(null, false);
      return;
    }
    if (alertConfig.createdInRealTime) {
      callback(null, commonTicket.alertStillValid(singleData, garage, alertConfig.type));
      return;
    }
    alertConfig.check(singleData, callback);
  };

  Alert.remoteMethod('fetchAndSend', {
    http: {
      path: '/fetch-and-send',
      verb: 'post',
    },
    accepts: [],
    returns: [
      {
        arg: 'alertIds',
        type: 'Array',
      },
    ],
  });
};
