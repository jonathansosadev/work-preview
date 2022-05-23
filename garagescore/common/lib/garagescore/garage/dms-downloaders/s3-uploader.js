const AWS = require('aws-sdk');
const config = require('config');
const pathFunction = require('../../data-file/paths/path-function');

/*
 * Upload one file to s3
 */
const upload = function (content, garage, date, dataType, callback) {
  const Key = pathFunction(garage, date, dataType);
  if (Key === null) {
    callback(new Error('[S3 Uploader] :: ERROR :: Cannot determine path to use on S3'));
    return;
  }

  AWS.config.region = config.get('dmsupload.awsS3BucketRegion');

  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('dmsupload.awsS3BucketName'),
    },
  });

  awsS3Bucket.createBucket(function () {
    const uploadParameters = {
      Key,
      ACL: 'private',
      ContentType: 'text/txt',
      Body: content,
    };
    awsS3Bucket.upload(uploadParameters, function (uploadErr) {
      if (uploadErr) {
        console.error('[S3 Uploader] :: ERROR :: Error uploading directory to S3: ', uploadErr);
        callback(uploadErr);
        return;
      }
      callback(null, Key);
    });
  });
};

module.exports = upload;
