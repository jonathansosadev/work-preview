const lodash = require('lodash');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const { promisify } = require('util');
const debug = require('debug')('garagescore:server:boot-users:02-override-user-methods');

const UserSubscriptionStatus = require('../../common/models/user-subscription-status.js');
const UserAuthorization = require('../../common/models/user-autorization');
const commonTicket = require('../../common/models/data/_common-ticket');
const ContacType = require('../../common/models/contact.type');
const AlertTypes = require('../../common/models/alert.types');
const GarageSubscriptions = require('../../common/models/garage.subscription.type');
const GarageTypes = require('../../common/models/garage.type');
const GarageSubscriptionTypes = require('../../common/models/garage.subscription.type');
const SubscriptionPrices = require('../../common/models/subscription-price.type.js');

const ContactService = require('../../common/lib/garagescore/contact/service');
const {
  isGarageScoreTechnicalTeamMemberByEmail,
  customerSuccessAliasEmail,
} = require('../../common/lib/garagescore/custeed-users.js');
const publicApi = require('../../common/lib/garagescore/api/public-api');
const slackClient = require('../../common/lib/slack/client');

const userMethods = require('../../common/models/user/user-methods');
const { getUserGarages, getUsersByGarageId } = require('../../common/models/user/user-mongo');
const { isSubscribed, updateFromObject, hasMakeSurveys } = require('../../common/models/garage/garage-methods');

const { UserRoles } = require('../../frontend/utils/enumV2');

const _aMinute = 60000; // Milliseconds in a minute
const _accessHistoryCache = {};
const { RGA, log } = require('../../common/lib/util/log');

