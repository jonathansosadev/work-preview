const app = require('../../../server/server.js');
const MongoObjectID = require('mongodb').ObjectID;
const fs = require('fs');

if (process.argv.length !== 3) {
  console.error(`
    Bad usage: missing name of the file we want to use to update the phone numbers.
    Usage: node scripts/maintenance/user/import-phone-numbers.js <path to file>
  `);
  process.exit(1);
}

app.on('booted', async () => {
  const fileName = process.argv[2];
  let lines;
  try {
    const fileContent = fs.readFileSync(fileName, 'utf-8');
    lines = fileContent.split('\n');
    lines.shift(); // Removes the 1st line that is the CSV header
    // Now lines are in the following format : userId;userEmail;phoneNumber
    console.log(`File successfully loaded. It has ${lines.length} entries`);
  } catch (readError) {
    console.error('Error reading file : ', readError);
    process.exit(2);
  }

  const updates = lines
    .map((line) => {
      try {
        return {
          updateOne: {
            filter: { _id: new MongoObjectID(line.split(';')[0]) },
            update: { $set: { mobilePhone: `+${line.split(';')[2]}` } }, // Because the + has been forgotten in the file
          },
        };
      } catch (updateCreationError) {
        console.error('Cannot create mongo object id ', line.split(';')[0]);
        return null;
      }
    })
    .filter((u) => u);
  try {
    console.log(`Now attempting to update ${updates.length} users`);
    const result = await app.models.User.getMongoConnector().bulkWrite(updates);
    console.log('Users updated successfully : update count : ', result.modifiedCount);
  } catch (error) {
    console.error('Error updating users : ', error);
    process.exit(3);
  }
  process.exit(0);
});
