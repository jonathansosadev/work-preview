var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:ERIC:maurel'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');

var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
  },
  columns: {
    gender: 'Civilité',
    fullName: 'Nom',
    postCode: 'CP',
    city: 'Ville',
    streetAddress: ['Adresse 1', 'Adresse 2'],
    email: ['e-mail'],
    vehicleMake: 'Marque',
    vehicleModel: 'Modele',
    dataRecordCompletedAt: 'Date km',
    vehicleRegistrationPlate: 'Immat',
  },
  format: {
    dataRecordCompletedAt: 'MM/DD/YY',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  ID: 'ERIC',
  config: config,
};
