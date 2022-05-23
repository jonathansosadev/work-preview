// const gsDataS3Pusher = require('../../..//common/lib/garagescore/garage/data-s3-pusher');
const moment = require('moment');
const async = require('async');
const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
const gsCampaignStatus = require('../../../common/models/campaign.status');
const gsCampaignTypes = require('../../../common/models/campaign.type.js');
const contactsConfig = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
const gsDataS3Pusher = require('../../../common/lib/garagescore/garage/data-s3-pusher');
const gsCampaignCreator = require('../../../common/lib/garagescore/campaign/creator');
const gsDataFileImporter = require('../../../common/lib/garagescore/data-file/lib/importer');
const timeHelper = require('../../../common/lib/util/time-helper');
const mongodb = require('mongodb');
const garageStatus = require('../../../common/models/garage.status.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
/** Manual pulls */

const garageStatusSimplified = {};
const statusToName = {};
garageStatus.keys().forEach((k) => (garageStatusSimplified[k] = garageStatus[k]));
garageStatus.values().forEach((v) => (statusToName[v] = garageStatus.displayName(v)));

const _index = function (app, req, res) {
  try {
    const lastdays = [];
    for (let d = 0; d < 15; d++) {
      lastdays.push(moment().subtract(d, 'days').format('YYYY-MM-DD'));
    }
    const dataTypes = gsDataFileDataTypes.values();
    app.models.Garage.find({ fields: { id: true, dms: true, publicDisplayName: true } }, (err, garages) => {
      if (err) {
        res.status(500).send('Error');
      } else {
        app.models.Garage.findById(GaragesTest.GARAGE_DUPONT, (err2, garage) => {
          garages.push(garage);
          res.render('darkbo/darkbo-campaigns/pulls', {
            current_tab: 'pulls',
            garages: JSON.stringify(garages),
            lastdays: JSON.stringify(lastdays),
            dataTypes: JSON.stringify(dataTypes),
            statusToNames: JSON.stringify(statusToName),
            garageStatus: JSON.stringify(garageStatusSimplified),
          });
        });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

const _listIndex = function (app, req, res) {
  try {
    res.render('darkbo/darkbo-campaigns/manage-campaign', {
      current_tab: 'pulls',
      campaignsStatus: JSON.stringify(gsCampaignStatus),
      campaignTypes: JSON.stringify(gsCampaignTypes),
      contactsConfig: JSON.stringify(contactsConfig),
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

function _addInfoToDataFile(app, dataFile, callback) {
  app.models.Campaign.findOne({ where: { dataFileId: dataFile.getId().toString() } }, (err, campaign) => {
    if (err) {
      callback(err);
      return;
    }
    delete dataFile.fileBuffer; // eslint-disable-line no-param-reassign
    dataFile.campaign = campaign; // eslint-disable-line no-param-reassign
    callback(null, dataFile);
  });
}

const _dataFileList = function (app, req, res) {
  const supportedFormat = 'DD-MM-YYYY HH:mm';
  async.auto(
    {
      filters(cb) {
        const filters = req.query.filter ? JSON.parse(req.query.filter) : {};
        if (!filters.limit) {
          filters.limit = 10; // eslint-disable-line no-param-reassign
        }
        if (!filters.order) {
          filters.order = 'createdAt DESC'; // eslint-disable-line no-param-reassign
        }
        const maxDate =
          filters.maxDate && moment(filters.maxDate, supportedFormat).isValid()
            ? moment(filters.maxDate, supportedFormat).toDate()
            : null;
        const minDate =
          filters.minDate && moment(filters.minDate, supportedFormat).isValid()
            ? moment(filters.minDate, supportedFormat).toDate()
            : null;
        if (maxDate && minDate) {
          filters.where.and = [{ createdAt: { gt: minDate } }, { createdAt: { lte: maxDate } }];
        } else {
          if (maxDate) {
            filters.where.createdAt = { lte: maxDate };
          }
          if (minDate) {
            filters.where.createdAt = { gt: minDate };
          }
        }
        cb(null, filters);
      },
      dataFiles: [
        'filters',
        function (cb, resx) {
          app.models.DataFile.find(resx.filters, cb);
        },
      ],
      dataFilesInfo: [
        'dataFiles',
        function (cb, resx) {
          async.mapSeries(
            resx.dataFiles,
            (dataFile, mapSeriesCallback) => {
              _addInfoToDataFile(app, dataFile, mapSeriesCallback);
            },
            cb
          );
        },
      ],
      total: [
        'filters',
        function (cb, resx) {
          app.models.DataFile.count(resx.filters.where || {}, cb);
        },
      ],
    },
    (err, results) => {
      if (err) {
        res.status(403).send(err.toString());
        return;
      }
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(
        JSON.stringify({
          limit: results.filters.limit,
          skip: results.filters.skip || 0,
          dataFiles: results.dataFilesInfo,
          total: results.total,
        })
      );
    }
  );
};

const _listPushes = async function (app, req, res) {
  try {
    const garageIds = req.body.garageIds;
    if (!garageIds) {
      res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
      return;
    }

    // Ask for 60 elements for each garages
    const pushes = await app.models.Garage.latestPushes(garageIds, 60);
    res.send({ status: 'ok', pushes });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

const _download = function (app, req, res) {
  const garageId = req.body.garageId;
  const date = req.body.date;
  const dataType = req.body.dataType;
  const garageIds = req.body.garageIds;
  if (!garageId || !date || !dataType || !garageIds) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Garage.findById(garageId, (getErr, garage) => {
    if (getErr) {
      res.status(500).send({ status: 'ko', error: getErr.message });
      return;
    }
    gsDataS3Pusher.pushToS3(garage, date, dataType, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send({ status: 'ko', error: err.message });
        return;
      }
      _listPushes(app, req, res);
    });
  });
};
const _import = function (app, req, res) {
  const garageId = req.body.garageId;
  const filePath = req.body.filePath;
  const dataType = req.body.dataType;
  if (!garageId || !filePath || !dataType) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Garage.findById(garageId, (err, garage) => {
    if (err) {
      res.status(500).send({ status: 'ko', error: err.message });
      return;
    }
    gsCampaignCreator.createCampaignsFromPath(garage, filePath, dataType, null, (importErr) => {
      if (importErr && importErr.message !== 'No Data created from datafile') {
        res.status(500).send({ status: 'ko', error: importErr.message });
        return;
      }
      _listPushes(app, req, res);
    });
  });
};
const _datafileDelete = function (app, req, res) {
  const garageIds = req.body.garageIds;
  const dataFileId = req.body.dataFileId;
  const forceDelete = req.body.force;
  if (!dataFileId || !garageIds) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.DataFile[forceDelete ? 'destroyById' : 'removeDataFileInError'](dataFileId, (removeError) => {
    if (removeError) {
      res.status(500).send({ status: 'ko', error: removeError.message });
      return;
    }
    _listPushes(app, req, res);
  });
};
const _datafileStats = function (app, req, res) {
  const dataFileId = req.body.dataFileId;
  if (!dataFileId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  const stats = {};

  // process one campaign item and get the related events
  const processItem = function (cs, item, i, next) {
    // eslint-disable-line no-unused-vars
    app.models.Contact.find(
      {
        where: {
          'payload.campaignItemId': new mongodb.ObjectID(item.id),
        },
      },
      (errCC, contacts) => {
        if (errCC) {
          next(errCC);
          return;
        }
        if (!contacts) {
          next();
          return;
        }
        cs.contacts = contacts.length; // eslint-disable-line no-param-reassign
        next();
      }
    );
  };
  // process one campaign and iterate over its item
  const processCampaign = function (campaign, i, next) {
    const cs = { id: campaign.id, type: campaign.type, createdAt: campaign.createdAt, status: campaign.status };
    stats.campaigns.push(cs);
    app.models.Campaign.getCreatedCampaignItems(campaign.id, (ierr, items) => {
      if (ierr) {
        next(ierr);
        return;
      }
      cs.items = items.length;
      cs.events = {};
      cs.contacts = 0;
      const itemInfos = items.map((c) => ({ id: c.getId().toString() }));
      async.forEachOfSeries(itemInfos, processItem.bind(null, cs), next);
    });
  };
  // all campaigns done, return the response
  const processCampaignsDone = function (err) {
    if (err) {
      console.log(err);
      res.status(500).send({ status: 'ko', error: err.message });
      return;
    }
    res.send({ status: 'ok', stats });
  };

  // let's go
  const campaignFields = { id: 1, createdAt: 1, type: 1, status: 1 };
  app.models.DataFile.getCreatedCampaigns({ dataFileId, fields: campaignFields }, (getErr, campaigns) => {
    if (getErr) {
      console.log(getErr);
      res.status(500).send({ status: 'ko', error: getErr.message });
      return;
    }
    stats.campaigns = [];
    const campaignInfos = campaigns.map((c) => ({
      id: c.getId().toString(),
      createdAt: moment(c.createdAt).format('YYYY-MM-DD à hh:mm'),
      type: c.type,
      status: c.status,
    }));
    async.forEachOfSeries(campaignInfos, processCampaign, processCampaignsDone);
  });
};
const _viewfile = function (app, req, res) {
  let filePath = req.query.filePath;
  const bucket = req.query.bucket || 'S3';
  if (!filePath) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  if (bucket === 'humanupload') {
    // Little hack to correct the folder in the path
    filePath = filePath.replace('import-todo', 'import-done');
  }
  gsDataFileImporter
    .loadFileFromFileStore(filePath, bucket)
    .then((content) => {
      const fileName = filePath.split('/').pop();
      res.set('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(content.fileBuffer);
    })
    .catch((error) => {
      res.status(500).send(error.message);
    });
};
const supportedFormat = 'DD-MM-YYYY HH:mm';
const _listCampaignDatas = function (app, req, res) {
  if (!req.body.campaignId) {
    res.status(500).send({ status: 'ko', error: 'CampaignId is mandatory' });
    return;
  }
  const filters = {
    limit: req.body.limit ? parseInt(req.body.limit, 10) : 10,
    where: { 'campaign.campaignId': req.body.campaignId },
    order: 'campaign.campaignId DESC',
  };
  if (req.body.skip) {
    filters.skip = parseInt(req.body.skip, 10);
  }
  app.models.Data.count(filters.where || {}, (e0, total) => {
    if (e0) {
      res.status(500).send({ status: 'ko', error: e0.message });
      return;
    }
    app.models.Data.find({ where: filters.where }, (e, datas) => {
      res.send({ status: 'ok', datas, total, skip: filters.skip || 0, limit: filters.limit });
    });
  });
};

const _listCampaigns = function (app, req, res) {
  let filters = req.body;
  if (!filters) {
    filters = {};
  }
  if (!filters.limit) {
    filters.limit = 10;
  } else {
    filters.limit = parseInt(filters.limit, 10);
  }
  filters.order = 'createdAt DESC';
  if (req.body.skip) {
    filters.skip = parseInt(req.body.skip, 10);
  }
  const maxDate =
    filters.maxDate && moment(filters.maxDate, supportedFormat).isValid()
      ? moment(filters.maxDate, supportedFormat).toDate()
      : null;
  const minDate =
    filters.minDate && moment(filters.minDate, supportedFormat).isValid()
      ? moment(filters.minDate, supportedFormat).toDate()
      : null;
  if (maxDate && minDate) {
    filters.where.and = [{ createdAt: { gt: minDate } }, { createdAt: { lte: maxDate } }];
  } else {
    if (maxDate) {
      filters.where.createdAt = { lte: maxDate };
    }
    if (minDate) {
      filters.where.createdAt = { gt: minDate };
    }
  }
  app.models.Campaign.count(filters.where || {}, (e0, total) => {
    if (e0) {
      res.status(500).send({ status: 'ko', error: e0.message });
      return;
    }
    app.models.Campaign.find(filters, (e, campaigns) => {
      if (e) {
        res.status(500).send({ status: 'ko', error: e.message });
        return;
      }
      const simplified = campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        items: c.items,
        createdAt: moment(c.createdAt).format('YYYY-MM-DD à HH:mm'),
        completeScheduledAt: moment(timeHelper.dayNumberToDate(c.completeScheduledAt)).format('YYYY-MM-DD à HH:mm'),
        completedAt: c.completedAt ? moment(c.completedAt).format('YYYY-MM-DD à HH:mm') : '',
        dataFileId: c.dataFileId,
      }));
      async.forEachOfSeries(
        simplified,
        (campaign, i, next) => {
          app.models.DataFile.findById(campaign.dataFileId, (ierr, df) => {
            if (ierr) {
              console.error(ierr); // sometime we delete (in dev!) datafiles, in this case it s better to continue normally
              next();
              return;
            }
            campaign.dataFileId = df.dataFileId; // eslint-disable-line
            campaign.dataFilePath = df.filePath; // eslint-disable-line
            campaign.dataFileType = df.dataType; // eslint-disable-line
            campaign.dataFileImportSchemaName = df.importSchemaName; // eslint-disable-line
            next();
          });
        },
        (err) => {
          if (err) {
            console.log(err);
            res.status(500).send({ status: 'ko', error: err.message });
            return;
          }
          res.send({ status: 'ok', campaigns: simplified, total, skip: filters.skip, limit: filters.limit });
        }
      );
    });
  });
};
const _run = function (app, req, res) {
  const campaignId = req.body.campaignId;
  const from = req.body.from;
  if (!campaignId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Campaign.updateStatus(campaignId, gsCampaignStatus.WAITING, (err) => {
    if (err) {
      res.status(500).send({ status: 'ko', error: err.message });
      return;
    }
    if (from === 'campaigns') {
      _listCampaigns(app, req, res);
    } else {
      _datafileStats(app, req, res);
    }
  });
};

const _cancel = function (app, req, res) {
  const campaignId = req.body.campaignId;
  const from = req.body.from;
  if (!campaignId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Campaign.findById(campaignId, (e, campaign) => {
    if (e) {
      res.status(500).send({ status: 'ko', error: e.message });
      return;
    }
    if (!campaign) {
      res.status(500).send({ status: 'ko', error: 'No campaign found' });
      return;
    }
    if (campaign.status === gsCampaignStatus.WAITING || campaign.status === gsCampaignStatus.NEW) {
      // still deletable
      res.status(500).send({
        status: 'ko',
        error: `Campaign must NOT be ${gsCampaignStatus.WAITING} or ${gsCampaignStatus.NEW} (${campaign.status})`,
      });
      return;
    }
    app.models.Campaign.cancel(campaignId, (err) => {
      if (err) {
        res.status(500).send({ status: 'ko', error: err.message });
        return;
      }
      if (from === 'campaigns') {
        _listCampaigns(app, req, res);
      } else {
        _datafileStats(app, req, res);
      }
    });
  });
};

const _delete = function (app, req, res) {
  const campaignId = req.body.campaignId;
  if (!campaignId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Campaign.findById(campaignId, (e, campaign) => {
    if (e) {
      res.status(500).send({ status: 'ko', error: e.message });
      return;
    }
    if (!campaign) {
      res.status(500).send({ status: 'ko', error: 'No campaign found' });
      return;
    }
    if (campaign.status !== gsCampaignStatus.WAITING && campaign.status !== gsCampaignStatus.NEW) {
      res.status(500).send({
        status: 'ko',
        error: `Campaign must be ${gsCampaignStatus.WAITING} or ${gsCampaignStatus.NEW} (${campaign.status})`,
      });
      return;
    }
    app.models.Campaign.delete(campaignId, (err, data) => {
      if (err) {
        res.status(500).send({ status: 'ko', error: err.message });
        return;
      }
      res.send({ status: 'ok', data });
    });
  });
};

const _hide = function (app, req, res) {
  const campaignId = req.body.campaignId;
  if (!campaignId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  app.models.Campaign.findById(campaignId, (e, campaign) => {
    if (e) {
      res.status(500).send({ status: 'ko', error: e.message });
      return;
    }
    if (!campaign) {
      res.status(500).send({ status: 'ko', error: 'No campaign found' });
      return;
    }
    if (campaign.status === gsCampaignStatus.NEW || campaign.status === gsCampaignStatus.WAITING) {
      res
        .status(500)
        .send({ status: 'ko', error: "Campaign still deletable, please delete it before it's too late !" });
      return;
    }
    app.models.Campaign.hide(campaignId, (err, dataHidden) => {
      if (err) {
        res.status(500).send({ status: 'ko', error: err.message });
        return;
      }
      res.send(dataHidden);
      // _listCampaigns(app, req, res);
    });
  });
};

const _campaignsFromDataFile = function (app, req, res) {
  const dataFileId = req.body.dataFileId;
  if (!dataFileId) {
    res.status(400).send({ status: 'ko', error: 'Invalid parameters' });
    return;
  }
  const campaignFields = { id: 1, createdAt: 1, type: 1, status: 1, shouldSurfaceInStatistics: 1 };
  app.models.DataFile.getCreatedCampaigns({ dataFileId, fields: campaignFields }, (getErr, campaignsCreated) => {
    if (getErr) {
      console.log(getErr);
      res.status(500).send({ status: 'ko', error: getErr.message });
      return;
    }
    const campaigns = campaignsCreated.map((c) => ({
      id: c.getId().toString(),
      createdAt: moment(c.createdAt).format('YYYY-MM-DD à hh:mm'),
      type: c.type,
      status: c.status,
      shouldSurfaceInStatistics: c.shouldSurfaceInStatistics,
    }));
    res.send({ status: 'ok', campaigns });
  });
};

module.exports = {
  // /backoffice/campaigns/list
  listIndex: _listIndex,
  // /backoffice/data_files
  dataFileList: _dataFileList,
  // /backoffice/garages/pulls
  index: _index,
  // /backoffice/garages/pull/list
  listPushes: _listPushes,
  // /backoffice/garages/pull/download
  download: _download,
  // /backoffice/garages/pull/datafilestats
  datafileStats: _datafileStats,
  // /backoffice/garages/pull/campaignsfromdatafile
  campaignsFromDataFile: _campaignsFromDataFile,
  // /backoffice/garages/pull/import
  import: _import,
  // /backoffice/garages/pull/runcampaign
  run: _run,
  // /backoffice/garages/pull/cancelcampaign
  cancel: _cancel,
  // /backoffice/garages/pull/deletecampaign
  delete: _delete,
  // /backoffice/garages/pull/hidecampaign
  hide: _hide,
  // /backoffice/garages/pull/viewfile
  viewfile: _viewfile,
  // /backoffice/garages/pull/listcampaigns
  listcampaigns: _listCampaigns,
  // /backoffice/garages/pull/list-campaign-datas
  listCampaignDatas: _listCampaignDatas,
  // /backoffice/garages/pull/datafiledelete
  datafileDelete: _datafileDelete,
};
/*
const app = require('../../server.js');

const req = { body: { dataFileId: '57a38243402e9f1409c86755'} };
const res = {
  status:function(){},
  send:function(data){
    console.log(data.stats.campaigns);
    process.exit();
  }
}
_datafileStats(app, req, res);
*/
