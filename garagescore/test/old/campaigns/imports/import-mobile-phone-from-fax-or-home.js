const chai = require('chai');
const customerContactchannelPhonesFax = require('../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-phones-fax.js');

const expect = chai.expect;
/**
 Do we parse mobilePhone correctly if it take the place of homePhone
 */
describe('Test contacts sent:', () => {
  // test
  it('issue 647 in github', (done) => {
    const options = {
      cellLabels: {
        homePhone: 'homePhone',
        mobilePhone: 'mobilePhone',
        officePhone: 'officePhone',
        fax: 'fax',
      },
    };
    const dataRecord = {
      importStats: {
        dataPresence: {},
        dataValidity: {},
        dataFixes: {},
      },
      customer: {},
    };
    const rowCells = {
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
      mobilePhone: '0386815319',
      homePhone: '0648630158',
      fax: '',
      email: 'lemaire0117@orange.fr',
      flagOptOut: '',
      vehicleMake: 'FORD',
      vehicleModel: 'TRANSIT CHASSIS SIMPLE CABINE PROPULSION',
      vehicleRegistrationFirstRegisteredAt: '2017-10-19 00:00:00.000',
      TypeVehiculeIcar: '',
      ID_section: '',
      section: '',
    };
    customerContactchannelPhonesFax(dataRecord, 0, rowCells, options, (err, dataRec) => {
      expect(err).to.be.null;
      expect(dataRec.importStats.dataValidity.customer.contactChannel.mobilePhone).to.be.true;
      expect(dataRec.importStats.dataPresence.customer.contactChannel.mobilePhone).to.be.true;
      expect(dataRec.importStats.dataPresence.customer.contactChannel.mobilePhone).to.be.true;
      expect(dataRec.customer.contactChannel.mobilePhone.number).to.equals('+33648630158');
      done();
    });
  });
});
