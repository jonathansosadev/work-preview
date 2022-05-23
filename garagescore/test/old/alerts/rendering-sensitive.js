const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const config = require('config');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const Tools = require('../../../common/lib/test/testtools');
const gsClient = require('../../../common/lib/garagescore/client.js');
const nuxtRender = require('../../../common/lib/garagescore/contact/render');
const AlertTypes = require('../../../common/models/alert.types.js');
const GarageTypes = require('../../../common/models/garage.type.js');

const expect = chai.expect;
const app = new TestApp();

const renderTxtUnsatisfied = async (data) => await nuxtRender.txt('emails/notifications/unsatisfied/body', data);
const renderHtmlUnsatisfied = async (data) => await nuxtRender.html('emails/notifications/unsatisfied/body', data);

describe('Test affichage email sensitive', () => {
  const baseInfos = {
    publicDisplayName: 'Renault Melun',
    thresholds: {
      alertSensitiveThreshold: {
        maintenance: 8,
        sale_new: 8,
        sale_used: 8,
      },
    },
  };
  before(async function () {
    await nuxtRender.setTestMode();
  });
  beforeEach(async function () {
    await app.reset();
  });

  it('test unsatisfied Maintenance', async () => {
    const garage = await app.addGarage(baseInfos);
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(7).submit();
    const datas = await campaign.datas();
    const data = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.SENSITIVE_MAINTENANCE } },
      gsClient,
      config,
    };

    rendered = await renderTxtUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible Atelier à 7/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible Atelier à 7/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');
    expect(rendered).to.contain('Voir le mécontentement');
  });

  it('test unsatisfied Vn / VO', async () => {
    const garage = await app.addGarage(baseInfos);
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(7.5).submit();
    const datas = await campaign.datas();
    const data2 = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.SENSITIVE_VN } },
      gsClient,
      config,
    };

    /* Test for vahicule Sale survey */
    rendered = await renderTxtUnsatisfied(data2);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible V.Neuf à 7,5/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');

    rendered = await renderHtmlUnsatisfied(data2);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible V.Neuf à 7,5/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');
    expect(rendered).to.contain('Voir le mécontentement');
  });

  it('test unsatisfied Maintenance with lead', async () => {
    const garage = await app.addGarage(baseInfos);
    let rendered;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(8).submit();
    const datas = await campaign.datas();
    const data = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD } },
      gsClient,
      config,
    };

    rendered = await renderTxtUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible Atelier à 8/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('Client sensible Atelier à 8/10');
    expect(rendered).to.contain('supérieure à 6 et inférieure à 8');
    expect(rendered).to.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.contain("Pour gérer vos préférences d'emails");
    expect(rendered).to.contain('(par défaut 6/10)');
    expect(rendered).to.contain('Voir le mécontentement');
  });

  it('test unsatisfied VI', async () => {
    const garage = await app.addGarage({
      type: GarageTypes.VEHICLE_INSPECTION,
      subscriptions: {
        VehicleInspection: {
          enabled: true,
          price: 0,
        },
        active: true,
      },
      ratingType: 'stars',
      thresholds: {
        alertSensitiveThreshold: {
          vehicle_inspection: 8,
        },
      },
    });
    const campaign = await garage.runNewCampaign(dataFileTypes.VEHICLE_INSPECTIONS);
    const survey = await campaign.getSurvey();
    await survey.rate(7).submit();
    const datas = await campaign.datas();
    const data = {
      addressee: Tools.random.user(),
      garage: await garage.getInstance(),
      data: datas[0],
      contact: { payload: { alertType: AlertTypes.SENSITIVE_VI } },
      gsClient,
      config,
    };

    let rendered;
    rendered = await renderTxtUnsatisfied(data);
    //grades should be /5 since the garage is VI and it's rating type is 'stars'
    expect(rendered).to.be.string;
    expect(rendered).to.contain('3,5/5');
    expect(rendered).to.contain('supérieure à 3 et inférieure à 4');
    expect(rendered).to.contain('(par défaut 3/5)');
    //[SGS] : some emails' elements should be removed
    expect(rendered).to.not.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.not.contain("Pour gérer vos préférences d'emails");

    rendered = await renderHtmlUnsatisfied(data);
    expect(rendered).to.be.string;
    expect(rendered).to.contain('3,5/5');
    expect(rendered).to.contain('supérieure à 3 et inférieure à 4');
    expect(rendered).to.contain('(par défaut 3/5)');
    expect(rendered).to.not.contain('Voir le mécontentement');
    expect(rendered).to.not.contain('Rappel sur le protocole de suivi des clients mécontents');
    expect(rendered).to.not.contain("Pour gérer vos préférences d'emails");
  });
});
