const { routesPermissions } = require('../route-permissions');
const transferLogsAndTest = require('../transfer-logs');
const { UnauthorizedError } = require('../apiErrors');

/**
API methods for ftpToS3
**/

/* eslint-disable no-param-reassign */
module.exports = (API, app, _hasAccess) => {
  /*
    list of garages with ftp files to be copied to s3
    @throws hasAccessException
  */
  const ftp2s3Garages = async (appId, page) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }
    const count = await app.models.Garage.getMongoConnector().count({ imports: { $exists: true } });
    const batchSize = Math.ceil(count / 4);
    const skip = page ? (page - 1) * batchSize : 0;
    const limit = page ? batchSize : count + 1;
    const garages = await app.models.Garage.getMongoConnector()
      .find({ imports: { $exists: true } }, { projection: { _id: true }, skip, limit, sort: { businessId: 1 } })
      .toArray();
    return garages.map((garage) => garage._id);
  };
  /*
    return garage for ftp2s3
    @throws hasAccessException
  */
  const ftp2s3Config = async (appId, garageId) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }

    const garage = await app.models.Garage.findById(garageId)

    return {
      id: garageId,
      slug: garage.slug,
      dms: garage.dms && garage.dms.uploadFolder,
      imports: garage && garage.imports,
    };
  };
  /*
    save ftp2s3 log
    @throws hasAccessException
  */
  const ftp2s3LogSet = async (appId, taskId, taskLog) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }
    await transferLogsAndTest.setLog(taskId, taskLog);
    return { taskId };
  };
  /*
    load ftp2s3 log
    @throws hasAccessException
  */
  const ftp2s3LogGet = async (appId, taskId) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }
    return transferLogsAndTest.getLog(taskId);
  };
  /*
    ask a transfer
    @throws hasAccessException
  */
  const ftp2s3PushTransfer = async (appId, garageId) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }
    return transferLogsAndTest.pushTransfer(garageId)

  };
  /*
    get and pop the next waiting transfer
    @throws hasAccessException
  */
  const ftp2s3PopTransfer = async (appId) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.CUSTEED, null)
    if (authErr) {
      throw new UnauthorizedError(authErr.message); //catched in server/routes/public-api/ftp.js
    }
    return transferLogsAndTest.popTransfer();
  };

  API.ftp2s3Garages = ftp2s3Garages;
  API.ftp2s3Config = ftp2s3Config;
  API.ftp2s3LogSet = ftp2s3LogSet;
  API.ftp2s3LogGet = ftp2s3LogGet;
  API.ftp2s3PushTransfer = ftp2s3PushTransfer;
  API.ftp2s3PopTransfer = ftp2s3PopTransfer;
};
