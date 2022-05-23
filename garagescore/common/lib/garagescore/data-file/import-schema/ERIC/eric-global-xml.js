var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:ERIC:maurel'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');
/** shared arguments to create Maurel importer schemas*/
var shared = {
  fileformat: {
    type: 'xml',
    path: 'root.record',
  },
  columns: {
    gender: 'client.juridique',
    fullName: 'client.nom',
    postCode: 'client.adresse.cp',
    city: 'client.adresse.distributeur',
    streetAddress: 'client.adresse.rue',
    email: 'utilisateur.mail',
    mobilePhone: 'utilisateur.telephone.mobile',
    homePhone: 'utilisateur.telephone.domicile',
    officePhone: 'utilisateur.telephone.bureau',
    vehicleMake: 'vehicule.marque',
    vehicleModel: 'vehicule.modele',
    dataRecordCompletedAt: 'facture.date',
    vehicleRegistrationFirstRegisteredAt: 'vehicule.datemec',
    vehicleRegistrationPlate: 'vehicule.immatriculation',
    vehicleMileage: 'vehicule.kilometrage',
  },
  foreigns: {
    providedFrontDeskUserName: 'responsable.nom',
  },
  format: {
    dataRecordCompletedAt: 'DD-MM-YY',
    vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  shared: shared,
};
