const async = require('async');
const ContacType = require('../../../../common/models/contact.type');
const AlertType = require('../../../../common/models/alert.types');

function AlertSubscriber(app) {
  this.userModel = app.models.User;
  this.alertModel = app.models.Alert;
  this.contactModel = app.models.Contact;
}

function hackAlertTypeForSubscription(alertType) {
  /*  Transforms the alertType into another alertType that is compatible with the alert subscriptions we can set on users
    Input: alertType we want to send
    Output: its equivalent in terms of user subscriptions to alerts
    */
  switch (alertType) {
    // UNSATISFIED_MAINTENANCE
    case AlertType.UNSATISFIED_FOLLOWUP:
    case AlertType.UNSATISFIED_MAINTENANCE_WITH_LEAD:
    case AlertType.SENSITIVE_MAINTENANCE:
    case AlertType.SENSITIVE_MAINTENANCE_WITH_LEAD:
      return AlertType.UNSATISFIED_MAINTENANCE;

    // UNSATISFIED_VN
    case AlertType.SENSITIVE_VN:
    case AlertType.UNSATISFIED_FOLLOWUP_VN:
      return AlertType.UNSATISFIED_VN;

    // UNSATISFIED_VO
    case AlertType.SENSITIVE_VO:
    case AlertType.UNSATISFIED_FOLLOWUP_VO:
      return AlertType.UNSATISFIED_VO;

    // UNSATISFIED_VI
    case AlertType.SENSITIVE_VI:
    case AlertType.UNSATISFIED_FOLLOWUP_VI:
      return AlertType.UNSATISFIED_VI;

    // LEAD_APV
    case AlertType.LEAD_FOLLOWUP_APV_RDV_NOT_PROPOSED:
    case AlertType.LEAD_FOLLOWUP_APV_NOT_RECONTACTED:
    case AlertType.AUTOMATION_LEAD_APV:
      return AlertType.LEAD_APV;

    // LEAD_VN
    case AlertType.LEAD_FOLLOWUP_VN_RDV_NOT_PROPOSED:
    case AlertType.LEAD_FOLLOWUP_VN_NOT_RECONTACTED:
    case AlertType.AUTOMATION_LEAD_VN:
      return AlertType.LEAD_VN;

    // LEAD_VO
    case AlertType.LEAD_FOLLOWUP_VO_RDV_NOT_PROPOSED:
    case AlertType.LEAD_FOLLOWUP_VO_NOT_RECONTACTED:
    case AlertType.AUTOMATION_LEAD_VO:
      return AlertType.LEAD_VO;

    // We didn't find our case, return the alertType raw
    default:
      return alertType;
  }
}

/**
 * unsubscribe user from all alerts even the pending ones
 * @param userId ObjectId for UserModel
 * @param callback Function(error,user) with user is UserModel or null
 */
AlertSubscriber.prototype.unsubscribeUserFromAll = function unsubscribeUserFromAll(userId, callback) {
  const userModel = this.userModel;
  const alertModel = this.alertModel;
  const contactModel = this.contactModel;
  async.auto(
    {
      user: function getUserInstance(cb) {
        userModel.findOne({ where: { id: userId } }, (err, user) => {
          cb(err || !user ? err || `user ${userId} not found` : null, user);
        });
      },
      deleteUserIdsInAlert: [
        'user',
        (cb, res) => {
          const user = res.user;
          alertModel.find({ where: { 'foreign.userIds': user.getId().toString() } }, (err2, alerts) => {
            if (err2) {
              callback(err2);
              return;
            }
            async.eachSeries(
              alerts,
              (alert, cb2) => {
                alert.foreign.userIds.splice(alert.foreign.userIds.indexOf(user.getId().toString()), 1);
                if (!alert.foreign.permanentlyDeletedUserIds) {
                  alert.foreign.permanentlyDeletedUserIds = []; // eslint-disable-line no-param-reassign
                }
                alert.foreign.permanentlyDeletedUserIds.push(user.getId().toString());
                alert.updateAttribute('foreign', alert.foreign, cb2);
              },
              cb
            );
          });
        },
      ],
      deleteUserIdsInContact: [
        'user',
        (cb, res) => {
          const user = res.user;
          contactModel.find(
            {
              where: { 'payload.addresseeId': user.getId().toString(), type: ContacType.ALERT_EMAIL },
            },
            (err2, contacts) => {
              if (err2) {
                callback(err2);
                return;
              }
              async.eachSeries(
                contacts,
                (contact, cb2) => {
                  contact.payload.permanentlyDeletedAddresseeId = user.getId().toString(); // eslint-disable-line no-param-reassign
                  contact.payload.addresseeId = null; // eslint-disable-line no-param-reassign
                  contact.updateAttribute('payload', contact.payload, cb2);
                },
                cb
              );
            }
          );
        },
      ],
      updateUser: [
        'deleteUserIdsInContact',
        'deleteUserIdsInAlert',
        'user',
        (cb, res) => {
          res.user.updateAttribute('alerts', [], cb);
        },
      ],
    },
    callback
  );
};

/**
 * Get Subscribed users for a garage and for a specific alertType
 * @param garageId ObjectId for GarageModel
 * @param alertType AlertSubscriber.prototype.types
 */
AlertSubscriber.prototype.getSubscribedUsers = async function getSubscribedUsers(garageId, alertType) {
  const UserModel = this.userModel;
  const fields = { id: true, email: true, fullName: true, allGaragesAlerts: true };
  const garageUsers = await UserModel.getUsersForGarage(garageId, fields);
  return garageUsers.filter(
    (user) => user.allGaragesAlerts && user.allGaragesAlerts[hackAlertTypeForSubscription(alertType)]
  );
};

module.exports = AlertSubscriber;
