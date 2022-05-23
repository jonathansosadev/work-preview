/**
 * ETL = Extract + Transform + Load
 * To do this we need three streams ReadStream + TransformStream + WriteStream
 * @param options
 * @constructor
 */

function TrackedEtl(options) {
  if (!options.readStream) {
    throw new Error('Mandatory readStream');
  }
  if (!options.transformStream) {
    throw new Error('Mandatory transformStream');
  }
  if (!options.writeStream) {
    throw new Error('Mandatory writeStream');
  }
  this.logFrequency = options.logFrequency || 10000;
  this.readStream = options.readStream;
  this.transformerStream = options.transformStream;
  this.writeStream = options.writeStream;
  this.prefixLog = options.prefixLog || '';
  this.disableTotalCount = options.disableTotalCount;
  this.finishListeners = [];
  this.errorListeners = [];
}

TrackedEtl.prototype.start = function start() {
  let countDataToProcess = 0;
  let countReadData = 0;
  let countTransformedData = 0;

  console.log(`${this.prefixLog} Started on :  ${new Date()}`); // eslint-disable-line no-console
  this.readStream
    .pipe(this.transformerStream)
    .pipe(this.writeStream)
    .on('finish', () => {
      // finished
      if (this.steIntervalReference) {
        clearInterval(this.steIntervalReference);
      }
      console.log(`${this.prefixLog} Ended on :  ${new Date()}`); // eslint-disable-line no-console
      console.log(`${this.prefixLog} Total read : ${countReadData} of ${countDataToProcess}`); // eslint-disable-line no-console
      console.log(
        // eslint-disable-line no-console
        `${this.prefixLog} Total transformed : ${countTransformedData} of ${countDataToProcess}`
      );

      if (this.finishListeners.length) {
        this.finishListeners.map((listener) => listener());
      }
    });

  // ############################################## Tracking operations ##################################################
  if (!this.disableTotalCount) {
    this.readStream.count((err, count) => {
      console.log(`${this.prefixLog} Total data to process : ${count}`); // eslint-disable-line no-console
      countDataToProcess = count;
    });
  }

  this.readStream.on('data', () => countReadData++);
  this.transformerStream.on('data', () => countTransformedData++);

  this.readStream.on('error', (err) => {
    if (this.errorListeners.length) {
      this.errorListeners.map((listener) =>
        listener(new Error(`Error Reading : ${err.toString() || JSON.stringify(err)}`))
      );
      return;
    }
    console.log(`${this.prefixLog} Error Reading : ${err.toString() || JSON.stringify(err)}`); // eslint-disable-line no-console
    process.exit(-1);
  });
  this.transformerStream.on('error', (err) => {
    if (this.errorListeners.length) {
      this.errorListeners.map((listener) =>
        listener(new Error(`Error Transform : ${err.toString() || JSON.stringify(err)}`))
      );
      return;
    }
    console.log(`${this.prefixLog} Error Transform : ${err.toString() || JSON.stringify(err)}`); // eslint-disable-line no-console
    process.exit(-1);
  });
  this.writeStream.on('error', (err) => {
    if (this.errorListeners.length) {
      this.errorListeners.map((listener) =>
        listener(new Error(`Error Writing : ${err.toString() || JSON.stringify(err)}`))
      );
      return;
    }
    console.log(`${this.prefixLog} Error Writing : ${err.toString() || JSON.stringify(err)}`); // eslint-disable-line no-console
    process.exit(-1);
  });

  this.steIntervalReference = setInterval(() => {
    console.log(`${this.prefixLog} Time : ${new Date()}`); // eslint-disable-line no-console
    console.log(`${this.prefixLog} Total readed : ${countReadData} of ${countDataToProcess}`); // eslint-disable-line no-console
    console.log(`${this.prefixLog} Total transformed : ${countTransformedData} of ${countDataToProcess}`); // eslint-disable-line no-console
    console.log(`${this.prefixLog} Read stream waiting : ${this.readStream._readableState.buffer.length}`); // eslint-disable-line no-console
    console.log(
      // eslint-disable-line no-console
      `${this.prefixLog} Write stream waiting : ${this.writeStream._writableState.getBuffer().length}`
    );
    console.log('-----'); // eslint-disable-line no-console
  }, this.logFrequency);
};

TrackedEtl.prototype.on = function on(eventName, callback) {
  switch (eventName) {
    case 'finish':
      this.finishListeners.push(callback);
      break;
    case 'error':
      this.errorListeners.push(callback);
      break;
    default:
      throw new Error(`Unsupported event of name ${eventName} for TrackedETL`);
  }
};

module.exports = TrackedEtl;
