const debug = require('debug')('garagescore:survey'); // eslint-disable-line max-len,no-unused-vars
const config = require('config');
const { decrypt } = require('../../../../common/lib/garagescore/survey/survey-id-encryption');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');
const { log, JS } = require('../../util/log');
const Consumer = require('../../mq/workers/consumer');
const MQProducer = require('../../mq/workers/producer');

const prefix =
  config.has('messageQueue.prefix') && config.get('messageQueue.prefix') ? config.get('messageQueue.prefix') : '';
const SURVEY_QUEUE = `${prefix}survey`;
/*
A queue to store surveys reponses and consume them
*/

// process one message in the queue
const processMessage = function (app, stringMessage, done) {
  const processId = (Math.random() + 1).toString(36).substring(7);
  const startTime = Date.now();
  let dataId;
  log.debug(JS, `Processing one survey request #${processId}`);
  const removeMessageFromQueue = () => {
    log.debug(JS, `Processed survey request #${processId} in ${Date.now() - startTime}ms, dataId: ${dataId}`);
    done(null, false);
  };

  let message = null;
  try {
    message = JSON.parse(stringMessage);
  } catch (err) {
    console.error('Ignoring survey request - Cannot parse JSON:', err);
    removeMessageFromQueue();
    return;
  }
  // check the id and data
  const protectedId = message.id;
  const responses = message.responses;
  if (!protectedId || !responses) {
    removeMessageFromQueue();
    return;
  }
  const decrypted = decrypt(protectedId);
  dataId = decrypted.dataId;
  if (!dataId) {
    removeMessageFromQueue();
    return;
  }
  app.models.Data.findById(dataId, (errData, data) => {
    if (errData || !data) {
      removeMessageFromQueue();
      return;
    }
    /**
     * TO BE RETRO-COMPATIBLE, we need data.getSurveyInProgress() when we don't have the surveyType in the URL !
     * KEEP THIS UNTIL 01/09/2019, then -> we should trust 'decrypted.surveyType' only and remove getSurveyInProgress
     */
    const surveyType = decrypted.surveyType === SurveyTypes.SURVEY ? data.getSurveyInProgress() : decrypted.surveyType;
    if (!surveyType) {
      removeMessageFromQueue();
      return;
    }
    // add foreign responses
    const isCompleted = () => {
      const foreignResponses = data.get(`${surveyType}.foreignResponses`) || [];
      const foreignResponseCompleted = foreignResponses.slice().reverse().find(response => response.payload && response.payload.isComplete);
      return !data.get(`${surveyType}.acceptNewResponses`) || !!foreignResponseCompleted;
    };

    const regexMobileUser = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/;
    const isMobile = (message.userAgent && regexMobileUser.test(message.userAgent));

    if (!isCompleted()) {
      const foreignResponses = data.get(`${surveyType}.foreignResponses`) || [];
      foreignResponses.push({
        source: 'Internal survey',
        date: new Date(),
        payload: responses,
        userAgent: message.userAgent,
        isMobile,
      });
      data.set(`${surveyType}.foreignResponses`, foreignResponses);
    }
    data.set(`${surveyType}.isIntern`, true);
    // parse them
    data.survey_parseForeignResponses(surveyType, (err) => {
      if (err) {
        console.error(err);
        removeMessageFromQueue(); // clean queue
        return;
      }
      data.survey_saveUserTracking(surveyType, message.userIp, message.userFingerPrint, removeMessageFromQueue); // store tracking info
    });
  });
};

// start listening to new messages in the queue

/* Start the message queue */
const startListening = async function (app) {
  const ACCEPTED_MESSAGES_PER_MINUTE = config.messageQueue.rate.survey;
  log.info(
    JS,
    `Using the messageQueue to process survey responses : ${SURVEY_QUEUE} ${ACCEPTED_MESSAGES_PER_MINUTE} req/minute`
  );
  if (ACCEPTED_MESSAGES_PER_MINUTE && ACCEPTED_MESSAGES_PER_MINUTE > 0) {
    try {
      const consumer = new Consumer(SURVEY_QUEUE, ACCEPTED_MESSAGES_PER_MINUTE);
      await consumer.start(processMessage.bind(null, app));
    } catch (e) {
      log.error(JS, e);
      process.exit();
    }
  }
};

/**
 * Add a response to the queue
 * protectedId: encoded dataId+surveyType
 * responses: responses returned by the survey
 */
let producer = null;
const add = async function add(protectedId, responses, userIp, userFingerPrint, userAgent) {
  try {
    if (!producer) {
      producer = new MQProducer(SURVEY_QUEUE);
      await producer.start();
    }
    const msg = {
      id: protectedId,
      userIp,
      userFingerPrint,
      responses,
      userAgent,
    };
    await producer.publish(msg);
  } catch (e) {
    console.error(e);
  }
};

module.exports = { startListening, add };
