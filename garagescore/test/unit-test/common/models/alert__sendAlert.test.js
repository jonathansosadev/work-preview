const TestApp = require('../../../../common/lib/test/test-app');
const chai = require('chai');
const sinon = require('sinon');

const DataBuilder = require('../../../../common/lib/test/test-instance-factory/data-builder');
const DataFileTypes = require('../../../../common/models/data-file.data-type');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const AlertType = require('../../../../common/models/alert.types');

const expect = chai.expect;
const app = new TestApp();

describe('Send Alert', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('Should not break if email is malformed', async () => {
    const alert = await app.models.Alert.create({ type: AlertType.UNSATISFIED_VO });
    const garage = await app.addGarage({});
    const data = await new DataBuilder(app)
      .garage(garage.id.toString())
      .type(DataFileTypes.MAINTENANCES)
      .source(SourceTypes.DATAFILE)
      .create();
    const users = await Promise.all([app.models.User.create({ email: 'user@gmail.com5', password: '12345678' })]);

    var callback = sinon.spy();

    await new Promise((res) =>
      app.models.Alert.sendAlert(alert, data, users, (...args) => {
        callback(...args);
        res();
      })
    );

    expect(callback.calledWith(null)).to.be.true;
  });
});
