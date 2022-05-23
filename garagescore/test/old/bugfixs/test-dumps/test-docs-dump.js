const path = require('path');
const chai = require('chai');
const TestApp = require('../../../../common/lib/test/test-app');

const { expect } = chai;
const app = new TestApp();

describe('Restore dump from random collection', async () => {
  // test
  it('Restore filtered ideas', async function test() {
    await app.reset();
    await app.restore(path.resolve(`${__dirname}/datas/ideas.dump`));
    const ideas = await app.find('Idea', {});
    expect(ideas.length).equals(12);
    for (let i = 0; i < ideas.length; i += 1) {
      expect(ideas[0].category).equals('Amélioration boite à idées');
    }
  });
});
