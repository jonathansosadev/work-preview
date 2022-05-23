const moment = require('moment-timezone');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../common/lib/garagescore/client');

const index = (app, req, res) => {
  if (!req.user.email.match(/@garagescore\.com|@custeed\.com/)) {
    rs.status(403).send('');
  }
  res.render('darkbo/darkbo-simulators/importer.nunjucks', {
    current_tab: 'simulators',
  });
};

const _importSimulator = async (app, req, res) => {
  const b = req.body;
  const date = moment().format('DD/MM/YYYY');
  let csv =
    'dateinter;genre;fullName;firstName;lastName;email;ville;rue;cp;marque;modele;IMMAT;VIN;mobilePhone;Service\n';

  for (const r of b.rows) {
    csv += `${date};${r.gender};${`${r.firstName} ${r.lastName}`};${r.firstName};${r.lastName};${r.email};${
      r.city
    };`;
    csv += `${`${r.streetNumber} Rue ${r.streetName}`};${r.postalCode};${r.carMake};${r.carModel};${r.plate};${
      r.vin
    };${r.phone};${r.service}\n`;
  }
  console.log('Trying to DataFile.importFromString --- ', b.garageId, b.dataFileType);
  const createdCampaigns = await new Promise((resolve, reject) => {
    app.models.DataFile.importFromString(b.garageId, b.dataFileType, csv, (err, createdCampaigns) => {
      if (err) {
        reject(err);
      }
      if (createdCampaigns) {
        for (const campaign of createdCampaigns) {
          app.models.Campaign.requestRun(campaign.id);
        }
      }
      resolve(createdCampaigns);
    });
  });
  res.json("ok");
};

module.exports = {
  // GET /simulators/importer
  index,
  // POST /simulators/importer
  importSimulator: _importSimulator,
};