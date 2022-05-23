var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:cobredia-mix'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');
var mecaplanning = require('../MecaPlanning/mecaplanning').config;
var moment = require('moment');

// concat values with values from mecaplanning
var concatMP = function (columnName, values) {
  if (mecaplanning.columns[columnName]) {
    var cols = mecaplanning.columns[columnName];
    if (typeof cols === 'string') {
      cols = [cols];
    }
    return cols.concat(values);
  }
  return values;
};
var concatFMP = function (columnName, values) {
  if (mecaplanning.foreigns[columnName]) {
    var cols = mecaplanning.foreigns[columnName];
    if (typeof cols === 'string') {
      cols = [cols];
    }
    return cols.concat(values);
  }
  return values;
};

var config = {
  fileformat: {
    type: 'variable',
    worksheetName: '#first#',
  },
  columns: {
    gender: concatMP('gender', ['Civilite', 'civilite']),
    firstName: concatMP('firstName', ['prenom']),
    lastName: concatMP('lastName', ['Nom', 'nom']),
    city: concatMP('city', ['Ville', 'ville']),
    postCode: concatMP('postCode', ['CodePostal', 'code_postal']),
    streetAddress: concatMP('streetAddress', ['Adresse', 'adresse']),
    mobilePhone: concatMP('mobilePhone', ['TelephoneMobile', 'cor_tel1']),
    homePhone: concatMP('homePhone', ['TelephoneFixe']),
    officePhone: concatMP('officePhone', ['TelephoneBureau']),
    email: concatMP('email', ['Email', 'mail']),
    price: concatMP('price', ['TarifTTC']),
    dataRecordCompletedAt: concatMP('dataRecordCompletedAt', ['DateFacture', 'datelivraison']),
    vehicleMake: concatMP('vehicleMake', ['Marque', 'marque']),
    vehicleModel: concatMP('vehicleModel', ['Modele', 'modele']),
    vehicleRegistrationPlate: concatMP('vehicleRegistrationPlate', ['Immatriculation', 'immat']),
    vehicleRegistrationFirstRegisteredAt: concatMP('vehicleRegistrationFirstRegisteredAt', ['date MEC', 'DateMEC']),
    vehicleMileage: concatMP('vehicleMileage', ['km', 'Km', 'Kilometrage']),
    rowType: concatMP('rowType', ['genre']),
  },
  foreigns: {
    providedCustomerId: concatFMP('providedCustomerId', ['codeclient']),
    providedGarageId: concatFMP('providedGarageId', ['codesociete']),
    providedFrontDeskUserName: concatFMP('providedFrontDeskUserName', [
      'Nom vendeur1',
      'Libellé réceptionnaire',
      'Nom Conseiller comm. principal',
      'vendeur',
      'interlocuteur',
      'Interlocuteur',
    ]),
  },
  format: {
    dataRecordCompletedAt: 'YYYY-MM-DD',
    vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
    vehicleMake: vehicleMake,
  },
  valuesTransformer: function (columnName, value, rowCells) {
    if (columnName === 'dataRecordCompletedAt' && rowCells.datelivraison) {
      // change '27/09/2016 to 2016-09-27
      try {
        return moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
      } catch (e) {
        console.error(e);
      }
    }
    if (columnName === 'dataRecordCompletedAt' && rowCells['RdvStateList.[last].RdvStateDateHeure']) {
      // change '16/03/2016 16:23:51 to 2016-03-16
      try {
        return moment(value, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD');
      } catch (e) {
        console.error(e);
      }
    }
    if (columnName === 'vehicleRegistrationFirstRegisteredAt' && rowCells.DateMEC) {
      // change '16/03/2016 to 2016-03-16
      try {
        return moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
      } catch (e) {
        console.error(e);
      }
    }
    return value;
  },
  shouldImportCallback: function shouldImportCallback(dataRecord, rowIndex, rowCells) {
    return (
      !rowCells['RdvStateList.[last].RdvState'] || mecaplanning.shouldImportCallback(dataRecord, rowIndex, rowCells)
    );
  },
};
module.exports = {
  ID: 'COBREDIAMIX',
  config: config,
};
