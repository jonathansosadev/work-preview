const AWS = require('aws-sdk');
const config = require('config');

const { TIBO, log } = require('../../../common/lib/util/log');

module.exports = async (job) => {
  const { bucket, key } = job.payload;
  const deleteParameters = {};
  let deleteResult = null;
  let s3Bucket = null;

  AWS.config.region = config.get('cockpitExportsUpload.awsS3BucketRegion');
  s3Bucket = new AWS.S3({ params: { Bucket: bucket } });

  deleteParameters.Key = key;
  deleteParameters.Bucket = bucket;

  deleteResult = await new Promise((res, rej) =>
    s3Bucket.deleteObject(deleteParameters, (e, d) => (e ? rej(e) : res(d)))
  );

  log.error(TIBO, `[JOB - CLEAN-EXPORT] Successfully Deleted File ${key} In Bucket ${bucket}`);
};
