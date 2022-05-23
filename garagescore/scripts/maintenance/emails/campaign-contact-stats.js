/**
 * get campaign contacts stats
 * @type {Enum}
 */
var ContactType = require('../../../common/models/contact.type');
var contactsConfig = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
var app = require('../../../server/server.js');
var util = require('util');
var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
var Transform = require('stream').Transform;
var cliMinDate;
var cliMaxDate;

process.argv.forEach(function (val, index) {
  if (val === '--help') {
    console.log('');
    console.log('* Copy campaignContacts model instance to contact Model');
    console.log('');
    console.log('Usage node bin/contact/campaign-contact-stats.js [options]');
    console.log(
      '--minDate \t must be succeded by a date in this format `DD-MM-YYYY-hh:mm:ss`.' +
        ' Run script from a given reference date. Fetch contact where its `createdAt` greter then the given date'
    );
    console.log(
      '--maxDate \t must be succeded by a date in this format `DD-MM-YYYY-hh:mm:ss`.' +
        ' Run script from a given reference date. Fetch contact where its `createdAt` less then the given date'
    );
    console.log('options:');
    process.exit(0);
  }
  if (val === '--minDate') {
    if (!moment(process.argv[index + 1], 'DD-MM-YYYY-hh:mm:ss').isValid()) {
      console.log('Invalid minDate must be in this format : DD-MM-YYYY-hh:mm:ss');
      process.exit(-1);
    }
    cliMinDate = moment(process.argv[index + 1], 'DD-MM-YYYY-hh:mm:ss').toDate();
  }
  if (val === '--maxDate') {
    if (!moment(process.argv[index + 1], 'DD-MM-YYYY-hh:mm:ss').isValid()) {
      console.log('Invalid maxDate must be in this format : DD-MM-YYYY-hh:mm:ss');
      process.exit(-1);
    }
    cliMaxDate = moment(process.argv[index + 1], 'DD-MM-YYYY-hh:mm:ss').toDate();
  }
});
var countDataToProcess = 0;
var countReadData = 0;
var countTransformedData = 0;
var recipientCollection = {};

