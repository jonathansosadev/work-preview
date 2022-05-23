const chai = require('chai');
const expect = chai.expect;

describe('Public api access file', () => {
  // prevent app-infos module export to be malformed
  // https://github.com/garagescore/garagescore/pull/4884#pullrequestreview-783650371
  it('Should export the right properties', async () => {
    const appInfos = require('../../../../../common/lib/garagescore/api/app-infos.js');

    expect(appInfos).to.have.all.keys(['addApp', 'getApp', 'currentApps']);
    expect(appInfos.currentApps).to.be.an('object');
  });
});
