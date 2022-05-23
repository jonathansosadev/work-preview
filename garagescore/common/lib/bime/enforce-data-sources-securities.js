'use strict';

var _ = require('underscore');
var bimeApi = require('./api');
var chalk = require('chalk');
var gsLogger = require('../garagescore/logger');
var Q = require('q');
var s = require('underscore.string');
var util = require('util');
var debug = require('debug')('garagescore:common:lib:bime:enforce-data-sources-securities'); // eslint-disable-line max-len,no-unused-vars
var dataSourcesSecuritiesConfig = require('./data-sources-config');
var app = require('../../../server/server');

var autoCreate = true;
var getUserToken = function (user) {
  if (!user) return null;
  if (!user.backoffice) return null;
  if (!user.backoffice.config) return null;
  if (!user.backoffice.config.main) return null;
  if (!user.backoffice.config.main.bime) return null;
  return user.backoffice.config.main.bime.accessToken;
};

module.exports = {
  run: function (callback) {
    Q()
      .then(function () {
        var promises = [];
        promises.push(
          Q().then(function () {
            console.log(chalk.bold('Gathering Users…'));
            return Q.ninvoke(app.models.User, 'find').then(function (foundUsers) {
              console.log(chalk.green('✔'), util.format('Found %d Users.', foundUsers.length));
              return foundUsers;
            });
          })
        );

        var bimeObjectNames = [
          'Connections',
          'NamedUsers',
          'NamedUserGroups',
          'Dashboards',
          'DashboardSubscriptions',
          'DataSecurityRules',
          'NamedUserGroupSecurities',
        ];
        _.each(bimeObjectNames, function (bimeObjectName) {
          promises.push(
            Q().then(function () {
              console.log(chalk.bold(util.format('Gathering BIME %s…', bimeObjectName)));
              return Q.ninvoke(bimeApi, 'get' + bimeObjectName).then(function (foundBimeObjects) {
                console.log(
                  chalk.green('✔'),
                  util.format('Found %d BIME %s.', foundBimeObjects.length, bimeObjectName)
                );
                return foundBimeObjects;
              });
            })
          );
        });

        return Q.all(promises);
      })

      .then(function (results) {
        var deferred = Q.defer();
        var bimeNamedUsers = results[2];
        var promises = [];
        console.log(chalk.bold('Remove incohernal `external_id` from namedUsers …'));
        _.each(bimeNamedUsers, function (bimeUser) {
          var defred1 = Q.defer();
          if (bimeUser.external_id) {
            app.models.User.findById(bimeUser.external_id, function (err, user) {
              if (err || !user || bimeUser.access_token !== getUserToken(user)) {
                console.log(
                  'id_bime : ' +
                    bimeUser.id +
                    ' external_id : ' +
                    bimeUser.external_id +
                    ' access_token : ' +
                    bimeUser.access_token +
                    ' email_bime : ' +
                    bimeUser.email +
                    ' garagescore user not found ' +
                    err +
                    (bimeUser.access_token === getUserToken(user)
                      ? 'token cohérent'
                      : 'token incohérant dans db = ' + getUserToken(user))
                );
                bimeApi.updateNamedUser(
                  bimeUser.id,
                  {
                    external_id: '',
                  },
                  function (errUpdate) {
                    if (errUpdate) {
                      defred1.reject(errUpdate);
                    } else {
                      defred1.resolve();
                    }
                  }
                );
              } else {
                defred1.resolve();
              }
            });
          } else {
            defred1.resolve();
          }
          promises.push(defred1.promise);
        });
        Q.all(promises).then(function () {
          deferred.resolve(results);
        }, deferred.reject);
        return deferred.promise;
      })
      .then(function (results) {
        var warnings = [];
        // Sorry about manual destructuring
        var users = results[0];
        var bimeConnections = results[1];
        var bimeNamedUsers = results[2];
        var bimeNamedUserGroups = results[3];
        var bimeDataSecurityRules = results[6];
        var bimeNamedUserGroupSecurities = results[7];

        var promises = [];

        var bimeDataSecurityRulesById = {};
        _.each(bimeDataSecurityRules, function (bimeDataSecurityRule) {
          bimeDataSecurityRulesById[bimeDataSecurityRule.id] = bimeDataSecurityRule;
        });

        console.log(chalk.bold('Ensuring secured data sources in config reference existing BIME Connections…'));
        _.each(dataSourcesSecuritiesConfig.securedDataSources, function (securedDataSourceConfig) {
          var securedDataSource = _.findWhere(bimeConnections, { id: securedDataSourceConfig.bimeConnectionId });

          if (typeof securedDataSource === 'undefined') {
            throw new Error(
              util.format(
                'securedDataSource.bimeConnectionId:%s not found in BIME',
                securedDataSourceConfig.bimeConnectionId
              )
            );
          }
          console.log(
            chalk.green('✔'),
            util.format(
              'securedDataSource.bimeConnectionId:%s found in BIME: %s',
              securedDataSourceConfig.bimeConnectionId,
              securedDataSource.name
            )
          );
        });

        console.log(chalk.bold('Ensuring public data sources in config reference existing BIME Connections…'));
        _.each(dataSourcesSecuritiesConfig.publicDataSources, function (publicDataSourceConfig) {
          var publicDataSource = _.findWhere(bimeConnections, { id: publicDataSourceConfig.bimeConnectionId });

          if (typeof publicDataSource === 'undefined') {
            throw new Error(
              util.format(
                'publicDataSource.bimeConnectionId:%s not found in BIME',
                publicDataSourceConfig.bimeConnectionId
              )
            );
          }
          console.log(
            chalk.green('✔'),
            util.format(
              'publicDataSource.bimeConnectionId:%s found in BIME: %s',
              publicDataSourceConfig.bimeConnectionId,
              publicDataSource.name
            )
          );
        });

        console.log(chalk.bold('Filtering out BIME NamedUsers with empty `external_id`…'));
        var gsBimeNamedUsers = _.filter(bimeNamedUsers, function (bimeNamedUser) {
          if (_.isEmpty(bimeNamedUser.external_id)) {
            console.log(
              chalk.yellow('✔'),
              chalk.yellow(util.format('Filtering out BIME NamedUser id:%s', bimeNamedUser.id))
            );
            warnings.push('Empty `external_id` for BIME NamedUser ' + bimeNamedUser.login);
            return false;
          }
          return true;
        });

        console.log(chalk.bold('Filtering out BIME DataSecurityRules with no BIME DataSecuritySubscriptions…'));
        var gsDataSecurityRules = _.filter(bimeDataSecurityRules, function (bimeDataSecurityRule) {
          /* eslint no-param-reassign:0 */
          bimeDataSecurityRule.relatedNamedUserGroupSecurities = _.where(bimeNamedUserGroupSecurities, {
            data_security_rule_id: bimeDataSecurityRule.id.toString(),
          });
          if (_.isEmpty(bimeDataSecurityRule.relatedNamedUserGroupSecurities)) {
            // console.log(chalk.yellow('✔'), chalk.yellow(util.format(
            //   'Filtering out BIME DataSecurityRule id:%s', bimeDataSecurityRule.id
            //   )));
            // warnings.push('No DataSecuritySubscriptions for DataSecurityRule #' + bimeDataSecurityRule.id);
            return false;
          }
          // console.log(chalk.green('✔'), chalk.yellow(util.format(
          //   'Keeping BIME DataSecurityRule id:%s', bimeDataSecurityRule.id
          //   )));
          return true;
        });

        var deletableDataSecurityRules = _.difference(bimeDataSecurityRules, gsDataSecurityRules);
        debug('deletableDataSecurityRules = ' + deletableDataSecurityRules.length);

        console.log(chalk.bold('Ensuring BIME NamedUser external_id matches User id…'));
        _.each(gsBimeNamedUsers, function (bimeNamedUser) {
          var user = _.find(users, function (filterableUser) {
            return filterableUser.getId().toString() === bimeNamedUser.external_id;
          });

          if (typeof user === 'undefined') {
            throw new Error(
              util.format(
                'bimeNamedUser.id:%s external_id:%s not matching any User.id',
                bimeNamedUser.id,
                bimeNamedUser.external_id
              )
            );
          }
          console.log(
            chalk.green('✔'),
            util.format(
              'bimeNamedUser.id:%s external_id:%s matches User.id:%s',
              bimeNamedUser.id,
              bimeNamedUser.external_id,
              user.id
            )
          );
        });

        console.log(chalk.bold('Checking that BIME NamedUser login matches User e-mail address…'));
        _.each(gsBimeNamedUsers, function (bimeNamedUser) {
          var user = _.find(users, function (filterableUser) {
            return filterableUser.getId().toString() === bimeNamedUser.external_id;
          });

          if (bimeNamedUser.login !== user.email) {
            console.log(
              chalk.yellow('✔'),
              chalk.yellow(
                util.format(
                  'bimeNamedUser.id:%s login:%s not matching User.id:%s email:%s',
                  bimeNamedUser.id,
                  bimeNamedUser.login,
                  user.id,
                  user.email
                )
              )
            );
            warnings.push('bimeNamedUser ' + bimeNamedUser.login + 'not matching user ' + user.email);
          } else {
            console.log(
              chalk.green('✔'),
              util.format(
                'bimeNamedUser.id:%s login:%s matching User.id:%s email:%s',
                bimeNamedUser.id,
                bimeNamedUser.login,
                user.id,
                user.email
              )
            );
          }
        });

        console.log(
          chalk.bold('Ensuring that BIME NamedUser access_token matches User backoffice.config.main.bime.accessToken…')
        );
        _.each(gsBimeNamedUsers, function (bimeNamedUser) {
          var user = _.find(users, function (filterableUser) {
            return filterableUser.getId().toString() === bimeNamedUser.external_id;
          });

          if (bimeNamedUser.access_token !== user.backoffice.config.main.bime.accessToken) {
            throw new Error(
              util.format(
                'bimeNamedUser.id:%s (%s) access_token:%s not matching User.backoffice.config.main.bime.accessToken:%s (User.id:%s email:%s)',
                bimeNamedUser.id,
                bimeNamedUser.login,
                bimeNamedUser.access_token,
                user.backoffice.config.main.bime.accessToken,
                user.id,
                user.email
              )
            );
          }

          console.log(
            chalk.green('✔'),
            util.format(
              'bimeNamedUser.id:%s access_token:%s matching User.backoffice.config.main.bime.accessToken:%s',
              bimeNamedUser.id,
              bimeNamedUser.access_token,
              user.backoffice.config.main.bime.accessToken
            )
          );
        });

        var gsBimeNamedUserGroupsById = {};
        var gsBimeNamedUserGroupIdByBimeNamedUserId = {};
        console.log(
          chalk.bold('Ensuring that BIME NamedUser belongs to one exclusive, well-named BIME NamedUserGroup…')
        );
        _.each(gsBimeNamedUsers, function (bimeNamedUser) {
          if (typeof bimeNamedUser.named_user_group_id === 'undefined') {
            throw new Error(util.format('bimeNamedUser.id:%s named_user_group_id is undefined', bimeNamedUser.id));
          }

          var bimeNamedUserGroup = _.findWhere(bimeNamedUserGroups, { id: bimeNamedUser.named_user_group_id });
          if (typeof bimeNamedUserGroup === 'undefined') {
            throw new Error(
              util.format(
                'bimeNamedUser.named_user_group_id:%s matches no bimeNamedUserGroup',
                bimeNamedUser.named_user_group_id
              )
            );
          }

          // Ensure that BIME NamedUserGroup is exclusive to this BIME NamedUser
          if (_.contains(_.keys(gsBimeNamedUserGroupsById), bimeNamedUserGroup.id)) {
            throw new Error(
              util.format(
                'bimeNamedUserGroup.id:%s “%s” is not exclusive',
                bimeNamedUserGroup.id,
                bimeNamedUserGroup.name
              )
            );
          }

          // Ensure NamedUserGroup name is prefixed with either [admin], [demo], [garage] or [group]
          if (
            !(
              s.startsWith(bimeNamedUserGroup.name, '[admin]') ||
              s.startsWith(bimeNamedUserGroup.name, '[demo]') ||
              s.startsWith(bimeNamedUserGroup.name, '[garage]') ||
              s.startsWith(bimeNamedUserGroup.name, '[group]')
            )
          ) {
            throw new Error(
              util.format(
                'bimeNamedUserGroup.id:%s “%s” is not well-named',
                bimeNamedUserGroup.id,
                bimeNamedUserGroup.name
              )
            );
          }
          gsBimeNamedUserGroupsById[bimeNamedUserGroup.id] = bimeNamedUserGroup;
          gsBimeNamedUserGroupIdByBimeNamedUserId[bimeNamedUser.id] = bimeNamedUserGroup;
          console.log(
            chalk.green('✔'),
            util.format(
              'bimeNamedUser.id:%s belongs to exclusive well-named bimeNamedUserGroup.id:%s “%s”',
              bimeNamedUser.id,
              bimeNamedUserGroup.id,
              bimeNamedUserGroup.name
            )
          );
        });

        // TODO: Public Data Sources

        var garageIdSecuredDataSourceConfigs = {};
        console.log(chalk.bold('Gathering BIME DataSecurityRules for garageId-securedDataSources…'));
        _.each(dataSourcesSecuritiesConfig.securedDataSources, function (securedDataSourceConfig) {
          if (
            securedDataSourceConfig.securityDataFieldName === '.garage.id' ||
            securedDataSourceConfig.securityDataFieldName === 'publicimports_garage_id' ||
            securedDataSourceConfig.securityDataFieldName === 'garage_id'
          ) {
            garageIdSecuredDataSourceConfigs[securedDataSourceConfig.bimeConnectionId] = securedDataSourceConfig;
          }
        });

        // Ensure each BIME Named User is subscribed to proper data security rules
        var bimeDataSecurityIdsByBimeNamedUserId = {};
        var missingBimeDataSecurityRules = [];

        console.log(chalk.bold('Gathering existing BIME Data Securities required for Users…'));
        _.each(gsBimeNamedUsers, function (bimeNamedUser) {
          var user = _.find(users, function (filterableUser) {
            return filterableUser.getId().toString() === bimeNamedUser.external_id;
          });

          var userSecuredGarageIds = user.garageIds.map(function (garageId) {
            return garageId.toString();
          });

          if (!user.hasAllGarages) {
            var bimeDataSecurityRulesForUserSecuredGarageIds = _.filter(gsDataSecurityRules, function (
              bimeDataSecurityRule
            ) {
              if (
                bimeDataSecurityRule.datafield !== '.garage.id' &&
                bimeDataSecurityRule.datafield !== 'publicimports_garage_id' &&
                bimeDataSecurityRule.datafield !== 'garage_id'
              ) {
                return false;
              }

              var intersection = _.intersection(userSecuredGarageIds, bimeDataSecurityRule.authorized_values);
              if (
                intersection.length === userSecuredGarageIds.length &&
                intersection.length === bimeDataSecurityRule.authorized_values.length
              ) {
                if (typeof bimeDataSecurityIdsByBimeNamedUserId[user.id] === 'undefined') {
                  bimeDataSecurityIdsByBimeNamedUserId[user.id] = [];
                }
                bimeDataSecurityIdsByBimeNamedUserId[user.id].push(bimeDataSecurityRule.id);
                return true;
              }
              return false;
            });

            _.each(dataSourcesSecuritiesConfig.securedDataSources, function (securedDataSource) {
              var bimeDataSecurityRuleForUserSecuredGarageIdsForSource = _.find(
                bimeDataSecurityRulesForUserSecuredGarageIds,
                function (bimeDataSecurityRule) {
                  if (bimeDataSecurityRule.connection_id.toString() === securedDataSource.bimeConnectionId.toString()) {
                    return true;
                  }
                  return false;
                }
              );
              if (typeof bimeDataSecurityRuleForUserSecuredGarageIdsForSource === 'undefined') {
                console.log(
                  chalk.yellow('✔'),
                  chalk.yellow(
                    util.format(
                      'Staging missing data security for BIME NamedUser id:%s on Connection id:%s',
                      bimeNamedUser.id,
                      securedDataSource.bimeConnectionId
                    )
                  )
                );
                missingBimeDataSecurityRules.push({
                  bimeNamedUserGroupId: bimeNamedUser.named_user_group_id,
                  bimeDataSecurityRule: {
                    connection_id: securedDataSource.bimeConnectionId,
                    datafield: securedDataSource.securityDataFieldName,
                    authorized_values: userSecuredGarageIds.length > 0 ? userSecuredGarageIds : ['blablablaaa'],
                  },
                });
              } else {
                console.log(
                  chalk.green('✔'),
                  util.format(
                    'Found data security for BIME NamedUser id:%s on Connection id:%s',
                    bimeNamedUser.id,
                    securedDataSource.bimeConnectionId
                  )
                );
              }
            });
          } else {
            var bimeDataSecurityRulesToRemove = _.filter(gsDataSecurityRules, function (bimeDataSecurityRule) {
              if (
                bimeDataSecurityRule.datafield !== '.garage.id' &&
                bimeDataSecurityRule.datafield !== 'publicimports_garage_id' &&
                bimeDataSecurityRule.datafield !== 'garage_id'
              ) {
                return false;
              }
              var namedUserGroupSecurities = _.filter(bimeDataSecurityRule.relatedNamedUserGroupSecurities, function (
                namedUserGroupSecurity
              ) {
                return bimeNamedUser.named_user_group_id === parseInt(namedUserGroupSecurity.named_user_group_id, 10);
              });
              return namedUserGroupSecurities.length > 0;
            });
            console.log(
              chalk.green('✔'),
              util.format(
                'User %s having no garage and %s dataSecurity will be removed',
                user.id,
                bimeDataSecurityRulesToRemove.length
              )
            );
            deletableDataSecurityRules = deletableDataSecurityRules.concat(bimeDataSecurityRulesToRemove);
          }
        });

        if (missingBimeDataSecurityRules.length) {
          if (!autoCreate) {
            throw new Error(
              util.format(
                'Can not create %d missing BIME Data Security Rules: autoCreate is false',
                missingBimeDataSecurityRules.length
              )
            );
          }

          _.each(missingBimeDataSecurityRules, function (dataSecurityRule) {
            promises.push(
              Q().then(function () {
                console.log(chalk.bold(util.format('Creating missing BIME Data Security Rule…')));
                return Q.ninvoke(bimeApi, 'createDataSecurityRule', dataSecurityRule.bimeDataSecurityRule)
                  .then(function (createdDataSecurityRule) {
                    console.log(
                      chalk.green('✔'),
                      util.format('Created BIME Data Security Rule id:%s.', createdDataSecurityRule.id)
                    );
                    return createdDataSecurityRule;
                  })
                  .then(function (createdDataSecurityRule) {
                    var dataSecuritySubscription = {
                      named_user_group_id: dataSecurityRule.bimeNamedUserGroupId,
                      data_security_rule_id: createdDataSecurityRule.id,
                    };
                    return Q.ninvoke(bimeApi, 'createNamedUserGroupSecurity', dataSecuritySubscription).then(function (
                      createdNamedUserGroupSecurity
                    ) {
                      console.log(
                        chalk.green('✔'),
                        util.format('Created BIME Data Security Subscription id:%s.', createdNamedUserGroupSecurity.id)
                      );
                      return createdNamedUserGroupSecurity;
                    });
                  });
              })
            );
          });
        }

        // console.log(chalk.bold('Checking subscriptions…'));
        // _.each(gsBimeNamedUsers, function(bimeNamedUser) {
        //   var user = _.find(users, function(user) {
        //     return user.getId().toString() == bimeNamedUser.external_id;
        //   });

        //   _.each(bimeDataSecurityIdsByBimeNamedUserId[user.id], function(bimeDataSecurityId) {
        //     var bimeDataSecurity = bimeDataSecurityRulesById[bimeDataSecurityId];

        //     // Ensure that a subscription exists for this source, for these authorized values, for this user's named user group

        //     var matchingBimeNamedUserGroupSecurities = _.filter(bimeNamedUserGroupSecurities, function(bimeNamedUserGroupSecurity) {
        //       return (
        //         bimeDataSecurityId == bimeNamedUserGroupSecurity.data_security_rule_id
        //         && bimeNamedUser.named_user_group_id == bimeNamedUserGroupSecurity.named_user_group_id
        //       );
        //     });

        //   });

        // });

        return Q.all(promises)
          .then(function () {
            console.log(chalk.green('✔'), chalk.green('Deleting orphan data securities'));
            var promises1 = [];
            _.each(deletableDataSecurityRules, function (dataSecurityRule) {
              var defer = Q.defer();
              bimeApi.deleteDataSecurityRule(dataSecurityRule.id, function (err) {
                if (err) {
                  if (parseInt(err.response.statusCode / 100, 10) === 4) {
                    console.log(
                      chalk.yellow('✔'),
                      chalk.yellow(
                        util.format(
                          'Warning missing data security from BIME id:%s on Connection id:%s',
                          dataSecurityRule.id,
                          dataSecurityRule.connection_id
                        )
                      )
                    );
                    defer.resolve();
                  } else {
                    defer.reject();
                  }
                } else {
                  defer.resolve();
                }
              });
              promises1.push(defer.promise);
            });
            return Q.all(promises1);
          })
          .then(function (createdNamedUserGroupSecurities) {
            console.log(
              gsLogger.inspect({
                createdNamedUserGroupSecurities: createdNamedUserGroupSecurities,
              })
            );
            return warnings;
          });

        // TODO : Subscriptions
        // TODO : Dashboards
        // TODO : Special case: empty user.garageIds means no security
      })

      .done(
        function onFulfilled(warnings) {
          console.log(chalk.green.bold('All Done!'));
          callback(null, warnings);
        },
        function onRejected(err) {
          console.error(chalk.red.bold(err.stack ? err.stack : err));
          callback(err);
        }
      );
  },
};
