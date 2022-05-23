/** Find data, display them, update them */
const gsClient = require('../../../common/lib/garagescore/urls');
const PDFKit = require('pdfkit');
const moment = require('moment');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service.js');
const SupervisorMessageType = require('../../../common/models/supervisor-message.type.js');
const { startImmediateJob } = require('../../../common/lib/garagescore/scheduler/scheduler');
const { JobTypes } = require('../../../frontend/utils/enumV2');

const index = async function index(app, req, res) {
  const datas = await app.models.Data.getMongoConnector().find({}).sort({ _id: -1 }).limit(3).toArray();
  res.render('darkbo/darkbo-data/index', {
    datas,
  });
};

// serch bar
const search = function search(app, req, res) {
  res.render('darkbo/darkbo-data/search', {
    current_tab: 'users',
  });
};
// display data
const display = function display(app, req, res) {
  const dataId = req.params.dataId;
  app.models.Data.findById(dataId, async (err, data) => {
    const jobs = data !== null ? await app.models.Job.findJobsWithDataId(dataId) : [];
    res.render('darkbo/darkbo-data/display', {
      current_tab: 'users',
      dataId,
      found: data !== null,
      instance: JSON.stringify(data),
      jobs: JSON.stringify(jobs),
    });
  });
};
// delete personnal data
const anonymize = function anonymize(app, req, res) {
  const dataId = req.params.dataId;
  app.models.Data.findById(dataId, (errSearch, data) => {
    if (data) {
      const deleted = '-anonymized-';
      [
        'customer.contact.email',
        'customer.contact.mobilePhone',
        'customer.firstName',
        'customer.firstName',
        'customer.lastName',
        'customer.fullName',
        'customer.city',
        'customer.street',
        'customer.postalCode',
        'customer.countryCode',
        'vehicle.make',
        'vehicle.model',
        'vehicle.mileage',
        'vehicle.plate',
        'survey.lastRespondentIP',
        'surveyFollowupUnsatisfied.lastRespondentIP',
      ].forEach((field) => {
        if (data.get(`${field}.value`)) {
          data.set(`${field}.value`, deleted);
        }
        if (data.get(`${field}.original`)) {
          data.set(`${field}.original`, deleted);
        }
      });
      ['service.frontDeskCustomerId'].forEach((field) => {
        if (data.get(field)) {
          data.set(field, deleted);
        }
      });
      // bug: the field was an array and stays an array if we set a string
      data.set('source.raw', null);
      data.set('survey.foreignResponses', null);
      data.save((errSave) => {
        if (errSave) {
          console.error(errSave);
        }
        res.redirect(gsClient.getUrl('ADMIN_DATA_DISPLAY_ROOT') + dataId);
      });
    } else {
      console.error(errSearch);
      res.redirect(gsClient.getUrl('ADMIN_DATA_DISPLAY_ROOT') + dataId);
    }
  });
};
// download personal data as pdf
const download = function download(app, req, res) {
  const dataId = req.params.dataId;
  app.models.Data.findById(dataId, (err, data) => {
    const pdf = new PDFKit();
    pdf.fontSize(20).text(`Données importées le ${moment(data.get('createdAt')).format('DD/MM/YYYY')}`, 50, 50);

    let line = 1;
    const lineHeight = 15;
    const marginTop = 105;

    // macros
    const get = data.get.bind(data);
    const print = function (title, fields) {
      let anonymized = false;
      const fs = fields.map((f) => {
        const v = get(f);
        if (v === '-anonymized-') {
          anonymized = true;
        }
        return typeof v === 'object' ? '' : v; // we have sometimes no value in db like { "isSyntaxOK" : false, "isEmpty" : false }
      });
      let value = fs.join(' ');
      if (anonymized) {
        value = '-anonymized-';
      }
      if (value) {
        pdf.fontSize(10).text(`${title}: `, 50, marginTop + lineHeight * line /* , { underline: true }*/);
        pdf.fontSize(10).text(value, 150, marginTop + lineHeight * line++);
      }
    };
    print('Nom', ['customer.gender', 'customer.fullName']);
    print('Email', ['customer.contact.email']);
    print('Téléphone', ['customer.contact.mobilePhone']);
    print('Adresse', ['customer.street', 'customer.postalCode', 'customer.city']);
    print('Véhicule', ['vehicle.make', 'vehicle.model']);
    print('Plaque', ['vehicle.plate']);
    pdf.end();
    pdf.pipe(res);
  });
};

const switchShouldSurfaceInStatistics = async (app, req, res) => {
  const dataId = req.params.dataId;
  const state = req.query.switchTo;
  const data = await app.models.Data.findByIdAndUpdateAttributes(dataId, { shouldSurfaceInStatistics: state });
  const forwardedTo = data.get('lead.forwardedTo');
  const customerDataIdsToRemove = [dataId];

  if (forwardedTo) {
    const forwardedData = await app.models.Data.findById(forwardedTo);
    customerDataIdsToRemove.push(forwardedData.getId().toString());

    await forwardedData.updateAttributes({ shouldSurfaceInStatistics: state });
    if (!state || state === 'false') {
      await Scheduler.removeJob(JobTypes.ESCALATE, {
        dataId: forwardedData.getId().toString(),
        type: 'lead',
        stage: 1,
      });
      await Scheduler.removeJob(JobTypes.SEND_LEAD_FOLLOWUP, { dataId: forwardedData.getId().toString() });
      await Scheduler.removeJob(JobTypes.CLOSE_EXPIRED_LEAD_TICKET, { dataId: forwardedData.getId().toString() });
    }
  }

  if (!data) {
    res.json({ status: 'ko', message: "Error, can't find the data." });
    return;
  }
  // cancel campaign
  if (!data.shouldSurfaceInStatistics) {
    try {
      await data.campaign_cancel();
      await app.models.Customer.removeDatas([data.getId()]);
    } catch (errCancel) {
      res.json({ status: 'ko', message: `Error cancel data: ${data.getId().toString()} ${errCancel.message}` });
    }
  }
  await app.models.Customer.removeDatas(customerDataIdsToRemove);
  res.json({ status: 'ok', shouldSurfaceInStatistics: data.shouldSurfaceInStatistics });
};

