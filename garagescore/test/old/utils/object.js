const chai = require('chai');
const ObjectUtil = require('../../../common/lib/util/object');

const expect = chai.expect;

describe('Test Questions 124,132,133,134', () => {
  it('Test getDeepFieldValue', (done) => {
    const myObject = {
      a: {
        b: { c: 5 },
        g: { k: false, l: 0 },
      },
      d: 6,
      f: null,
    };
    expect(ObjectUtil.getDeepFieldValue(myObject, 'a.b.c')).to.equal(5);
    expect(ObjectUtil.getDeepFieldValue(myObject, 'a.g.k')).to.equal(false);
    expect(ObjectUtil.getDeepFieldValue(myObject, 'a.g.l')).to.equal(0);
    expect(ObjectUtil.getDeepFieldValue(myObject, 'd')).to.equal(6);
    expect(ObjectUtil.getDeepFieldValue(myObject, 'f.g.po')).to.equal(null);
    done();
  });
  it('Test setDeepFieldValue', (done) => {
    const myObject = {
      a: {
        b: { c: 5 },
      },
      d: 6,
      h: null,
    };
    ObjectUtil.setDeepFieldValue(myObject, 'k', 26);
    expect(myObject.k).to.equal(26);
    ObjectUtil.setDeepFieldValue(myObject, 'g.s.c', 96);
    expect(myObject.g.s.c).to.equal(96);
    ObjectUtil.setDeepFieldValue(myObject, 'h.l', 7454);
    expect(myObject.h.l).to.equal(7454);
    done();
  });
});
