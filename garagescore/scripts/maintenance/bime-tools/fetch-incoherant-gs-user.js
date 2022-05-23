/**
 * Fetch incoherance between GarageScore Users and Bime User :
 * GarageScore User when associated to a Bime User will copy his token.
 * The approch is to cheack if the token saved on gargesocre users is the same with associated bime user.
 * This script print the informations for all Bime Users
 */
process.argv.forEach(function (val) {
  if (val === '--help') {
    console.log('');
    console.log('* Fetch incoherance between GarageScore Users and Bime User :');
    console.log('* GarageScore User when associated to a Bime User will copy his token.');
    console.log(
      '* The approch is to cheack if the token saved on gargesocre users is the same with associated bime user.'
    );
    console.log('* This script print the informations for all Bime Users');
    console.log('');
    console.log('Usage node bin/bimeTools/fetch-incoherant-gs-user.js');
    process.exit(0);
  }
});
var bimeApi = require('./../../common/lib/bime/api');
var app = require('./../../server/server');

bimeApi.getNamedUsers(function (err, cs) {
  cs.forEach(function (c) {
    if (c.external_id) {
      app.models.User.findById(c.external_id, function (err2, user) {
        if (err || !user) {
          console.log(
            'id_bime : ' +
              c.id +
              ' external_id : ' +
              c.external_id +
              ' access_token : ' +
              c.access_token +
              ' email_bime : ' +
              c.email +
              ' garagescore user not found ' +
              err
          );
        } else {
          console.log(
            'id_bime : ' +
              c.id +
              ' external_id : ' +
              c.external_id +
              ' access_token : ' +
              c.access_token +
              ' email_bime : ' +
              c.email +
              ' email_garagescore : ' +
              user.email +
              (c.access_token.toString() === user.backoffice.config.main.bime.accessToken.toString()
                ? 'token cohérent'
                : 'token incohérant dans db = ' + user.backoffice.config.main.bime.accessToken)
          );
          if (c.access_token !== user.backoffice.config.main.bime.accessToken) {
            bimeApi.updateNamedUser(
              c.id,
              {
                external_id: '',
              },
              function () {
                console.log('deleted external_id');
              }
            );
          }
        }
      });
    } else {
      console.log(
        'id_bime : ' + c.id + ' external_id : null' + ' access_token : ' + c.access_token + ' email_bime : ' + c.email
      );
    }
  });
});
