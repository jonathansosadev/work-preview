var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:IcarSystems:iscarsystems'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');

var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
  },
  columns: {
    firstName: 'Prénom',
    lastName: 'Nom',
    gender: 'Civilité',
    postCode: 'Code Postal',
    city: 'Ville',
    streetAddress: ['Adresse', 'Adresse (suite)'],
    email: ['E-mail Particulier', 'E-mail Professionnel', 'Au moins un e-mail'],
    vehicleMake: 'Marque',
    vehicleModel: 'Modèle',
    dataRecordCompletedAt: 'Date de la Dernière Facture',
    vehicleRegistrationPlate: 'Immatriculation',
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  ID: 'IcarSystems',
  config: config,
};
