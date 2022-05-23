const _sortBy = require('../../util/array').sortBy;
const gsMecaplanningDownloader = require('./dms-downloaders/mecaplanning-downloader');
const gsNextLaneDownloader = require('./dms-downloaders/nextlane-downloader');
const gsYuzerDownloader = require('./dms-downloaders/yuzer-downloader');
const DMS = require('../../dms/dms');
const AWS = require('aws-sdk');
const config = require('config');
const moment = require('moment');
const { promisify } = require('util');

/** pull data for one garage/date/dataType and copy them to s3 */
const pushToS3 = async function (garage, date, dataType) {
  const uploadMethod = garage.getUploadMethod(dataType);
  if (uploadMethod === DMS.MECAPLANNING) {
    await promisify(gsMecaplanningDownloader.pushToS3)(garage, date, dataType);
    return;
  }
  if (uploadMethod === DMS.NEXTLANE) {
    await gsNextLaneDownloader.pushToS3(garage, date, dataType);
    return;
  }
  if (uploadMethod === DMS.YUZER) {
    await gsYuzerDownloader.pushToS3(garage, date, dataType);
    return;
  }
  throw new Error(`Upload method (${uploadMethod}) not supported (supported methods : ${DMS.MECAPLANNING}, ${DMS.NEXTLANE})`);;
};

/** list the latest files on S3 for a garage*/
const listLatestPushes = async function (garageId, size) {
  const date = new Date();
  const numberOfDays = size;
  AWS.config.region = config.get('dmsupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('dmsupload.awsS3BucketName'),
    },
  });
  const params = { MaxKeys: 1000 };

  const awsPromises = [];

  for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
    const year = moment(date).subtract(dayOffset, 'day').format('YYYY');
    const month = moment(date).subtract(dayOffset, 'day').format('MM');
    const day = moment(date).subtract(dayOffset, 'day').format('DD');
    params.Prefix = `${year}/${month}/${day}/${garageId}`;

    awsPromises.push(awsS3Bucket.listObjectsV2(params).promise());
  }

  const awsOutput = await Promise.all(awsPromises);

  let data = [];

  for (const { Contents } of awsOutput) {
    data.push(Contents);
  }

  let fileList = data.reduce((acc, val) => acc.concat(val), []);

  if (fileList) {
    fileList = fileList.filter((file) => file.Key[file.Key.length - 1] !== '/'); // filter directories
    _sortBy(fileList, (file) => -file.LastModified.getTime()); // sort by date Desc (-14254782000)
  }

  let res = [];
  for (let i = 0; i < fileList.length && i < size; i++) {
    res.push({ path: fileList[i].Key, pushedAt: fileList[i].LastModified });
  }

  return res;
};

module.exports = {
  pushToS3,
  listLatestPushes,
};
