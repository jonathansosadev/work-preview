const TestApp = require('../../../common/lib/test/test-app');
const GarageTypes = require('../../../common/models/garage.type');
const chai = require('chai');
/** Some foreign responses */
const foreignResponses = require('./foreign-responses/VI-example.json');
const TestSurvey = require('../../../common/lib/test/test-app/test-survey.js');

const expect = chai.expect;
const { ObjectId } = require('mongodb');
const app = new TestApp();

/**
 * Survey modification with foreign responses
 */
describe('Add SurveyGizmo ForeignResponse:', () => {
  let survey = null;
  let datas = null;
  beforeEach(async function () {
    await app.reset();
    const garage = await app.addGarage({ type: GarageTypes.VEHICLE_INSPECTION });
    exampleData.garageId = garage.getId();
    await app.models.Data.create(exampleData);
    datas = await app.datas();
    survey = new TestSurvey(app, datas[0].getId());
  });
  /**
   * this test a response rate 10
   * with a lead
   */
  it('Test : page 1', async function test() {
    // Page 1 : rating - comment - acceptTermOfSharing(true) - acceptTermOfUse(true)
    await survey.addSurveyGizmoForeignResponse(foreignResponses[0]);
    datas = await app.datas();

    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal('superbe établissement , rien à dire');
    expect(datas[0].get('lead.potentialSale')).to.equal(true);
  });

  it('Test : page 2', async function test() {
    await survey.addSurveyGizmoForeignResponse(foreignResponses[1]);
    datas = await app.datas();
    // préférences de marques : 'Aston Martin', 'McLaren', 'Ferrari'
    expect(datas[0].get('lead.brands')[0].brand).to.equal('Aston Martin');
    expect(datas[0].get('lead.brands')[1].brand).to.equal('McLaren');
    expect(datas[0].get('lead.brands')[2].brand).to.equal('Ferrari');
    // Réalisation de mon projet : 0 à 6 mois
    expect(datas[0].get('lead.timing')).to.equal('BetweenNowToMidTerm');
    // Type de véhicule : Neuf
    expect(datas[0].get('lead.saleType')).to.equal('NewVehicleSale');
    // Motorisation : Diesel - Essence
    expect(datas[0].get('lead.energyType')).to.have.members(['diesel', 'fuel']);
    // Règlement : Au comptant
    expect(datas[0].get('lead.financing')).to.equal('cash');
    // Offre de reprise : Oui
    expect(datas[0].get('lead.tradeIn')).to.equal('Yes');
    // essai vehicule : Oui
    expect(datas[0].get('lead.testDrive')).to.equal('Yes');
  });

  it('Test : page 3', async function test() {
    await survey.addSurveyGizmoForeignResponse(foreignResponses[2]);
    datas = await app.datas();

    // Comment avez-vous connu notre centre ? :
    expect(datas[0].get('service.middleMans')).to.have.members(['Pub', 'Offer', 'Garage']);
    // Coordonnées
    expect(datas[0].get('customer.title')).to.equal('Monsieur');
    expect(datas[0].get('customer.fullName')).to.equal('Jean Dubois');
    expect(datas[0].get('customer.contact.email')).to.equal('testG@gmail.com');
    expect(datas[0].get('customer.street')).to.equal('44 Rue Cauchy');
    expect(datas[0].get('customer.postalCode')).to.equal('94110');
    expect(datas[0].get('customer.city')).to.equal('Arcueil');
    // Recommande : Oui
    expect(datas[0].get('lead.recommend')).to.be.undefined;
  });

  it('Test : page 4', async function test() {
    await survey.addSurveyGizmoForeignResponse(foreignResponses[3]);
    datas = await app.datas();
    // Pouvez-vous nous aider à nous faire connaître sur Google et LesPagesJaunes en partageant votre avis ? : Oui
    expect(datas[0].get('review.shareWithPartners')).to.equal(true);
  });
});

