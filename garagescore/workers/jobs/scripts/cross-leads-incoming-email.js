const axios = require('axios');
const querystring = require('querystring');
const { promisify } = require('util');
const Mutex = require('locks').createMutex();

const app = require('../../../server/server');
const commonTicket = require('../../../common/models/data/_common-ticket');
const ContactService = require('../../../common/lib/garagescore/contact/service.js');

const { TicketActionNames } = require('../../../frontend/utils/enumV2');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const GarageTypes = require('../../../common/models/garage.type');
const SourceBy = require('../../../common/models/data/type/source-by.js');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const IncomingCrossLeadsStatus = require('../../../common/models/incoming-cross-leads.status.js');
const IncomingCrossLeadsTypes = require('../../../common/models/incoming-cross-leads.types.js');
const LeadTicketStatus = require('../../../common/models/data/type/lead-ticket-status');
const ContactTypes = require('../../../common/models/contact.type.js');

const sendEmail = promisify(ContactService.prepareForSend).bind(ContactService);

const _sendInternalAlert = async ({ garageId, sourceType, webSite }) => {
  const garage = await app.models.Garage.findOne({
    where: { id: garageId },
    fields: {
      publicDisplayName: true,
    },
  });
  await sendEmail({
    to: 'customer_success@custeed.com',
    from: 'no-reply@custeed.com',
    sender: 'GarageScore',
    type: ContactTypes.SUPERVISOR_SOURCE_TYPE_MISMATCH,
    payload: {
      logs: [
        `Garage: ${garage.publicDisplayName} - ID: ${garageId} a mal été configuré (Erreur copier/coller) ! Configuré sur GS: ${sourceType} !== reçu depuis: ${webSite}`,
      ],
    },
  });
};

const apiAuth = `api:${process.env.MAILGUN_SECRET_API_KEY}`;

const lock = promisify(Mutex.lock).bind(Mutex);
const unlock = Mutex.unlock.bind(Mutex);

/**
 * Transfer the email which wasn't parsed when we are in production
 */
const _transferEmail = async (email, to) => {
  const isUnitTest =
    typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
    (process.argv.length > 1 && process.argv[1].indexOf('mocha') >= 0);
  if (isUnitTest || process.env.NODE_APP_INSTANCE !== 'app') {
    return; // Do use axios in unit test
  }
  await axios.post(`${email.payload.messageUrl}`, querystring.stringify({ to }), {
    headers: { Authorization: `Basic ${new Buffer(apiAuth).toString('base64')}` },
  });
};

/**
 * Parse incoming emails and create new ticket or just forward it
 */
