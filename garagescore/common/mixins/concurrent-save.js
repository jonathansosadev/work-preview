/*
 * Override the save function to allow updating only the difference instead of the whole document
 Actually it's only a mixin for Data, because we need to set a field this.concurrentSave
 It's not init from the data.json but directly in data.js
 */
const object = require('../lib/util/object');

function mixin(Model) {
  /* async loopback mixin must be run before*/
  const isAsync = Model.save.constructor.name === 'AsyncFunction';
  if (!isAsync) {
    throw new Error('Cannot load concurrentsave mixin before loading async mixin');
  }
  const save = Model.prototype.save;

  // we overwrite the data.save fonction
  // adding a parameter save([concurrentSafe], cb)
  // if concurrentSafe then we are going to do a findByIdAndUpdateAttributes instead of a save
  Model.prototype.save = async function (...args) {
    const s = save.bind(this);
    // during data.set we backup in concurrentSave our object at the beginning & at the end of the set
    const original = this.concurrentSave && this.concurrentSave.original;
    const current = this.concurrentSave && this.concurrentSave.current;
    if (original) {
      delete original.concurrentSave;
    }
    if (current) {
      delete current.concurrentSave;
    }
    delete this.concurrentSave;
    let cb = null;
    let concurrentSafe = null;
    if (typeof args[0] === 'function') {
      cb = args[0];
      concurrentSafe = args[1] || false;
    }
    if (typeof args[0] === 'boolean') {
      concurrentSafe = args[0];
      cb = args[1] || null;
    }
    if (!original) {
      // no data set has been run
      concurrentSafe = false;
    }
    if (!this.getId()) {
      // data is new, with no id yet, update is impossible
      concurrentSafe = false;
    }
    if (!concurrentSafe) {
      if (cb) {
        s(cb); // if we have a callback, async-loopback mixin tells us they is no promise
        return null;
      }
      return s();
    }
    // make it flat
    const originalFlat = object.flatten(original);
    const currentFlat = object.flatten(current);

    const updates = {};
    Object.keys(originalFlat).forEach((k) => {
      if (typeof currentFlat[k] === 'undefined') {
        // console.log('delete ' + k);
        // object.setDeepFieldValue(updates, k, null);
        updates[k] = null;
      } else if (currentFlat[k] !== originalFlat[k]) {
        // console.log('update ' + k);
        // object.setDeepFieldValue(updates, k, object.getDeepFieldValue(this, k));
        // it's important here to keep it flatenned 'x.a': toto (instead of x: { a: 'toto'})
        // to not overwrite all the nested fields
        updates[k] = object.getDeepFieldValue(this, k);
      }
    });
    Object.keys(currentFlat).forEach((k) => {
      if (currentFlat[k] !== originalFlat[k]) {
        // console.log('update ' + k);
        updates[k] = object.getDeepFieldValue(this, k);
      }
    });
    const res = await Model.findByIdAndUpdateAttributes(this.getId(), updates);

    if (cb) {
      cb(null, res);
    }
    return res;
  };
}

module.exports = mixin;
