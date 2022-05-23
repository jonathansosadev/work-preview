/*
 * Based on TWorkFile objects from MecaPlanning WSDL v1.0.0.6 and v1.0.0.12:
 * http://188.130.32.200/cgi-bin/MPSrv/MPSRVDMS-V_1-0-0-6.exe/soap/IWSDialog
 * http://81.93.245.71/MPSrv/MPSRVDMS-V_1-0-0-12.exe/wsdl/IWSDialog`
 */

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:MecaPlanning:mecaplanning'); // eslint-disable-line max-len,no-unused-vars
var vehicleMake = require('../vehicle-make');
// importForeignDataFileRow
var config = {
  fileformat: {
    type: 'csv',
  },
  columns: {
    gender: ['Client.CliTitle', 'CliTitle'],
    firstName: ['Client.CliFirName', 'CliFirName'],
    lastName: ['Client.CliFamName', 'CliFamName'],
    city: ['Client.CliCity', 'CliCity'],
    postCode: ['Client.CliPC', 'CliPC'],
    streetAddress: ['Client.CliAddr1', 'Client.CliAddr2'],
    mobilePhone: ['Client.CliCellPhone', 'CliCellPhone'],
    homePhone: ['Client.CliHomePhone', 'CliHomePhone'],
    officePhone: ['Client.CliWorkPhone', 'CliWorkPhone'],
    fax: ['Client.CliFax', 'CliFax'],
    email: ['Client.CliEmail', 'CliEmail'],
    dataRecordCompletedAt: 'RdvStateList.[last].RdvStateDateHeure',
    vehicleMake: ['Vehicle.VehMake', 'VehMake'],
    vehicleModel: ['Vehicle.VehModel', 'VehModel'],
    vehicleRegistrationPlate: ['Vehicle.VehRegNum', 'VehRegNum'],
    vehicleRegistrationFirstRegisteredAt: ['Vehicle.VehRegDate', 'VehRegDate'],
    vehicleMileage: ['Vehicle.VehKm'],
  },
  foreigns: {
    providedCustomerId: 'Client.CliDMSId',
    providedFrontDeskUserName: 'RdvStateList.[RdvState=2].Utilisateur.UtiNom',
  },
  format: {
    dataRecordCompletedAt: 'DD/MM/YYYY HH:mm:ss',
    vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
    vehicleMake: vehicleMake,
  },
  shouldImportCallback: function shouldImportCallback(dataRecord, rowIndex, rowCells) {
    return rowCells['RdvStateList.[last].RdvState'] && rowCells['RdvStateList.[last].RdvState'].toString() === '10';
  },
};

module.exports = {
  ID: 'MecaPlanning',
  config: config,
};
