const moment = require('moment');
const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
const { AutoBrands, MotoBrands, CaravanBrands, OtherBrands } = require('../../../frontend/utils/enumV2');

const list = function (app, req, res) {
  app.models.DataFile.find(req.query.filter ? JSON.parse(req.query.filter) : {}, (err, dataFiles) => {
    if (err) {
      res.status(403).send(err.toString());
      return;
    }
    res.status(200).setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify(
        dataFiles.map((dataFile) => ({
          id: dataFile.getId(),
          dataType: dataFile.dataType,
          filePath: dataFile.filePath,
          fileStore: dataFile.fileStore,
        }))
      )
    );
  });
};

// send a test survey
const importStringGET = function (app, req, res) {
  // TODO use a dynamic parser
  const availableDataTypes = gsDataFileDataTypes.values();
  const makes = [...AutoBrands.keys(), ...MotoBrands.keys(), ...CaravanBrands.keys(), ...OtherBrands.keys()];
  const randomMake = makes[(makes.length * Math.random()) << 0];
  res.render('darkbo/darkbo-campaigns/string-importer', {
    current_tab: 'string-importer',
    availableBrands: { ...AutoBrands.toObject(), ...MotoBrands.toObject(), ...CaravanBrands.toObject(), ...OtherBrands.toObject() },
    randomMake,
    availableDataTypes,
  });
};
const importStringPOST = function (app, req, res) {
  if (!req.params.garageId) {
    res.send({ status: 'error', message: 'garageId missing' });
    return;
  }
  if (!req.params.dataType) {
    res.send({ status: 'error', message: 'dataType missing' });
    return;
  }
  if (!req.body.fullName && !(req.body.firstName && req.body.lastName)) {
    res.send({ status: 'error', message: 'fullName missing' });
    return;
  }
  if (!req.body.email && !req.body.mobilePhone) {
    res.send({ status: 'error', message: 'email/mobilePhone missing' });
    return;
  }
  if (!req.body.city) {
    res.send({ status: 'error', message: 'city missing' });
    return;
  }
  if (!req.body.model) {
    res.send({ status: 'error', message: 'model missing' });
    return;
  }
  if (!req.body.vehicleMake) {
    res.send({ status: 'error', message: 'vehicleMake missing' });
    return;
  }
  if (!req.body.gender) {
    res.send({ status: 'error', message: 'gender missing' });
    return;
  }
  // Generic/csv-ddmmyyyy
  const date = moment().format('DD/MM/YYYY');
  const csv = `dateinter;genre;fullName;firstName;lastName;email;ville;rue;cp;marque;modele;mobilePhone\n${[
    date,
    req.body.gender,
    req.body.fullName || '',
    req.body.firstName || '',
    req.body.lastName || '',
    req.body.email || '',
    req.body.city,
    req.body.streetAddress,
    req.body.postCode,
    req.body.vehicleMake,
    req.body.model,
    req.body.mobilePhone || '',
  ].join(';')}`;
  app.models.DataFile.importFromString(req.params.garageId, req.params.dataType, csv, (e, campaigns) => {
    if (e) {
      const message = 'message' in e ? e.message : 'Unknown error';
      res.send({ status: 'error', message });
      return;
    }
    if (!campaigns || campaigns.length === 0) {
      res.send({ status: 'error', message: 'No campaigns created' });
      return;
    }
    for (let c = 0; c < campaigns.length; c++) {
      app.models.Campaign.requestRun(campaigns[c].id);
    }
    res.send({ status: 'ok', details: { campaigns } });
  });
};
module.exports = {
  list,
  // GET data-file/string-importer
  importStringGET,
  // POST data-file/string-importer
  importStringPOST,
};
