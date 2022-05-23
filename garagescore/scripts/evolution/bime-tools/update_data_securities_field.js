/**
 * Must be executed if one or many securityDataFieldName was changed in the common/lib/bime/data-sources-config.js
 * It update saved dataSecurities in Bime to be same as configured securityDataFieldName
 */
process.argv.forEach(function (val) {
  if (val === '--help') {
    console.log('');
    console.log(
      '* Must be executed if one or many securityDataFieldName was changed in the common/lib/bime/data-sources-config.js'
    );
    console.log('* It update saved dataSecurities in Bime to be same as configured securityDataFieldName');
    console.log('');
    console.log('Usage node bin/bimeTools/update_data_securities_field.js');
    process.exit(0);
  }
});

var bimeApi = require('./../../common/lib/bime/api');
var dataSecuritiesRules = require('./../../common/lib/bime/data-sources-config.js');
var async = require('async');
var _ = require('lodash');
bimeApi.getDataSecurityRules(function (err, dataSecurities) {
  var tasks = [];
  _.each(dataSecurities, function (dataSecurity) {
    var configuredConnection = _.find(dataSecuritiesRules.securedDataSources, function (cfg) {
      return cfg.bimeConnectionId === dataSecurity.connection_id;
    });
    if (!configuredConnection) {
      return;
    }
    if (dataSecurity.datafield !== configuredConnection.securityDataFieldName) {
      tasks.push(function (callback) {
        bimeApi.updateDataSecurityRule(
          dataSecurity.id,
          {
            connection_id: dataSecurity.connection_id,
            datafield: configuredConnection.securityDataFieldName,
            authorized_values: dataSecurity.authorized_values,
          },
          callback
        );
      });
    }
  });
  async.series(tasks, function (err1, results) {
    if (err1) {
      throw new Error(err1);
    }
    console.log('updated dataSecurities = ' + results.length);
  });
});
