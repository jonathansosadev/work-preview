const app = require('../../../../server/server');
const OVH = require('./ovh-telephony-api.js');
const Scheduler = require('../../../../common/lib/garagescore/scheduler/scheduler');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const { SIMON, log } = require('../../../../common/lib/util/log.js');

module.exports = {
  handleIncomingCalls: async (phones, from, to, create = false) => {
    const retrievedCalls = [];
    for (const phone of phones) {
      let calls = [];
      try {
        calls = await OVH.calls(phone.value, { from, to });
        if (calls.length) log.info(SIMON, `OVH API Calls for ${phone.value}: ${calls.length} calls...`);
        for (const callId of calls) {
          const callDetails = await OVH.callDetails(phone.value, callId);
          retrievedCalls.push(callDetails);
          if (create) {
            let call = null;
            try {
              call = await app.models.IncomingCrossLead.initFromCall(callDetails, phone.garageId, phone.sourceType);
            } catch (e) {
              log.error(SIMON, `app.models.IncomingCrossLead.create error: ${e.message}`);
            }
            if (call) {
              await Scheduler.insertJob(
                JobTypes.CROSS_LEADS_INCOMING_CALL,
                { callId: call.externalId },
                new Date(),
                null,
                `CROSS_LEADS-${phone.garageId}`
              );
            }
          }
        }
      } catch (e) {
        log.error(SIMON, `OVH API Calls for ${phone.value}: generate a error: ${e.message}`);
      }
    }
    return retrievedCalls;
  },
};
