const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const common = require('./common');

/** next ftp account waiting to be created */
const nextCreate = async function (req, res) {
  try {
    const appId = req.query.appId;
    const { username, email } = await gsAPI.nextFtpCreationRequest(appId);
    if (!username || !email) {
      res.send(JSON.stringify({}));
      return;
    }
    res.send(JSON.stringify({ username, email }));
  } catch (error) {
    common.apiError(res, error);
    console.error(error);
  }
};
/** warn that an ftp has been created and send an email to the user who requested the creation */
const accountCreated = async function (req, res) {
  try {
    const appId = req.query.appId;
    const username = req.query.username;
    const pwd = req.query.pwd;
    await gsAPI.ftpCreated(appId, username, pwd);

    res.send('');
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
// configured garage with ftp 2 S3
const garagesWithCopyFTP2S3 = async function (req, res) {
  try {
    const appId = req.query.appId;
    const page = (req.query.page && parseInt(req.query.page, 10)) || null;
    const result = await gsAPI.ftp2s3Garages(appId, page);
    res.send(JSON.stringify(result));
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
// get a garage conf
const garageConf = async function (req, res) {
  try {
    const appId = req.query.appId;
    const garageId = req.query.garageId;
    if (!garageId) {
      res.status(404).send(JSON.stringify({ error: 'No garageId' }));
      return;
    }
    const result = await gsAPI.ftp2s3Config(appId, garageId);

    res.send(JSON.stringify(result || {}));
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
// store log message
const setLog = async function (req, res) {
  try {
    const appId = req.query.appId;
    const taskId = req.query.taskId;
    const taskLog = req.body.taskLog;
    const result = await gsAPI.ftp2s3LogSet(appId, taskId, taskLog);

    res.send(JSON.stringify(result));
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
// get log message
const getLog = async function (req, res) {
  try {
    const appId = req.query.appId;
    const taskId = req.query.taskId;
    const result = await gsAPI.ftp2s3LogGet(appId, taskId);

    res.send(JSON.stringify(result));
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
// get and pop the next waiting transfer
const popTransfer = async function (req, res) {
  try {
    const appId = req.query.appId;
    const task = await gsAPI.ftp2s3PopTransfer(appId) || {};

    res.send(JSON.stringify(task));
  } catch (errAPI) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};
module.exports = {
  nextCreate,
  accountCreated,
  garagesWithCopyFTP2S3,
  garageConf,
  setLog,
  getLog,
  popTransfer,
};
