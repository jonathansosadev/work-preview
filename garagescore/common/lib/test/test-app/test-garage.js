/*
 * Test-app: garage
 */

const moment = require('moment');
const { ObjectId } = require('mongodb');
const testTools = require('../testtools.js');
const TestCampaign = require('./test-campaign.js');
const promises = require('../../util/promises');

class TestGarage {
  constructor(testApp, garageId) {
    this.app = testApp;
    this._garageId = garageId;
  }
  get garageId() {
    return this._garageId.toString();
  }
  get id() {
    return this._garageId;
  }
  getId() {
    return this._garageId.toString();
  }
  async runNewCampaign(dataFileDataType, datafileColumns = {}) {
    // Create and import datafile
    const date = moment().format('DD/MM/YYYY');
    const person = testTools.random.person();
    const vehicule = testTools.random.vehicule();
    const d = {};
    d.gender = datafileColumns.gender || person.gender;
    d.fullName = datafileColumns.fullName || person.fullName;
    d.firstName = datafileColumns.firstName || person.firstName;
    d.lastName = datafileColumns.lastName || person.lastName;
    d.email = datafileColumns.email || datafileColumns.email === null ? datafileColumns.email : person.email;
    d.mobilePhone =
      datafileColumns.mobilePhone || datafileColumns.mobilePhone === null
        ? datafileColumns.mobilePhone
        : person.mobilePhone;
    d.city = datafileColumns.city || person.city;
    d.streetAddress = datafileColumns.streetAddress || person.streetAddress;
    d.postCode = datafileColumns.postalCode || person.postalCode;
    d.vehicleMake = datafileColumns.make || vehicule.make;
    d.model = datafileColumns.model || vehicule.model;
    d.Service = datafileColumns.Service;
    let csv = `dateinter;genre;fullName;firstName;lastName;email;mobilePhone;ville;rue;cp;marque;modele${
      d.Service ? ';Service' : ''
    }\n`;
    const csvFields = [
      date,
      d.gender,
      d.fullName,
      d.firstName,
      d.lastName,
      d.email,
      d.mobilePhone,
      d.city,
      d.streetAddress,
      d.postCode,
      d.vehicleMake,
      d.model,
    ]; // eslint-disable-line max-len
    if (d.Service) {
      csvFields.push(d.Service);
    }
    csv += csvFields.join(';');
    const campaigns = await promises.wait(
      this.app.models.DataFile.importFromString,
      this.garageId,
      dataFileDataType,
      csv
    );
    // run campaign
    await promises.wait(this.app.models.Campaign.run, campaigns[0].id);
    return new TestCampaign(this.app, campaigns[0].id);
  }
  async runMultipleCampaigns(dataFileDataType, datafileColumns) {
    let csv = 'dateinter;genre;fullName;firstName;lastName;email;mobilePhone;ville;rue;cp;marque;modele;Service';

    for (let i = 0; i < datafileColumns.length; ++i) {
      const date = moment().format('DD/MM/YYYY');
      const person = testTools.random.person();
      const vehicule = testTools.random.vehicule();
      const d = {};
      d.gender = datafileColumns[i].gender || person.gender;
      d.fullName = datafileColumns[i].fullName || person.fullName;
      d.firstName = datafileColumns[i].firstName || person.firstName;
      d.lastName = datafileColumns[i].lastName || person.lastName;
      d.email = datafileColumns[i].email || person.email;
      d.mobilePhone = datafileColumns[i].mobilePhone || person.mobilePhone;
      d.city = datafileColumns[i].city || person.city;
      d.streetAddress = datafileColumns[i].streetAddress || person.streetAddress;
      d.postCode = datafileColumns[i].postalCode || person.postalCode;
      d.vehicleMake = datafileColumns[i].make || vehicule.make;
      d.model = datafileColumns[i].model || vehicule.model;
      d.Service = datafileColumns[i].Service;
      const csvFields = [
        date,
        d.gender,
        d.fullName,
        d.firstName,
        d.lastName,
        d.email,
        d.mobilePhone,
        d.city,
        d.streetAddress,
        d.postCode,
        d.vehicleMake,
        d.model,
      ]; // eslint-disable-line max-len
      if (d.Service) {
        csvFields.push(d.Service);
      }
      csv += '\n';
      csv += csvFields.join(';');
    }

    const campaigns = await promises.wait(
      this.app.models.DataFile.importFromString,
      this.garageId,
      dataFileDataType,
      csv
    );
    // run campaign
    for (const c of campaigns) {
      await promises.wait(this.app.models.Campaign.run, c.id);
    }
    const returnCampaigns = [];
    for (const c of campaigns) {
      returnCampaigns.push(new TestCampaign(this.app, c.id));
    }
    return returnCampaigns;
  }
  async getInstance() {
    return this.app.models.Garage.findById(this.garageId);
  }
  async getInstanceMongo(projection = {}) {
    const _id = new ObjectId(this.garageId);
    return this.app.models.Garage.getMongoConnector().findOne({ _id }, { projection });
  }
  // all data of this garage
  async datas() {
    return this.app.models.Data.find({ where: { garageId: this.garageId } });
  }
  removeFilterCache() {
    require('../../../../common/lib/garagescore/campaign/filtering/customers-filter') // eslint-disable-line global-require
      .removeCache();
  }
}
module.exports = TestGarage;
