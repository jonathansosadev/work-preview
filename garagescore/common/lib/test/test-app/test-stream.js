const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

class TestStream {
  async testTrasformStream(dataArray, transformStream) {
    return new Promise((resolve, reject) => {
      const readable = new Readable({ objectMode: true });
      const writable = new Writable({ objectMode: true });
      const results = [];
      writable._write = (data, encoding, callback) => {
        results.push(data);
        callback();
      };
      transformStream.on('error', reject);

      readable
        .pipe(transformStream)
        .pipe(writable)
        .on('finish', () => {
          resolve(results);
        });
      dataArray.forEach((item) => readable.push(item));
      readable.push(null);
    });
  }
  makeReadStream(dataArray) {
    const readable = new Readable({ objectMode: true });
    dataArray.forEach((item) => readable.push(item));
    readable.push(null);
    return readable;
  }
}
module.exports = TestStream;
