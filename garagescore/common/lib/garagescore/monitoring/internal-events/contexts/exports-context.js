const EVENT = 'INCONSISTENT_VALUE';

function create(jobId = '', eventDay, emitListener) {
  return {
    key1: jobId,
    emitListener,
    eventDay,
  };
}
module.exports = {
  create,
  EVENT,
};
