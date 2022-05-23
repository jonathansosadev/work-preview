const runEvents = require('../run/run-events');
const emitEvent = require('../run/emit-data-model-event');
const setCurrentRunEvent = require('../run/set-current-run-event');
const handleCurrentRunEvent = require('../run/handle-current-run-event');
const updateLeadTicket = require('../run/update-lead-ticket');
const updateUnsatisfiedTicket = require('../run/update-unsatisfied-ticket');
const async = require('async');
const InstancesCache = require('../../../model-tool/instances-cache');

const iCache = new InstancesCache();

/** Check results changes on the last survey */

module.exports = (data, callback) => {
  iCache.findById('Garage', data.garageId, (err, garage) => {
    if (err || !garage) {
      callback(err || `Unable to find garage ${data.garageId}`);
      return;
    }
    const context = { modelInstances: { data, garage }, dataId: data.getId().toString() };
    async.series(
      [
        setCurrentRunEvent.bind(context, runEvents.SURVEY_UPDATE),
        handleCurrentRunEvent.bind(context),
        updateLeadTicket.bind(context),
        updateUnsatisfiedTicket.bind(context),
      ],
      (err2) => {
        if (!err2) {
          callback();
          return;
        }
        if (!context.modelInstances.data) {
          callback(err2);
        } else {
          emitEvent.bind(context)('checksurveyupdates.failure', { error: err2.message }, callback.bind(null, err2));
        }
      }
    );
  });
};
