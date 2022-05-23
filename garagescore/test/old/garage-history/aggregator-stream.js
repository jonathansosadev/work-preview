const TestApp = require('../../../common/lib/test/test-app');
const TestStream = require('../../../common/lib/test/test-app/test-stream.js');
const GarageHistoryAggregatorStream = require('../../../common/lib/garagescore/garage-history/aggregator-stream');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line
// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();
let Data = null;
/**
 * Test the model garageHistory aggregotor
 * The source is Data Models
 * The result is a garageHistory instance
 */
describe('GarageHistory aggregation stream:', () => {
  // to catch the rejection we need to return the should.be` => as many test as 'shoulds'
  // https://github.com/domenic/chai-as-promised/issues/173
  beforeEach(async function () {
    await app.reset();
    Data = app.models.Data;
  });
  it('generate data EmailStatus Empty', async () => {
    const dataArray = [];
    const data = await Data.create({ garageId: '12345678', type: 'Maintenance', source: 'toto', rawSource: {} });
    data.campaign_generateEmailStatus();
    data.campaign_generatePhoneStatus();
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('Empty');
    dataArray.push(data);
    const data2 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: { isEmpty: true },
        },
      },
    });
    data2.campaign_generateEmailStatus();
    data2.campaign_generatePhoneStatus();
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.emailStatus).equal('Empty');
    dataArray.push(data2);
    const data3 = await Data.create({
      garageId: '12345678',
      type: 'Maintenance',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: false,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
    });
    data3.campaign_generateEmailStatus();
    data3.campaign_generatePhoneStatus();
    expect(data3.campaign.contactStatus).to.not.be.undefined;
    expect(data3.campaign.contactStatus.emailStatus).equal('Wrong');
    dataArray.push(data3);
    const data4 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isDropped: true,
          },
        },
      },
    });
    data4.campaign_generateEmailStatus();
    data4.campaign_generatePhoneStatus();
    expect(data4.campaign.contactStatus).to.not.be.undefined;
    expect(data4.campaign.contactStatus.emailStatus).equal('Dropped');
    dataArray.push(data4);
    const data5 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
    });
    data5.campaign_generateEmailStatus();
    data5.campaign_generatePhoneStatus();
    expect(data5.campaign.contactStatus).to.not.be.undefined;
    expect(data5.campaign.contactStatus.emailStatus).equal('Valid');
    dataArray.push(data5);
    const data6 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isDropped: false,
          },
        },
      },
    });
    data6.campaign_generateEmailStatus();
    data6.campaign_generatePhoneStatus();
    expect(data6.campaign.contactStatus).to.not.be.undefined;
    expect(data6.campaign.contactStatus.emailStatus).equal('Valid');
    dataArray.push(data6);
    const data7 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyUnsubscribedByEmail: true,
        },
      },
    });
    data7.campaign_generateEmailStatus();
    data7.campaign_generatePhoneStatus();
    expect(data7.campaign.contactStatus).to.not.be.undefined;
    expect(data7.campaign.contactStatus.emailStatus).equal('Unsubscribed');
    dataArray.push(data7);
    const data8 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isUnsubscribed: true,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyUnsubscribedByEmail: false,
        },
      },
    });
    data8.campaign_generateEmailStatus();
    data8.campaign_generatePhoneStatus();
    expect(data8.campaign.contactStatus).to.not.be.undefined;
    expect(data8.campaign.contactStatus.emailStatus).equal('Unsubscribed');
    dataArray.push(data8);
    const data9 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyComplainedByEmail: true,
        },
      },
    });
    data9.campaign_generateEmailStatus();
    data9.campaign_generatePhoneStatus();
    expect(data9.campaign.contactStatus).to.not.be.undefined;
    expect(data9.campaign.contactStatus.emailStatus).equal('Unsubscribed');
    dataArray.push(data9);
    const data10 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isComplained: true,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyComplainedByEmail: false,
        },
      },
    });
    data10.campaign_generateEmailStatus();
    data10.campaign_generatePhoneStatus();
    expect(data10.campaign.contactStatus).to.not.be.undefined;
    expect(data10.campaign.contactStatus.emailStatus).equal('Unsubscribed');
    dataArray.push(data10);
    const data11 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          email: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isComplained: false,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyContactedByEmail: true,
          previouslyComplainedByEmail: false,
        },
      },
    });
    data11.campaign_generateEmailStatus();
    data11.campaign_generatePhoneStatus();
    expect(data11.campaign.contactStatus).to.not.be.undefined;
    expect(data11.campaign.contactStatus.emailStatus).equal('RecentlyContacted');
    dataArray.push(data11);
    const data12 = await Data.create({ garageId: '12345678', type: 'toto', source: 'toto', rawSource: {} });
    data12.campaign_generatePhoneStatus();
    data12.campaign_generateEmailStatus();
    expect(data12.campaign.contactStatus).to.not.be.undefined;
    expect(data12.campaign.contactStatus.phoneStatus).equal('Empty');
    dataArray.push(data12);
    const data13 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          phone: { isEmpty: true },
        },
      },
    });
    data13.campaign_generatePhoneStatus();
    data13.campaign_generateEmailStatus();
    expect(data13.campaign.contactStatus).to.not.be.undefined;
    expect(data13.campaign.contactStatus.phoneStatus).equal('Empty');
    dataArray.push(data13);
    const data14 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: false,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
    });
    data14.campaign_generatePhoneStatus();
    data14.campaign_generateEmailStatus();
    expect(data14.campaign.contactStatus).to.not.be.undefined;
    expect(data14.campaign.contactStatus.phoneStatus).equal('Wrong');
    dataArray.push(data14);
    const data15 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isDropped: true,
          },
        },
      },
    });
    data15.campaign_generatePhoneStatus();
    data15.campaign_generateEmailStatus();
    expect(data15.campaign.contactStatus).to.not.be.undefined;
    expect(data15.campaign.contactStatus.phoneStatus).equal('Wrong');
    dataArray.push(data15);
    const data16 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
    });
    data16.campaign_generatePhoneStatus();
    data16.campaign_generateEmailStatus();
    expect(data16.campaign.contactStatus).to.not.be.undefined;
    expect(data16.campaign.contactStatus.phoneStatus).equal('Valid');
    dataArray.push(data16);
    const data17 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isDropped: false,
          },
        },
      },
    });
    data17.campaign_generatePhoneStatus();
    data17.campaign_generateEmailStatus();
    expect(data17.campaign.contactStatus).to.not.be.undefined;
    expect(data17.campaign.contactStatus.phoneStatus).equal('Valid');
    dataArray.push(data17);
    const data18 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyUnsubscribedByPhone: true,
        },
      },
    });
    data18.campaign_generatePhoneStatus();
    data18.campaign_generateEmailStatus();
    expect(data18.campaign.contactStatus).to.not.be.undefined;
    expect(data18.campaign.contactStatus.phoneStatus).equal('Unsubscribed');
    const data19 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isUnsubscribed: true,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyUnsubscribedByPhone: false,
        },
      },
    });
    data19.campaign_generatePhoneStatus();
    data19.campaign_generateEmailStatus();
    expect(data19.campaign.contactStatus).to.not.be.undefined;
    expect(data19.campaign.contactStatus.phoneStatus).equal('Unsubscribed');
    dataArray.push(data19);
    const data20 = await Data.create({
      garageId: '12345678',
      type: 'toto',
      source: 'toto',
      rawSource: {},
      customer: {
        contact: {
          mobilePhone: {
            value: 'blabla@gs.com',
            isSyntaxOK: true,
            isEmpty: false,
            isValidated: false,
            isComplained: false,
          },
        },
      },
      campaign: {
        contactStatus: {
          previouslyContactedByPhone: true,
          previouslyComplainedByPhone: false,
        },
      },
    });
    data20.campaign_generatePhoneStatus();
    data20.campaign_generateEmailStatus();
    expect(data20.campaign.contactStatus).to.not.be.undefined;
    expect(data20.campaign.contactStatus.phoneStatus).equal('RecentlyContacted');
    dataArray.push(data20);
    const testStream = new TestStream();
    const readStream = testStream.makeReadStream(dataArray);
    const aggregatorStream = new GarageHistoryAggregatorStream({
      generateHistoryDetails: true,
    });
    return new Promise((resolve, reject) => {
      readStream.pipe(aggregatorStream).on('finish', () => {
        const garageHistory = aggregatorStream.getAggregationResult();
        expect(garageHistory).to.not.be.undefined;
        resolve();
      });
      readStream.on('error', (e) => reject(e));
      aggregatorStream.on('error', (e) => reject(e));
    });
  });
});