app.on('booted', function () {
  var Contact = app.models.Contact;
  var readContactsStream = Contact.findStream({
    where: {
      type: { in: [ContactType.CAMPAIGN_SMS, ContactType.CAMPAIGN_EMAIL] },
      and: [
        { createdAt: { gt: cliMinDate || moment().subtract(90, 'days').toDate() } },
        { createdAt: { lte: cliMaxDate || moment().toDate() } },
      ],
    },
  });

  /**
   * Defining transform data stream class
   * It expect a campaingContact in entry an deliver ready to save contact Model instant
   * @param options
   * @returns {TransformDataStream}
   * @constructor
   */
  function TransformDataStream(options) {
    if (!(this instanceof TransformDataStream)) {
      return new TransformDataStream(options);
    }

    if (!options) options = {}; // eslint-disable-line no-param-reassign
    options.objectMode = true; // eslint-disable-line no-param-reassign
    Transform.call(this, options);
  }

  util.inherits(TransformDataStream, Transform);
  TransformDataStream.prototype._transform = function _transform(contact, encoding, callback) {
    try {
      if (recipientCollection[contact.to]) {
        recipientCollection[contact.to].push(contact);
      } else {
        recipientCollection[contact.to] = [contact];
      }
      callback(null, contact);
    } catch (err) {
      callback(err);
    }
  };

  console.log('Reading started : ' + new Date());
  var transformerStream = new TransformDataStream();
  var countOneTimeCampaign = 0;
  var countOneTimeSmsCampaign = 0;
  var countOneTimeEmailCampaign = 0;
  var countManyTimesCampaign = 0;
  var countManyTimesSmsCampaign = 0;
  var countManyTimesEmailCampaign = 0;
  var countManyTimesMaintenanceCampaign = 0;
  var countManyTimesSmsMaintenanceCampaign = 0;
  var countManyTimesEmailMaintenanceCampaign = 0;
  var countManyTimesSaleCampaign = 0;
  var countManyTimesSmsSaleCampaign = 0;
  var countManyTimesEmailSaleCampaign = 0;
  var countOneTimeCampaignAtLeast = 0;
  readContactsStream.pipe(transformerStream).on('finish', function () {
    // finished
    fs.open('doubles-' + moment().format('YYYY-MM-DD_HH_mm_ss') + '.csv', 'w', function (err3, fd) {
      if (err3) {
        console.log(err3);
        process.exit(-1);
      }
      fs.write(fd, 'email or phone, total contacts, contact #1 atelier, contact #1 ventes\n');
      fs.write(fd, '\n');
      fs.write(fd, ',,,,,Total,' + countTransformedData + '\n');
      fs.write(fd, ',,,,,uniq recipient tous campaign contacts,' + _.keys(recipientCollection).length + '\n');
      fs.write(fd, '\n');
      fs.write(fd, '\n');
      console.log('Reading ended : ' + new Date());
      console.log('Total readed : ' + countReadData + ' of ' + countDataToProcess);
      console.log('Total transformed : ' + countTransformedData + ' of ' + countDataToProcess);
      console.log('Total uniq recipient : ' + _.keys(recipientCollection).length);
      _.each(
        _.sortBy(recipientCollection, function (o) {
          return o[0].to;
        }),
        function (contactArray) {
          var firstMaintenanceContacts = _.filter(contactArray, function (contact) {
            return (
              contact.payload.key === contactsConfig.maintenance_email_1.key ||
              contact.payload.key === contactsConfig.maintenance_sms_1.key
            );
          });
          var firstSaleContacts = _.filter(contactArray, function (contact) {
            return (
              contact.payload.key === contactsConfig.sale_email_1.key ||
              contact.payload.key === contactsConfig.sale_sms_1.key
            );
          });
          var firstMaintenanceEmailContacts = _.filter(contactArray, function (contact) {
            return contact.payload.key === contactsConfig.maintenance_email_1.key;
          });
          var firstMaintenanceSmsContacts = _.filter(contactArray, function (contact) {
            return contact.payload.key === contactsConfig.maintenance_sms_1.key;
          });
          var firstSaleSmsContacts = _.filter(contactArray, function (contact) {
            return contact.payload.key === contactsConfig.sale_email_1.key;
          });
          var firstSaleEmailContacts = _.filter(contactArray, function (contact) {
            return contact.payload.key === contactsConfig.sale_sms_1.key;
          });
          if (firstMaintenanceContacts.length >= 1 || firstSaleContacts.length >= 1) {
            countOneTimeCampaignAtLeast++;
          }
          if (firstMaintenanceContacts.length > 1 || firstSaleContacts.length > 1) {
            // console.log(contactArray[0].to + ' has received multiple campaigns : '
            //   + firstMaintenanceContacts.length + ' campaigns de  Maintenance et '
            //   + firstSaleContacts.length + ' campaign de vente.'
            // );
            fs.write(
              fd,
              contactArray[0].to +
                ',' +
                contactArray.length +
                ',' +
                firstMaintenanceContacts.length +
                ',' +
                firstSaleContacts.length +
                '\n'
            );
            countManyTimesCampaign++;
            if (firstMaintenanceContacts.length > 1) {
              countManyTimesMaintenanceCampaign++;
              if (firstMaintenanceEmailContacts.length > 1) {
                countManyTimesEmailMaintenanceCampaign++;
                countManyTimesEmailCampaign++;
              }
              if (firstMaintenanceSmsContacts.length > 1) {
                countManyTimesSmsMaintenanceCampaign++;
                countManyTimesSmsCampaign++;
              }
            }
            if (firstSaleContacts.length > 1) {
              countManyTimesSaleCampaign++;
              if (firstSaleEmailContacts.length > 1) {
                countManyTimesEmailSaleCampaign++;
                countManyTimesEmailCampaign++;
              }
              if (firstSaleSmsContacts.length > 1) {
                countManyTimesSmsSaleCampaign++;
                countManyTimesSmsCampaign++;
              }
            }
          }
          if (firstMaintenanceContacts.length === 1 || firstSaleContacts.length === 1) {
            // console.log(contactArray[0].to + ' has received multiple campaigns : '
            //   + firstMaintenanceContacts.length + ' campaigns de  Maintenance et '
            //   + firstSaleContacts.length + ' campaign de vente.'
            // );
            countOneTimeCampaign++;
            if (firstMaintenanceContacts.length === 1) {
              if (firstMaintenanceEmailContacts.length === 1) {
                countOneTimeEmailCampaign++;
              }
              if (firstMaintenanceSmsContacts.length === 1) {
                countOneTimeSmsCampaign++;
              }
            }
            if (firstSaleContacts.length === 1) {
              if (firstSaleEmailContacts.length === 1) {
                countOneTimeEmailCampaign++;
              }
              if (firstSaleSmsContacts.length === 1) {
                countOneTimeSmsCampaign++;
              }
            }
          }
        }
      );

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu au moin un campaign contact 1 total,' + countOneTimeCampaignAtLeast + '\n\n'
      );
      console.log('Nombre de contact ayant recu au moin un campaign contact 1 total : ' + countOneTimeCampaignAtLeast);

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu une fois des campaign contact 1 total,' + countOneTimeCampaign + '\n'
      );
      console.log('Nombre de contact ayant recu une fois des campaign contact 1 total : ' + countOneTimeCampaign);

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu une fois des campaign email contact 1 total,' +
          countOneTimeEmailCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu une fois des campaign email contact 1 total : ' + countOneTimeEmailCampaign
      );

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu une fois des campaign sms contact 1 total,' + countOneTimeSmsCampaign + '\n'
      );
      console.log(
        'Nombre de contact ayant recu une fois des campaign sms contact 1 total : ' + countOneTimeSmsCampaign
      );

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign contact 1 total,' + countManyTimesCampaign + '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign contact 1 total : ' + countManyTimesCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign email contact 1 total,' +
          countManyTimesEmailCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign email contact 1 total : ' +
          countManyTimesEmailCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign sms contact 1 total,' +
          countManyTimesSmsCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign sms contact 1 total : ' + countManyTimesSmsCampaign
      );

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign contact 1 Maintenance,' +
          countManyTimesMaintenanceCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign contact 1 Maintenance : ' +
          countManyTimesMaintenanceCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign Email contact 1 Maintenance,' +
          countManyTimesEmailMaintenanceCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign Email contact 1 Maintenance : ' +
          countManyTimesEmailMaintenanceCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign Sms contact 1 Maintenance,' +
          countManyTimesSmsMaintenanceCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign Sms contact 1 Maintenance : ' +
          countManyTimesSmsMaintenanceCampaign
      );

      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign contact 1 Vente,' +
          countManyTimesSaleCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign contact 1 Vente : ' + countManyTimesSaleCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign Email contact 1 Vente,' +
          countManyTimesEmailSaleCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign Email contact 1 Vente : ' +
          countManyTimesEmailSaleCampaign
      );
      fs.write(
        fd,
        ',,,,,Nombre de contact ayant recu plusieurs fois des campaign Sms contact 1 Vente,' +
          countManyTimesSmsSaleCampaign +
          '\n'
      );
      console.log(
        'Nombre de contact ayant recu plusieurs fois des campaign Sms contact 1 Vente : ' +
          countManyTimesSmsSaleCampaign
      );

      process.exit();
    });
  });
  // ############################################## Tracking operations ##################################################
  readContactsStream.count(function (err, count) {
    console.log('Total data to process : ' + count);
    countDataToProcess = count;
  });

  readContactsStream.on('data', function () {
    countReadData++;
  });
  transformerStream.on('data', function () {
    countTransformedData++;
  });

  readContactsStream.on('error', function (err) {
    console.log('Error Reading ' + JSON.stringify(err));
  });
  transformerStream.on('error', function (err) {
    console.log('Error Transform ' + JSON.stringify(err));
  });

  setInterval(function () {
    console.log('Total readed : ' + countReadData + ' of ' + countDataToProcess);
    console.log('Total transformed : ' + countTransformedData + ' of ' + countDataToProcess);
    console.log('Read stream waiting ' + readContactsStream._readableState.buffer.length);
  }, 10000);
});
