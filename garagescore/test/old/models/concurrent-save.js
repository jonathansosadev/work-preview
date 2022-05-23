const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line

// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();

const update = async (concurrent = false) => {
  await app.reset();
  const d = await app.emptyData();
  const source = { type: 'test' };
  const raw = { toto: 'toto' };
  d.set('garageId', 'test');
  d.set('source', source);
  d.set('source.raw', raw);
  await d.save(concurrent);
  let datas = await app.datas();
  // sometimes, in classic mode, this test fail and the garageId field has
  // a value of 'garageId' (like the orignal emptyData from app), like if we are going to fast
  // or an await is missing
  // do not understand why
  // we could add a sleep before getting the datas
  expect(datas[0].get('garageId'), JSON.stringify(datas[0])).equals('test');
  expect(datas[0].get('source.type')).equals('test');
  expect(typeof datas[0].get('source.raw')).equals('object');
  expect(JSON.stringify(datas[0].get('source.raw'))).equals(JSON.stringify(raw));
  // set and save again
  // test if we dont overwrite nested neighbours
  d.set('source.type', 'test2');
  await d.save(concurrent);
  datas = await app.datas();
  expect(datas[0].get('source.type')).equals('test2');
  expect(typeof datas[0].get('source.raw')).equals('object');
  expect(JSON.stringify(datas[0].get('source.raw')), JSON.stringify(datas[0])).equals(JSON.stringify(raw));
};

describe('Concurrent save', () => {
  const LOOPS = 1;

  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Classic save', async () => {
    for (let i = 0; i < LOOPS; i++) {
      await update();
    }
  });
  it('Concurrent safe save', async () => {
    for (let i = 0; i < LOOPS; i++) {
      await update(true);
    }
  });
});
