const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const unzipper = require('unzipper');
const request = require('request');
const MongoObjectID = require('mongodb').ObjectID;

const app = require('../../../server/server');

const url = process.argv.slice(2)[0];
const password = process.argv.slice(2)[1];

if (process.argv.slice(2).length !== 2) {
  console.error('Usage: node fix-corrupted-datas.js [saneDatasUrl] [archivePassword]');
  process.exit(1);
}

app.on('booted', async () => {
  const db = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
  const corruptedDatas = await db
    .collection('datas')
    .find({ 'service.providedAt': { $exists: false }, customer: { $exists: false } });
  const directory = await unzipper.Open.url(request, url);
  const file = directory.files[0];
  const content = (await file.buffer(password)).toString();
  const saneDatas = JSON.parse(JSON.parse(content));

  console.log(`Found ${await corruptedDatas.count()} corrupted datas`);
  console.log(`Found ${saneDatas.length} sane datas`);

  _prepareSaneDatas(saneDatas);

  while (await corruptedDatas.hasNext()) {
    const corruptedData = await corruptedDatas.next();
    const saneData = saneDatas.find((d) => d.id.equals(corruptedData._id));

    if (!saneData) {
      console.log(`Corrupted data ${corruptedData._id.toString()} was not found in sane datas`);
    } else {
      _mergeSaneAndCorruptedData(saneData, corruptedData);
    }
  }

  const bulkWrite = _buildBulkWriteFromSaneDatas(saneDatas);
  const result = bulkWrite.length ? await db.collection('datas').bulkWrite(bulkWrite) : { modifiedCount: 0 };

  console.log(`Done. Updated ${result.modifiedCount} Datas in database.`);
  process.exit(0);
});

function _prepareSaneDatas(saneDatas) {
  const prepareFields = (obj) => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && obj[key].includes('$DATE$')) {
        obj[key] = new Date(obj[key].replace('$DATE$', '')); // eslint-disable-line
      } else if (obj[key] && typeof obj[key] === 'object' && !MongoObjectID.isValid(obj[key])) {
        prepareFields(obj[key]);
      }
    }
  };

  for (const saneData of saneDatas) {
    saneData.id = new MongoObjectID(saneData.id);
    prepareFields(saneData);
  }
}

function _mergeSaneAndCorruptedData(saneData, corruptedData) {
  saneData._$toUpdate = true;

  for (const field of Object.keys(saneData)) {
    if (typeof corruptedData[field] !== 'undefined' && field !== 'id') {
      saneData[field] = corruptedData[field]; // eslint-disable-line
    }
  }

  for (const field of Object.keys(corruptedData)) {
    if (typeof saneData[field] === 'undefined' && field !== '_id') {
      saneData[field] = corruptedData[field]; // eslint-disable-line
    }
  }
}

function _buildBulkWriteFromSaneDatas(saneDatas) {
  const bulkWrite = [];
  let id = null;

  for (const saneData of saneDatas) {
    if (saneData._$toUpdate) {
      id = saneData.id;
      delete saneData.id;
      delete saneData._$toUpdate;
      bulkWrite.push({ updateOne: { filter: { _id: id }, update: { ...saneData } } }); // eslint-disable-line
    }
  }
  return bulkWrite;
}
