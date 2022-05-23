const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const expect = chai.expect;
const app = new TestApp();
const {
  generateHeaders,
  generateLines,
  getLocaleDisplayName,
  getBrandNames,
  handleSubSetup,
  handleSubTypes,
  handleSubUsers,
  handleSubContacts,
  getPerformerEmail,
  getBizDevEmail,
} = require('../../../common/lib/garagescore/exports/garages.js');
const { _checkIfDateDefined } = require('../../../common/lib/garagescore/exports/utils.js');
const HEADERS = require('../../../common/lib/garagescore/exports/garages-headers');
const GarageTypes = require('../../../common/models/garage.type');

const garages = [
  {
    type: 'Dealership',
    publicDisplayName: 'Europe Motors (Opel Brest)',
    brandNames: ['Opel'],
    streetAddress: '3 Rue du Commandant Yves Mindren',
    postalCode: '29200',
    city: 'Brest',
    subscriptions: {
      priceValidated: true,
      Maintenance: { enabled: true, price: 38.055, date: null },
      NewVehicleSale: { enabled: true, price: 12.5775, date: null },
      UsedVehicleSale: { enabled: true, price: 12.5775, date: null },
      Lead: { enabled: true, price: 25.155, date: null },
      EReputation: { enabled: true, price: 19, date: null },
      VehicleInspection: { enabled: false, price: 1.99, date: null },
      Analytics: { enabled: true, price: 12.255, date: null },
      Coaching: { enabled: true, price: 10, date: null },
      Connect: { enabled: true, price: 20, date: null },
      CrossLeads: {
        enabled: false,
        price: 0,
        included: 0,
        unitPrice: 0,
        restrictMobile: false,
        minutePrice: 0,
        date: null,
      },
      Automation: {
        enabled: true,
        price: 99,
        included: 0,
        every: 0.16,
        date: null,
        userId: '562f4d39baf25619004f6a6d',
      },
      active: true,
      dateStart: new Date('2018-04-05T13:30:09.753Z'),
      dateEnd: null,
      setup: null,
      users: { included: 3, price: 2.5 },
      contacts: { bundle: false, included: 0, every: 0, price: 0.16 },
    },
    annexGarageId: null,
    status: 'RunningAuto',
    group: 'Cobredia',
    businessId: '34766208200010',
    locale: 'fr_FR',
    id: '5609175e70ad25190055d4ff',
    bizDevId: '414141',
    performerId: '424242',
  },
  {
    type: 'Agent',
    group: 'test2',
    status: 'test2',
    businessId: 'test2',
    publicDisplayName: 'test2',
    streetAddress: 'test2',
    postalCode: 'test2',
    city: 'test2',
    annexGarageId: 'test2',
    setup: {
      enabled: true,
    },
    bizDevId: '0000',
    performerId: '0000',
  },
  {
    type: '',
    group: '',
    status: '',
    businessId: '',
    publicDisplayName: '',
    streetAddress: '',
    postalCode: '',
    city: '',
    annexGarageId: '',
  },
  {
    type: null,
    group: null,
    status: null,
    businessId: null,
    publicDisplayName: null,
    streetAddress: null,
    postalCode: null,
    city: null,
    annexGarageId: null,
  },
  {},
];

const performers = [
  { id: '424242', email: 'test@test.com' },
  { id: '12345', email: 'test2@test.com' },
  { id: '54321', email: 'test3@test.com' },
];

const bizDevs = [
  { id: '414141', email: 'test@test.com' },
  { id: '12345', email: 'test2@test.com' },
  { id: '54321', email: 'test3@test.com' },
];

function getLines() {
  let result = generateLines(garages, performers, bizDevs).split('\r');
  result.pop();
  return result;
}

function getColumnIndex(columnName) {
  const index = HEADERS.findIndex((el) => el === columnName);
  if (index === -1) expect.fail('-1', 'index >= 0', `The column ${columnName} was not found`);
  return index;
}

