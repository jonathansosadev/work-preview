/* eslint-disable */
/**
 * A user can be subscribed to garages G1,G2 and G3
 * but it could be subscribed to recieve alerts of other garages G4, G5...
 * this script detect incoherant alerte subscriptions
 * */
var _ = require('lodash');
var async = require('async');
var app = require('../../../server/server.js');

app.on('booted', function () {
  var User = app.models.User;
  async.auto(
    {
      users: function (cb) {
        User.find({}, cb);
      },
      usersSubscribedToSingleAlerts: [
        'users',
        function (cb, res) {
          cb(
            null,
            _.filter(res.users, function (u) {
              return u.alerts && u.alerts.length > 0;
            })
          );
        },
      ],
      processUsers: [
        'users',
        function (cb, res) {
          console.log('users  : ' + res.users.length);

          for (const user of res.users) {
            const { garageIds } = user;
            if (!user.alerts || user.alerts.length === 0 || garageIds.length === 0) {
              cb2();
              return;
            }
            var garageIds2 = garageIds.map(function (g) {
              return g.toString();
            });
            var notInScopeGarages = [];
            _.each(user.alerts, function (alert) {
              if (alert.types && alert.types.length > 0 && garageIds2.indexOf(alert.garageId) === -1) {
                notInScopeGarages.push(alert.garageId);
              }
            });
            if (notInScopeGarages.length) {
              console.log(
                'Error for user ' +
                  user.email +
                  ' : garage is not in the scope of the user' +
                  notInScopeGarages.join(',')
              );
              cb2();
              return;
            }
            var alertLeadGarageIds = _.filter(user.alerts, function (a) {
              return a.types && a.types.indexOf('Lead') > -1;
            }).map(function (a) {
              return a.garageId.toString();
            });
            var alertUnsatisfiedVnGarageIds = _.filter(user.alerts, function (a) {
              return a.types && a.types.indexOf('UnsatisfiedVn') > -1;
            }).map(function (a) {
              return a.garageId.toString();
            });
            var alertUnsatisfiedVoGarageIds = _.filter(user.alerts, function (a) {
              return a.types && a.types.indexOf('UnsatisfiedVo') > -1;
            }).map(function (a) {
              return a.garageId.toString();
            });
            var alertUnsatisfiedMaintenanceGarageIds = _.filter(user.alerts, function (a) {
              return a.types && a.types.indexOf('UnsatisfiedMaintenance') > -1;
            }).map(function (a) {
              return a.garageId.toString();
            });
            var userCoeff = 0; // must === 4;

            var intersectLead = _.intersection(garageIds2, alertLeadGarageIds);
            if (alertLeadGarageIds.length && intersectLead.length === garageIds2.length) {
              console.log('User ' + user.email + ' can be migrated for lead');
              userCoeff++;
            }
            if (alertLeadGarageIds.length === 0) {
              console.log('User ' + user.email + ' not subscribed to lead ');
              userCoeff++;
            }

            var intersectUnsatisfiedVn = _.intersection(garageIds2, alertUnsatisfiedVnGarageIds);
            if (alertUnsatisfiedVnGarageIds.length && intersectUnsatisfiedVn.length === garageIds2.length) {
              console.log('User ' + user.email + ' can be migrated for UnsatisfiedVn');
              userCoeff++;
            }
            if (alertUnsatisfiedVnGarageIds.length === 0) {
              console.log('User ' + user.email + ' not subscribed to UnsatisfiedVn');
              userCoeff++;
            }

            var intersectUnsatisfiedVo = _.intersection(garageIds2, alertUnsatisfiedVoGarageIds);
            if (alertUnsatisfiedVoGarageIds.length && intersectUnsatisfiedVo.length === garageIds2.length) {
              console.log('User ' + user.email + ' can be migrated for UnsatisfiedVo');
              userCoeff++;
            }
            if (alertUnsatisfiedVoGarageIds.length === 0) {
              console.log('User ' + user.email + ' not subscribed to UnsatisfiedVo');
              userCoeff++;
            }

            var intersectUnsatisfiedMaintenance = _.intersection(garageIds2, alertUnsatisfiedMaintenanceGarageIds);
            if (
              alertUnsatisfiedMaintenanceGarageIds.length &&
              intersectUnsatisfiedMaintenance.length === garageIds2.length
            ) {
              console.log('User ' + user.email + ' can be migrated for UnsatisfiedMaintenance');
              userCoeff++;
            }
            if (alertUnsatisfiedMaintenanceGarageIds.length === 0) {
              console.log('User ' + user.email + ' not subscribed to UnsatisfiedMaintenance');
              userCoeff++;
            }
            if (userCoeff !== 4) {
              console.log('incoherent user : ' + user.email);
            }
          }
          cb();
        },
      ],
    },
    function (err) {
      if (err) {
        throw err;
      }
    }
  );
});