var exampleData = {
  type: 'VehicleInspection',
  garageType: 'VehicleInspection',
  shouldSurfaceInStatistics: true,
  service: {
    isQuote: false,
    providedAt: new Date('2021-03-22T23:00:00.000Z'),
    frontDeskUserName: 'UNDEFINED',
  },
  customer: {
    contact: {
      email: {
        value: 'test@test.com',
        original: 'test@test.com',
        isSyntaxOK: true,
        isEmpty: false,
      },
      mobilePhone: {
        isEmpty: true,
      },
    },
    gender: {
      value: 'M',
      original: 'M',
      isSyntaxOK: true,
      isEmpty: false,
    },
    title: {
      value: 'Monsieur',
      original: 'Monsieur',
      isSyntaxOK: true,
      isEmpty: false,
    },
    firstName: {
      value: 'Jean',
      original: 'Jean',
      isSyntaxOK: true,
      isEmpty: false,
    },
    lastName: {
      value: 'Dubois',
      original: 'Dubois',
      isSyntaxOK: true,
      isEmpty: false,
    },
    fullName: {
      value: 'Jean Dubois',
      original: 'Jean Dubois',
      isSyntaxOK: true,
      isEmpty: false,
    },
    street: {
      value: '44 Rue Cauchy',
      original: '44 Rue Cauchy',
      isSyntaxOK: true,
      isEmpty: false,
    },
    postalCode: {
      value: '94110',
      original: '94110',
      isSyntaxOK: true,
      isEmpty: false,
    },
    city: {
      value: 'Arcueil',
      original: 'Arcueil',
      isSyntaxOK: true,
      isEmpty: false,
    },
    countryCode: {
      value: 'FR',
      original: 'FR',
      isSyntaxOK: true,
      isEmpty: false,
    },
    rgpd: {
      optOutMailing: {
        isEmpty: true,
      },
      optOutSMS: {
        isEmpty: true,
      },
    },
  },
  vehicle: {
    isRevised: false,
    isValidated: false,
    make: {
      isEmpty: true,
    },
    model: {
      value: 'Clio',
      original: 'Clio',
      isSyntaxOK: true,
      isEmpty: false,
    },
    mileage: {
      isEmpty: true,
    },
    plate: {
      isEmpty: true,
    },
    vin: {
      isEmpty: true,
    },
    countryCode: {
      isEmpty: true,
    },
    registrationDate: {
      isEmpty: true,
    },
  },
  campaign: {
    campaignId: ObjectId('605a1a89106b6006e2b2a061'),
    status: 'Running',
    importedAt: new Date('2021-03-23T16:42:49.540Z'),
    contactStatus: {
      hasBeenContactedByPhone: false,
      hasBeenContactedByEmail: true,
      hasOriginalBeenContactedByPhone: false,
      hasOriginalBeenContactedByEmail: false,
      status: 'Received',
      phoneStatus: 'Empty',
      emailStatus: 'Valid',
      previouslyContactedByPhone: false,
      previouslyContactedByEmail: false,
      previouslyDroppedEmail: false,
      previouslyDroppedPhone: false,
      previouslyUnsubscribedByEmail: false,
      previouslyUnsubscribedByPhone: false,
      previouslyComplainedByEmail: false,
    },
    contactScenario: {
      firstContactedAt: new Date('2021-03-23T16:42:49.678Z'),
      nextCampaignReContactDay: null,
      nextCampaignContact: 'vehicle_inspection_email_2',
      nextCampaignContactDay: 18713,
      lastCampaignContactSent: 'vehicle_inspection_email_1',
      lastCampaignContactSentAt: new Date('2021-03-23T16:42:49.673Z'),
      firstContactByEmailDay: 18709,
      firstContactByPhoneDay: 18709,
      nextCampaignContactEvent: 'CONTACT_SENT',
      nextCampaignContactAt: new Date('2021-03-27T00:00:00.000Z'),
    },
  },
  source: {
    sourceId: ObjectId('605a1a89106b6006e2b2a05c'),
    importedAt: new Date('2021-03-23T16:42:49.388Z'),
    raw: {
      index: 0,
      cells: {
        dateinter: '23/03/2021',
        genre: 'Mr',
        fullName: 'Jean DUBOIS',
        firstName: 'Jean',
        lastName: 'DUBOIS',
        email: 'test@test.com',
        ville: 'Arcueil',
        rue: '44 rue Cauchy',
        cp: '94110',
        marque: 'Renault',
        modele: 'Clio',
        mobilePhone: '',
      },
    },
    type: 'DataFile',
  },
  createdAt: new Date('2021-03-23T16:42:49.395Z'),
  updatedAt: new Date('2021-03-23T16:42:49.693Z'),
  survey: {
    acceptNewResponses: true,
    urls: {
      base: 'http://localhost:3000/s/7952ce9c1df647a39b9d94d5d',
      baseShort: 'http://localhost:3000/n3L3Txbl3',
      mobileLanding: 'http://localhost:3000/m/7952ce9c1df647a39b9d94d5d',
      unsatisfiedLanding: 'http://localhost:3000/u/7952ce9c1df647a39b9d94d5d',
    },
    type: 'VehicleInspection',
    sendAt: new Date('2021-03-23T16:42:49.665Z'),
  },
};
