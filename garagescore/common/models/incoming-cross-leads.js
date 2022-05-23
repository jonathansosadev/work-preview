/* eslint-disable object-curly-newline */
const { ObjectID } = require('mongodb');
const IncomingCrossLeadsTypes = require('./incoming-cross-leads.types.js');
const IncomingCrossLeadsStatus = require('./incoming-cross-leads.status.js');
const { parseEmail, parseCall } = require('../lib/garagescore/cross-leads/parser.js');
const { SIMON, log } = require('../lib/util/log.js');
const { getTestPhoneFromInput, slackMessage } = require('../../common/lib/garagescore/cross-leads/util');

// Cancel data creation if it's a test call
const shouldBeCensored = async (call) => {
  if (!call || !call.payload || !call.payload.phone) return false;
  const testPhoneFromInput = await getTestPhoneFromInput(call.payload.phone);
  if (!testPhoneFromInput) return false;
  await slackMessage(
    `${testPhoneFromInput} - Appel de test sur le garage ${call.garageId} a été intercepté ✔️`,
    `📞 - ${call.sourceType}`,
    '#tests_xleads'
  );
  await call.updateAttributes({
    status: IncomingCrossLeadsStatus.ERROR,
    error: `Test call by Custeed censored by ${testPhoneFromInput}`,
  });
  return true;
};

module.exports = (model) => {
  model.prototype.parseMe = async function parseMe(garage) {
    if (this.type === IncomingCrossLeadsTypes.EMAIL) return parseEmail(this, garage);
    if (this.type === IncomingCrossLeadsTypes.CALL) return parseCall(this, garage);
    return null;
  };
  model.initFromCall = async function initFromCall(callDetails, garageId, sourceType, live = false) {
    log.info(SIMON, `callDetails: ${JSON.stringify(callDetails)}`);
    const receivedAt = new Date(callDetails.creationDatetime || callDetails.begin);
    let payload = {};
    // Manually set duration to 1s for liveCalls so it's not a missed call
    if (!live) {
      payload = { phone: callDetails.calling, agentNumber: callDetails.dialed, duration: callDetails.duration };
    } else {
      payload = {
        phone: `00${callDetails.callerIdNumber.trim()}`,
        agentNumber: callDetails.agent,
        duration: 1,
        live: true,
      };
    }
    const call = await model.create({
      externalId: payload.phone + receivedAt.getTime(),
      type: IncomingCrossLeadsTypes.CALL,
      status: IncomingCrossLeadsStatus.NEW,
      garageId: new ObjectID(garageId), // Needed for aggregations
      sourceType,
      receivedAt,
      payload,
      raw: callDetails,
    });
    if (await shouldBeCensored(call)) return null;
    return call;
  };
};
