const axios = require('axios');
const { promisify } = require('util');
const _ = require('lodash');
const lruCache = require('lru-cache');
const gsDataFileDataTypes = require('../../../../models/data-file.data-type');
const nextlaneColums = require('./-nextlane-columns');
const csvUtil = require('../../../csv/util');
const s3Uploader = require('./s3-uploader');
const { log, JS } = require('../../../util/log');

const nexlaneCache = lruCache(50);

const checkconfig = (garage, dataType, configNextLane) => {
    if (!gsDataFileDataTypes.isSupported(dataType)) {
        throw new Error(`${dataType} not supported`);
    }
    if (_.isUndefined(garage)) {
        throw new Error('Undefined `garage`');
    }
    if (!configNextLane) {
        throw new Error(`Garage does not use NextLane or do not have any NextLane configuration for dataType ${dataType}`);
    }
    if (_.isUndefined(configNextLane.urlDatas)) {
        throw new Error('Undefined `urlDatas`');
    }
    if (_.isUndefined(configNextLane.urlSession)) {
        throw new Error('Undefined `urlSession`');
    }
    if (_.isUndefined(configNextLane.dealerId)) {
        throw new Error('Undefined `dealerId`');
    }

}

const makePostRequest = async (url, options) => {
    try {
        const res = await axios.post(url, options);
        if (res.data && res.data.status === "OK") {
            return res.data.data || [];
        }
        else {
            if (!res.data) throw new Error('Error occured in NetLine POST request : no data in response')
            else throw new Error(`Error occured in NetLine POST request => status: ${res.data.status}, errorID: ${res.data.errorID}, errorMessage: ${res.data.errorMessage}`)
        }
    } catch (err) {
        throw new Error((err && err.message) || 'Error occured in NetLine POST request')
    }

}

const nextLaneRequest = async (
    configNextLane
) => {

    const today = new Date().toISOString().split('T')[0];
    let sessionsCache = nexlaneCache.get(today);
    let session = null;

    if (!sessionsCache) {
        const sessions = await makePostRequest(configNextLane.urlSession, { DateFrom: today, IWB_DATA_UploadTypeIDs: ["CUSTEED"] });
        if (sessions) {
            nexlaneCache.set(today, sessions, { ttl: 1000 * 60 * 60 * 24 });
            session = sessions.find(session => session.dealerID === configNextLane.dealerId);
        }
    } else {
        session = sessionsCache.find(session => session.dealerID === configNextLane.dealerId);
    }
    if (!session) {
        throw new Error(`Session not found for dealerID : ${configNextLane.dealerId}`)
    }
    const datas = await makePostRequest(configNextLane.urlDatas, { iwB_DataSessionID: session.iwB_DataSessionID });
    return datas;
}

const genCsv = (nextLaneDatas) => {
    const datasOrdered = [];
    const dmsConfig = {};

    dmsConfig.dataFileFileColumnNames = nextlaneColums

    nextLaneDatas.forEach(data => {
        const dataOrdered = {}
        dmsConfig.dataFileFileColumnNames.forEach(columnName => dataOrdered[columnName] = data[columnName] || null)
        datasOrdered.push(dataOrdered);
    })

    const csvFieldDelimiter = ';';
    const csvLineDelimiter = '\n';
    return [
        dmsConfig.dataFileFileColumnNames.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter),
    ]
        .concat(datasOrdered.map((dataRow) => Object.keys(dataRow).map(key => dataRow[key]).join(csvFieldDelimiter)))
        .join(csvLineDelimiter);
}

/** pull data from nextlane for one garage/date/dataType and copy them to s3 */
const pushToS3 = async function (garage, date, dataType) {

    const configNextLane = garage.dms && garage.dms[dataType] && garage.dms[dataType].NextLane;
    try {
        checkconfig(garage, dataType, configNextLane)

        const datas = await nextLaneRequest(configNextLane);
        log.info(
            JS,
            `[pullNextLane] Flattened pullNextLane Work Files feed to %d DataRecord Sheet File Rows. ${datas.length}`
        );

        const csv = genCsv(datas)

        log.info(JS, '[pullNextLane] Uploading to S3');
        await promisify(s3Uploader)(csv, garage, date, dataType);

    } catch (e) {
        log.error(JS, `pushToS3 error ${e.message} on ${garage.publicDisplayName}`);
        throw e;
    }

}

const getCsv = async function (garage, dataType) {

    const configNextLane = garage.dms && garage.dms[dataType] && garage.dms[dataType].NextLane;
    try {
        checkconfig(garage, dataType, configNextLane)

        const datas = await nextLaneRequest(configNextLane);
        log.info(
            JS,
            `[pullNextLane] Flattened pullNextLane Work Files feed to %d DataRecord Sheet File Rows. ${datas.length}`
        );
        return genCsv(datas);

    } catch (e) {
        log.error(JS, `pushToS3 error ${e.message} on ${garage.publicDisplayName}`);
        throw e
    }
    return
};
module.exports = { pushToS3, getCsv };
