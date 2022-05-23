const ArrayUtil = require('../../../common/lib/util/array');
const chai = require('chai');

const expect = chai.expect;

describe('Test aws', () => {
  it('Test sort', (done) => {
    const myS3List = [
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/10_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-10T15:13:15.000Z',
        ETag: "'967b4cbe7c35c089c653b559f11e593e'",
        Size: 19458,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/11_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-11T08:17:57.000Z',
        ETag: "'ff99fbf7f9bbc216b0594c33c7a75d58'",
        Size: 27275,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/12_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-12T00:01:57.000Z',
        ETag: "'04b882af42fe27ce06828eff1e54bd49'",
        Size: 25306,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/13_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-13T00:03:01.000Z',
        ETag: "'c248288c4bd7ffebad86a65c54c75df4'",
        Size: 22426,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/14_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-14T00:01:43.000Z',
        ETag: "'e925c4558c6ff5800a46c32a34825677'",
        Size: 6655,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/16_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-16T00:03:06.000Z',
        ETag: "'3cc969d6105fc1c0f233ef6c7d031645'",
        Size: 27658,
        StorageClass: 'STANDARD',
      },
      {
        Key:
          'CobrediaMix/gid-5609171770ad25190055d4fc/2018/01/18_01_2018-Maintenances-garage-de-l-etoile-mercedes-benz-brest.csv',
        LastModified: '2018-01-18T00:01:46.000Z',
        ETag: "'8f0e761df6b07bcf073041c564558f9e'",
        Size: 39450,
        StorageClass: 'STANDARD',
      },
    ];
    ArrayUtil.sortBy(myS3List, (o) => {
      const number = new Date(o.LastModified).getTime();
      return -number;
    });
    expect(myS3List[0].Size).to.equal(39450);
    done();
  });
});
