const Writable = require('stream').Writable;

/**
 * [StreamWrapper constructor]
 * @param {[type]} _options [json => contains func: onWrite,onFinish,onErr & var model]
 */

function StreamWrapper(_options) {
  this.onWrite = null;
  this.onFinish = null;
  this.onErr = null;
  this.model = null;
  this.options = null;

  if (_options) {
    this.options = _options;

    if (_options.model) {
      this.model = _options.model;
    } else {
      throw new Error('Model is undefined');
    }

    if (_options.onWrite) {
      this.onWrite = _options.onWrite;
    }

    if (_options.onFinish) {
      this.onFinish = _options.onFinish;
    }
    if (_options.onErr) {
      this.onErr = _options.onErr;
    } else {
      throw new Error('onErr is undefined');
    }
  }
}

StreamWrapper.prototype.setModel = function setModel(_model) {
  if (_model) {
    this.model = _model;
  } else {
    throw new Error('Model is undefined');
  }
};

StreamWrapper.prototype.setWrite = function setWrite(cb) {
  this.onWrite = cb;
};

StreamWrapper.prototype.setFinished = function setFinished(cb) {
  this.onFinish = cb;
};

StreamWrapper.prototype.setErr = function setErr(cb) {
  this.onErr = cb;
};

/**
 * [find object in DB (findStream's wrapper)]
 * @param  {[json]} _searchObj [object description]
 * @return {[type]}            [description]
 */
StreamWrapper.prototype.find = function find(_searchObj) {
  let searchObj = _searchObj;
  const onWriteFunc = this.onWrite;

  if (!searchObj) {
    searchObj = { where: {} }; // by default searchObj find all
  }

  if (this.model && this.model.findStream) {
    // if model exists
    const modelR = this.model.findStream(searchObj);

    const modelW = new Writable({
      objectMode: true,
    });

    modelR.pipe(modelW);

    modelR.on('error', (err) => {
      if (this.onErr) {
        this.onErr(err);
      }
    });

    modelW.on('error', (err) => {
      if (this.onErr) {
        this.onErr(err);
      }
    });

    modelW._write = function write(result, encoding, next) {
      if (onWriteFunc) {
        // if write func has been setted
        onWriteFunc(result, encoding, next);
      } else {
        next();
      }
    };

    modelR.on('finish', () => {
      if (this.onFinish) {
        this.onFinish();
      }
    });
  } else {
    const msg = 'Model error check if model exists and can be streamed.';
    if (this.onErr) {
      // else throw error
      this.onErr({ err: true, msg });
    }
    throw new Error(msg);
  }
};

module.exports = StreamWrapper;
