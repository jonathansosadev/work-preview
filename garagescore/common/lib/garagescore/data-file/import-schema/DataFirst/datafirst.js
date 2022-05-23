var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:DSC:dcsnet'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');

// importForeignDataFileRow
var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
  },
  columns: {
    fullName: ['Nom Client'],
    mobilePhone: ['Tel portable'],
    email: ['Email'],
    city: ['Ville'],
    vehicleMake: ['Marque'],
    dataRecordCompletedAt: ['Date Facture'],
    billedAt: 'Date Facture',
    vehicleMileage: ['Kilometrage'],
    vehicleRegistrationFirstRegisteredAt: ['DataMEC'],
  },
  foreigns: {
    providedFrontDeskUserName: ['Interlocuteur'],
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY hh:mm:ss',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  ID: 'DataFirst',
  config: config,
};
