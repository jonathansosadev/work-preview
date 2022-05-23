const app = require('../../server/server');
const config = require('config');
const MongoClient = require('mongodb').MongoClient;

const plop = async ({ email }) => {
  const client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
  const db = await client.db(process.env.DB_NAME || 'heroku_6jk0qvwj');
  db.collection('plop').insertOne({ plop: '1', email })
  /*
  const plop = await app.models.User.getMongoConnector().find({ email }).toArray()
  console.log(plop.length);
  */
}

app.on('booted', async () => {
  try {
    await plop({});
  } catch (e) {
    console.error('there was an error');
    console.error(e);
  }

  process.exit(0);
});
