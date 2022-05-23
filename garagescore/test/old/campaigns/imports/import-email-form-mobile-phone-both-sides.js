const chai = require('chai');
const customerContactchannelEmail = require('../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-email');
const customerContactchannelPhonesFax = require('../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-phones-fax.js');

const { expect } = chai;
/**
 Do we parse mobilePhone correctly if it take the place of homePhone
 */
describe('Test contacts sent:', () => {
  // test
  const options = {
    cellLabels: {
      homePhone: 'homePhone',
      mobilePhone: 'mobilePhone',
      officePhone: 'officePhone',
      email: 'email',
      fax: 'fax',
    },
  };
  const rowCells = [
    {
      expected: {
        email: 'jmliduena@hotmail.com',
        email_valid: true,
        email_presence: true,
        phone: 'jmliduena@hotmail.com',
        phone_valid: false,
        phone_prensence: true,
      },
      data: {
        IDsociété: '004',
        providedGarageId: '40',
        dataRecordCompletedAt: '2018-03-27 00:00:00.000',
        providedCustomerId: '79603',
        VIN: '181248',
        vehicleRegistrationPlate: 'ER341JF',
        vehicleMileage: '15345',
        providedFrontDeskUserName: 'Didier BALIVET',
        testpresta: 'TRAPPE ABLUE NE TIENT PLUS FERMEE',
        gender: 'STE',
        lastName: 'SARL LEMAIRE JACQUES  Mr HERMANN',
        firstName: '',
        rue: 'ZONE ARTISANAL ROUTE DE TONNERRE',
        postCode: '89270',
        city: 'VERMENTON',
        officePhone: '',
        mobilePhone: 'jmliduena@hotmail.com',
        homePhone: '',
        fax: '',
        email: '',
        flagOptOut: '',
        vehicleMake: 'FORD',
        vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
        vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
        TypeVehiculeIcar: '',
        ID_section: '',
        section: '',
      },
    },
    {
      expected: {
        email: 'sabia@hotmail.com',
        email_valid: true,
        email_presence: true,
        phone: 'sabiahotmail.com',
        phone_valid: false,
        phone_prensence: true,
      },
      data: {
        IDsociété: '004',
        providedGarageId: '40',
        dataRecordCompletedAt: '2018-03-27 00:00:00.000',
        providedCustomerId: '79603',
        VIN: '181248',
        vehicleRegistrationPlate: 'ER341JF',
        vehicleMileage: '15345',
        providedFrontDeskUserName: 'Didier BALIVET',
        testpresta: 'TRAPPE ABLUE NE TIENT PLUS FERMEE',
        gender: 'STE',
        lastName: 'SARL LEMAIRE JACQUES  Mr HERMANN',
        firstName: '',
        rue: 'ZONE ARTISANAL ROUTE DE TONNERRE',
        postCode: '89270',
        city: 'VERMENTON',
        officePhone: '',
        mobilePhone: 'sabiahotmail.com',
        homePhone: '',
        fax: '',
        email: '',
        flagOptOut: '',
        vehicleMake: 'FORD',
        vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
        vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
        TypeVehiculeIcar: '',
        ID_section: '',
        section: '',
      },
    },
    {
      expected: {
        email: 'jmliduena@hotmail.com',
        email_valid: true,
        email_presence: true,
        phone: 'jmliduena@hotmail.com',
        phone_valid: false,
        phone_prensence: true,
      },
      data: {
        IDsociété: '004',
        providedGarageId: '40',
        dataRecordCompletedAt: '2018-03-27 00:00:00.000',
        providedCustomerId: '79603',
        VIN: '181248',
        vehicleRegistrationPlate: 'ER341JF',
        vehicleMileage: '15345',
        providedFrontDeskUserName: 'Didier BALIVET',
        testpresta: 'TRAPPE ABLUE NE TIENT PLUS FERMEE',
        gender: 'STE',
        lastName: 'SARL LEMAIRE JACQUES  Mr HERMANN',
        firstName: '',
        rue: 'ZONE ARTISANAL ROUTE DE TONNERRE',
        postCode: '89270',
        city: 'VERMENTON',
        officePhone: '',
        mobilePhone: 'jmliduena@hotmail.com',
        homePhone: '',
        fax: '',
        email: 'abcxyz',
        flagOptOut: '',
        vehicleMake: 'FORD',
        vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
        vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
        TypeVehiculeIcar: '',
        ID_section: '',
        section: '',
      },
    },
    {
      expected: {
        email: '0677718641',
        email_valid: false,
        email_presence: true,
        phone: '+33677718641',
        phone_valid: true,
        phone_prensence: true,
      },
      data: {
        IDsociété: '004',
        providedGarageId: '40',
        dataRecordCompletedAt: '2018-03-27 00:00:00.000',
        providedCustomerId: '79603',
        VIN: '181248',
        vehicleRegistrationPlate: 'ER341JF',
        vehicleMileage: '15345',
        providedFrontDeskUserName: 'Didier BALIVET',
        testpresta: 'TRAPPE ABLUE NE TIENT PLUS FERMEE',
        gender: 'STE',
        lastName: 'SARL LEMAIRE JACQUES  Mr HERMANN',
        firstName: '',
        rue: 'ZONE ARTISANAL ROUTE DE TONNERRE',
        postCode: '89270',
        city: 'VERMENTON',
        officePhone: '',
        mobilePhone: '',
        homePhone: '',
        fax: '',
        email: '0677718641',
        flagOptOut: '',
        vehicleMake: 'FORD',
        vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
        vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
        TypeVehiculeIcar: '',
        ID_section: '',
        section: '',
      },
    },
    {
      expected: {
        email: '0677718641',
        email_valid: false,
        email_presence: true,
        phone: '+33677718641',
        phone_valid: true,
        phone_prensence: true,
      },
      data: {
        IDsociété: '004',
        providedGarageId: '40',
        dataRecordCompletedAt: '2018-03-27 00:00:00.000',
        providedCustomerId: '79603',
        VIN: '181248',
        vehicleRegistrationPlate: 'ER341JF',
        vehicleMileage: '15345',
        providedFrontDeskUserName: 'Didier BALIVET',
        testpresta: 'TRAPPE ABLUE NE TIENT PLUS FERMEE',
        gender: 'STE',
        lastName: 'SARL LEMAIRE JACQUES  Mr HERMANN',
        firstName: '',
        rue: 'ZONE ARTISANAL ROUTE DE TONNERRE',
        postCode: '89270',
        city: 'VERMENTON',
        officePhone: '',
        mobilePhone: '1234',
        homePhone: '',
        fax: '',
        email: '0677718641',
        flagOptOut: '',
        vehicleMake: 'FORD',
        vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
        vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
        TypeVehiculeIcar: '',
        ID_section: '',
        section: '',
      },
    },
  ];
  it('issue #749 in github #1 email from mobile', (done) => {
    /* email from mobile */
    for (let index = 0; index < rowCells.length; index += 1) {
      const dataRecord = {
        importStats: {
          dataPresence: {},
          dataValidity: {},
          dataFixes: {},
          dataNC: {},
        },
        customer: {},
      };

      const cell = rowCells[index];
      customerContactchannelEmail(dataRecord, 0, cell.data, options, (err, dataRec) => {
        expect(err).to.be.null;
        expect(dataRec.importStats.dataValidity.customer.contactChannel.email).to.equals(cell.expected.email_valid);
        expect(dataRec.importStats.dataPresence.customer.contactChannel.email).to.equals(cell.expected.email_presence);

        let email;
        if (dataRec.customer && dataRec.customer.contactChannel) {
          email = dataRec.customer.contactChannel.email.address;
        }

        expect(email).to.equals(cell.expected.email);
      });
    }
    done();
  });

  /* mobile form email */
  it('issue #749 in github #2 mobile form email', (done) => {
    for (let index = 0; index < rowCells.length; index += 1) {
      const dataRecord = {
        importStats: {
          dataPresence: {},
          dataValidity: {},
          dataFixes: {},
          dataNC: {},
        },
        customer: {},
      };

      const cell = rowCells[index];
      customerContactchannelPhonesFax(dataRecord, 0, cell.data, options, (err, dataRec) => {
        expect(err).to.be.null;
        expect(dataRec.importStats.dataValidity.customer.contactChannel.mobilePhone).to.equals(
          cell.expected.phone_valid
        );
        expect(dataRec.importStats.dataPresence.customer.contactChannel.mobilePhone).to.equals(
          cell.expected.phone_prensence
        );

        let phone;
        if (dataRec.customer && dataRec.customer.contactChannel) {
          phone = dataRec.customer.contactChannel.mobilePhone.number;
        }

        expect(phone).to.equals(cell.expected.phone);
      });
    }

    done();
  });
});
