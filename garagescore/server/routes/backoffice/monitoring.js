const moment = require('moment');
const config = require('config');
const ContactTypes = require('../../../common/models/contact.type');
const monitoringData = require('../../../common/lib/garagescore/monitoring/data');
const gsClient = require('../../../common/lib/garagescore/client');
const boWorkers = require('../../workers/backoffice-workers');

/** APP Monitoring */
const mongoProfiler = require('../../../common/lib/garagescore/monitoring/mongo-profiler');
const graphqlProfiler = require('../../../common/lib/garagescore/monitoring/graphql-profiler');

const { ANASS, log } = require('../../../common/lib/util/log');

//  Performance review
const _profiler = function _profiler(app, req, res) {
  try {
    let graphqlJournal = [];
    let mongoJournal = [];
    graphqlProfiler
      .getJournal(app, { name: 1, runTime: 1 })
      .then((journal) => {
        graphqlJournal = journal;
        return mongoProfiler.getJournal(app);
      })
      .then((journal) => {
        mongoJournal = journal;
        res.render('darkbo/darkbo-monitoring/monitoring-profiler', {
          error: null,
          current_tab: 'monitoring',
          env_profiler: config.get('profiler.enable'),
          env_profiler_namespace: config.get('profiler.namespace'),
          mongoJournal: JSON.stringify(mongoJournal),
          graphqlJournal: JSON.stringify(graphqlJournal),
        });
      })
      .catch((e) => {
        res.render('darkbo/darkbo-monitoring/monitoring-profiler', {
          error: e.message,
          current_tab: 'monitoring',
          env_profiler: config.get('profiler.enable'),
          env_profiler_namespace: config.get('profiler.namespace'),
          env_profiler_printSlowQueries: config.get('profiler.printSlowQueries'),
          mongoJournal: JSON.stringify(mongoProfiler.getJournal()),
          graphqlJournal: [],
        });
      });
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};
const _profilerReset = function _profiler(app, req, res) {
  try {
    graphqlProfiler
      .reset(app)
      .then(() => {
        return mongoProfiler.reset(app);
      })
      .then(() => {
        res.send(JSON.stringify({ status: 'OK' }));
      })
      .catch((e) => {
        console.error(e);
        res.send(JSON.stringify({ status: 'KO', error: e.message }));
      });
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

// Monthly summary
const hasMontlhySummaryBeenValidated = async (app, { month: monthToCheck, year: yearToCheck }) => {
  return new Promise((res) => {
    app.models.Configuration.getMonthlySummaryValidations((err, monthlySummaryValidations) => {
      if (err || !monthlySummaryValidations) {
        log.error(ANASS, err || 'No validations found in config');
        res(false);
        return;
      }
      const isValidated = monthlySummaryValidations.find(
        ({ year, month }) => year === yearToCheck && month === monthToCheck
      );
      res(!!isValidated);
    });
  });
};

const getSentSummariesList = async (app, { reportConfigId, month, year }) => {
  const ReportConnector = app.models.Report.getMongoConnector();
  const ContactsConnector = app.models.Contact.getMongoConnector();

  const generatedSummaries = await ReportConnector.find(
    { reportConfigId, month, year },
    { projection: { _id: true, userId: true, userEmail: true, userPhone: true } }
  ).toArray();

  const reportIdsList = generatedSummaries.map(({ _id }) => _id.toString());
  const emailContactsQuery = {
    to: { $in: generatedSummaries.map(({ userEmail }) => userEmail) },
    type: ContactTypes.MONTHLY_SUMMARY_EMAIL,
  };
  const smsContactsQuery = {
    to: { $in: generatedSummaries.map(({ userPhone }) => userPhone) },
    type: ContactTypes.MONTHLY_SUMMARY_SMS,
  };

  const sentContacts = await ContactsConnector.find(
    {
      $or: [emailContactsQuery, smsContactsQuery],
      'payload.reportId': { $in: reportIdsList },
    },
    { projection: { _id: true, type: true, to: true, payload: true } }
  ).toArray();

  return generatedSummaries.map(({ _id, userId, userEmail, userPhone }) => {
    const reportId = _id.toString();
    const sentEmail = sentContacts.find(({ to, payload }) => to === userEmail && reportId === payload.reportId);
    const sentSMS = sentContacts.find(({ to, payload }) => to === userPhone && reportId === payload.reportId);
    const reportLink = `${gsClient.appUrl()}${gsClient.url.getShortUrl('MONTLHY_SUMMARY')}/${reportId}`;
    return {
      reportId,
      userId,
      userEmail,
      userPhone,
      sentEmail: sentEmail && sentEmail._id.toString(),
      sentSMS: sentSMS && sentSMS._id.toString(),
      reportLink,
    };
  });
};

const _monthlySummaryData = async (app) => {
  try {
    const reportConfigId = 'monthlySummary';
    const ReportConnector = app.models.Report.getMongoConnector();
    const lastMonthlySummaryGenerated = await ReportConnector.findOne({ reportConfigId }, { sort: { _id: -1 } });
    if (!lastMonthlySummaryGenerated) return {};

    const { year, month } = lastMonthlySummaryGenerated;
    const nSummariesSent = await ReportConnector.count({ reportConfigId, month, year });

    const sentSummariesList =
      nSummariesSent < 20 ? await getSentSummariesList(app, { reportConfigId, month, year }) : [];

    const isValidated = await hasMontlhySummaryBeenValidated(app, { month, year });

    return { month, year, nSummariesSent, sentSummariesList, isValidated };
  } catch (err) {
    log.error(ANASS, `_monthlySummaryData :: ${err} ${err.stack}`);
    return {};
  }
};
const _monthlySummary = function (app, req, res) {
  _monthlySummaryData(app).then(({ month, year, nSummariesSent, sentSummariesList, isValidated }) => {
    res.render('darkbo/darkbo-monitoring/monitoring-monthly-summary', {
      current_tab: 'monitoring',
      month,
      year,
      nSummariesSent,
      sentSummariesList: JSON.stringify(sentSummariesList),
      isValidated,
    });
  });
};

const _validateMonthlySummary = function (app, req, res) {
  const { month: reqMonth, year: reqYear } = req.query;
  const monthToValidate = parseInt(reqMonth, 10);
  const yearToValidate = parseInt(reqYear, 10);

  app.models.Configuration.getMonthlySummaryValidations((err, oldValidations) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    const newValidations = oldValidations && Array.isArray(oldValidations) ? oldValidations : [];

    const isValidated = !!newValidations.find(
      ({ month, year }) => month === monthToValidate && year === yearToValidate
    );

    if (isValidated) {
      res.status(200).send({ message: 'Was already validated' });
      return;
    }

    newValidations.push({
      month: monthToValidate,
      year: yearToValidate,
      theDudeWhoValidated: req.user.email,
      validationDate: new Date(),
    });

    app.models.Configuration.setMonthlySummaryValidations(newValidations, (err, validationsAfterWrite) => {
      if (err || newValidations.length !== validationsAfterWrite.length) {
        res.status(500).send({ message: err || 'Failed to save new validation' });
      }

      res.status(200).send({ message: 'Validated successfully' });
    });
  });
};

module.exports = {
  // /backoffice/monitoring/*
  profiler: _profiler,
  profilerReset: _profilerReset,
  monthlySummary: _monthlySummary,
  validateMonthlySummary: _validateMonthlySummary,
};
