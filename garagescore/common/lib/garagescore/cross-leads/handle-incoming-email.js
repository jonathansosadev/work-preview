/* eslint-disable no-await-in-loop,no-plusplus */
const { ObjectID } = require('mongodb');
const https = require('https');
const url = require('url');
const loopback = require('../../../../server/server');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const IncomingCrossLeadsStatus = require('../../../models/incoming-cross-leads.status.js');
const IncomingCrossLeadsTypes = require('../../../models/incoming-cross-leads.types.js');
const Scheduler = require('../scheduler/scheduler.js');
const crossLeadsIncomingEmail = require('../../../../workers/jobs/scripts/cross-leads-incoming-email.js');
const { SIMON, log } = require('../../util/log.js');
const { Common } = require('./parser.js');
const { getTestEmailFromInput, getTestPhoneFromInput, slackMessage } = require('./util');

const apiAuth = `api:${process.env.MAILGUN_SECRET_API_KEY}`;

// download ana attachment from a mailgun api url
const downloadAttachments = async (attachmentURL) =>
  new Promise((resolve, reject) => {
    const options = url.parse(attachmentURL);
    options.headers = {
      Authorization: `Basic ${new Buffer(apiAuth).toString('base64')}`,
    };
    https.get(options, (res) => {
      const body = [];
      res.on('data', (data) => {
        body.push(data);
      });
      res.on('end', () => {
        const buffer = Buffer.concat(body);
        resolve(buffer);
      });
      res.on('error', reject);
    });
  });
// init express and multer

/**
 *
 * https://app.mailgun.com/app/receiving/routes
 * The tools here return a body we need to decode with multer, the attachements are in the body
 * const upload = multer();
 * const files = req.files || [];
 * but in production you need to decode with bodyParser.urlencode and get the attachements from api urls given in te body
 */

module.exports = async (req, res) => {
  let email = null;
  if (!req.body.isATest) res.status(201).send('OK');
  try {
    if (!req.body) {
      console.error('No req.body');
      console.error(req);
      console.error(req.headers && req.headers['content-type']);
    }

    const payload = {
      to: req.body.recipient,
      subject: req.body.Subject,
      messageUrl: req.body['message-url'],
      html: req.body['stripped-html'] || req.body['body-html'],
      attachments: [],
    };

    const files = (req.body.attachments && JSON.parse(req.body.attachments)) || [];
    for (let i = 0; i < files.length; i++) {
      if (
        files[i]['content-type'] &&
        files[i]['content-type'].includes &&
        files[i]['content-type'].includes('xml') &&
        files[i].size < 1048576
      ) {
        // file size < 1Mb and only XML type
        const buffer = await downloadAttachments(files[i].url);
        payload.attachments.push({ ...files[i], buffer, heavyFile: false });
      } else {
        payload.attachments.push({ ...files[i], buffer: null, heavyFile: true });
      }
    }
    let garageId = null;
    let sourceType = null;
    try {
      garageId = Common.parsers.garageId(payload);
      if (garageId) garageId = new ObjectID(garageId); // Try to convert it to objectId
    } catch (e) {
      log.error(SIMON, `handle-incoming-email.js: (Common.parsers.garageId) ${e.message}`);
      garageId = null;
    }
    try {
      sourceType = Common.parsers.sourceType(payload);
    } catch (e) {
      log.error(SIMON, `handle-incoming-email.js: (Common.parsers.sourceType) ${e.message}`);
    }
    email = await loopback.models.IncomingCrossLead.create({
      externalId: req.body['Message-Id'],
      type: IncomingCrossLeadsTypes.EMAIL,
      status: IncomingCrossLeadsStatus.NEW,
      garageId, // Needed for aggregations
      sourceType: sourceType || 'undefined',
      receivedAt: new Date(),
      payload,
      raw: req.body,
    });
    if (!garageId) throw new Error(`handle-incoming-email: garageId wrong or not found in receiver '${payload.to}'`);
    else if (!sourceType)
      throw new Error(`handle-incoming-email: sourceType wrong or not found in receiver '${payload.to}'`);
    if (!req.body.isATest && !(await loopback.models.Garage.isSourceEnabled(garageId, sourceType))) {
      // isATest for DBO
      throw new Error(`handle-incoming-email: Garage ${garageId.toString()} ${sourceType} is disabled`);
    }

    const testEmailFromInput = await getTestEmailFromInput(req.body['Reply-To'] + req.body['stripped-html']);
    const testPhoneFromInput = await getTestPhoneFromInput(payload.html);
    // #3853 send slack message to PM
    if (testEmailFromInput || testPhoneFromInput) {
      await slackMessage(
        `${testEmailFromInput || testPhoneFromInput} - Email de test sur le garage ${garageId} a été intercepté ✔️`,
        `📧 - ${sourceType}`,
        '#tests_xleads'
      );
      await email.updateAttributes({
        status: IncomingCrossLeadsStatus.ERROR,
        error: `Test email by Custeed censored by ${testEmailFromInput || testPhoneFromInput}`,
      });
      return;
    }
    if (req.body.isATest) {
      await crossLeadsIncomingEmail({
        payload: {
          emailId: email.id.toString(),
        },
      });
      if (res) res.status(201).send('OK');
      return;
    }
    // Create job to parse the email as soon as possible:
    if (email && garageId) {
      await Scheduler.insertJob(
        JobTypes.CROSS_LEADS_INCOMING_EMAIL,
        {
          emailId: email.id.toString(),
        },
        new Date(),
        null,
        `CROSS_LEADS-${garageId.toString()}`
      );
    }
  } catch (e) {
    console.error(e);
    log.error(SIMON, e.message);
    if (email) await email.updateAttributes({ status: IncomingCrossLeadsStatus.ERROR, error: e.message });
    if (req.body.isATest && res) res.status(201).send(e.message);
  }
};