module.exports = async (job) => {
  const src = 'cross-leads-incoming-email.js';
  await lock();
  let email = null;
  let blacklistedBy = null;
  try {
    const { emailId } = job.payload;
    if (!emailId) throw new Error(`${src}: ${emailId} is not a correct emailId`);
    email = await app.models.IncomingCrossLead.findById(emailId);
    if (!email) throw new Error(`${src}: email with ${emailId} is not found`);
    if (email.type !== IncomingCrossLeadsTypes.EMAIL)
      throw new Error(`CROSS-LEADS: cross-lead TYPE invalid for parsing: ${email.type}`);
    if (email.status !== IncomingCrossLeadsStatus.NEW)
      throw new Error(`CROSS-LEADS: email status invalid for parsing: ${email.status}`);
    if (!email.garageId) throw new Error(`${src}: garageId wrong or not found in email: ${emailId}`);
    const garage = await app.models.Garage.findById(email.garageId, { crossLeadsConfig: 1, type: 1, locale: 1 });
    const parsed = await email.parseMe(garage);
    if (!parsed.sourceType) throw new Error(`${src}: sourceType wrong or not found in email: ${emailId}`);
    if (!garage) throw new Error(`${src}: garage not found: ${parsed.garageId}`);
    if (!garage.crossLeadsConfig) throw new Error(`${src}: crossLeadsConfig not found on garage: ${parsed.garageId}`);
    if (!parsed.success) {
      blacklistedBy = await app.models.XLeadsBlacklist.testEmail(email);
      let error = `Couldn't parse email ${emailId}: `;
      if (blacklistedBy) error += blacklistedBy;
      else {
        error += `parsedCount:${parsed.parsedCount}, email:${parsed.fields.email || 'not parsed'}, phone:${
          parsed.fields.phone || 'not parsed'
        }`;
      }
      if (
        parsed.webSite &&
        SourceTypes.getValue(parsed.webSite) &&
        SourceTypes.getValue(parsed.webSite) !== parsed.sourceType
      ) {
        await _sendInternalAlert(parsed);
        error += `, MATCH FAIL: (source=${parsed.sourceType}) !== webSite=${SourceTypes.getValue(parsed.webSite)}`;
      }
      await email.updateAttributes({ status: IncomingCrossLeadsStatus.TRANSFERRED, error });
      if (!Array.isArray(garage.crossLeadsConfig.sources))
        throw new Error(`CROSS-LEADS: sources not found: ${parsed.garageId}`);
      const sourceConfig = garage.crossLeadsConfig.sources.find((s) => s.type === parsed.sourceType);
      if (!sourceConfig)
        throw new Error(`${src}: crossLeadsConfig[${parsed.sourceType}] not found on garage: ${parsed.garageId}`);
      await _transferEmail(email, sourceConfig.followed_email);
      unlock();
      return;
    }
    let data = await app.models.Data.findOne({
      // Try if the data already exists
      where: {
        garageId: parsed.garageId,
        'source.sourceId': parsed.sourceId,
        'leadTicket.status': { inq: LeadTicketStatus.openStatus() },
      },
    });
    if (!data || !data.get('leadTicket')) {
      // Doesn't exists, we add a new one
      const customer = {
        email: parsed.fields.email,
        mobilePhone: parsed.fields.phone,
        gender: parsed.fields.gender,
        title: parsed.fields.title,
        firstName: parsed.fields.firstName,
        lastName: parsed.fields.lastName,
        fullName: `${parsed.fields.firstName || ''} ${parsed.fields.lastName || ''}`.trim(),
      };
      data = await app.models.Data.init(parsed.garageId, {
        garageType: (garage && garage.type) || GarageTypes.DEALERSHIP,
        raw: { emailId },
        sourceId: parsed.sourceId,
        sourceType: parsed.sourceType,
        sourceBy: SourceBy.EMAIL,
        lead: {
          type: LeadTypes.INTERESTED,
          saleType: SourceTypes.saleType(parsed.sourceType),
          reportedAt: email.receivedAt,
        },
        customer,
      });
      data = await data.save(); // Save have to stay before adding the ticket, otherwise the job doesn't have a data.id
      await data.addLeadTicket(null, {
        // first action parameters
        source: 'crossLeads',
        sourceData: {
          type: 'Email',
          sourceType: parsed.sourceType,
          sourceSubtype: parsed.sourceSubtype,
          parsedFields: parsed.fields,
          createdAt: email.receivedAt,
        },
      });
    } else {
      await commonTicket.addAction('lead', data, {
        createdAt: email.receivedAt,
        name: TicketActionNames.INCOMING_EMAIL,
        recontact: true,
        sourceType: parsed.sourceType,
        ...parsed.fields,
      });
      if (!data.get('leadTicket.parsedRawData') || !data.get('leadTicket.parsedRawData').push)
        data.set('leadTicket.parsedRawData', []);
      const parsedRawData = data.get('leadTicket.parsedRawData');
      parsedRawData.push({ ...parsed.fields });
    }

    await data.save();
    await email.updateAttributes({ status: IncomingCrossLeadsStatus.PARSED, dataId: data.id });
    unlock();
  } catch (e) {
    if (email && email.status !== IncomingCrossLeadsStatus.TRANSFERRED) {
      // Keep TRANSFERRED, otherwise set to ERROR
      await email.updateAttributes({ status: IncomingCrossLeadsStatus.ERROR, error: e.message });
    }
    unlock();
    if (!blacklistedBy) throw e; // Don't throw error when it's blacklisted
  }
};
