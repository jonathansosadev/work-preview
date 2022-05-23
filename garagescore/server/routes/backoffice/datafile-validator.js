const AWS = require('aws-sdk');
const config = require('config');
const gsImportSchemas = require('../../../common/lib/garagescore/data-file/import-schemas');
const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
const gsParserLoader = require('../../../common/lib/garagescore/data-file-parser/loader');
const boWorkers = require('../../workers/backoffice-workers');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

/*

Validate and Import xls,csv... files to create campaigns

*/

// list files on an s3 folder
const __listS3Files = function (prefix, callback) {
  AWS.config.region = config.get('humanupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('humanupload.awsS3BucketName'),
    },
  });
  const params = { MaxKeys: 1000 };
  const p = Object.assign(params, { Prefix: prefix });
  console.time('listObjectsV2');
  awsS3Bucket.listObjectsV2(p, (err, data) => {
    console.timeEnd('listObjectsV2');
    if (err) {
      callback(err);
      return;
    }
    let contents = data.Contents;
    if (contents) {
      contents = contents.filter((o) => o.Key[o.Key.length - 1] !== '/'); // filter directories
    }
    const res = [];
    for (let i = contents.length - 1; i >= 0; i--) {
      res.push({ path: `humanupload:/${contents[i].Key}`, pushedAt: contents[i].LastModified });
    }
    callback(null, res);
  });
};

// list garages with files to import
const __listGarageToDo = function (cb) {
  AWS.config.region = config.get('humanupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('humanupload.awsS3BucketName'),
    },
  });
  const params = { MaxKeys: 1000 };
  params.Prefix = 'import-todo/';
  awsS3Bucket.listObjectsV2(params, (err, data) => {
    if (err) {
      cb(err);
      return;
    }
    const contents = data.Contents;
    const garages = {};
    for (let i = contents.length - 1; i >= 0; i--) {
      if (contents[i].Key[contents[i].Key.length - 1] === '/') continue;
      const path = contents[i].Key.replace('import-todo/', '');
      const garage = path.substr(0, path.indexOf('/'));
      if (garage) {
        if (garages[garage]) {
          garages[garage]++;
        } else {
          garages[garage] = 1;
        }
      }
    }
    cb(null, garages);
  });
};

// archive files from `import-todo` to  `import-done`
const __archiveS3 = function (file) {
  const filePath = file.replace('humanupload:/', '');
  if (filePath.indexOf('import-todo') < 0) return;
  AWS.config.region = config.get('humanupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('humanupload.awsS3BucketName'),
    },
  });
  const params = {
    Key: filePath,
  };
  awsS3Bucket.getObject(params, (getErr, data) => {
    if (getErr) {
      console.error(`Error donwloading from S3: ${filePath}`, getErr);
      return;
    }
    const paramsPut = {
      Key: filePath.replace('import-todo', 'import-done'),
      Body: data.Body,
      Metadata: data.Metadata,
    };
    awsS3Bucket.putObject(paramsPut, (putErr) => {
      if (putErr) {
        console.error(`Error uploading from S3: ${filePath}`, putErr);
        return;
      }
      awsS3Bucket.deleteObject(params, (delErr) => {
        if (delErr) {
          console.error(`Error deleting from S3: ${filePath}`, delErr);
        }
      });
    });
  });
};

const _index = function (app, req, res) {
  // get garages list in db
  // app.models.Garage.find({ order: 'createdAt ASC', fields: { slug: true, id: true, publicDisplayName: true } }, function (err, garageModelInstances) {
  __listS3Files('js/', (errS32, availableFiles) => {
    if (errS32) {
      res.send({ status: 'error', message: errS32.message });
      return;
    }
    __listGarageToDo((errS33, slugs) => {
      if (errS33) {
        res.send({ status: 'error', message: errS33.message });
        return;
      }
      const garagesWithFiles = Object.keys(slugs).map(
        (slug) => `${slug} (${slugs[slug]} fichier${slugs[slug] > 1 ? 's' : ''}`
      );
      let availableSchemas = gsImportSchemas.availablePaths;
      const availableDataTypes = gsDataFileDataTypes.values();
      app.models.Garage.find(
        {
          where: { slug: { inq: Object.keys(slugs) } },
          order: 'createdAt ASC',
          fields: { id: true, slug: true, publicDisplayName: true },
        },
        (err, garagesFound) => {
          const garages = garagesFound
            .map((g) => ({
              id: g.id.toString(),
              publicDisplayName: `${g.publicDisplayName} (${slugs[g.slug]} fichier${slugs[g.slug] > 1 ? 's)' : ')'}`,
            }))
            .filter((g) => !GaragesTest.hasValue(g.id));
          gsParserLoader.availableReferences((erref, refs) => {
            if (erref) {
              res.send({ status: 'error', message: erref.message });
              return;
            }
            availableSchemas = refs.concat(availableSchemas);
            res.render('darkbo/darkbo-campaigns/data-file-importer', {
              current_tab: 'file-importer',
              garagesWithFiles,
              availableFiles: JSON.stringify(availableFiles),
              availableSchemas,
              availableDataTypes,
              garages,
              garagesObject: JSON.stringify(garages),
            });
          });
        }
      );
    });
  });
};

