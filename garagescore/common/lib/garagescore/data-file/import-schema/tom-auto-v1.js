var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:tom-auto-v1'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('./vehicle-make');

var config = {
  fileformat: {
    type: 'xlsx',
    worksheetName: '#first#',
  },
  columns: {
    gender: 'Civilite',
    fullName: 'Nom',
    city: 'Ville',
    postCode: 'CP',
    streetAddress: ['Adresse1', 'Adresse2'],
    mobilePhone: 'Portable',
    homePhone: 'Téléphone',
    officePhone: 'Tél bureau',
    fax: 'Fax',
    email: 'Email',
    dataRecordCompletedAt: 'Date intervention',
    vehicleMake: 'Marque',
    vehicleModel: 'Modèle',
    vehicleRegistrationPlate: 'Immat',
    vehicleCategoryId: 'Catégorie',
    vehicleRegistrationFirstRegisteredAt: '1ère Mise en circulation',
    billedAt: 'billedAt',
  },
  foreigns: {
    providedCustomerId: 'Code',
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY',
    vehicleRegistrationFirstRegisteredAt: 'DD/MM/YYYY',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  ID: 'TOMAUTO',
  config: config,
};
