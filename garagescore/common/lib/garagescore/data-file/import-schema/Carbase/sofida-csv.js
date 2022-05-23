/*
 * Based on TWorkFile objects from MecaPlanning WSDL v1.0.0.6 and v1.0.0.12:
 * http://188.130.32.200/cgi-bin/MPSrv/MPSRVDMS-V_1-0-0-6.exe/soap/IWSDialog
 * http://81.93.245.71/MPSrv/MPSRVDMS-V_1-0-0-12.exe/wsdl/IWSDialog`
 */

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:MecaPlanning:mecaplanning'); // eslint-disable-line max-len,no-unused-vars
var shared = require('./sofida-shared');

// importForeignDataFileRow
var config = {
  fileformat: {
    type: 'csv',
    charset: 'win1252',
    ignoreFirstXLines: 1,
  },
  columns: {
    gender: 'Civilité',
    fullName: 'Nom 1',
    postCode: 'Code Postal',
    city: 'Ville',
    streetAddress: ['Adresse'],
    email: ['Adresse mail'],
    mobilePhone: 'Téléphone Portable',
    homePhone: 'Téléphone Domicile',
    officePhone: 'Téléphone Société',
    vehicleMake: 'Marque',
    vehicleModel: 'Modèle',
    dataRecordCompletedAt: 'Date Facture',
    vehicleRegistrationPlate: 'Immatriculation Véhicule',
    billedAt: 'Date Facture',
    price: 'Montant Facture TTC',
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY',
    vehicleMake: shared.vehicleMake,
  },
  shouldImportCallback: shared.shouldImportCallback,
  valuesTransformer: shared.valuesTransformer,
};

module.exports = {
  ID: 'SofidaCsv',
  config: config,
};