const _listFiles = function (app, req, res) {
  if (!req.params.garageId) {
    res.send({ status: 'error', message: 'garageId missing' });
    return;
  }
  const { garageId } = req.params;
  app.models.Garage.findById(garageId, (err, garage) => {
    if (err || !garage) {
      res.send({ status: 'error', message: 'garage not found' });
      return;
    }
    const uploadFolder = `${garage.slug}`;
    if (!uploadFolder) {
      res.send({ status: 'error', message: 'Cannot find any uploadFolder in the garage configuration' });
      return;
    }
    __listS3Files(`import-todo/${uploadFolder}`, (errS31, files) => {
      if (errS31) {
        res.send({ status: 'error', message: errS31.message });
        return;
      }
      res.send({ status: 'ok', files });
    });
  });
};

const _validate = function (app, req, res) {
  if (!req.body.garageId) {
    res.status(404).send({ status: 'ko', message: 'garage missing' });
    return;
  }
  if (!req.body.filePath) {
    res.status(404).send({ status: 'ko', message: 'filePath missing' });
    return;
  }
  if (!req.body.importSchemaName) {
    res.status(404).send({ status: 'ko', message: 'importSchemaName missing' });
    return;
  }
  if (!req.body.dataType) {
    res.status(404).send({ status: 'ko', message: 'dataType missing' });
    return;
  }
  if (!req.body.importOptions) {
    res.status(404).send({ status: 'ko', message: 'importOptions missing' });
    return;
  }
  let importOptions = null;
  try {
    importOptions = JSON.parse(req.body.importOptions);
  } catch (e) {
    res.send({ isValid: false, validationDetails: 'importOptions is not a valid json' });
    return;
  }
  let { filePath } = req.body;
  let fileStore = null;
  if (filePath.indexOf('dbox:') === 0) {
    fileStore = 'Dropbox';
    filePath = filePath.replace('dbox:', '');
  } else {
    fileStore = 'humanupload';
    filePath = filePath.replace('humanupload:/', '');
  }
  boWorkers.launch(res, (emit, done) => {
    app.models.DataFile.validateImportFile(
      filePath,
      fileStore,
      req.body.importSchemaName,
      importOptions,
      req.body.dataType,
      req.body.garageId,
      done
    );
  });
};
const _import = function (app, req, res) {
  if (!req.params.filePath) {
    res.status(404).send({ status: 'ko', message: 'filePath missing' });
    return;
  }
  if (!req.params.garageId) {
    res.status(404).send({ status: 'ko', message: 'garageId missing' });
    return;
  }
  if (!req.params.importSchemaName) {
    res.status(404).send({ status: 'ko', message: 'importSchemaName missing' });
    return;
  }
  if (!req.params.dataType) {
    res.status(404).send({ status: 'ko', message: 'dataType missing' });
    return;
  }
  const importAutomation = req.params.importAutomation === 'automation';
  let { filePath } = req.params;
  let fileStore = null;
  if (filePath.indexOf('dbox:') === 0) {
    fileStore = 'Dropbox';
    filePath = filePath.replace('dbox:', '');
  } else {
    fileStore = 'humanupload';
    filePath = filePath.replace('humanupload:/', '');
  }
  boWorkers.launch(res, (emit, done) => {
    app.models.DataFile.importFromFileStore(
      req.params.garageId,
      fileStore,
      filePath,
      req.params.importSchemaName,
      req.params.dataType,
      importAutomation,
      (err, campaigns, ignoredCampaignItems) => {
        const reasons = {};
        if (err) {
          let e = err;
          if (ignoredCampaignItems && ignoredCampaignItems.length) {
            ignoredCampaignItems.forEach((i) => {
              reasons[i[0]] = reasons[i[0]] ? reasons[i[0]] + 1 : 1;
            });
            e = new Error(
              `${err.message} (${ignoredCampaignItems.length} élément(s) filtré(s) ${JSON.stringify(reasons)})`
            );
          }
          done(e);
          return;
        }
        __archiveS3(filePath);
        let ignoredDetails = null;
        if (ignoredCampaignItems && ignoredCampaignItems.length) {
          ignoredCampaignItems.forEach((i) => {
            reasons[i[0]] = reasons[i[0]] ? reasons[i[0]] + 1 : 1;
          });
          ignoredDetails = `${ignoredCampaignItems.length} élément(s) filtré(s) ${JSON.stringify(reasons)}`;
        }
        let message = `${campaigns && campaigns.length ? campaigns.length : 0} campagne(s) créé(s)`;
        if (campaigns) {
          campaigns.forEach((c) => {
            message += ` ${c.id}`;
          });
        }
        if (ignoredDetails) {
          message += `, ${ignoredDetails}`;
        }
        done(null, message);
      }
    );
  });
};
module.exports = {
  // GET /backoffice/data-file/file-importer
  index: _index,
  // GET /backoffice/data-file/importer/list-files/:garageId
  listFiles: _listFiles,
  // POST /backoffice/data-file/importer/validate
  validate: _validate,
  // /backoffice/data-file/importer/import-from-filestore/:garageId/:filePath/:importSchemaName/:dataType
  import: _import,
};
