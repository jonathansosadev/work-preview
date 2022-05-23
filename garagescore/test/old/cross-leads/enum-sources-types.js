const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const { expect } = chai;

const app = new TestApp();

describe('Test cross leads enum Source Type', () => {
  beforeEach(async function beforeEach() {
    this.timeout(9999999);
    await app.reset();
  });
  it('it should return isExogenous boolean true', (done) => {
    const result = SourceTypes.isExogenous('Google');
    expect(result).equal(true);
    done();
  });
  it('it should return isExogenous Error, Gogole is not Enum', (done) => {
    try {
      SourceTypes.isExogenous('Gogole');
    } catch (err) {
      expect(err.message).equal('Gogole is not a SourceType Enum');
      done();
    }
  });
  it('it should return isExogenous missing parameter', (done) => {
    try {
      SourceTypes.isExogenous();
    } catch (err) {
      expect(err.message).equal('source argument (ex: Google) is missing');
      done();
    }
  });
  it('it should return getValue enum', (done) => {
    const result = SourceTypes.getValue('lacentrale');
    expect(result).equal('LaCentrale');
    done();
  });
  it('it should return canHaveALeadOrUnsatisfiedTicket enum', (done) => {
    const result = SourceTypes.canHaveALeadOrUnsatisfiedTicket();
    expect(result.length).above(0);
    expect(result.includes('LaCentrale')).equal(true);
    done();
  });
  it('it should return supportedCrossLeadsSources enum', (done) => {
    const result = SourceTypes.supportedCrossLeadsSources();
    expect(result.length).above(0);
    expect(result.includes('Google')).equal(false);
    expect(result.includes('LaCentrale')).equal(true);
    done();
  });
  it('it should return getCategory enum', (done) => {
    const result = SourceTypes.getCategory('LaCentrale');
    expect(result).equal('XLEADS');
    done();
  });
  it('it should return saleType enum', (done) => {
    const result = SourceTypes.saleType('LaCentrale');
    expect(result).equal('UsedVehicleSale');
    done();
  });
  it('it should return typeToInt enum', (done) => {
    const result = SourceTypes.typeToInt('LaCentrale');
    expect(result).equal(101);
    done();
  });
  it('it should return intToType enum', (done) => {
    const result = SourceTypes.intToType(101);
    expect(result).equal('LaCentrale');
    done();
  });
});
