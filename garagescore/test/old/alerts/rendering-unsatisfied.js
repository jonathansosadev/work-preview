const chai = require('chai');
const config = require('config');
const TestApp = require('../../../common/lib/test/test-app');
const Tools = require('../../../common/lib/test/testtools');
const AlertTypes = require('../../../common/models/alert.types.js');
const gsClient = require('../../../common/lib/garagescore/client.js');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const nuxtRender = require('../../../common/lib/garagescore/contact/render');

const expect = chai.expect;
const app = new TestApp();

const renderTxtUnsatisfied = async (data) => await nuxtRender.txt('emails/notifications/unsatisfied/body', data);
const renderHtmlUnsatisfied = async (data) => await nuxtRender.html('emails/notifications/unsatisfied/body', data);

describe('Rendering Unsatisfied:', () => {
  let garage;
  before(async () => {
    await nuxtRender.setTestMode();
  });
  beforeEach(async function () {
    await app.reset();
    garage = await app.addGarage();
  });

  it('test Négatif comment mail render', async () => {
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const datas = await campaign.datas();
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
    expect(rendered).to.contain(datas[0].get('customer.fullName.value'));

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain(datas[0].get('customer.fullName.value'));

    /* Test for vahicule Sale survey */

    const campaign2 = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey2 = await campaign2.getSurvey();
    await survey2.rate(0).submit();
    const datas2 = await campaign.datas();
    const data2 = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas2[0],
      contact: { payload: { alertType: AlertTypes.UNSATISFIED_VN } },
      gsClient,
      config,
    };

    rendered = await renderTxtUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain(datas2[0].get('customer.fullName.value'));

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain(datas[0].get('customer.fullName.value'));
  });
});
