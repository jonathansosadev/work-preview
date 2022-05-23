const debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:IcarSystems:iscarsystems'); // eslint-disable-line max-len,no-unused-vars
const vehicleMake = require('../vehicle-make');

const config = {
  fileformat: {
    type: 'csv',
    charset: 'win1252',
    transformers: [
      {
        name: 'tsv-to-csv',
        options: {},
      },
      {
        name: 'headerless-csv',
        options: {
          Maintenances: {
            header:
              ';;ID société;;providedGarageId;;;dataRecordCompletedAt;;providedCustomerId;codeClient;vehicleRegistrationPlate;vehicleMileage;providedFrontDeskUserName;;;;;;;;gender;lastName;firstName;;;postCode;city;;;officePhone;mobilePhone;homePhone;fax;email;;;;;flagOptOut;;vehicleMake;;vehicleModel;;;;;;vehicleRegistrationFirstRegisteredAt', // eslint-disable-line
          },
          NewVehicleSales: {
            header:
              'providedCustomerId;gender;firstName;lastName;postCode;city;;homePhone;mobilePhone;officePhone;fax;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName', // eslint-disable-line
          },
          UsedVehicleSales: {
            header:
              'providedCustomerId;gender;firstName;lastName;postCode;city;;homePhone;mobilePhone;officePhone;fax;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName', // eslint-disable-line
          },
          MixedVehicleSales: {
            header:
              'providedCustomerId;gender;firstName;lastName;postCode;city;;homePhone;mobilePhone;officePhone;fax;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName', // eslint-disable-line
          },
          VehicleInspections: {
            header:
              'providedCustomerId;gender;firstName;lastName;postCode;city;;homePhone;mobilePhone;officePhone;fax;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName', // eslint-disable-line
          },
        },
      },
      {
        name: 'colsize-csv',
        options: { size: 59 },
      },
    ],
  },
  columns: {
    firstName: 'firstName',
    lastName: 'lastName',
    gender: 'gender',
    postCode: 'postCode',
    city: 'city',
    streetAddress: 'streetAddress',
    email: 'email',
    homePhone: 'homePhone',
    mobilePhone: 'mobilePhone',
    officePhone: 'officePhone',
    fax: 'fax',
    vehicleMake: 'vehicleMake',
    vehicleModel: 'vehicleModel',
    vehicleMileage: 'vehicleMileage',
    dataRecordCompletedAt: 'dataRecordCompletedAt',
    vehicleRegistrationPlate: 'vehicleRegistrationPlate',
    rowType: 'rowType',
  },
  foreigns: {
    providedCustomerId: 'providedCustomerId',
    providedGarageId: 'providedGarageId',
    providedFrontDeskUserName: 'providedFrontDeskUserName',
  },
  format: {
    dataRecordCompletedAt: 'YYYY-MM-DD',
    vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
    vehicleMake,
  },
};

module.exports = {
  ID: 'DMD',
  config,
};
