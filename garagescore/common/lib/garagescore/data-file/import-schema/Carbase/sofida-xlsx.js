var shared = require('./sofida-shared');

var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
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
  },
  foreigns: {
    typeFacture: 'Type Facture',
  },
  format: {
    dataRecordCompletedAt: 'MM/DD/YY',
    vehicleMake: shared.vehicleMake,
  },
  shouldImportCallback: shared.shouldImportCallback,
  valuesTransformer: shared.valuesTransformer,
};

module.exports = {
  ID: 'SofidaXlsx',
  config: config,
};
