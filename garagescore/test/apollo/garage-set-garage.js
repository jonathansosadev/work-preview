const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const GarageStatuses = require('../../common/models/garage.status');
const { expect, assert } = chai;
const testApp = new TestApp();
const { UserInputError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');

/* Get garage data from api */
describe('Garage modify', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Set a garage', async () => {
    const testGarage = await testApp.addGarage({ status: GarageStatuses.RUNNING_AUTO });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const request = `mutation GarageSetGarage($id: String!, $garagesModifications: GarageSetGarageGarageModifications!) {
      GarageSetGarage(id: $id, garagesModifications: $garagesModifications) {
      garageUpdated
    }
    }`;
    let garage = await testGarage.getInstance();
    const id = garage.getId().toString();

    expect(garage.brandNames[0]).equal('Renault');

    // all these fields are required when sending
    const form = {
      externalId: garage.externalId || '',
      type: 'MotorbikeDealership',
      name: 'Change Garagescore',
      group: garage.group || '',
      businessId: garage.businessId || '',
      googlePlaceId: garage.googlePlaceId || '',
      zohoDealUrl: garage.zohoDealUrl || '',
      disableZohoUrl: garage.disableZohoUrl || false,
      ratingType: garage.ratingType || '',
      isReverseRating: garage.isReverseRating || false,
      certificateWording: garage.certificateWording || '',
      locale: garage.locale || '',
      timezone: garage.timezone || '',
      brandNames: ['Peugeot'],
      performerId: garage.performerId || '',
      surveySignature: {
        defaultSignature: {
          firstName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.firstName : '',
          lastName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.lastName : '',
          job: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.job : '',
        },
      },
      apv:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.maintenance
          : 0,
      vn:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_new
          : 0,
      vo:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_used
          : 0,
      link: '',
      parentGarageId: (garage.parent && garage.parent.garageId) || '',
      shareLeadTicket:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.enabled) || false,
      shareLeadTicketNewVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.NewVehicleSale) || false,
      shareLeadTicketUsedVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.UsedVehicleSale) || false,
      allowReviewCreationFromContactTicket: garage.allowReviewCreationFromContactTicket || false,
      enableCrossLeadsSelfAssignCallAlert: garage.enableCrossLeadsSelfAssignCallAlert || true,
    };

    const variables = { id, garagesModifications: form };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const isGarageUpdated = res.data.GarageSetGarage.garageUpdated;
    expect(isGarageUpdated).to.be.true;
    garage = await testApp.models.Garage.findOne({ _id: ObjectId(id) });

    // Should be Peugeot
    expect(garage.brandNames[0]).equal('Peugeot');
    // Should be Change Garagescore
    expect(garage.publicDisplayName).equal('Change Garagescore');
    // Should be MotorbikeDealership
    expect(garage.type).equal('MotorbikeDealership');
  });

  it('Modify a garage with unknown Id', async () => {
    const testGarage = await testApp.addGarage({ status: GarageStatuses.RUNNING_AUTO });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const request = `mutation GarageSetGarage($id: String!, $garagesModifications: GarageSetGarageGarageModifications!) {
      GarageSetGarage(id: $id, garagesModifications: $garagesModifications) {
      garageUpdated
    }
    }`;
    let garage = await testGarage.getInstance();
    // unknown Id
    const id = new ObjectId().toHexString();

    // all these fields are required when sending
    const form = {
      externalId: garage.externalId || '',
      type: garage.type,
      name: garage.publicDisplayName,
      group: garage.group || '',
      businessId: garage.businessId || '',
      googlePlaceId: garage.googlePlaceId || '',
      zohoDealUrl: garage.zohoDealUrl || '',
      disableZohoUrl: garage.disableZohoUrl || false,
      ratingType: garage.ratingType || '',
      isReverseRating: garage.isReverseRating || false,
      certificateWording: garage.certificateWording || '',
      locale: garage.locale || '',
      timezone: garage.timezone || '',
      brandNames: ['Peugeot'],
      performerId: garage.performerId || '',
      surveySignature: {
        defaultSignature: {
          firstName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.firstName : '',
          lastName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.lastName : '',
          job: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.job : '',
        },
      },
      apv:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.maintenance
          : 0,
      vn:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_new
          : 0,
      vo:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_used
          : 0,
      link: '',
      parentGarageId: (garage.parent && garage.parent.garageId) || '',
      shareLeadTicket:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.enabled) || false,
      shareLeadTicketNewVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.NewVehicleSale) || false,
      shareLeadTicketUsedVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.UsedVehicleSale) || false,
      allowReviewCreationFromContactTicket: garage.allowReviewCreationFromContactTicket || false,
      enableCrossLeadsSelfAssignCallAlert: garage.enableCrossLeadsSelfAssignCallAlert || true,
    };

    const variables = { id, garagesModifications: form };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.errors.length > 0).to.be.true;
    expect(res.errors[0].message).equal(`Garage with id ${id} not found.`);
  });

  it('Modify a garage with invalid Id', async () => {
    const testGarage = await testApp.addGarage({ status: GarageStatuses.RUNNING_AUTO });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const request = `mutation GarageSetGarage($id: String!, $garagesModifications: GarageSetGarageGarageModifications!) {
      GarageSetGarage(id: $id, garagesModifications: $garagesModifications) {
      garageUpdated
    }
    }`;
    let garage = await testGarage.getInstance();
    // invalid Id
    const id = 'invalidId';

    // all these fields are required when sending
    const form = {
      externalId: garage.externalId || '',
      type: garage.type,
      name: garage.publicDisplayName,
      group: garage.group || '',
      businessId: garage.businessId || '',
      googlePlaceId: garage.googlePlaceId || '',
      zohoDealUrl: garage.zohoDealUrl || '',
      disableZohoUrl: garage.disableZohoUrl || false,
      ratingType: garage.ratingType || '',
      isReverseRating: garage.isReverseRating || false,
      certificateWording: garage.certificateWording || '',
      locale: garage.locale || '',
      timezone: garage.timezone || '',
      brandNames: ['Peugeot'],
      performerId: garage.performerId || '',
      surveySignature: {
        defaultSignature: {
          firstName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.firstName : '',
          lastName: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.lastName : '',
          job: garage.surveySignature.defaultSignature ? garage.surveySignature.defaultSignature.job : '',
        },
      },
      apv:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.maintenance
          : 0,
      vn:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_new
          : 0,
      vo:
        garage.thresholds && garage.thresholds.alertSensitiveThreshold
          ? garage.thresholds.alertSensitiveThreshold.sale_used
          : 0,
      link: '',
      parentGarageId: (garage.parent && garage.parent.garageId) || '',
      shareLeadTicket:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.enabled) || false,
      shareLeadTicketNewVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.NewVehicleSale) || false,
      shareLeadTicketUsedVehicleSale:
        (garage.parent && garage.parent.shareLeadTicket && garage.parent.shareLeadTicket.UsedVehicleSale) || false,
      allowReviewCreationFromContactTicket: garage.allowReviewCreationFromContactTicket || false,
      enableCrossLeadsSelfAssignCallAlert: garage.enableCrossLeadsSelfAssignCallAlert || true,
    };

    const variables = { id, garagesModifications: form };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.errors.length > 0).to.be.true;
    expect(res.errors[0].message).equal('ObjectId invalidId is not valid.');
  });
});