describe('garages export to csv', () => {
  beforeEach(async () => {
    await app.reset();
  });
  it('headers must always end with a \\r', () => {
    expect(generateHeaders().slice(-1)).to.equal('\r');
  });
  it('should return the headers in csv format based on the headers model', () => {
    const expected = `${HEADERS.join(';')};\r`;
    expect(generateHeaders()).to.equal(expected);
  });

  it('each line should have the same amount of headers as headers-model even if garage is empty', () => {
    const expected = HEADERS.length;
    garages.forEach((garage) => {
      const actual = generateLines([garage]).split(';').length - 1;
      expect(actual).to.equal(expected);
    });
  });

  it('a line must always end with a \\r', () => {
    garages.forEach((garage) => {
      expect(generateLines([garage]).slice(-1)).to.equal('\r');
    });
  });

  it("each field should be set at the default value 'Non renseigné' if it's missing", () => {
    const emptyGarage = {};
    const actual = generateLines([emptyGarage]).split(';');
    const valid = ['Oui', 'Non', 'Non renseigné'];
    actual.pop();
    const test = actual.every((el) => valid.includes(el));
    expect(test).to.equal(true);
  });

  it('Column : Type', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Type');

    lines.forEach((line, i) => {
      const originalType = garages[i].type;
      const processedType = line.split(';')[columnIndex];
      expect(processedType).to.equal(GarageTypes.displayName(originalType) || 'Non renseigné');
    });
  });

  it('Columns : Groupe ,Statut branchement, Siret, Nom, Adresse postale, Code postal, Ville, Etabl. de rattachement', () => {
    const names = [
      'Groupe',
      'Statut branchement',
      'Siret',
      'Nom',
      'Adresse postale',
      'Code postal',
      'Ville',
      'Etabl. de rattachement',
    ];
    const keys = [
      'group',
      'status',
      'businessId',
      'publicDisplayName',
      'streetAddress',
      'postalCode',
      'city',
      'annexGarageId',
    ];
    const lines = getLines();
    keys.forEach((key, index) => {
      const columnIndex = getColumnIndex(names[index]);
      lines.forEach((line, i) => {
        const original = garages[i][key];
        const processed = line.split(';')[columnIndex];

        expect(processed).to.equal(original || 'Non renseigné');
      });
    });
  });

  it('Column : Langue', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Langue');

    lines.forEach((line, i) => {
      const original = garages[i].locale;
      const processed = line.split(';')[columnIndex];
      expect(processed).to.equal(getLocaleDisplayName(original) || 'Non renseigné');
    });
  });

  it('Column : Miroir', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Miroir');

    lines.forEach((line, i) => {
      const original = garages[i].annexGarageId;
      const processed = line.split(';')[columnIndex];
      if (original) expect(processed).to.equal('Oui');
      else expect(processed).to.equal('Non' || 'Non renseigné');
    });
  });

  it('Column : Date démarrage abonnement', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Date démarrage abonnement');

    lines.forEach((line, i) => {
      const { subscriptions = {} } = garages[i];
      const original = subscriptions.dateStart;
      const processed = line.split(';')[columnIndex];

      expect(processed).to.equal(_checkIfDateDefined(original));
    });
  });

  it('Column : Marques certificats', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Marques certificats');

    lines.forEach((line, i) => {
      const processed = line.split(';')[columnIndex];

      expect(processed).to.equal(getBrandNames(garages[i]));
    });
  });

  it('Column : Performance Manager', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Performance Manager');

    lines.forEach((line, i) => {
      const processed = line.split(';')[columnIndex];
      const computed = getPerformerEmail(garages[i].performerId, performers);

      expect(processed).to.equal(computed);

      switch (garages[i].performerId) {
        case '424242':
          expect(computed).to.equal('test@test.com');
          break;
        case '0000':
          expect(computed).to.equal('Invalide');
          break;
        default:
          expect(computed).to.equal('Non renseigné');
          break;
      }
    });
  });

  it('Column : Business Dev', () => {
    const lines = getLines();
    const columnIndex = getColumnIndex('Business Dev');

    lines.forEach((line, i) => {
      const processed = line.split(';')[columnIndex];
      const computed = getBizDevEmail(garages[i].bizDevId, bizDevs);

      expect(processed).to.equal(computed);

      switch (garages[i].bizDevId) {
        case '414141':
          expect(computed).to.equal('test@test.com');
          break;
        case '0000':
          expect(computed).to.equal('Invalide');
          break;
        default:
          expect(computed).to.equal('Non renseigné');
          break;
      }
    });
  });

  // partie abonnement
  const subscriptionsTests = {
    'ACTIVE-FALSE': {
      subscriptions: {
        active: false,
        setup: null,
        Maintenance: null,
        NewVehicleSale: null,
        UsedVehicleSale: null,
        Lead: null,
        EReputation: null,
        VehicleInspection: null,
        Analytics: null,
        Coaching: null,
        Connect: null,
        CrossLeads: null,
        Automation: null,
        users: null,
        contacts: null,
      },
    },
    'ENABLED-FALSE': {
      subscriptions: {
        active: true,
        setup: null,
        Maintenance: { enabled: false, price: null, date: new Date('2018-04-05T13:30:09.753Z') },
        NewVehicleSale: { enabled: false, price: null, date: new Date('2018-04-05T13:30:09.753Z') },
        UsedVehicleSale: { enabled: false, price: null, date: new Date('2018-04-05T13:30:09.753Z') },
        Lead: { enabled: false, price: 25.155, date: new Date('2018-04-05T13:30:09.753Z') },
        EReputation: { enabled: false, price: 19, date: new Date('2018-04-05T13:30:09.753Z') },
        VehicleInspection: { enabled: false, price: 1.99, date: new Date('2018-04-05T13:30:09.753Z') },
        Analytics: { enabled: false, price: 12.255, date: new Date('2018-04-05T13:30:09.753Z') },
        Coaching: { enabled: false, price: 10, date: new Date('2018-04-05T13:30:09.753Z') },
        Connect: { enabled: false, price: 20, date: new Date('2018-04-05T13:30:09.753Z') },
        CrossLeads: {
          enabled: false,
          price: 0,
          included: 0,
          unitPrice: 0,
          restrictMobile: false,
          minutePrice: 0,
          date: new Date('2018-04-05T13:30:09.753Z'),
        },
        Automation: {
          enabled: false,
          price: 99,
          included: 0,
          every: 0.16,
          date: new Date('2018-04-05T13:30:09.753Z'),
          userId: '562f4d39baf25619004f6a6d',
        },
        users: null,
        contacts: null,
      },
    },
    'SUB-VALID': {
      subscriptions: {
        active: true,
        setup: {
          enabled: true,
          billDate: new Date('2018-04-05T13:30:09.753Z'),
          price: 42,
        },
        Maintenance: { enabled: true, price: 38.055, date: new Date('2018-04-05T13:30:09.753Z') },
        NewVehicleSale: { enabled: true, price: 12.5775, date: new Date('2018-04-05T13:30:09.753Z') },
        UsedVehicleSale: { enabled: true, price: 12.5775, date: new Date('2018-04-05T13:30:09.753Z') },
        Lead: { enabled: true, price: 25.155, date: new Date('2018-04-05T13:30:09.753Z') },
        EReputation: { enabled: true, price: 19, date: new Date('2018-04-05T13:30:09.753Z') },
        VehicleInspection: { enabled: false, price: 1.99, date: new Date('2018-04-05T13:30:09.753Z') },
        Analytics: { enabled: true, price: 12.255, date: new Date('2018-04-05T13:30:09.753Z') },
        Coaching: { enabled: true, price: 10, date: new Date('2018-04-05T13:30:09.753Z') },
        Connect: { enabled: true, price: 20, date: new Date('2018-04-05T13:30:09.753Z') },
        CrossLeads: {
          enabled: true,
          price: 42.42,
          included: 0,
          unitPrice: 1.42,
          restrictMobile: false,
          minutePrice: 0.42,
          date: new Date('2018-04-05T13:30:09.753Z'),
        },
        Automation: {
          enabled: true,
          price: 99.9,
          included: 0,
          every: 0.16,
          date: new Date('2018-04-05T13:30:09.753Z'),
          userId: '562f4d39baf25619004f6a6d',
        },
        users: { included: 3, price: 2.5 },
        contacts: { bundle: false, included: 0, every: 0, price: 0.16 },
      },
    },
  };

  it('Column Subscription : SETUP', () => {
    Object.keys(subscriptionsTests).forEach((key) => {
      const { subscriptions } = subscriptionsTests[key];
      const processed = handleSubSetup(subscriptions);
      switch (key) {
        case 'ACTIVE-FALSE':
          expect(processed).to.equal('Non;Non renseigné;Non renseigné;');
          break;
        case 'ENABLED-FALSE':
          expect(processed).to.equal('Non;Non renseigné;Non renseigné;');
          break;
        case 'SUB-VALID':
          expect(processed).to.equal('Oui;05/04/2018;42;');
          break;
      }
    });
  });

  it("Column Subscription : MAINTENANCE, VÉHICULE NEUF, VÉHICULE D'OCCASION, CONTRÔLE TECHNIQUE, PROJET D'ACHAT, ANALYTICS, E-RÉPUTATION, COACHING, CONNECT", () => {
    Object.keys(subscriptionsTests).forEach((key) => {
      const { subscriptions } = subscriptionsTests[key];
      const processed = handleSubTypes(subscriptions);
      const defaultOutput =
      'Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non renseigné;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;Non;Non renseigné;Non renseigné;';
      const validOutput =
      'Oui;05/04/2018;38,055;Oui;05/04/2018;12,5775;Oui;05/04/2018;12,5775;Non;Non renseigné;Non renseigné;Oui;05/04/2018;25,155;Oui;05/04/2018;12,255;Oui;05/04/2018;19;Oui;05/04/2018;0;99,9;0,16;Oui;05/04/2018;0;42,42;1,42;0,42;Oui;05/04/2018;10;Oui;05/04/2018;20;';
      switch (key) {
        case 'ACTIVE-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'ENABLED-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'SUB-VALID':
          expect(processed).to.equal(validOutput);
          break;
      }
    });
  });

  it('Column Subscription : UTILISATEURS', () => {
    Object.keys(subscriptionsTests).forEach((key) => {
      const { subscriptions } = subscriptionsTests[key];
      const processed = handleSubUsers(subscriptions);
      const defaultOutput = 'Oui;Non renseigné;Non renseigné;';
      const validOutput = 'Oui;3;2,5;';

      switch (key) {
        case 'ACTIVE-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'ENABLED-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'SUB-VALID':
          expect(processed).to.equal(validOutput);
          break;
      }
    });
  });

  it('Column Subscription : CONTACTS', () => {
    Object.keys(subscriptionsTests).forEach((key) => {
      const { subscriptions } = subscriptionsTests[key];
      const processed = handleSubContacts(subscriptions);
      const defaultOutput = 'Oui;Non renseigné;Non renseigné;Non renseigné;';
      const validOutput = 'Oui;Non;0,16;0;';

      switch (key) {
        case 'ACTIVE-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'ENABLED-FALSE':
          expect(processed).to.equal(defaultOutput);
          break;
        case 'SUB-VALID':
          expect(processed).to.equal(validOutput);
          break;
      }
    });
  });
});
