/** Remove the datafile content from the database of old datafiles records and copy it to S3*/
const app = require('../../../server/server');
const moment = require('moment');
const Writable = require('stream').Writable;
const util = require('util');
const AWS = require('aws-sdk');
const config = require('config');
const CronRunner = require('../../../common/lib/cron/runner');

const frequency = CronRunner.supportedFrequencies.DAILY;
const runner = new CronRunner({
  frequency,
  description: 'Archive datafile',
});

const daysMin = process.argv.length >= 3 ? parseInt(process.argv[2], 0) : 37;
const dateMin = moment()
  .add(daysMin * -1, 'days')
  .toDate();
const daysMax = process.argv.length >= 3 ? parseInt(process.argv[3], 0) : 30;
const dateMax = moment()
  .add(daysMax * -1, 'days')
  .toDate();
const awsBucket = 'gs-db-archive';

app.on('booted', () => {
  runner.execute = (options, callbackFinal) => {
    console.log(`Archive all datafiles created before ${dateMax}`); // eslint-disable-line no-console
    let countArchived = 0;
    // set buffer to null and active archived flag
    const archive = (datafile, callback) => {
      countArchived++;
      datafile.fileBuffer = null; // eslint-disable-line
      datafile.archived = true; // eslint-disable-line
      datafile.save(callback);
    };
    // uplaod data buffer to S3
    function UploadDataFile() {
      if (!(this instanceof UploadDataFile)) {
        return new UploadDataFile({});
      }
      Writable.call(this, { objectMode: true });
    }
    util.inherits(UploadDataFile, Writable);
    UploadDataFile.prototype._write = function write(datafile, encoding, callback) {
      if (datafile.archived) {
        console.log(`${datafile.getId().toString()} already archived`); // eslint-disable-line no-console
        callback();
        return;
      }
      if (!datafile.fileBuffer) {
        console.log(`${datafile.getId().toString()} has no fileBuffer`); // eslint-disable-line no-console
        callback();
        return;
      }
      const dir = datafile.getId().toString().substr(-4);
      const suffix = datafile.filePath.substr(datafile.filePath.lastIndexOf('.'));
      const key = `${dir}/${datafile.id}${suffix}`;
      AWS.config.region = config.get('dmsupload.awsS3BucketRegion');
      const awsS3Bucket = new AWS.S3({ params: { Bucket: awsBucket } });
      const uploadParameters = {
        Key: key,
        ACL: 'private',
        ContentType: 'text/txt',
        Body: datafile.fileBuffer,
      };
      console.log(`Uploading ${key}`); // eslint-disable-line no-console

      awsS3Bucket.createBucket(() => {
        awsS3Bucket.upload(uploadParameters, (uploadErr) => {
          if (uploadErr) {
            console.error('Error uploading directory to S3: ', uploadErr); // eslint-disable-line no-console
            callback(uploadErr);
            return;
          }
          archive(datafile, callback);
          return;
        });
      });
    };
    const and = [];
    and.push({ createdAt: { gt: dateMin } });
    and.push({ createdAt: { lt: dateMax } });
    const datafilesStream = app.models.DataFile.findStream({ where: { and } });
    datafilesStream
      .pipe(new UploadDataFile())
      .on('finish', () => {
        console.log(`${countArchived} datafiles archived`); // eslint-disable-line no-console
        callbackFinal();
      })
      .on('error', (err) => {
        console.error('An error occured'); // eslint-disable-line no-console
        callbackFinal(err); // eslint-disable-line no-console
      });
    datafilesStream.count((err, count) => {
      console.log(`Datafiles to process : ${count}`); // eslint-disable-line no-console
    });
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    } // eslint-disable-line no-console
    process.exit(err ? -1 : 0);
  });
});
