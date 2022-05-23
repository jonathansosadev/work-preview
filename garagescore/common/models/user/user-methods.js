/**
 *
 * Set of methods (extracted from the User Model)
 *
 * You can use them if you dont have a full loopback User because you have directly used mongo
 * It's still better to use mongo projection instead of those methods (less network consumption)
 */
const moment = require('moment');

const UserAuthorization = require('../user-autorization');
const { isGarageScoreUserByEmail } = require('../../lib/garagescore/custeed-users');
const userMongo = require('./user-mongo');
const { setUserExportConfigurations } = require('./set_user_export_configurations');
const { RGA, log } = require('../../../common/lib/util/log');
//
// ===================== SIMPLE FUNCTION (NON-ASYNC) =====================
//

const hasAuthorization = ({ authorization: userAuth }, authorization) => {
  return UserAuthorization[authorization] && userAuth && userAuth[authorization];
};
const isResetPasswordVeryRecent = ({ resetPassword = null } = {}) => {
  if (!resetPassword) {
    return false;
  }
  const { createdDate } = resetPassword;
  return createdDate && moment(createdDate).add(10, 'minutes').isAfter(moment());
};
const isGarageScoreUser = ({ email = null } = {}) => {
  if (!email) {
    return false;
  }
  return isGarageScoreUserByEmail(email);
};
const isGod = ({ email = null, garageIds = [] } = {}) => {
  // Quick hack to replace hasAllGarages, use the length of garageIds. Like if there are more than 1000 we can safely say it's a god
  return isGarageScoreUser({ email }) && garageIds.length > 1000;
};
const isGhost = ({ email }) => {
  // 2018-08-21 remove @ford according to ticket
  return false; // email.toLowerCase().indexOf('@ford.com') >= 0; // for now it's just a hack
};

const hasAccessToGarage = ({ garageIds }, garageId) => {
  return garageIds.map((gId) => gId.toString()).includes(garageId.toString());
};

const isPriorityProfile = ({ job }) => {
  return [
    'Actionnaire / Président',
    'Directeur général',
    'Direction marketing groupe',
    'Direction qualité & méthodes groupe',
    'Direction des ventes groupe',
    'Direction des ventes VN groupe',
    'Direction des ventes VO groupe',
    'Direction atelier groupe',
    'Directeur de marque',
    'Directeur de concession',
    "Chef d'atelier concession",
    'Responsable qualité concession',
    'Responsable des ventes VN & VO concession',
    'Responsable des ventes VN concession',
    'Responsable des ventes VO concession',
    'Responsable marketing concession',
    'Responsable digital',
    'Direction de la communication groupe',
  ]
    .map((e) => e.toLowerCase())
    .includes(job ? job.toLowerCase() : '');
};

const getFullName = ({ firstName, lastName, email }) => {
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  return firstName && lastName ? `${capitalize(firstName)} ${capitalize(lastName)}` : email;
};

const getUserReducedFormat = (user) => {
  return {
    id: user._id || user.id || user.getId(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    civility: user.civility,
    postCode: user.postCode,
    phone: user.phone,
    mobilePhone: user.mobilePhone,
    fax: user.fax,
    job: user.job,
    businessName: user.businessName,
    address: user.address,
    city: user.city,
    authorization: user.authorization,
    garageIds: user.garageIds,
    groupIds: user.groupIds,
    allGaragesAlerts: user.allGaragesAlerts,
    reportConfigs: user.reportConfigs,
    lastCockpitOpenAt: user.lastCockpitOpenAt,
    resetPasswordVeryRecent: isResetPasswordVeryRecent(user),
  };
};

//
// ===================== ASYNC FUNCTION =====================
//

const addUser = async (app, userData) => {
  const instance = await app.models.User.createUserInstance(userData);
  const user = await app.models.User.create(instance);

  await new Promise((resolve, reject) => {
    user.resetPasswordAndSendWelcomeEmail((e) => {
      if (e) {
        reject();
        return;
      }
      resolve();
    });
  });

  //adding user export configurations
  try {
    const valuesToInsert = await setUserExportConfigurations(app, user);
    await app.models.CockpitExportConfiguration.getMongoConnector().insertMany(valuesToInsert);
  } catch (error) {
    log.error(RGA, error);
  }
  return user;
};

// Format is: { 'garageId': [user1, user2, ...] }
const getUsersByGarageId = async (app, garageIds, $project) => {
  // Light version of getUsersByGarageId which doesn't use additional stages
  // It also format the results into a nice object, like the one we were using prior to the opti
  const rawResult = await userMongo.getUsersByGarageId(app, garageIds, $project);
  return Object.fromEntries(rawResult.map(({ _id, users }) => [_id.toString(), users]));
};

const getUserIdsByGarageId = async (app, garageIds, graphQlQuery = null) => {
  // Light version of getUsersByGarageId which doesn't use additional stages and gives userIds only
  // It also format the results into a nice object, like the one we were using prior to the opti
  const rawResult = await userMongo.getUsersByGarageId(app, garageIds, {}, [], graphQlQuery);
  return Object.fromEntries(rawResult.map(({ _id, users }) => [_id.toString(), users.map((u) => u.id)]));
};

module.exports = {
  hasAuthorization,
  isResetPasswordVeryRecent,
  isGarageScoreUser,
  isGod,
  isGhost,
  hasAccessToGarage,
  isPriorityProfile,
  getFullName,
  getUserReducedFormat,
  addUser,
  getUsersByGarageId,
  getUserIdsByGarageId,
};
