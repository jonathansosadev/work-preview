const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();

const kpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const kpiEncoder = require('../../../common/lib/garagescore/kpi/KpiEncoder');

describe('KpiEncoder', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('KpiEncoder - Should encode correctly an Object', async function test() {
    const obj = { garageId: 'foo', period: 42, or: [{ countLeads: 66 }, { countLeads: 99 }] };
    const obj2 = { garageId: 'foo', period: 42, garageType: 0, countLeads: 0 };

    kpiEncoder.encodeObject(obj, false); // Simulate a 'find'
    // Fields should have disappeared, expect for the 'or'
    expect(obj.garageId).to.be.undefined;
    expect(obj.period).to.be.undefined;
    expect(obj.or).to.exist;
    expect(obj.or[0].countLeads).to.be.undefined;
    expect(obj.or[1].countLeads).to.be.undefined;
    // New encoded fields should have appeared
    expect(obj[kpiDictionary.garageId]).to.equals('foo');
    expect(obj[kpiDictionary.period]).to.equals(42);
    expect(obj.or[0][kpiDictionary.countLeads]).to.equals(66);
    expect(obj.or[1][kpiDictionary.countLeads]).to.equals(99);

    kpiEncoder.encodeObject(obj2, true); // Simulate a 'create'
    // Fields should have disappeared
    expect(obj2.garageId).to.be.undefined;
    expect(obj2.period).to.be.undefined;
    expect(obj2.garageType).to.be.undefined;
    expect(obj2.countLeads).to.be.undefined;
    // New encoded fields should have appeared, expect for fields equal to zero and unprotected (see kpiEncoder)
    expect(obj2[kpiDictionary.garageId]).to.equals('foo');
    expect(obj2[kpiDictionary.period]).to.equals(42);
    expect(obj2[kpiDictionary.garageType]).to.equals(0);
    expect(obj2[kpiDictionary.countLeads]).to.be.undefined;
  });

  it('KpiEncoder - Should decode correctly an Object', async function test() {
    const obj = { [kpiDictionary.garageId]: 'foo', [kpiDictionary.countLeads]: 42 };

    kpiEncoder.decodeObj(obj);
    // Fields should have disappeared
    expect(obj[kpiDictionary.garageId]).to.be.undefined;
    expect(obj[kpiDictionary.countLeads]).to.be.undefined;
    expect(obj.garageId).to.equals('foo');
    expect(obj.countLeads).to.equals(42);
  });
});
