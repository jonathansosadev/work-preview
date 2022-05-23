const axios = require('axios');
const { promisify } = require('util');
const gsDataFileDataTypes = require('../../../../models/data-file.data-type');
const csvUtil = require('../../../csv/util');
const s3Uploader = require('./s3-uploader');
const { log, JS } = require('../../../util/log');

function getDaysFromNow(from) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;
  const diffInTime = now.getTime() - from.getTime();
  const diffInDays = Math.round(diffInTime / oneDay);
  return diffInDays + 1;
}

const checkconfig = (garage, dataType, configYuzer) => {
  if (!gsDataFileDataTypes.isSupported(dataType)) {
    throw new Error(`${dataType} not supported`);
  }
  if (!garage) {
    throw new Error('Undefined `garage`');
  }
  if (!configYuzer) {
    throw new Error(`Garage does not use Yuzer or do not have any Yuzer configuration for dataType ${dataType}`);
  }
  if (!configYuzer.url) {
    throw new Error('Undefined `url`');
  }
  if (!configYuzer.token) {
    throw new Error('Undefined `token`');
  }
};

const makeGetRequest = async ({ url, token }, daysFromNow) => {
  try {
    const res = await axios.get(url.replace(/dayFromNow=-?\d+/, `dayFromNow=-${daysFromNow}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 200 && res.data && Array.isArray(res.data)) {
      return res.data;
    } else {
      if (res.status !== 200) throw new Error(`Error occured in Yuzer GET request : status code ${res.status} `);
      else if (!res.data) throw new Error('Error occured in Yuzer POST request : no data in response');
      else
        throw new Error(
          `Error occured in NetLine POST request => status: ${res.data.status}, errorID: ${res.data.errorID}, errorMessage: ${res.data.errorMessage}`
        );
    }
  } catch (err) {
    throw new Error((err && err.message) || 'Error occured in Yuzer POST request');
  }
};

const yuzerRequest = async (configYuzer, daysFromNow) => {
  const datas = await makeGetRequest(configYuzer, daysFromNow);
  return datas;
};

const genCsv = (YuzerDatas) => {
  const path = [];
  const headersNames = [];

  /**
      Get the csv headers names from data
     data = {
            a: {
                aa: 'string',
                ab: {
                    aba: string
                }
            }
        }

        will give : "a.aa;a.ab.aba"
     */
  YuzerDatas.forEach((data) => {
    const headersName = {};
    const recurs = (obj) => {
      Object.keys(obj).forEach((key) => {
        path.push(key);
        if (obj[key].constructor.name === 'Object') {
          recurs(obj[key]);
        } else {
          headersName[path.join('.')] = obj[key];
          path.pop();
        }
      });
      path.pop();
    };
    recurs(data);
    headersNames.push(headersName);
  });

  const csvheader = [];
  const csvLines = [];

  // fill data by column and set empty string if no data for one column
  headersNames.forEach((item, index) => {
    csvLines[index] = [];
    Object.keys(item).forEach((key) => {
      if (!csvheader.find((headerItem) => headerItem === key)) {
        csvheader.push(key);
      }
      const headerIndex = csvheader.indexOf(key);
      csvLines[index][headerIndex] = csvUtil.toSafeCsvValue(item[key].toString()) || '';
    });
  });

  const csvFieldDelimiter = ';';
  const csvLineDelimiter = '\n';

  return [csvheader.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter)]
    .concat(csvLines.map((line) => line.join(csvFieldDelimiter)))
    .join(csvLineDelimiter);
};

/** pull data from Yuzer for one garage/date/dataType and copy them to s3 */
const pushToS3 = async function (garage, date, dataType) {
  const configYuzer = garage.dms && garage.dms[dataType] && garage.dms[dataType].Yuzer;
  try {
    checkconfig(garage, dataType, configYuzer);

    const daysFromNow = getDaysFromNow(date);

    const datas = await yuzerRequest(configYuzer, daysFromNow);
    log.info(JS, `[pullYuzer] Flattened pullYuzer Work Files feed to %d DataRecord Sheet File Rows. ${datas.length}`);

    const csv = genCsv(datas);

    log.info(JS, '[pullYuzer] Uploading to S3');
    await promisify(s3Uploader)(csv, garage, date, dataType);
  } catch (e) {
    log.error(JS, `pushToS3 error ${e.message} on ${garage.publicDisplayName}`);
    throw e;
  }
};

const getCsv = async function (garage, dataType, startDate, endDate) {
  const configYuzer = garage.dms && garage.dms[dataType] && garage.dms[dataType].Yuzer;
  try {
    checkconfig(garage, dataType, configYuzer);
    const startDateObject = new Date(startDate);
    const endDateObject = new Date(endDate);
    let datas = [];
    if (startDateObject && endDateObject && startDateObject <= endDateObject) {
      while (startDateObject <= endDateObject) {
        const daysFromNow = getDaysFromNow(startDateObject);
        const res = await yuzerRequest(configYuzer, daysFromNow);
        datas = datas.concat(res);
        startDateObject.setDate(startDateObject.getDate() + 1);
      }
      log.info(JS, `[pullYuzer] Flattened pullYuzer Work Files feed to %d DataRecord Sheet File Rows. ${datas.length}`);
      return genCsv(datas);
    }
    throw new Error('startDate or endDate invalid');
  } catch (e) {
    log.error(JS, `pushToS3 error ${e.message} on ${garage.publicDisplayName}`);
    throw e;
  }
  return;
};
module.exports = { pushToS3, getCsv };
