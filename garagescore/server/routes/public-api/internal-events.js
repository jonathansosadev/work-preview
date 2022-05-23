const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const common = require('./common');
const ObjectId = require('mongodb').ObjectId;
const { log, JS } = require('../../../common/lib/util/log');

function isPositiveNumber(n) {
  var floatN = parseFloat(n);
  return !isNaN(floatN) && isFinite(n) && floatN > 0;
}
function autoConvertToObjectId(s) {
  if (s && s.length === 24) {
    // autoconvert to objectId
    try {
      return ObjectId(s);
    } catch (e) {
      return s;
    }
  }
  return s;
}
/**
 * Add an event from an http GET request
 * Format the query received and send it clean to the api
 */
const addEvent = function (req, res) {
  res.status(200).end('ok'); // send response asap
  const key1 = autoConvertToObjectId(req.params.key1);
  const key2 = autoConvertToObjectId(req.params.key2);
  const key3 = autoConvertToObjectId(req.params.key3);
  const key4 = autoConvertToObjectId(req.params.key4);
  const key5 = autoConvertToObjectId(req.params.key5);
  const event = req.params.event;
  const nEvents = parseInt(req.params.nEvents || 1);
  if (!key1 && !key2 && !key3 && !key4 && !key5) {
    return;
  }
  if (!event) {
    return;
  }
  const counters = JSON.parse(JSON.stringify(req.query));
  Object.keys(counters).forEach((k) => {
    if (!isPositiveNumber(counters[k])) {
      delete counters[k]; // delete stuff like appId, signature...
    } else {
      counters[k] = parseFloat(counters[k]);
    }
  });
  gsAPI.addEvent(event, nEvents, { key1, key2, key3, key4, key5 }, counters, (err) => {
    if (err) {
      log.error(JS, err);
    }
  });
};

module.exports = {
  addEvent,
};