const forceSurveyUpdate = async (app, req, res) => {
  const dataId = req.params.dataId;
  const data = await app.models.Data.findById(dataId);
  data.campaign_checkSurveyUdpates((errCheckSurveyUdpates) => {
    if (errCheckSurveyUdpates) {
      const msg = `Cannot update survey for data ${data.id} : ${errCheckSurveyUdpates.message}`;
      console.error(msg);
      data.set('campaign.contactScenario.nextCheckSurveyUpdatesDecaminute', null);
      data.save();
      res.json({ status: 'KO', text: msg });
    } else {
      res.json({ status: 'OK', text: `Data ${dataId} : survey update checked` });
    }
  });
};

const forceSendNextCampaignContactForDay = async (app, req, res) => {
  const dataId = req.params.dataId;
  const data = await app.models.Data.findById(dataId);
  data.campaign_sendNextContact((errorSendOneContact) => {
    if (errorSendOneContact) {
      const msg = `Cannot send next contact for data ${data.id} : ${errorSendOneContact.message}`;
      console.error(msg);
      data.set('campaign.contactScenario.nextCampaignContactDay', null);
      data.set('campaign.contactScenario.nextCampaignContactFailedAt', new Date());
      data.save();
      res.json({ status: 'KO', text: `${msg}` });
    } else {
      res.json({ status: 'OK', text: `Data ${dataId} : contact send` });
    }
  });
};

const forceSendNextCampaignReContactForDay = async (app, req, res) => {
  const dataId = req.params.dataId;
  const data = await app.models.Data.findById(dataId);
  data.campaign_sendReContact((errorSendOneReContact) => {
    if (errorSendOneReContact) {
      const msg = `Cannot send recontact for data ${data.id} : ${errorSendOneReContact.message}`;
      console.error(msg);
      GsSupervisor.warn({
        type: SupervisorMessageType.SEND_RECONTACT_ERROR,
        payload: {
          error: msg,
          context: 'Data.campaign_sendReContactForDay',
        },
      }); // do not wait the callback
      data.set('campaign.contactScenario.nextCampaignReContactDay', null);
      data.set('campaign.contactScenario.recontactFailedAt', new Date());
      data.save();
      res.json({ status: 'KO', text: `${msg}` });
    } else {
      res.json({ status: 'OK', text: `Data ${dataId} : reContact send` });
    }
  });
};

const forceSendUnsatisfiedFollowup = async (app, req, res) => {
  const dataId = req.params.dataId;
  const jobsCollection = app.models.Job.getMongoConnector();
  const jobs = await jobsCollection
    .find({ type: 'SEND_UNSATISFIED_FOLLOWUP', status: 'WAITING', 'payload.dataId': dataId })
    .toArray();
  for (const job of jobs) {
    await startImmediateJob(job._id);
  }
  res.json({ status: 'OK', text: `Data ${dataId} : jobs SEND_UNSATISFIED_FOLLOWUP will run as soon as possible` });
};

const forceSendLeadFollowup = async (app, req, res) => {
  const dataId = req.params.dataId;
  const jobsCollection = app.models.Job.getMongoConnector();
  const jobs = await jobsCollection
    .find({ type: 'SEND_LEAD_FOLLOWUP', status: 'WAITING', 'payload.dataId': dataId })
    .toArray();
  for (const job of jobs) {
    await startImmediateJob(job._id);
  }
  res.json({ status: 'OK', text: `Data ${dataId} : jobs SEND_LEAD_FOLLOWUP will run as soon as possible` });
};

const forceSendAlerts = async (app, req, res) => {
  const dataId = req.params.dataId;
  const data = await app.models.Data.findById(dataId);

  await app.models.Alert.fetchAndSendAlert(
    data,
    () => {
      res.json({ status: 'OK', text: `Data ${dataId} : Alerts send` });
    },
    true
  );

  await app.models.Alert.sendDeferred();
};

module.exports = {
  // GET /backoffice/data/search
  search,
  // GET /backoffice/data/:dataId
  display,
  // GET /backoffice/data/anonymize/:dataId
  anonymize,
  // GET /backoffice/data/download/:dataId
  download,
  // GET /backoffice/data/switch/:dataId
  switchShouldSurfaceInStatistics,
  // GET /backoffice/data/force-survey-update/:dataId
  forceSurveyUpdate,
  // GET /backoffice/data/force-survey-update/:dataId
  forceSendNextCampaignContactForDay,
  // GET /backoffice/data/force-send-next-campaign-contact-for-day/:dataId
  forceSendNextCampaignReContactForDay,
  // GET /backoffice/data/force-send-unsatisfied-followup/:dataId
  forceSendUnsatisfiedFollowup,
  // GET /backoffice/data/force-send-lead-followup/:dataId
  forceSendLeadFollowup,
  // GET /backoffice/data/force-send-alerts/:dataId
  forceSendAlerts,
  // GET /backoffice/data
  index,
};
