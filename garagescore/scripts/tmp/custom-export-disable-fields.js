const app = require('../../server/server');
const { ObjectId } = require('mongodb');

const invalidFields = [
  'BG_SAT__MIDDLEMANS_ALREADY_CUSTOMER',
  'BG_SAT__MIDDLEMANS_FACTORY_WEBSITE',
  'BG_SAT__MIDDLEMANS_GARAGE_WEBSITE',
  'BG_SAT__MIDDLEMANS_LEBONCOIN_WEBSITE',
  'BG_SAT__MIDDLEMANS_LACENTRALE_WEBSITE',
  'BG_SAT__MIDDLEMANS_ADVERTING_WEBSITE',
  'BG_SAT__MIDDLEMANS_DISCOUNT_COMMUNICATION',
  'BG_SAT__MIDDLEMANS_PROXIMITY',
  'BG_SAT__MIDDLEMANS_THIRD_PARTY_RECOMMENDATION',
  'BG_SAT__MIDDLEMANS_SOCIAL_NETWORKS',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE1',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE2',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE3',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE4',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE5',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE6',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE7',
  'BG_SAT__SERVICE_CATEGORY_MAINTENANCE8',
];

app.on('booted', async () => {
  console.time('CustomExportsMigration');

  try {
    /* step 1 : remove all predefined configurations with invalid fields */
    await deletePredefinedConfigurations();

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
