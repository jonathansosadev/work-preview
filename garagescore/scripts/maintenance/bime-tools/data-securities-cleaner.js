/**
 * Remove duplication of dataSecurities :
 * DataSecurities are considered duplicated if they have the same connection_id, datafield,
 * authorized_values and related NamedUserGroup.
 */
process.argv.forEach(function (val) {
  if (val === '--help') {
    console.log('');
    console.log('* Remove duplication of dataSecurities :');
    console.log(
      '* DataSecurities are considered duplicated if they have the same connection_id, datafield,' +
        ' authorized_values and related NamedUserGroup.'
    );
    console.log('');
    console.log('Usage node bin/bimeTools/data-securities-cleaner.js');
    process.exit(0);
  }
});
var bimeApi = require('../../../common/lib/bime/api');
var Q = require('q');
var _ = require('lodash');
bimeApi.getNamedUserGroupSecurities(function (e, secs) {
  var groupedNamedGroupByDatSecurity = _.groupBy(secs, 'data_security_rule_id');
  bimeApi.getDataSecurityRules(function (err, dataSecurities) {
    var reallyDuplacated = {};
    _.each(dataSecurities, function (dataSecurity) {
      dataSecurity.relatedNamedUserGroupSecurity = groupedNamedGroupByDatSecurity[dataSecurity.id]; // eslint-disable-line no-param-reassign
      var keyedUserGroupsIds = '';
      if (dataSecurity.relatedNamedUserGroupSecurity) {
        keyedUserGroupsIds = _.sortBy(
          dataSecurity.relatedNamedUserGroupSecurity.map(function (element) {
            return element.named_user_group_id;
          })
        ).join('');
      }
      var keyedGaragesIds = _.sortBy(dataSecurity.authorized_values).join('');
      var generalKey =
        dataSecurity.connection_id + '-' + keyedGaragesIds + '-' + dataSecurity.datafield + '-' + keyedUserGroupsIds;
      if (reallyDuplacated[generalKey]) {
        reallyDuplacated[generalKey].push(dataSecurity);
      } else {
        reallyDuplacated[generalKey] = [dataSecurity]; // eslint-disable-line no-param-reassign
      }
    });
    var defredFns = [];
    _.each(reallyDuplacated, function (duplicatedRules) {
      // if (_.filter(duplicatedRules[0].relatedNamedUserGroupSecurity, function (relatedNamedUserGroupSecurity) {
      //   return relatedNamedUserGroupSecurity.named_user_group_id == '508234';
      // }).length) {
      duplicatedRules.pop();
      _.each(duplicatedRules, function (duplicatedRule) {
        defredFns.push(function () {
          var defred1 = Q.defer();
          bimeApi.deleteDataSecurityRule(duplicatedRule.id, function (err2) {
            if (err2) {
              defred1.reject(err2);
            } else {
              defred1.resolve();
            }
          });
          return defred1.promise;
        });
      });
    });
    console.log('toRemove = ' + defredFns.length);
    defredFns.push(function () {
      var defred1 = Q.defer();
      console.log('completed');
      defred1.resolve();
      return defred1.promise;
    });
    defredFns.reduce(function (soFar, f) {
      return soFar.then(f);
    }, Q());
  });
});
