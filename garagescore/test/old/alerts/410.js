const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const config = require('config');
const Tools = require('../../../common/lib/test/testtools');
const AlertTypes = require('../../../common/models/alert.types.js');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const leadTimings = require('../../../common/models/data/type/lead-timings');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const nuxtRender = require('../../../common/lib/garagescore/contact/render');
const gsClient = require('../../../common/lib/garagescore/client.js');

const expect = chai.expect;
const app = new TestApp();

const renderTxtUnsatisfied = async (data) => await nuxtRender.txt('emails/notifications/unsatisfied/body', data);
const renderHtmlUnsatisfied = async (data) => await nuxtRender.html('emails/notifications/unsatisfied/body', data);

const testGarage = Tools.random.garage();
testGarage.publicDisplayName = 'Renault Melun';
chai.should();

describe('Test affichage de la note dans le header alerte: unsatisfied', () => {
  let garage = null;

  before(async function () {
    await nuxtRender.setTestMode();
  });
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage();
  });
  it('test unsatisfait Maintenance', async function test() {
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    const datas = await campaign.datas();
    console.log('Rating: ', datas[0] && datas[0].review && datas[0].review.rating && datas[0].review.rating.value);
    const data = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.UNSATISFIED_MAINTENANCE } },
      gsClient,
      config,
    };

    rendered = await renderTxtUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent Atelier à 2/10');

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent Atelier à 2/10');
  });

  it('test unsatisfait Vn / VO', async () => {
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(2.1).submit();
    const datas = await campaign.datas();
    const data2 = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.UNSATISFIED_VN } },
      gsClient,
      config,
    };

    /* Test for vahicule Sale survey */
    rendered = await renderTxtUnsatisfied(data2);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent V.Neuf à 2,1/10');

    rendered = await renderHtmlUnsatisfied(data2);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent V.Neuf à 2,1/10');
  });

  it('test unsatisfait Maintenance with lead', async () => {
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2.1).setLead(LeadTypes.INTERESTED, leadTimings.MID_TERM, LeadSaleTypes.NEW_VEHICLE_SALE).submit();
    const datas = await campaign.datas();
    const data = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.UNSATISFIED_MAINTENANCE_WITH_LEAD } },
      gsClient,
      config,
    };

    rendered = await renderTxtUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent Atelier à 2,1/10');

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client mécontent Atelier à 2,1/10');
  });
});
