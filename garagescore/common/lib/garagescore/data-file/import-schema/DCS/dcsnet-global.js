var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:DSC:dcsnet'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');

// shared by all dcsnet schémas
var shared = {
  fileformat: {
    type: 'variable',
    worksheetName: '#first#',
  },
  columns: {
    fullName: ['Nom client', 'NOM DU CLIENT', '     Nom client'],
    firstName: ['Prénom', 'Prénom (propriétaire)', 'PRENOM', 'Prénom propriétaire', 'Prénom'],
    lastName: ['Nom', 'Nom individu', 'Nom (propriétaire)', 'Nom individu propriétaire', 'Nom client'],
    gender: [
      'Civilité',
      'Civilité (long) (Civ)',
      'Civilité (Libellé)',
      'CIVILITE',
      'Libellé civilité',
      'Civilité propriétaire (abrégé)',
    ],
    mobilePhone: [
      'Téléphone portable',
      'Tél. portable',
      'Portable',
      'PORTABLE',
      'Tel portable (propriétaire)',
      'Tél. portable individu propriétaire',
    ],
    homePhone: ['Téléphone domicile', 'Tél. domicile', 'Tel dom (propriétaire)'],
    email: ['Email', 'Email individu', 'EMAIL', 'Email (propriétaire)', 'Email individu propriétaire'],
    city: [
      'Ville',
      'VILLE',
      'Commune individu',
      'Commune client',
      'Ville (propriétaire)',
      'Commune individu propriétaire',
    ],
    postCode: ['Code postal', 'Code postal (propriétaire)'],
    streetAddress: ['N° et Nom de la voie', 'Rue', 'N° et Nom de la voie (propriétaire)'],
    vehicleMake: ['Libellé marque (Mrq)', 'Marque (Libellé)', 'Marque', 'Libellé marque'],
    vehicleModel: [
      'Libellé modèle (Mod)',
      'Gamme Modele',
      'Modele',
      'LIBELLE MODELE',
      'Libellé gamme',
      'Libellé Modèle',
    ],
    dataRecordCompletedAt: [
      'PASSAGE ATELIER',
      'Date évènement (Veh)',
      'Date dernier évènement (Indv)',
      'Date dernier événement (Veh)',
      'Date facture',
      'Date',
      'Date de livraison',
      'DATE DERN FACT',
      'Date livraison client',
      'Date livraison',
      'Date dernier évènement (Veh)',
    ],
    vehicleRegistrationPlate: 'Immatriculation',
    vehicleRegistrationFirstRegisteredAt: [
      'Date de mise en circulation',
      'Date de VD',
      'Date 1ère mise en circulation',
    ],
    vehicleMileage: ['Kilométrage compteur', 'Km'],
    billedAt: ['Date facture'],
    rowType: ['Type', 'RtYpE', 'Type VN VO'],
  },
  foreigns: {
    providedFrontDeskUserName: [
      'Nom vendeur1',
      'Libellé réceptionnaire',
      'Nom Conseiller comm. principal',
      'vendeur',
      'interlocuteur',
      'Interlocuteur',
      'Nom Conseiller comm． principal',
    ],
  },
  format: {
    vehicleMake: vehicleMake,
  },
};

module.exports = {
  shared: shared,
};
