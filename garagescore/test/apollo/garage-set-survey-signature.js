const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Garage set status', () => {
  const request = `mutation garageSetSurveySignature($modifications: [garageSetSurveySignatureModifications!]!) {
    garageSetSurveySignature(modifications: $modifications) {
      status
      message
      modifiedGarages {
        id
        surveySignature {
          useDefault
          defaultSignature {
            lastName
            firstName
            job
          }
          Maintenance {
            lastName
            firstName
            job
          }
          NewVehicleSale {
            lastName
            firstName
            job
          }
          UsedVehicleSale {
            lastName
            firstName
            job
          }
        }
      }
    }
  }`;
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Set garage surveySignature', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();
    const garageId = garageInstance.getId().toString();
    const newSurveySignature = {
      defaultSignature: {
        lastName: 'Ibrahimović',
        firstName: 'Zlatan',
        job: 'Zlataneur de Leads',
      },
    };
    const variables = { modifications: [{ garageId, surveySignature: newSurveySignature }] };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status, message, modifiedGarages } = res.data.garageSetSurveySignature;
    expect(status).equal(200);
    expect(message).equal('OK');
    expect(modifiedGarages).to.be.an('Array').and.to.have.lengthOf(1);
    expect(modifiedGarages[0].id).to.equal(garageId);
    expect(modifiedGarages[0].surveySignature).not.to.be.undefined;
    expect(modifiedGarages[0].surveySignature.defaultSignature).not.to.be.undefined;

    const { lastName, firstName, job } = modifiedGarages[0].surveySignature.defaultSignature;
    expect(lastName).to.equal('Ibrahimović');
    expect(firstName).to.equal('Zlatan');
    expect(job).to.equal('Zlataneur de Leads');

    garageInstance = await testGarage.getInstance();
    expect(garageInstance.surveySignature).not.to.be.undefined;
    expect(garageInstance.surveySignature.defaultSignature).not.to.be.undefined;
    const {
      lastName: lastNameDb,
      firstName: firstNameDb,
      job: jobDb,
    } = garageInstance.surveySignature.defaultSignature;
    expect(lastNameDb).to.equal('Ibrahimović');
    expect(firstNameDb).to.equal('Zlatan');
    expect(jobDb).to.equal('Zlataneur de Leads');
  });
  it('works if we change useDefault only', async () => {
    const testGarage = await testApp.addGarage({
      surveySignature: {
        useDefault: false,
        defaultSignature: {
          lastName: 'Ibrahimović',
          firstName: 'Zlatan',
          job: 'Zlataneur de Leads',
        },
        Maintenance: {
          lastName: 'MacGyver',
          firstName: 'Angus',
          job: 'Roi de la clé de 12',
        },
      },
    });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();
    const garageId = garageInstance.getId().toString();
    let variables = { modifications: [{ garageId, surveySignature: { useDefault: true } }] };
    let res = await _sendQueryAs(testApp, request, variables, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status, message, modifiedGarages } = res.data.garageSetSurveySignature;
    expect(status).equal(200);
    expect(message).equal('OK');
    expect(modifiedGarages).to.be.an('Array').and.to.have.lengthOf(1);
    expect(modifiedGarages[0].id).to.equal(garageId);
    expect(modifiedGarages[0].surveySignature).not.to.be.undefined;
    expect(modifiedGarages[0].surveySignature.useDefault).to.be.true;

    garageInstance = await testGarage.getInstance();
    expect(garageInstance.surveySignature).not.to.be.undefined;
    expect(garageInstance.surveySignature.useDefault).to.be.true;

    variables = { modifications: [{ garageId, surveySignature: { useDefault: true } }] };
    res = await _sendQueryAs(testApp, request, variables, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status: status2, message: message2, modifiedGarages: modGarages2 } = res.data.garageSetSurveySignature;
    expect(status2).equal(200);
    expect(message2).equal('OK');
    expect(modGarages2).to.be.an('Array').and.to.have.lengthOf(1);
    expect(modGarages2[0].id).to.equal(garageId);
    expect(modGarages2[0].surveySignature).not.to.be.undefined;
    expect(modGarages2[0].surveySignature.useDefault).to.be.true;
  });
  it("is not affected if the previous surveySignature wasn't filled before", async () => {
    const testGarage = await testApp.addGarage({ surveySignature: {} });
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();
    const garageId = garageInstance.getId().toString();
    const newSurveySignature = {
      useDefault: false,
      Maintenance: {
        lastName: 'MacGyver',
        firstName: 'Angus',
        job: 'Roi des bricoleurs',
      },
    };
    const variables = { modifications: [{ garageId, surveySignature: newSurveySignature }] };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status, message, modifiedGarages } = res.data.garageSetSurveySignature;
    expect(status).equal(200);
    expect(message).equal('OK');
    expect(modifiedGarages).to.be.an('Array').and.to.have.lengthOf(1);
    expect(modifiedGarages[0].id).to.equal(garageId);
    expect(modifiedGarages[0].surveySignature).not.to.be.undefined;
    expect(modifiedGarages[0].surveySignature.useDefault).to.be.false;
    expect(modifiedGarages[0].surveySignature.Maintenance).not.to.be.undefined;

    const { lastName, firstName, job } = modifiedGarages[0].surveySignature.Maintenance;
    expect(lastName).to.equal('MacGyver');
    expect(firstName).to.equal('Angus');
    expect(job).to.equal('Roi des bricoleurs');

    garageInstance = await testGarage.getInstance();
    expect(garageInstance.surveySignature).not.to.be.undefined;
    expect(garageInstance.surveySignature.useDefault).to.be.false;
    expect(garageInstance.surveySignature.Maintenance).not.to.be.undefined;
    const { lastName: lastNameDb, firstName: firstNameDb, job: jobDb } = garageInstance.surveySignature.Maintenance;
    expect(lastNameDb).to.equal('MacGyver');
    expect(firstNameDb).to.equal('Angus');
    expect(jobDb).to.equal('Roi des bricoleurs');
  });
  it('can set survey signature for several garages at once', async () => {
    const garage1 = await testApp.addGarage();
    const garage2 = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(garage1);
    await user.addGarage(garage2);

    const garage1Instance = await garage1.getInstance();
    const garage2Instance = await garage2.getInstance();

    const modifications = [
      {
        garageId: garage1Instance.getId().toString(),
        surveySignature: {
          useDefault: false,
          NewVehicleSale: {
            lastName: 'Ibrahimović',
            firstName: 'Zlatan',
            job: 'Zlataneur de Leads',
          },
        },
      },
      {
        garageId: garage2Instance.getId().toString(),
        surveySignature: {
          useDefault: true,
          defaultSignature: {
            lastName: 'MacGyver',
            firstName: 'Angus',
            job: 'Roi des bricoleurs',
          },
        },
      },
    ];
    const res = await _sendQueryAs(testApp, request, { modifications }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status, message, modifiedGarages } = res.data.garageSetSurveySignature;
    expect(status).equal(200);
    expect(message).equal('OK');
    expect(modifiedGarages).to.be.an('Array').and.to.have.lengthOf(2);
    // Check garage 1
    const modifiedGarage1 = modifiedGarages.find(({ id }) => id === garage1Instance.getId().toString());
    expect(modifiedGarage1).not.to.be.undefined.and.not.to.be.null;
    expect(modifiedGarage1.surveySignature).not.to.be.undefined;
    expect(modifiedGarage1.surveySignature.useDefault).to.be.false;
    expect(modifiedGarage1.surveySignature.NewVehicleSale).not.to.be.undefined;
    const { lastName: lastName1, firstName: firstName1, job: job1 } = modifiedGarage1.surveySignature.NewVehicleSale;
    expect(lastName1).to.equal('Ibrahimović');
    expect(firstName1).to.equal('Zlatan');
    expect(job1).to.equal('Zlataneur de Leads');
    // Check garage 2
    const modifiedGarage2 = modifiedGarages.find(({ id }) => id === garage2Instance.getId().toString());
    expect(modifiedGarage2).not.to.be.undefined.and.not.to.be.null;
    expect(modifiedGarage2.surveySignature).not.to.be.undefined;
    expect(modifiedGarage2.surveySignature.useDefault).to.be.true;
    expect(modifiedGarage2.surveySignature.defaultSignature).not.to.be.undefined;
    const { lastName: lastName2, firstName: firstName2, job: job2 } = modifiedGarage2.surveySignature.defaultSignature;
    expect(lastName2).to.equal('MacGyver');
    expect(firstName2).to.equal('Angus');
    expect(job2).to.equal('Roi des bricoleurs');
  });

  it('can set survey signature only for our scope', async () => {
    const garage1 = await testApp.addGarage();
    // This garage is not in our scope, we mustn't be able to change its surveySignature
    const garage2 = await testApp.addGarage({
      surveySignature: {
        useDefault: true,
        defaultSignature: { lastName: 'Hammer', firstName: 'MC', job: "Can't touch this" },
      },
    });
    const user = await testApp.addUser();
    await user.addGarage(garage1);

    const garage1Instance = await garage1.getInstance();
    const garage2Instance = await garage2.getInstance();

    const modifications = [
      {
        garageId: garage1Instance.getId().toString(),
        surveySignature: {
          useDefault: false,
          NewVehicleSale: {
            lastName: 'Ibrahimović',
            firstName: 'Zlatan',
            job: 'Zlataneur de Leads',
          },
        },
      },
      {
        garageId: garage2Instance.getId().toString(),
        surveySignature: {
          useDefault: false,
          defaultSignature: {
            lastName: 'MacGyver',
            firstName: 'Angus',
            job: 'Roi des bricoleurs',
          },
          Maintenance: {
            lastName: 'MacGyver',
            firstName: 'Angus',
            job: 'Roi des bricoleurs',
          },
        },
      },
    ];
    const res = await _sendQueryAs(testApp, request, { modifications }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetSurveySignature).to.not.be.undefined;

    const { status, message, modifiedGarages } = res.data.garageSetSurveySignature;
    expect(status).equal(200);
    expect(message).equal('OK');
    expect(modifiedGarages).to.be.an('Array').and.to.have.lengthOf(1);
    expect(modifiedGarages[0].id).to.equal(garage1Instance.getId().toString());

    const garage2After = await garage2.getInstance();
    expect(garage2After.surveySignature).not.to.be.undefined;
    expect(garage2After.surveySignature.useDefault).to.be.true;
    expect(garage2After.surveySignature.defaultSignature).not.to.be.undefined;
    expect(garage2After.surveySignature.Maintenance).to.be.undefined;
    const { lastName, firstName, job } = garage2After.surveySignature.defaultSignature;
    expect(lastName).to.equal('Hammer');
    expect(firstName).to.equal('MC');
    expect(job).to.equal("Can't touch this");
  });
});
