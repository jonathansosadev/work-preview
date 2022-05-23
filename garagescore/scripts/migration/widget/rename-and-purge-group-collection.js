const config = require('config');
const MongoClient = require('mongodb').MongoClient;

async function run() {
  const client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
  const db = client.db('garagescore');

  try {
    console.log('Removing deprecated fields from Groups collection\'s documents...');
    const { result: updateResult } = await db.collection('groups').updateMany(
      {},
      {
        $unset: {
          name: "",
          ownerId: "",
          type: "",
        },
      },
    );

    if (updateResult.ok === 1) {
      console.log(
        '[ownerId] and [name] field were successfully deleted.',
        updateResult,
      );
      console.log('\n Renaming [Groups] collection to [WidgetGroups]....');
      const { result: renameResult } = await db.collection("groups")
        .rename("widgetGroups");

      console.log(
        '[Groups] collection successfully renamed into [WidgetGroups].',
        renameResult,
      );
      process.exit();
    } else {
      console.error('Failed to remove fields from collection\'s documents. Stopping now.');
      process.exit();
    }

  } catch (e) {
    console.error(e);
    process.exit();
  }
}

run();


