/* eslint-disable */
const debug = require('debug')('garagescore:common:models:report'); // eslint-disable-line max-len,no-unused-vars
const moment = require('moment');
const async = require('async');
const locks = require('locks');
const { JS, ANASS, log } = require('../lib/util/log');

const reportLock = locks.createMutex();
const { ObjectID } = require('mongodb');

const ContactService = require('../lib/garagescore/contact/service');
const reportGenerator = require('../lib/garagescore/report/generator');
const ReportConfigs = require('../lib/garagescore/report/configuration');
const Subscriptions = require('./garage.subscription.type');
const ReportFormat = require('./report.format');
const ContacType = require('./contact.type');
const ContactStatus = require('./contact.status');
const { getUserGarages } = require('./user/user-mongo');
const { isSubscribed } = require('./garage/garage-methods');
const GarageSubscriptions = require('./garage.subscription.type.js');
const GarageTypes = require('./garage.type');
const ReportConfigTypes = require('./report-config.type');

// check if one of the garage have at least one data with survey during a given period of time
// bdd intensive so we use a cache (it's used by a cron)
const _cacheHDFSFP = {};
const _hasDataFromSurveyDuringPeriod = async (app, periodMin, periodMax, garageIds) => {
  const key = `${periodMin.getTime()}${periodMax.getTime()}`;
  if (!_cacheHDFSFP[key]) {
    log.debug(JS, `_hasDataFromSurveyDuringPeriod generate cache for ${periodMin} -> ${periodMax}`);
    const mongo = app.models.Data.getMongoConnector();
    const garages = await mongo
      .aggregate([
        {
          $match: {
            createdAt: { $gte: periodMin, $lte: periodMax },
            survey: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$garageId',
          },
        },
      ])
      .toArray();
    const cache = {};
    if (Array.isArray(garages)) {
      garages.forEach(({ _id }) => (cache[_id.toString()] = true));
    }
    log.debug(JS, `_hasDataFromSurveyDuringPeriod cache generated with ${Object.keys(cache).length} keys`);
    _cacheHDFSFP[key] = cache;
  }
  let has = false;
  for (const garageId of garageIds) {
    if (_cacheHDFSFP[key][garageId.toString()]) {
      has = true;
      break;
    }
  }
  /* Debug: check one by one if our cache is correct
  const check = !!(await app.models.Data.findOne({
    where: {
      survey: { neq: null },
      shouldSurfaceInStatistics: true,
      garageId: { inq: garageIds },
      and: [{ createdAt: { gte: periodMin } }, { createdAt: { lte: periodMax } }]

    },
    fields: { id: true }
  }));
  if(check !== has) {
    console.log({periodMin, periodMax, garageIds})
    console.log({check, has});
    process.exit()
  }*/
  return has;
};

