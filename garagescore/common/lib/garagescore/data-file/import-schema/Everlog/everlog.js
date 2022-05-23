var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:IcarSystems:iscarsystems'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');

var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
  },
  columns: {
    fullName: 'Client',
    city: 'Ville',
    email: ['Email'],
    vehicleMake: 'Marque',
    vehicleModel: 'Véhicule',
    mobilePhone: 'Numéro tél.',
    dataRecordCompletedAt: 'Date',
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  ID: 'Everlog',
  config: config,
};
