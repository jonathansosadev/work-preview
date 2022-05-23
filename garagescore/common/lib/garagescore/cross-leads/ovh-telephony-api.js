/**
 * API telephony cf: https://api.ovh.com/console/#/telephony
 */
require('dotenv').config({ silent: true });
const ovhInstance = require('ovh');
const config = require('config');
const { SIMON, log } = require('../../util/log.js');

let instanceConfig;
let ACCOUNT = null;
if (!['endpoint', 'appKey', 'appSecret', 'consumerKey', 'account'].find((e) => !config.has(`ovh.${e}`))) {
  instanceConfig = {
    endpoint: config.get('ovh.endpoint'),
    appKey: config.get('ovh.appKey'),
    appSecret: config.get('ovh.appSecret'),
    consumerKey: config.get('ovh.consumerKey'),
  };
  ACCOUNT = config.get('ovh.account');
}

let _instance;
function getOVHInstance() {
  if (!_instance) {
    _instance = instanceConfig && ovhInstance(instanceConfig);
  }
  return _instance;
}

const request = (method, url, args) =>
  new Promise((res, rej) => {
    const OVH = getOVHInstance();
    if (!OVH) {
      rej(new Error("COULDN'T CONNECT TO OVH API !"));
      return;
    }
    OVH.request(method, url, args, (errorCode, response) => {
      if (errorCode) rej(new Error(response));
      res(response);
    });
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const changeFeatureType = async (ovhPhone) => {
  // Need to wait the end of the task (I never waited more than 2s)
  let task = { status: null };
  log.info(SIMON, "Changing Feature Type to 'contactCenterSolution'...");
  const r = await request('POST', `/telephony/${ACCOUNT}/number/${ovhPhone}/changeFeatureType`, {
    featureType: 'contactCenterSolution',
  });
  while (task.status !== 'done') {
    task = await request('GET', `/telephony/${ACCOUNT}/service/${ovhPhone}/task/${r.taskId}`);
    if (task.status !== 'done') log.info(SIMON, `Task status is '${task.status}', try again in 500ms...`);
    await sleep(500);
  }
};

const _getQueues = async (ovhPhone) => {
  const queues = await request('GET', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/queue`);
  if (!queues || !queues[0]) return [];
  return queues;
};

module.exports = {
  configurePhonesAsAgents: async (followedPhones, ovhPhone) => {
    const phones = [...followedPhones].reverse(); // OVH do a shift on phones, we need to spread it and reverse it
    try {
      await changeFeatureType(ovhPhone);
      const agents = await request('GET', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent`);
      log.info(SIMON, 'Deleting all agents...');
      for (const agent of agents) {
        await request('DELETE', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent/${agent}`);
        log.info(SIMON, `Agent ${agent} deleted successfully`);
      }
      const queues = await _getQueues(ovhPhone);
      log.info(SIMON, 'Adding all agents...');
      for (const phone of phones) {
        const agent = await request('POST', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent`, {
          number: phone,
          description: null,
          status: 'available',
          timeout: phones.length === 1 ? 60 : 20, // Durée de la sonnerie avant de passer à la ligne suivante
          wrapUpTime: 0, // Temps de repos entre chaque prise d’appel
          simultaneousLines: phones.length === 1 ? 10 : 1, // Appels simultanés par ligne
        });
        await request('POST', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent/${agent.agentId}/queue`, {
          position: 0,
          queueId: queues[0],
        });
        log.info(SIMON, `Phone ${phone} added successfully`);
      }
    } catch (e) {
      log.error(SIMON, e);
      throw e;
    }
  },
  calls: async (
    ovhPhone,
    { from, to } // Get calls
  ) => {
    log.info(SIMON, `Getting calls for ${ovhPhone} from ${from.toISOString()} to ${to.toISOString()}...`);
    const calls = await request('GET', `/telephony/${ACCOUNT}/service/${ovhPhone}/voiceConsumption`, {
      'creationDatetime.from': from.toISOString(),
      'creationDatetime.to': to.toISOString(),
    });
    log.info(SIMON, `Getting calls done... ${calls}`);
    return calls;
  },
  getQueues: _getQueues,
  liveCalls: async (ovhPhone, queue) =>
    request('GET', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/queue/${queue}/liveCalls`),
  callDetails: async (ovhPhone, callId) =>
    request('GET', `/telephony/${ACCOUNT}/service/${ovhPhone}/voiceConsumption/${callId}`),
  liveCallDetails: async (
    ovhPhone,
    queue,
    liveCallId // Get calls details
  ) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    request('GET', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/queue/${queue}/liveCalls/${liveCallId}`),
  getAllPhones: async () => {
    const phones = await request('GET', `/telephony/${ACCOUNT}/number`);
    return phones.sort().filter((p) => p.match(/0033188|0033285|00333527|0033484|0033535/));
  },
  // OnlyChild to true updates only the only child agent
  updateAgents: async (ovhPhone, payload, onlyChild = false) => {
    const agents = await request('GET', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent`);
    if (onlyChild && agents.length > 1) return;
    for (const agent of agents) {
      await request('PUT', `/telephony/${ACCOUNT}/easyHunting/${ovhPhone}/hunting/agent/${agent}`, {
        ...payload,
      });
    }
    log.info(SIMON, `Agents of ${ovhPhone} updated successfully with ${JSON.stringify(payload)}`);
  },
};

// In case you want to regenerate new access, here is the request
// CF: https://ovh.github.io/node-ovh/
// require('dotenv').config({ silent: true });
//
// const OVH = require('ovh')({
//   endpoint: config.get('CROSS_LEAD_OVH_ENDPOINT'),
//   appKey: config.get('CROSS_LEAD_OVH_APP_KEY'),
//   appSecret: config.get('CROSS_LEAD_OVH_APP_SECRET')
// });
//
// OVH.request('POST', '/auth/credential', { // In case you want to regenerate new access, here is the request
//   accessRules: [
//     { method: 'GET', path: '/telephony/*' },
//     { method: 'POST', path: '/telephony/*' },
//     { method: 'PUT', path: '/telephony/*' },
//     { method: 'DELETE', path: '/telephony/*' }
//   ]
// }, (err, credentials) => {
//   console.log(err, credentials); // Then go to the url to validify the thing and keep your new consumerKey
// });