module.exports = function (Report) {
  // eslint-disable-line no-unused-vars
  Report.saveMonthlySummary = async function (user, reportConfigId, refDate, { erratum = false }) {
    const config = ReportConfigs.get(reportConfigId);
    return await Report.create({
      user: user,
      userEmail: user.email,
      userPhone: user.mobilePhone,
      reportConfigId: reportConfigId,
      year: config.year(refDate),
      month: config.month(refDate),
      sendDate: null,
      erratum,
    });
  };
  Report.saveReport = async function (user, reportConfigId, refDate, context) {
    if (!user.email || !user.garageIds) throw new Error("Missing user information : email or garageIds")

    const fetchGaragesSubscriptions =
      (await getUserGarages(Report.app, user.getId(), { subscriptions: true, _id: true })) || [];
    const subscriptionsByGarage = fetchGaragesSubscriptions.reduce((acc, { _id, subscriptions }) => {
      acc[_id.toString()] = subscriptions;
      return acc;
    }, {});

    const config = ReportConfigs.get(reportConfigId);
    return await Report.create({
      userId: user.id,
      userEmail: user.email,
      garageIds: user.garageIds,
      reportConfigId: reportConfigId,
      period: config.tokenDate(refDate),
      minDate: config.referenceDateMin(refDate),
      maxDate: config.referenceDateMax(refDate),
      config: user.reportConfigs[reportConfigId],
      format: ReportFormat.HTML,
      context: context,
      sendDate: null,
      subscriptionsByGarage
    });
  };

  Report.sendMonthlySummary = function (report, callback, user) {
    ContactService.prepareForSend(
      {
        to: report.userEmail,
        from: 'no-reply@custeed.com',
        sender: 'Custeed',
        type: ContacType.MONTHLY_SUMMARY_EMAIL,
        status: ContactStatus.WAITING,
        payload: {
          reportId: report.getId().toString(),
        },
      },
      callback
    );
    if (report.userPhone && !report.erratum) {
      log.debug(JS, `Sending monthly summary report to ${user.email}`);
      ContactService.prepareForSend(
        {
          to: report.userPhone,
          sender: 'Custeed',
          type: ContacType.MONTHLY_SUMMARY_SMS,
          status: ContactStatus.WAITING,
          payload: {
            reportId: report.getId().toString(),
          },
        },
        callback
      );
    }
  };
  Report.sendReport = function (report, callback, reportConfigId, user) {
    log.debug(JS, `Sending ${reportConfigId} report to ${user.email}`);
    async.auto(
      {
        contact: function (cb) {
          ContactService.prepareForSend(
            {
              to: report.userEmail,
              from: 'no-reply@custeed.com',
              sender: 'Custeed',
              type: ContacType.REPORT_EMAIL,
              status: ContactStatus.WAITING,
              payload: {
                reportId: report.getId(),
                reportConfigId: report.reportConfigId,
                reportPeriod: report.period,
              },
            },
            cb
          );
        },
      },
      callback
    );
  };

  Report.generateReport = function (user, reportConfigId, specificReport, refDate, { context, toBeUniq, erratum = false }, callback) {
    reportLock.lock(async () => {
      const endWith = (e, r) => {
        reportLock.unlock();
        callback(e, r);
      }; // Unlocks and returns callback so we don't forget to unlock
      /* Testing unicity of the report */

      const config = ReportConfigs.get(reportConfigId);

      let existingReport = false;
      if (reportConfigId === 'monthlySummary') {
        existingReport = await Report.findOne({
          where: { reportConfigId, userEmail: user.email, month: config.month(refDate), year: config.year(refDate) },
        });
      } else if (toBeUniq) {
        existingReport = await Report.findOne({ where: { period: config.tokenDate(refDate), userEmail: user.email } });
      }

      if (reportConfigId !== 'monthlySummary' && toBeUniq || reportConfigId === 'monthlySummary') {
        try {
          if (existingReport) {
            if (!erratum) return endWith('Report already exists');
            const updatedReport = await existingReport.updateAttribute('erratum', erratum);
            return endWith(null, updatedReport || null);
          }
        } catch (unicityErr) {
          return endWith(unicityErr);
        }
      }
      /* Testing relevancy of the report */
      try {
        if (reportConfigId === 'monthlySummary') {
          const garagesList = await getUserGarages(Report.app, user.getId(), { subscriptions: true, _id: true });
          const hasSubscriptions = garagesList.some(({ subscriptions }) =>
            [
              Subscriptions.VEHICLE_INSPECTION,
              Subscriptions.MAINTENANCE,
              Subscriptions.NEW_VEHICLE_SALE,
              Subscriptions.USED_VEHICLE_SALE,
            ].some((sub) => isSubscribed(subscriptions, sub))
          );
          if (!hasSubscriptions) {
            return endWith(`The garage's subscriptions do not allow the sending.`);
          }
        }
        const { canSendUnsatisfiedReport, canSendLeadReport, garagesList } = await Report.canSendReportAccordingToUserConfig(user, reportConfigId, specificReport);
        if (!canSendUnsatisfiedReport && !canSendLeadReport) {
          return endWith(`The user's configuration does not allow the sending.`);
        }

        const existingData = await _hasDataFromSurveyDuringPeriod(
          Report.app,
          reportConfigId === 'monthlySummary' ? moment().month(config.month(refDate)).year(config.year(refDate)).clone().startOf('month').toDate() : config.referenceDateMin(refDate),
          reportConfigId === 'monthlySummary' ? moment().month(config.month(refDate)).year(config.year(refDate)).clone().endOf('month').toDate() : config.referenceDateMax(refDate),
          garagesList.filter((g) => g).map((g) => g._id.toString())
        );
        if (!existingData) {
          return endWith('No data to display in report.');
        }
      } catch (relevancyErr) {
        return endWith(relevancyErr);
      }

      /* Finally generating & saving the report */
      try {
        log.debug(JS, `Generating ${reportConfigId} report to ${user.email}`);
        return endWith(null, reportConfigId === 'monthlySummary'
          ? (await Report.saveMonthlySummary(user, reportConfigId, refDate, { erratum }))
          : (await Report.saveReport(user, reportConfigId, refDate, context)) || null);
      } catch (createErr) {
        return endWith(createErr);
      }
    });
  };

  Report.canSendReportAccordingToUserConfig = async function (user, reportConfigId, specificReport = null) {
    const projectSub = {};
    GarageSubscriptions.values().forEach((garageSubscription) => {
      projectSub[garageSubscription] = 
      { '$convert': { 
          input: {
            $and: ['$subscriptions.active', `$subscriptions.${garageSubscription}.enabled`],
          },
          to: 'int'
        }
      }
    });
    const additionalStages = [
      { $project: { ...projectSub, _id: true, type: true } }
    ];

    const garagesList = await getUserGarages(Report.app, user.getId(), { subscriptions: true, _id: true, type: true }, additionalStages);
    const hasMaintenanceAtLeast = garagesList.some(garage => garage.Maintenance > 0);
    const hasVnAtLeast = garagesList.some(garage => garage.NewVehicleSale > 0);
    const hasVoAtLeast = garagesList.some(garage => garage.UsedVehicleSale > 0);
    const hasVIAtLeast = garagesList.some(garage => garage.VehicleInspection > 0);

    const hasDealershipGarages = garagesList.some(garage => garage.type !== GarageTypes.VEHICLE_INSPECTION);
    const hasVehicleInspectionGarages = garagesList.some(garage => garage.type === GarageTypes.VEHICLE_INSPECTION);

    // unsatisfied 
    const { UnsatisfiedVI, unsatisfiedApv, unsatisfiedVn, unsatisfiedVo } = user.reportConfigs[reportConfigId];
    const canSendUnsatisfiedReport =
      (hasDealershipGarages && 
        ((hasMaintenanceAtLeast && unsatisfiedApv && (!specificReport || specificReport === ReportConfigTypes.UNSATISFIED_APV))
        || (hasVnAtLeast && unsatisfiedVn && (!specificReport || specificReport === ReportConfigTypes.UNSATISFIED_VN))
        || (hasVoAtLeast && unsatisfiedVo && (!specificReport || specificReport === ReportConfigTypes.UNSATISFIED_VO))))
      || (hasVehicleInspectionGarages && hasVIAtLeast && UnsatisfiedVI && (!specificReport || specificReport === ReportConfigTypes.UNSATISFIED_VI));

    // leads
    const hasLeadAtLeast = garagesList.some(garage => garage.Lead > 0);
    const hasCrossLeadsAtLeast = garagesList.some(garage => garage.CrossLeads > 0);
    const hasAutomationAtLeast = garagesList.some(garage => garage.Automation > 0);
    const hasLead = Report.hasLead(hasLeadAtLeast, hasCrossLeadsAtLeast, hasAutomationAtLeast);
    const hasEscalationGarages = Report.hasEscalationGarages(hasMaintenanceAtLeast, hasVnAtLeast, hasVoAtLeast);
    const { lead, leadVo, leadVn } = user.reportConfigs[reportConfigId];

    const canSendLeadMaintenanceEscalateReport = hasAutomationAtLeast && hasEscalationGarages;
    const canSendLeadEscalateReport = hasLead && hasEscalationGarages;
    const canSendLeadReport =
      (hasAutomationAtLeast
        || canSendLeadMaintenanceEscalateReport
        || canSendLeadEscalateReport
        || hasLead) 
      && (
          (lead && (!specificReport || specificReport === ReportConfigTypes.LEAD))
          || (leadVo && (!specificReport || specificReport === ReportConfigTypes.LEAD_VO)) 
          || (leadVn && (!specificReport || specificReport === ReportConfigTypes.LEAD_VN))
        );
    return {
      canSendUnsatisfiedReport,
      canSendLeadReport,
      garagesList
    }
  }

  Report.hasLead = function (hasLeadAtLeast, hasCrossLeadsAtLeast, hasAutomationAtLeast) {
    return hasLeadAtLeast || hasCrossLeadsAtLeast || hasAutomationAtLeast;
  };

  Report.hasEscalationGarages = function (hasMaintenanceAtLeast, hasVnAtLeast, hasVoAtLeast) {
    return hasMaintenanceAtLeast || hasVnAtLeast || hasVoAtLeast;
  };

  Report.generateAndSend = function (user, reportConfigId, specificReport, refDate, { context = 'Scheduler', toBeUniq = true, erratum = false }, callback) {
    async.auto(
      {
        generate: function (cb) {
          Report.generateReport(user, reportConfigId, specificReport, refDate, { context, toBeUniq, erratum }, cb);
        },
        send: [
          'generate',
          function (cb, res) {
            if (reportConfigId === 'monthlySummary') {
              Report.sendMonthlySummary(res.generate, cb, user);
            } else {
              Report.sendReport(res.generate, cb, reportConfigId, user);
            }
          },
        ],
      },
      callback
    );
  };
  /**
   * Test report generation (for darkbo)
   */
  Report.testReport = function (userEmail, reportConfigId, date, cb) {
    const end = (err, res) => {
      cb(err, res);
    };
    const refDate = moment(date, 'DD/MM/YYYY');
    Report.app.models.User.findOne({ where: { email: userEmail } }, function (err, user) {
      if (err) {
        end(err);
        return;
      }
      if (!user) {
        end(new Error(`No User ${userEmail}`));
        return;
      }

      Report.generateReport(user, reportConfigId, null, refDate, { toBeUniq: false }, end);
    });
  };

  Report.generateAndSendAllReports = async ({ date, monthlySummaryOnly, usersList, monthlySummaryGo, specificReport, erratum }) => {
    for (const config of ReportConfigs) {
      // Those 2 conditions can prevent the report to be generated
      if (monthlySummaryOnly && config.id !== 'monthlySummary') {
        log.debug(ANASS, `You chose monthlySummary only mode and it's ${config.id}. Aborting!`);
        continue;
      }
      if (moment(config.sendDate(date)).isAfter(date)) {
        log.debug(ANASS, `Report ${config.id} is not ready to be send`);
        continue;
      }
      // Finding the users to whom the report will be sent
      const fields = { id: true, email: true, mobilePhone: true, reportConfigs: true, garageIds: true };
      var where = {
        [`reportConfigs.${config.id}.enable`]: true,
      };
      if (Array.isArray(usersList) && usersList.length) {
        where.id = { inq: usersList.map((uId) => new ObjectID(uId)) };
      } else if (config.id === 'monthlySummary' && !monthlySummaryGo) {
        const testUsersEmails = [
          'bbodrefaux@garagescore.com',
          'aseddiki@garagescore.com',
          'rbourbilieres@garagescore.com',
          'mvozmediano+2@garagescore.com', // To test ES
          'ag+1@garagescore.com', // To test CA
          'aseddiki+es@garagescore.com', // To test ES
          'aseddiki+ca@garagescore.com', // To test CA
        ];
        where.email = { inq: testUsersEmails };
      }
      // Sending for each user
      try {
        const users = await Report.app.models.User.find({ where, fields });
        if (!users || !users.length) {
          log.debug(ANASS, `No user is set to receive ${config.id} report`);
          continue;
        }

        for (const user of users) {
          await new Promise((res) => {
            Report.generateAndSend(user, config.id, specificReport, date, { erratum }, function (err2) {
              if (err2) {
                log.info(JS, `Report ${config.id} couldn't be send to user ${user.email} : ${err2}`);
              }
              res();
            });
          });
        }
      } catch (err) {
        log.error(err);
        throw err;
      }
    }
  };

  Report.remoteMethod('generateAndSendAllReports', {
    http: {
      path: '/generate-and-send-all-reports',
      verb: 'post',
    },
    accepts: [],
    returns: [],
  });
};
