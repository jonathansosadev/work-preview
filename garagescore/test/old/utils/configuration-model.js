const testTools = require('../../../common/lib/test/testtools');

testTools.useMemoryDB();
const app = require('../../../server/server');
const chai = require('chai');

const expect = chai.expect;

/**
 *Dynamic setters and getters with app.models.Configuration
 */
describe('Dynamic setters and getters with app.models.Configuration', () => {
  it('Undefined field return null', (done) => {
    app.models.Configuration.getMaintenanceMode((e, value) => {
      expect(value).to.be.null;
      done();
    });
  });
  it('Set and Get a field', (done) => {
    app.models.Configuration.setMaintenanceMode(true, () => {
      app.models.Configuration.getMaintenanceMode((e, value) => {
        expect(value).to.be.true;
        app.models.Configuration.getMaintenanceMode(false, (e2, value2) => {
          expect(value2).to.be.true;
          done();
        });
      });
    });
  });
});