module.exports = function (app) {
  const { User, Garage, CockpitExportConfiguration } = app.models;
  //
  // ===================== HELPER FUNCTIONS =====================
  //

  const _getAccessCache = async () => {
    if (Object.keys(_accessHistoryCache).length !== 0) return _accessHistoryCache;
    const lastHourAccess = new Date();
    lastHourAccess.setHours(lastHourAccess.getHours() - 1);
    const accessHistories = await app.models.AccessHistory.find({ where: { createdAt: { gt: lastHourAccess } } });
    accessHistories.forEach((access) => {
      if (!_accessHistoryCache[access.userId]) _accessHistoryCache[access.userId] = {};
      _accessHistoryCache[access.userId][access.section] = access;
    });
    return _accessHistoryCache;
  };
  const _printList = (garages) => {
    let result = garages[0];

    for (let i = 1; i < garages.length && i < 10; ++i) {
      if (i + 1 >= garages.length && garages.length <= 10) {
        result += ` et ${garages[i]}`;
      } else {
        result += `, ${garages[i]}`;
      }
    }
    if (garages.length > 10) {
      const remaining = garages.length - 10;
      result += ` et ${remaining} autre${remaining > 1 ? 's' : ''} établissement${remaining > 1 ? 's' : ''}`;
    }
    return result;
  };

  //
  // ===================== CLASS METHODS =====================
  //

  User.addAccess = async function addAccess(userObjectId, access, delayInMinutes = 60) {
    // default set to a hour if no delayInMinutes set
    if (!access) return;
    const now = new Date();
    const delay = delayInMinutes * _aMinute; // minutes to milliseconds
    const accessCache = await _getAccessCache();

    if (!accessCache[userObjectId]) accessCache[userObjectId] = {};
    if (
      !accessCache[userObjectId][access.section] ||
      now - accessCache[userObjectId][access.section].createdAt > delay
    ) {
      accessCache[userObjectId][access.section] = access;
      const newAccess = new app.models.AccessHistory({ ...access, userObjectId });
      await newAccess.save();
      await User.findByIdAndUpdateAttributes(userObjectId, { accessCount: (this.accessCount || 0) + 1 });
    }
    // const accessKey = `${user.id}:${access.ip}:${access.section}`;
  };
  User.getUsersForGarage = async function getUsersForGarage(garageId, project) {
    const fields = project || undefined;
    return User.find({ where: { garageIds: new ObjectID(garageId.toString()) }, fields });
  };
  User.getUsersForGarages = async function getUsersForGarage(garageIds, project) {
    const fields = project || undefined;
    return User.getMongoConnector()
      .find({ garageIds: { $in: garageIds } }, { fields })
      .toArray();
  };
  User.giveAuthorizationToGaragesUsers = async function giveAuthorizationToGaragesUsers(authorization, garageIds) {
    const additionalStages = [{ $unwind: '$users' }, { $group: { _id: null, usersList: { $addToSet: '$users.id' } } }];
    const [{ usersList }] = await getUsersByGarageId(User.app, garageIds, {}, additionalStages);
    await User.getMongoConnector().updateMany(
      { _id: { $in: usersList } },
      { $set: { [`authorization.${authorization}`]: true } }
    );
  };
  User.getReducedFormat = function getReducedFormat(user) {
    return {
      id: user._id || user.getId(),
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
      role: user.role,
      businessName: user.businessName,
      address: user.address,
      city: user.city,
      authorization: user.authorization,
      garageIds: user.garageIds,
      groupIds: user.groupIds,
      allGaragesAlerts: user.allGaragesAlerts,
      reportConfigs: user.reportConfigs,
      lastCockpitOpenAt: user.lastCockpitOpenAt,
      resetPasswordVeryRecent: user.isResetPasswordVeryRecent(),
    };
  };
  User.getRealUsersByGarage = async function getRealUsersByGarage(garageIds = []) {
    const rawResult = await getUsersByGarageId(User.app, [...garageIds], { email: '$email' });
    const filterUser = ({ email }) => !userMethods.isGarageScoreUser({ email }) && !userMethods.isGhost({ email });
    return Object.fromEntries(rawResult.map(({ _id, users }) => [_id.toString(), users.filter(filterUser)]));
  };
  User.createUserInstance = async function createUserInstance({
    email,
    garageIds,
    firstName,
    lastName,
    jobName = 'Secrétariat général',
    role = UserRoles.USER,
    civility,
    defaultAuthorization: authorization = {
      [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      [UserAuthorization.ACCESS_TO_WELCOME]: true,
      [UserAuthorization.ACCESS_TO_SATISFACTION]: true,
      [UserAuthorization.ACCESS_TO_UNSATISFIED]: true,
      [UserAuthorization.ACCESS_TO_LEADS]: true,
      [UserAuthorization.ACCESS_TO_AUTOMATION]: true,
      [UserAuthorization.ACCESS_TO_CONTACTS]: true,
      [UserAuthorization.ACCESS_TO_E_REPUTATION]: true,
      [UserAuthorization.ACCESS_TO_ESTABLISHMENT]: true,
      [UserAuthorization.ACCESS_TO_TEAM]: true,
      [UserAuthorization.ACCESS_TO_ADMIN]: true,
      [UserAuthorization.WIDGET_MANAGEMENT]: true,
    },
    defaultFirstVisit = {
      REPUTATION: true,
    },
    subscriptionRequestId,
    phone,
    mobilePhone,
    subscriptionStatus = UserSubscriptionStatus.INITIALIZED,
  }) {
    const jobInstance = await app.models.UserJob.getMongoConnector().findOne(
      { name: jobName },
      { projection: { defaultUserConfig: true } }
    );
    const rawInstance = {
      email: email.toLowerCase(),
      civility,
      password: Math.random().toString(36).substr(2),
      firstName,
      lastName,
      phone,
      mobilePhone,
      job: jobName,
      role,
      garageIds,
      subscriptionStatus,
      authorization,
      firstVisit: { ...(defaultFirstVisit || {}) },
      subscriptionRequestId,
    };
    ['reportConfigs', 'allGaragesAlerts'].forEach((userField) => {
      if (jobInstance && jobInstance.defaultUserConfig && jobInstance.defaultUserConfig[userField]) {
        rawInstance[userField] = jobInstance.defaultUserConfig[userField];
      }
    });
    return new User(rawInstance);
  };
  User.isManager = async function isManager(user) {
    const userJob = await app.models.UserJob.getMongoConnector().findOne(
      { name: user.job },
      { projection: { _id: 0, isManager: 1 } }
    );
    return userJob ? !!userJob.isManager : true;
  };
  User.destroyByIdAndClean = async function destroyByIdAndClean(user, loggedUser) {
    try {
      const garages = await getUserGarages(User.app, user._id.toString(), { _id: 0, publicDisplayName: 1 }, [
        { $limit: 4 },
      ]);
      const { firstName, lastName, job, email } = user;
      const phone = user.mobilePhone || user.phone;
      let postOnSlack;
      let garageList = '';
      if (job) {
        postOnSlack = await User.isManager(user);
      }
      // Remove user from places
      await commonTicket.resetManagerId(user._id);
      await User.getMongoConnector().deleteOne({ _id: new ObjectID(user._id.toString()) });

      //remove user configurations
      try {
        await CockpitExportConfiguration.getMongoConnector().deleteMany({ userId: new ObjectID(user._id.toString()) });
      } catch (error) {
        log.error(RGA, error);
      }

      // Post slack message
      if (postOnSlack) {
        const limit = garages.length > 3 ? 3 : garages.length;
        for (let i = 0; i < limit; ++i) {
          garageList += `${garages[i].publicDisplayName}${i + 1 >= limit ? '' : ', '}`;
        }
        if (garages.length > 3) {
          garageList += '...';
        }
        await new Promise((res, rej) =>
          slackClient.postMessage(
            {
              text: `Un utilisateur "manager" vient d'être supprimé : *${firstName} ${lastName}*, _${job}_\nTéléphone : ${phone}, Email : ${email}\nÉtablissement${
                garages.length > 1 ? 's' : ''
              } : ${garages.length ? garageList : '_Aucun..._'}`,
              channel: '#channel_of_users_death',
              username: loggedUser,
              attachments: [
                {
                  fallback: `Envoyer un email à cet utilisateur : ${email}`,
                  actions: [
                    ...(email
                      ? [
                          {
                            type: 'button',
                            text: 'Envoyer Email ✉',
                            url: `mailto:${email}`,
                          },
                        ]
                      : []),
                    ...(phone
                      ? [
                          {
                            type: 'button',
                            text: 'Téléphoner 📱',
                            url: `tel:${phone}`,
                          },
                        ]
                      : []),
                  ],
                },
              ],
            },
            (e) => (e ? rej(e) : res())
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  //
  // ===================== INSTANCE METHODS =====================
  //

  User.prototype.isProfileComplete = function isProfileComplete() {
    if (this.email && this.email.match(/@garagescore\.com|@custeed\.com/)) {
      return true;
    }
    return (
      this.civility && this.lastName && this.firstName && this.job && this.email && (this.phone || this.mobilePhone)
    );
  };
  User.prototype.isPriorityProfile = function isPriorityProfile() {
    return userMethods.isPriorityProfile(this);
  };
  User.prototype.setAuthorization = async function addAuthorization(authorization, val, save = false) {
    if (authorization && typeof val === 'boolean') {
      if (!this.authorization) {
        this.authorization = {};
      }
      this.authorization[authorization] = val;
      if (save) {
        await this.save();
      }
    }
  };
  User.prototype.setAlert = async function setAlert(alert, val, save = false) {
    if (alert && typeof val === 'boolean') {
      if (!this.allGaragesAlerts) {
        this.allGaragesAlerts = {};
      }
      this.allGaragesAlerts[alert] = val;
      if (save) {
        await this.save();
      }
    }
  };
  User.prototype.setAuthorizationRequest = async function setAuthorizationRequest(authorization, val, save = false) {
    if (authorization && typeof val === 'boolean') {
      if (!this.authRequest) {
        this.authRequest = {};
      }
      this.authRequest[authorization] = val;
      if (save) {
        await this.save();
      }
    }
  };
  const sendMeSubscriptionConfirmationEmail = async (subscriptionGarages, user) => {
    if (subscriptionGarages && subscriptionGarages.length) {
      let nbFrenchGarages = 0;
      await new Promise((res, rej) =>
        ContactService.prepareForSend(
          {
            to: user.email,
            cc: [{ name: 'Equipe Commerce Custeed', address: 'commerce@custeed.com' }],
            recipient: `${user.firstName} ${user.lastName}`,
            from: 'no-reply@custeed.com',
            sender: 'Custeed',
            type: ContacType.SUBSCRIPTION_CONFIRMATION_EMAIL,
            payload: {
              subscriptionStartDate: new Date(),
              subscriptionGaragesCount: subscriptionGarages.length,
              subscriptionGaragesList: _printList(subscriptionGarages.map((garage) => garage.publicDisplayName)),
              subscriptions: subscriptionGarages.map((garage) => {
                const isFrenchGarage = garage.locale === 'fr_FR';
                if (isFrenchGarage) nbFrenchGarages++;
                return {
                  name: 'ReputyScore',
                  basePrice: isFrenchGarage ? 29 : 20,
                };
              }),
              totalPrice: nbFrenchGarages * 29 + (subscriptionGarages.length - nbFrenchGarages) * 20,
            },
          },
          (e) => (e ? rej(e) : res())
        )
      );
    }
    return true;
  };
  User.prototype.isGarageScoreUser = function isGarageScoreUser() {
    return userMethods.isGarageScoreUser({ email: this.email });
  };
  User.prototype.isGod = function _isGod() {
    return userMethods.isGod({ email: this.email, garageIds: this.garageIds });
  };
  User.prototype.isGhost = function isGhost() {
    return userMethods.isGhost({ email: this.email });
  };
  User.prototype.isGarageTechnicalTeamMember = function isGarageTechnicalTeamMember() {
    return isGarageScoreTechnicalTeamMemberByEmail(this.email);
  };
  User.prototype.hasAuthorization = function _hasAuthorization(authorization) {
    return userMethods.hasAuthorization({ authorization: this.authorization }, authorization);
  };
  User.prototype.isSubscribedToRealTimeAlert = function isSubscribedToRealTimeAlert(name) {
    return this.allGaragesAlerts && this.allGaragesAlerts[name];
  };
  User.prototype.getFullName = function getFullName() {
    return userMethods.getFullName({ firstName: this.firstName, lastName: this.lastName, email: this.email });
  };
  User.prototype.getShortDescription = function getShortDescription() {
    if (this.firstName && this.lastName)
      return `${lodash.capitalize(this.firstName)} ${lodash.capitalize(this.lastName)}`;
    return this.email;
  };
  User.resetPasswordAndSendEmailWithMongo = async ({ _id, resetPassword, email, firstName, lastName }) => {
    if (userMethods.isResetPasswordVeryRecent({ resetPassword })) {
      throw new Error('Error resetPasswordAndSendEmail: User reset was asked recently');
    }
    const oldToken = resetPassword && resetPassword.token;
    const newToken = new Buffer(
      Date.now()
        .toString()
        .split('')
        .join(Math.floor(Math.random() * 10))
    ).toString('base64');
    resetPassword = { token: oldToken || newToken, createdDate: new Date(), userId: _id };
    await app.models.User.getMongoConnector().updateOne({ _id }, { $set: { resetPassword } });
    const sendContact = promisify(ContactService.prepareForSend).bind(ContactService);
    const recipient = userMethods.getFullName({ firstName, lastName, email });
    return sendContact({
      to: email,
      recipient,
      from: 'no-reply@custeed.com',
      sender: 'GarageScore',
      type: ContacType.RESET_PASSWORD_EMAIL,
      payload: resetPassword,
    });
  };
  User.prototype.resetPasswordAndSendEmail = function resetPasswordAndSendEmail(callback) {
    // WARNING: Don't use, use resetPasswordAndSendEmail from common/models/user/user-methods.js instead
    if (this.isResetPasswordVeryRecent()) {
      callback('resetAskedRecently');
      return;
    }
    const oldToken = this.resetPassword && this.resetPassword.token;
    const resetPassword = {
      token:
        oldToken ||
        new Buffer(
          Date.now()
            .toString()
            .split('')
            .join(Math.floor(Math.random() * 10))
        ).toString('base64'),
      createdDate: new Date(),
      userId: this.getId(),
    };
    this.updateAttributes({ resetPassword }, (err) => {
      if (err) {
        callback(err);
        return;
      }
      ContactService.prepareForSend(
        {
          to: this.email,
          recipient: this.getFullName(),
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContacType.RESET_PASSWORD_EMAIL,
          payload: resetPassword,
        },
        callback
      );
    });
  };
  User.prototype.resetPasswordAndSendWelcomeEmail = function resetPasswordAndSendWelcomeEmail(callback) {
    const self = this;
    const resetPassword = {
      token: new Buffer(
        Date.now()
          .toString()
          .split('')
          .join(Math.floor(Math.random() * 10))
      ).toString('base64'),
      createdDate: new Date(),
      userId: this.getId(),
    };
    self.updateAttributes({ resetPassword }, (err) => {
      if (err) {
        callback(err);
        return;
      }
      ContactService.prepareForSend(
        {
          to: self.email,
          recipient: self.getFullName(),
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContacType.WELCOME_EMAIL,
          payload: { ...resetPassword, job: self.job || null, cockpitType: self.cockpitType || null },
        },
        (e) => {
          callback(e, self);
        }
      );
    });
  };
  User.resetPasswordAndSendWelcomeEmailWithMongo = async ({ _id, email, fullName, job, cockpitType }) => {
    const resetPassword = {
      token: new Buffer(
        Date.now()
          .toString()
          .split('')
          .join(Math.floor(Math.random() * 10))
      ).toString('base64'),
      createdDate: new Date(),
      userId: _id.toString(),
    };

    // Update user via mongo
    const user = await app.models.User.getMongoConnector().updateOne(
      {
        _id: _id,
      },
      { $set: { resetPassword } }
    );

    await promisify(ContactService.prepareForSend)({
      to: email,
      recipient: fullName,
      from: 'no-reply@custeed.com',
      sender: 'GarageScore',
      type: ContacType.WELCOME_EMAIL,
      payload: { ...resetPassword, job: job || null, cockpitType: cockpitType || null },
    });

    return user;
  };
  User.prototype.isResetPasswordVeryRecent = function _isResetPasswordVeryRecent() {
    return userMethods.isResetPasswordVeryRecent({ resetPassword: this.resetPassword });
  };
  User.prototype.getReducedFormat = function getReducedFormat() {
    return User.getReducedFormat(this);
  };
  User.prototype.sendMakeSurveysEmail = async function sendMakeSurveysEmail() {
    if (this.makeSurveysSentAt !== moment().format('MMYYYY')) {
      await new Promise((res, rej) =>
        ContactService.prepareForSend(
          {
            to: this.email,
            recipient: this.getFullName(),
            from: 'no-reply@custeed.com',
            sender: 'GarageScore',
            type: ContacType.ALERT_EMAIL,
            payload: {
              alertType: AlertTypes.MAKE_SURVEYS,
              addresseeId: this.getId().toString(),
            },
          },
          (e) => (e ? rej(e) : res())
        )
      );
      await app.models.User.findByIdAndUpdateAttributes(this.getId(), { makeSurveysSentAt: moment().format('MMYYYY') });
      return true;
    }
    return false;
  };
  User.prototype.notifyMakeSurveyChanges = async function notifyMakeSurveyChanges(data) {
    await new Promise((res, rej) =>
      ContactService.prepareForSend(
        {
          to: this.email,
          cc: [{ name: 'Équipe Custeed', address: 'customer_success@custeed.com' }],
          recipient: this.getFullName(),
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContacType.ALERT_EMAIL,
          payload: {
            alertType: AlertTypes.MAKE_SURVEYS_NOTIFICATION,
            data,
          },
        },
        (e) => (e ? rej(e) : res())
      )
    );
  };
  User.notifyCustomerCusteed = async function notifyMakeSurveyChanges(data, contactType, alertTypeArg) {
    const type = contactType || ContacType.ALERT_EMAIL;
    const alertType = alertTypeArg || AlertTypes.MAKE_SURVEYS_NOTIFICATION;
    await new Promise((res, rej) =>
      ContactService.prepareForSend(
        {
          to: customerSuccessAliasEmail,
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: type,
          payload: { alertType: alertType, data },
        },
        (e) => (e ? rej(e) : res())
      )
    );
  };
  User.prototype.isManager = async function isManager() {
    const jobs = await app.models.UserJob.find({});
    const userJob = jobs.find((job) => job.name === this.job);

    return userJob ? !!userJob.isManager : true;
  };
  User.prototype.addAccess = async function addAccess(access, delayInMinutes = 60) {
    // default set to a hour if no delayInMinutes set
    return User.addAccess(this.id, access, delayInMinutes);
  };
  User.prototype.subscribeTo = async function subscribeTo(subscriptionName, data = {}, filter = () => true) {
    const fields = { _id: true, publicDisplayName: true, subscriptions: true, type: true, locale: true };
    const garages = await getUserGarages(User.app, this.getId(), fields);
    const subscribedGarages = [];

    for (const garage of garages) {
      if (filter(garage)) {
        if (!garage.subscriptions) garage.subscriptions = {};
        let price = 0;
        if (subscriptionName === GarageSubscriptionTypes.CROSS_LEADS) {
          price = [GarageTypes.DEALERSHIP, GarageTypes.CARAVANNING].includes(garage.type)
            ? SubscriptionPrices.CROSS_LEAD_PRICE_DEALERSHIP
            : SubscriptionPrices.CROSS_LEAD_PRICE_OTHER;
        } else if (subscriptionName === GarageSubscriptionTypes.AUTOMATION) {
          price = [GarageTypes.DEALERSHIP, GarageTypes.CARAVANNING].includes(garage.type)
            ? SubscriptionPrices.AUTOMATION_PRICE_DEALERSHIP
            : SubscriptionPrices.AUTOMATION_PRICE_OTHER;
        }
        if (!garage.subscriptions[subscriptionName] || !garage.subscriptions[subscriptionName].enabled) {
          subscribedGarages.push(garage._id.toString());
          await updateFromObject(
            { _id: garage._id, publicDisplayName: garage.publicDisplayName, subscriptions: garage.subscriptions },
            {
              [`subscriptions.${subscriptionName}`]: {
                ...data,
                price,
                enabled: true,
                userId: this.id.toString(),
                date: new Date(),
              },
            },
            User.app,
            publicApi
          );
        }
      }
    }
    return subscribedGarages;
  };
  User.subscribeToErep = async (user) => {
    debug(
      `[E-Reputation / Onboarding] ${user.email} just started a subscription to ${GarageSubscriptions.E_REPUTATION}`
    );
    const fields = { _id: true, publicDisplayName: true, subscriptions: true, locale: true };
    const garages = await getUserGarages(User.app, user.id, fields);

    const garageIds = garages.map((garage) => garage._id);
    const userIds = (await Garage.getUsersForGaragesWithoutCusteedUsers(garageIds, { _id: true })).map(
      (user) => new ObjectID(user._id.toString())
    );
    await User.getMongoConnector().updateMany(
      { _id: { $in: userIds } },
      {
        $set: {
          [`authorization.ACCESS_TO_E_REPUTATION`]: true,
          [`authRequest.ACCESS_TO_E_REPUTATION`]: false,
          [`allGaragesAlerts.ExogenousNewReview`]: true,
        },
      }
    );

    const subscriptionGarages = garages.filter(
      (garage) => !isSubscribed(garage.subscriptions, GarageSubscriptions.E_REPUTATION)
    );
    await Promise.all(
      garages.map(async (garage) => {
        const { _id, publicDisplayName, subscriptions, locale } = garage;
        await updateFromObject(
          { _id, publicDisplayName, subscriptions },
          {
            'subscriptions.EReputation': {
              enabled: true,
              price: locale === 'fr_FR' ? 29 : 20,
            },
            'subscriptions.active': true,
          },
          User.app,
          publicApi
        );
      })
    );

    return sendMeSubscriptionConfirmationEmail(subscriptionGarages, user);
  };
  User.prototype.getLocale = async function getLocale() {
    const [firstGarage] = await getUserGarages(User.app, this.getId(), { locale: true }, [{ $limit: 1 }]);
    return (firstGarage && firstGarage.locale) || null;
  };
  User.prototype.getTimezone = async function getTimezone() {
    const [firstGarage] = await getUserGarages(User.app, this.getId(), { locale: true }, [{ $limit: 1 }]);
    return (firstGarage && firstGarage.timezone) || null;
  };
  User.prototype.isConcernedByMakeSurveys = async function isConcernedByMakeSurveys() {
    const jobs = [
      'Actionnaire / Président',
      'Directeur général',
      'Direction marketing groupe',
      'Direction qualité & méthodes groupe',
      'Directeur de marque',
      'Directeur de concession',
      'Responsable qualité concession',
      'Responsable marketing concession',
      'Custeed',
    ];
    if (!jobs.includes(this.job)) return false;
    const fields = { type: true, status: true, subscriptions: true, brandNames: true };
    const garages = await getUserGarages(User.app, this.getId(), fields);
    return garages.some(({ type, status, subscriptions, brandNames }) =>
      hasMakeSurveys({ type, status, subscriptions, brandNames })
    );
  };

  User.prototype.hasAccessToGarage = function hasAccessToGarage(garageId) {
    return userMethods.hasAccessToGarage({ garageIds: this.garageIds }, garageId);
  };

  // User.defineProperty('email', {
  //   type: 'string',
  //   required: true,
  //   index: true,
  // });
};
