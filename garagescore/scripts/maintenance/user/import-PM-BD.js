const app = require('../../../server/server.js');
const MongoObjectID = require('mongodb').ObjectID;
const fs = require('fs');

if (process.argv.length < 3) {
  console.error(`
    Bad usage: missing name of the file we want to use to update the phone numbers.
    Usage: node scripts/maintenance/user/import-PM-BD.js <path to file> [-PM] [-BD] [--raw]
    Args : -PM to indicate we're importing PerfMans
           -BD to indicate we're importing BizDevs
           --raw : raw mode, we're treating MongoIds instead of user names
  `);
  process.exit(1);
}

const perfMans = {
  'Antoine Wettling': '589b3b5b4581371a003eac40',
  'Emmanuel Codjia': '5a86bd7dfa93690013c41328',
  'Camille Lardeau': '5ab51feeae5ed600131faf3f',
  'Sarah Faid': '5dee62ec06d75d00155d9ff5',
  'Laurène Poyatos': '5d63e52c0bc026001516bbdf',
  'Marta Vozmediano': '5c8900bfd5f8670015e71acb',
  'Martin Rollin': '5a86bd4cfa93690013c41324',
};

const bizDevs = {
  'Djilali Kali': '58ad8035e1b38d1a0073eba3',
  'Michel Grihangne': '5a008258ff67335f002d1705',
  'Alexis Biarneix': '58b97ea4fc3f301a00708128',
  'Martin Rollin': '5a86bd4cfa93690013c41324',
  'Marta Vozmediano': '5c8900bfd5f8670015e71acb',
  'Kenny Lebert': '5dbab372b35f8f0015e6e0bb',
  // '': new MongoObjectID('590c2377c82d3e190090cf86'), // eguillou@garagescore.com
  // '': new MongoObjectID('5dbab412b35f8f0015e6e0cd'), // adelcroix@garagescore.com
  // '': new MongoObjectID('5de6270a5fc1e80015d68090'), // blopetegui@garagescore.com
  // '': new MongoObjectID('5db845e53adf1c00151fb3cb'), // walleman@garagescore.com
};

const getMode = () => {
  const args = process.argv;
  if (!args.some((arg) => arg !== '-PM' && arg !== '-BD')) return false;
  if (args.includes('-PM') && args.includes('-BD')) return false;
  if (args.includes('-PM')) return 'PM';
  if (args.includes('-BD')) return 'BD';
};

app.on('booted', async () => {
  const fileName = process.argv[2];
  const mode = getMode();
  const isRaw = process.argv.includes('--raw');
  let lines;
  try {
    const fileContent = fs.readFileSync(fileName, 'utf-8');
    lines = fileContent.split('\n');
    lines.shift(); // Removes the 1st line that is the CSV header
    // Now lines are in the following format : garageId;bizDev;perfMan
    console.log(`File successfully loaded. It has ${lines.length} entries`);
  } catch (readError) {
    console.error('Error reading file : ', readError);
    process.exit(2);
  }
  const Garage = app.models.Garage.getMongoConnector();
  const updates = lines
    .map((line) => {
      if (!line.length) return null;
      try {
        const $set = {};
        if (!mode) {
          $set.bizDevId = isRaw ? line.split(';')[1].trim() : bizDevs[line.split(';')[1].trim()];
          $set.performerId = isRaw ? line.split(';')[2].trim() : perfMans[line.split(';')[2].trim()];
        } else if (mode === 'PM') {
          $set.performerId = isRaw ? line.split(';')[1].trim() : perfMans[line.split(';')[1].trim()];
        } else if (mode === 'BD') {
          $set.bizDevId = isRaw ? line.split(';')[1].trim() : perfMans[line.split(';')[1].trim()];
        }

        return {
          updateOne: {
            filter: { _id: new MongoObjectID(line.split(';')[0]) },
            update: { $set },
          },
        };
      } catch (updateCreationError) {
        console.error('Cannot create mongo object id ', line.split(';')[0]);
        return null;
      }
    })
    .filter((u) => u);
  try {
    console.log(`Now attempting to update ${updates.length} garages`);
    const result = await Garage.bulkWrite(updates);
    console.log('Garages updated successfully : update count : ', result.modifiedCount);
  } catch (error) {
    console.error('Error updating garages : ', error);
    process.exit(3);
  }
  process.exit(0);
});
