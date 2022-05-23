const chai = require('chai');
const gql = require('graphql-tag');
const { ObjectId } = require('mongodb');
const TestApp = require('../../../common/lib/test/test-app');
const createTestClient = require('../../../server/webservers-standalones/api/create-test-client');
const expect = chai.expect;
const app = new TestApp();

describe('KPI source leads', async function () {
  beforeEach(async function () {
    await app.reset();
    // create authorization
    const user = await app.addUser({
      email: 'bbodrefaux@garagescore.com',
      authorization: {
        ACCESS_TO_COCKPIT: true,
        ACCESS_TO_SATISFACTION: true,
        ACCESS_TO_UNSATISFIED: true,
        ACCESS_TO_LEADS: true,
        ACCESS_TO_CONTACTS: true,
        ACCESS_TO_E_REPUTATION: true,
        ACCESS_TO_ESTABLISHMENT: true,
        ACCESS_TO_TEAM: true,
        ACCESS_TO_ADMIN: true,
        ACCESS_TO_DARKBO: true,
        ACCESS_TO_GREYBO: true,
        WIDGET_MANAGEMENT: true,
        ACCESS_TO_WELCOME: true,
      },
      godMode: true,
      isPerfMan: true,
      isBizDev: true,
    });
    // create token
    let accessToken = await app.models.AccessToken.create({
      ttl: 9999999999,
      created: new Date(),
      userId: user.id,
    });

    // create garage for test
    let garage = await app.models.Garage.create({
      type: 'Dealership',
      slug: 'nc',
      publicDisplayName: 'Smart Etoile 10 Troyes',
      securedDisplayName: 'Smart Etoile 10 Troyes',
      brandNames: ['Audi'],
      ratingType: 'rating',
      certificateWording: 'appointment',
      hideDirectoryPage: true,
      disableAutoAllowCrawlers: false,
      updateFrequency: 'never',
      status: 'Stopped',
      group: 'Chopard',
      enrichScriptEnabled: false,
      automaticBillingBillNow: false,
      postOnGoogleMyBusiness: true,
      locale: 'fr_FR',
      timezone: 'Europe/Paris',
    });
    var garage2 = await app.models.Garage.create({
      type: 'Dealership',
      slug: 'nc',
      publicDisplayName: 'Smart Etoile 10 Troyes',
      securedDisplayName: 'Smart Etoile 10 Troyes',
      brandNames: ['Audi'],
      ratingType: 'rating',
      certificateWording: 'appointment',
      hideDirectoryPage: true,
      disableAutoAllowCrawlers: false,
      updateFrequency: 'never',
      status: 'Stopped',
      group: 'Chopard',
      enrichScriptEnabled: false,
      automaticBillingBillNow: false,
      postOnGoogleMyBusiness: true,
      locale: 'fr_FR',
      timezone: 'Europe/Paris',
    });
    // create document kpiByperiod for test
    const kpiByPeriod = {
      0: ObjectId(garage.id),
      2: 12,
      4: 10,
      6: 0,
      1001: 7,
      1003: 5,
      1010: 2,
      1017: 7,
      1018: 5,
      1019: 5,
      1021: 2,
      1023: 2,
      1024: 1,
      3: 0,
    };
    await app.models.KpiByPeriod.create(kpiByPeriod);

    const request = `
    query kpiByPeriodSourceList ($kpiByPeriodSourceList0periodId: String,$garageId: [String],$kpiByPeriodSourceList0cockpitType: String,$kpiByPeriodSourceList0sort: String,$kpiByPeriodSourceList0order: String) {
      kpiByPeriodSourceList (periodId: $kpiByPeriodSourceList0periodId,garageId: $garageId,cockpitType: $kpiByPeriodSourceList0cockpitType,sort: $kpiByPeriodSourceList0sort,order: $kpiByPeriodSourceList0order) {
        sourceType
        countLeads
        countLeadsUntouched
        countLeadsTouched
        countLeadsClosedWithSale
        countLeadsReactive
        }
     }
    `;

    this.currentTest.data = { user, garage,garage2, accessToken, request }
  });


  it('it should send apollo request and return kpiByPeriodSourceList', async function() {
    try {
      const { user, garage, accessToken: { id: authToken }, request } = this.test.data;

      // apollo variables
      const variablesApollo = {
        kpiByPeriodSourceList0cockpitType: 'Dealership',
        garageId: null,
        kpiByPeriodSourceList0order: 'DESC',
        kpiByPeriodSourceList0periodId: 'lastQuarter',
        kpiByPeriodSourceList0sort: 'countLeads',
      };
      // send query
      const { query: apolloQuery } = createTestClient(app, {
        req: { headers: { authorization: `Bearer ${authToken}` } },
      });
      const queryRes = await apolloQuery({ query: gql(request), variables: variablesApollo });
      // result
      expect(queryRes.data.kpiByPeriodSourceList).not.null;
    } catch (err) {
      console.log(err);
    }
  });
  it('it should send apollo request and return kpiByPeriodSourceList with one garage', async function() {
    const { user, garage, accessToken: { id: authToken }, request } = this.test.data;

    try {
      // apollo variables
      const variablesApollo = {
        kpiByPeriodSourceList0cockpitType: 'Dealership',
        garageId: [garage.id.toString()],
        kpiByPeriodSourceList0order: 'DESC',
        kpiByPeriodSourceList0periodId: 'lastQuarter',
        kpiByPeriodSourceList0sort: 'countLeads',
      };
      // send query
      const { query: apolloQuery } = createTestClient(app, {
        req: { headers: { authorization: `Bearer ${authToken}` } },
      });
      const queryRes = await apolloQuery({ query: gql(request), variables: variablesApollo });
      // result
      expect(queryRes.data.kpiByPeriodSourceList).not.null;
    } catch (err) {
      console.log(err);
    }
  });
  it('it should send apollo request and return kpiByPeriodSourceList with a list of garages', async function() {
    const { user, garage,garage2, accessToken: { id: authToken }, request } = this.test.data;

    try {
      // apollo variables
      const variablesApollo = {
        kpiByPeriodSourceList0cockpitType: 'Dealership',
        garageId: [garage.id.toString(),garage2.id.toString()],
        kpiByPeriodSourceList0order: 'DESC',
        kpiByPeriodSourceList0periodId: 'lastQuarter',
        kpiByPeriodSourceList0sort: 'countLeads',
      };
      // send query
      const { query: apolloQuery } = createTestClient(app, {
        req: { headers: { authorization: `Bearer ${authToken}` } },
      });
      const queryRes = await apolloQuery({ query: gql(request), variables: variablesApollo });
      // result
      expect(queryRes.data.kpiByPeriodSourceList).not.null;
    } catch (err) {
      console.log(err);
    }
  });
});
