const app = require('../../server/server');
const { ObjectId } = require('mongodb');
const ArgParser = require('minimist');
/*
  Script used to delete fields from both customExport and predefinedExports
    - use --delete if you want to delete all predefined configuration that includes an invalid fields
    - otherwise the invalids fields will be removed from the predefined configuration without deleting it
*/

const invalidFields = ['BG_SAT__ANSWERING_COUNT'];

app.on('booted', async () => {
  const processedArgs = ArgParser(process.argv.slice(2), {
    boolean: ['deletePredefined'],
    default: { deletePredefined: false },
  });

  console.time('CustomExportsMigration');

  try {
    /* step 1 : remove all or update all predefined configurations with invalid fields */
    if (processedArgs.deletePredefined) {
      await deletePredefinedConfigurations();
    } else {
      await updatePredefinedConfigurations();
    }

    /* step 2 : remove fields from custom configurations */
    await updateCustomConfigurations();

    console.timeEnd('CustomExportsMigration');
    process.exit(0);
  } catch (error) {
    console.error(`[ERROR] : ${error.message}`);
    process.exit(1);
  }
});

async function deletePredefinedConfigurations() {
  try {
    console.log('\x1b[33m', `Deleting predefined configurations ...`, '\x1b[0m');
    const res = await app.models.CockpitExportConfiguration.getMongoConnector().deleteMany({
      automaticallyGenerated: true,
      fields: { $in: invalidFields },
    });
    console.log('\x1b[32m', `[SUCCESS] deleted ${res.deletedCount} predefined configurations`, '\x1b[0m');
  } catch (error) {
    console.error(`[ERROR] : ${error.message}`);
    process.exit(1);
  }
}

async function updatePredefinedConfigurations() {
  try {
    console.log('\x1b[33m', `Updating predefined configurations ...`, '\x1b[0m');
    const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();
    const res = await mongoConnector
      .find({
        automaticallyGenerated: true,
        fields: { $in: invalidFields },
      })
      .toArray();

    let updatedDocuments = 0;
    for (const config of res) {
      const result = await mongoConnector.updateOne(
        { _id: ObjectId(config._id) },
        { $set: { fields: config.fields.filter((field) => !invalidFields.includes(field)) } }
      );
      if (result.modifiedCount) {
        updatedDocuments++;
      }
    }

    console.log('\x1b[32m', `[SUCCESS] updated ${updatedDocuments} predefined configurations`, '\x1b[0m');
  } catch (error) {
    console.error(`[ERROR] : ${error.message}`);
    process.exit(1);
  }
}

async function updateCustomConfigurations() {
  try {
    console.log('\x1b[33m', `Updating custom configurations ...`, '\x1b[0m');
    const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();
    const res = await mongoConnector
      .find({
        automaticallyGenerated: false,
        fields: { $in: invalidFields },
      })
      .toArray();

    let updatedDocuments = 0;
    for (const config of res) {
      const result = await mongoConnector.updateOne(
        { _id: ObjectId(config._id) },
        { $set: { fields: config.fields.filter((field) => !invalidFields.includes(field)) } }
      );
      if (result.modifiedCount) {
        updatedDocuments++;
      }
    }

    console.log('\x1b[32m', `[SUCCESS] updated ${updatedDocuments} custom configurations`, '\x1b[0m');
  } catch (error) {
    console.error(`[ERROR] : ${error.message}`);
    process.exit(1);
  }
}
