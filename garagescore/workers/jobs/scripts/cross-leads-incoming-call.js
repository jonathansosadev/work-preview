const crypto = require('crypto');
const { promisify } = require('util');
const Mutex = require('locks').createMutex();

const app = require('../../../server/server');
const commonTicket = require('../../../common/models/data/_common-ticket');
const { decodePhone } = require('../../../common/lib/garagescore/cross-leads/util.js');

const { TicketActionNames } = require('../../../frontend/utils/enumV2');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const GarageTypes = require('../../../common/models/garage.type');
const SourceBy = require('../../../common/models/data/type/source-by.js');
const IncomingCrossLeadsStatus = require('../../../common/models/incoming-cross-leads.status.js');
const IncomingCrossLeadsTypes = require('../../../common/models/incoming-cross-leads.types.js');
const LeadTicketStatus = require('../../../common/models/data/type/lead-ticket-status');

const lock = promisify(Mutex.lock).bind(Mutex);
const unlock = Mutex.unlock.bind(Mutex);
/**
 * Create a action "INCOMING_CALL" or "INCOMING_MISSED_CALL" in the ticket
 */
module.exports = async (job) => {
  await lock();
  let call = null;
  try {
    const { callId } = job.payload;
    if (!callId) throw new Error(`CROSS-LEADS: ${callId} is not a correct callId`);
    call = await app.models.IncomingCrossLead.findById(callId);
    if (!call) throw new Error(`CROSS-LEADS: ${callId} is not a correct callId`);
    if (call.type !== IncomingCrossLeadsTypes.CALL)
      throw new Error(`CROSS-LEADS: cross-lead TYPE invalid for parsing: ${call.type}`);
    if (call.status !== IncomingCrossLeadsStatus.NEW)
      throw new Error(`CROSS-LEADS: call status invalid for parsing: ${call.status}`);
    if (!call.payload.phone) throw new Error(`CROSS-LEADS: ${call.payload.phone} is not a correct phone`);
    if (!call.garageId) throw new Error(`CROSS-LEADS: ${call.garageId} is not a correct garageId`);
    if (!call.sourceType || !SourceTypes.hasValue(call.sourceType)) {
      throw new Error(`CROSS-LEADS: ${call.sourceType} is not a correct SourceTypes`);
    }
    if (!call.receivedAt) throw new Error(`CROSS-LEADS: ${call.receivedAt} is not a correct receivedAt`);
    call.payload.phone = call.payload.phone.replace(/^00/, '+');
    try {
      call.payload.phone = decodePhone(call.payload.phone);
    } catch (e) {
      call.payload.phone = null;
    }
    const sourceId = crypto
      .createHash('md5')
      .update(call.payload.phone || callId)
      .digest('hex');
    let [data, garage] = await Promise.all([
      app.models.Data.findOne({
        // Try if the data already exists
        where: {
          garageId: call.garageId.toString(),
          'source.sourceId': sourceId,
          'leadTicket.status': { inq: LeadTicketStatus.openStatus() },
        },
      }),
      app.models.Garage.findById(call.garageId.toString(), { fields: { type: true } }),
    ]);
    if (!data || !data.get('leadTicket')) {
      // Doesn't exists, we add a new one
      data = await app.models.Data.init(call.garageId, {
        garageType: (garage && garage.type) || GarageTypes.DEALERSHIP,
        raw: { callId },
        sourceId,
        sourceType: call.sourceType,
        sourceBy: SourceBy.PHONE,
        lead: {
          type: LeadTypes.INTERESTED,
          saleType: SourceTypes.saleType(call.sourceType),
          reportedAt: call.receivedAt,
        },
        customer: { mobilePhone: call.payload.phone || undefined },
      });
      data = await data.save(); // Should save before adding the ticket, otherwise the job doesn't have a data.id
      await data.addLeadTicket(null, {
        source: 'crossLeads',
        sourceData: {
          type: call.type,
          payload: call.payload,
          sourceType: call.sourceType,
          createdAt: call.receivedAt,
        },
      });
    } else {
      await commonTicket.addAction('lead', data, {
        createdAt: call.receivedAt,
        name: call.payload.duration ? TicketActionNames.INCOMING_CALL : TicketActionNames.INCOMING_MISSED_CALL,
        callDuration: call.payload.duration,
        recontact: true,
        sourceType: call.sourceType,
        phone: call.payload.phone,
      });
    }
    await data.save();
    await call.updateAttributes({ status: IncomingCrossLeadsStatus.PARSED, dataId: data.id });
    unlock();
  } catch (e) {
    if (call) await call.updateAttributes({ status: IncomingCrossLeadsStatus.ERROR, error: e.message });
    unlock();
    throw e;
  }
};
