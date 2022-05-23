const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { userSetUpdateOne } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { isGod } = require('../../../../common/models/user/user-methods');
const { ObjectId } = require('mongodb');
const UserSubscriptionStatus = require('../../../../common/models/user-subscription-status.js');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'userSetUpdateOne';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetUpdateOne.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String
    status: Boolean
    user: ${prefix}User
  }

  type ${prefix}User {
    id: ID
    firstName: String
    lastName: String
    job: String
    role: String
    email: String
    civility: String
    phone: String
    mobilePhone: String
    businessName: String
    address: String
    postCode: String
    city: String
    subscriptionStatus: String
    isGod: Boolean
    garageIds: [String]
    isDefaultTicketManagerSomewhere: Boolean
    defaultManagerGaragesIds: [String]
    isPriorityProfile: Boolean
    reportConfigs: ${prefix}ReportConfigs
    authorization: ${prefix}Authorization
    allGaragesAlerts: ${prefix}AllGaragesAlerts
  }

  type ${prefix}ReportConfigs {
    daily: ${prefix}ReportConfigsDaily
    weekly: ${prefix}ReportConfigsWeekly
    monthly: ${prefix}ReportConfigsMonthly
    monthlySummary: ${prefix}ReportConfigsMonthlySummary
  }
  type ${prefix}ReportConfigsDaily {
    leadVn: Boolean
    leadVo: Boolean
    UnsatisfiedVI: Boolean
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
  }
  type ${prefix}ReportConfigsWeekly {
    UnsatisfiedVI: Boolean
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
    leadVn: Boolean
    leadVo: Boolean
  }
  type ${prefix}ReportConfigsMonthly {
    UnsatisfiedVI: Boolean
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
    leadVn: Boolean
    leadVo: Boolean
  }
  type ${prefix}ReportConfigsMonthlySummary {
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
    unsatisfiedVI: Boolean
    leadVn: Boolean
    leadVo: Boolean
    contactsApv: Boolean
    contactsVn: Boolean
    contactsVo: Boolean
    contactsVI: Boolean
  }

  type ${prefix}Authorization {
    ACCESS_TO_COCKPIT: Boolean
    ACCESS_TO_WELCOME: Boolean
    ACCESS_TO_SATISFACTION: Boolean
    ACCESS_TO_UNSATISFIED: Boolean
    ACCESS_TO_LEADS: Boolean
    ACCESS_TO_AUTOMATION: Boolean
    ACCESS_TO_CONTACTS: Boolean
    ACCESS_TO_E_REPUTATION: Boolean
    ACCESS_TO_ESTABLISHMENT: Boolean
    ACCESS_TO_TEAM: Boolean

    ACCESS_TO_ADMIN: Boolean
    ACCESS_TO_DARKBO: Boolean
    ACCESS_TO_GREYBO: Boolean
    WIDGET_MANAGEMENT: Boolean
  }

  type ${prefix}AllGaragesAlerts {
    UnsatisfiedVI: Boolean
    LeadApv: Boolean
    LeadVn: Boolean
    LeadVo: Boolean
    UnsatisfiedMaintenance: Boolean
    UnsatisfiedVn: Boolean
    UnsatisfiedVo: Boolean
    ExogenousNewReview: Boolean
    EscalationUnsatisfiedMaintenance: Boolean
    EscalationUnsatisfiedVn: Boolean
    EscalationUnsatisfiedVo: Boolean
    EscalationUnsatisfiedVi: Boolean
    EscalationLeadMaintenance: Boolean
    EscalationLeadVn: Boolean
    EscalationLeadVo: Boolean
  }

`;
const setInformation = async function setInformation(userToUpdate, connectedUser, args, app) {
  //
  // User information
  //
  if (args.firstName) {
    userToUpdate.firstName = args.firstName;
  }
  if (args.lastName) {
    userToUpdate.lastName = args.lastName;
  }
  if (args.email) {
    userToUpdate.email = args.email;
  }
  if (args.civility) {
    userToUpdate.civility = args.civility;
  }
  if (args.job) {
    userToUpdate.job = args.job;
  }
  userToUpdate.phone = args.phone || '';
  userToUpdate.mobilePhone = args.mobilePhone || '';
  userToUpdate.businessName = args.businessName || '';
  userToUpdate.address = args.address || '';
  userToUpdate.postCode = args.postCode || '';
  userToUpdate.city = args.city || '';
  //
  // Access (can only be given to descendant)
  //
  if (userToUpdate._id.toString() !== connectedUser.getId().toString()) {
    [
      'ACCESS_TO_WELCOME',
      'ACCESS_TO_SATISFACTION',
      'ACCESS_TO_UNSATISFIED',
      'ACCESS_TO_LEADS',
      'ACCESS_TO_AUTOMATION',
      'ACCESS_TO_CONTACTS',
      'ACCESS_TO_E_REPUTATION',
      'ACCESS_TO_ESTABLISHMENT',
      'ACCESS_TO_TEAM',
    ].forEach((access) => {
      if (typeof args[access] === 'boolean') {
        userToUpdate.authorization[access] = args[access];
      }
    });
  }
  //
  // Alerts and reports
  //
  // Init
  if (!userToUpdate.allGaragesAlerts) userToUpdate.allGaragesAlerts = {};
  const defaultReportConfigs = {
    daily: {},
    weekly: {},
    monthly: {},
    monthlySummary: {},
  };
  userToUpdate.reportConfigs = { ...defaultReportConfigs, ...userToUpdate.reportConfigs };

  /** Why is Gamora... ? **/
  // allGaragesAlerts
  if (args.alertsUnsatisfiedVn !== undefined) {
    userToUpdate.allGaragesAlerts.UnsatisfiedVn = args.alertsUnsatisfiedVn;
  }
  if (args.alertsUnsatisfiedVo !== undefined) {
    userToUpdate.allGaragesAlerts.UnsatisfiedVo = args.alertsUnsatisfiedVo;
  }
  if (args.alertsUnsatisfiedVI !== undefined) {
    userToUpdate.allGaragesAlerts.UnsatisfiedVI = args.alertsUnsatisfiedVI;
  }
  if (args.alertsUnsatisfiedMaintenance !== undefined) {
    userToUpdate.allGaragesAlerts.UnsatisfiedMaintenance = args.alertsUnsatisfiedMaintenance;
  }
  if (args.alertsLeadApv !== undefined) {
    userToUpdate.allGaragesAlerts.LeadApv = args.alertsLeadApv;
  }
  if (args.alertsLeadVn !== undefined) {
    userToUpdate.allGaragesAlerts.LeadVn = args.alertsLeadVn;
  }
  if (args.alertsLeadVo !== undefined) {
    userToUpdate.allGaragesAlerts.LeadVo = args.alertsLeadVo;
  }
  if (args.alertsExogenousNewReview !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.ExogenousNewReview = args.alertsExogenousNewReview;
  }
  if (args.alertsEscalationUnsatisfiedMaintenance !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationUnsatisfiedMaintenance = args.alertsEscalationUnsatisfiedMaintenance;
  }
  if (args.alertsEscalationUnsatisfiedVn !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationUnsatisfiedVn = args.alertsEscalationUnsatisfiedVn;
  }
  if (args.alertsEscalationUnsatisfiedVo !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationUnsatisfiedVo = args.alertsEscalationUnsatisfiedVo;
  }
  if (args.alertsEscalationUnsatisfiedVi !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationUnsatisfiedVi = args.alertsEscalationUnsatisfiedVi;
  }
  if (args.alertsEscalationLeadMaintenance !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationLeadMaintenance = args.alertsEscalationLeadMaintenance;
  }
  if (args.alertsEscalationLeadVn !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationLeadVn = args.alertsEscalationLeadVn;
  }
  if (args.alertsEscalationLeadVo !== undefined) {
    // New
    userToUpdate.allGaragesAlerts.EscalationLeadVo = args.alertsEscalationLeadVo;
  }
  // Reports daily
  if (args.reportConfigsDailyUnsatisfiedApv !== undefined) {
    userToUpdate.reportConfigs.daily.unsatisfiedApv = args.reportConfigsDailyUnsatisfiedApv;
  }
  if (args.reportConfigsDailyUnsatisfiedVn !== undefined) {
    userToUpdate.reportConfigs.daily.unsatisfiedVn = args.reportConfigsDailyUnsatisfiedVn;
  }
  if (args.reportConfigsDailyUnsatisfiedVo !== undefined) {
    userToUpdate.reportConfigs.daily.unsatisfiedVo = args.reportConfigsDailyUnsatisfiedVo;
  }
  if (args.reportConfigsDailyUnsatisfiedVI !== undefined) {
    userToUpdate.reportConfigs.daily.UnsatisfiedVI = args.reportConfigsDailyUnsatisfiedVI;
  }
  if (args.reportConfigsDailyLeadVn !== undefined) {
    userToUpdate.reportConfigs.daily.leadVn = args.reportConfigsDailyLeadVn;
  }
  if (args.reportConfigsDailyLeadVo !== undefined) {
    userToUpdate.reportConfigs.daily.leadVo = args.reportConfigsDailyLeadVo;
  }
  // Reports weekly
  if (args.reportConfigsWeeklyUnsatisfiedApv !== undefined) {
    userToUpdate.reportConfigs.weekly.unsatisfiedApv = args.reportConfigsWeeklyUnsatisfiedApv;
  }
  if (args.reportConfigsWeeklyUnsatisfiedVn !== undefined) {
    userToUpdate.reportConfigs.weekly.unsatisfiedVn = args.reportConfigsWeeklyUnsatisfiedVn;
  }
  if (args.reportConfigsWeeklyUnsatisfiedVo !== undefined) {
    userToUpdate.reportConfigs.weekly.unsatisfiedVo = args.reportConfigsWeeklyUnsatisfiedVo;
  }
  if (args.reportConfigsWeeklyUnsatisfiedVI !== undefined) {
    userToUpdate.reportConfigs.weekly.UnsatisfiedVI = args.reportConfigsWeeklyUnsatisfiedVI;
  }
  if (args.reportConfigsWeeklyLeadVn !== undefined) {
    userToUpdate.reportConfigs.weekly.leadVn = args.reportConfigsWeeklyLeadVn;
  }
  if (args.reportConfigsWeeklyLeadVo !== undefined) {
    userToUpdate.reportConfigs.weekly.leadVo = args.reportConfigsWeeklyLeadVo;
  }
  // Reports monthly
  if (args.reportConfigsMonthlyUnsatisfiedApv !== undefined) {
    userToUpdate.reportConfigs.monthly.unsatisfiedApv = args.reportConfigsMonthlyUnsatisfiedApv;
  }
  if (args.reportConfigsMonthlyUnsatisfiedVn !== undefined) {
    userToUpdate.reportConfigs.monthly.unsatisfiedVn = args.reportConfigsMonthlyUnsatisfiedVn;
  }
  if (args.reportConfigsMonthlyUnsatisfiedVo !== undefined) {
    userToUpdate.reportConfigs.monthly.unsatisfiedVo = args.reportConfigsMonthlyUnsatisfiedVo;
  }
  if (args.reportConfigsMonthlyUnsatisfiedVI !== undefined) {
    userToUpdate.reportConfigs.monthly.UnsatisfiedVI = args.reportConfigsMonthlyUnsatisfiedVI;
  }
  if (args.reportConfigsMonthlyLeadVn !== undefined) {
    userToUpdate.reportConfigs.monthly.leadVn = args.reportConfigsMonthlyLeadVn;
  }
  if (args.reportConfigsMonthlyLeadVo !== undefined) {
    userToUpdate.reportConfigs.monthly.leadVo = args.reportConfigsMonthlyLeadVo;
  }
  // NEW Reports monthly summary
  if (args.reportConfigsMonthlySummaryUnsatisfiedApv !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.unsatisfiedApv = args.reportConfigsMonthlySummaryUnsatisfiedApv; // eslint-disable-line
  }
  if (args.reportConfigsMonthlySummaryUnsatisfiedVn !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.unsatisfiedVn = args.reportConfigsMonthlySummaryUnsatisfiedVn; // eslint-disable-line
  }
  if (args.reportConfigsMonthlySummaryUnsatisfiedVo !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.unsatisfiedVo = args.reportConfigsMonthlySummaryUnsatisfiedVo; // eslint-disable-line
  }
  if (args.reportConfigsMonthlySummaryUnsatisfiedVI !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.unsatisfiedVI = args.reportConfigsMonthlySummaryUnsatisfiedVI; // eslint-disable-line
  }
  if (args.reportConfigsMonthlySummaryLeadVn !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.leadVn = args.reportConfigsMonthlySummaryLeadVn;
  }
  if (args.reportConfigsMonthlySummaryLeadVo !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.leadVo = args.reportConfigsMonthlySummaryLeadVo;
  }
  if (args.reportConfigsMonthlySummaryContactsApv !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.contactsApv = args.reportConfigsMonthlySummaryContactsApv;
  }
  if (args.reportConfigsMonthlySummaryContactsVn !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.contactsVn = args.reportConfigsMonthlySummaryContactsVn;
  }
  if (args.reportConfigsMonthlySummaryContactsVo !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.contactsVo = args.reportConfigsMonthlySummaryContactsVo;
  }
  if (args.reportConfigsMonthlySummaryContactsVI !== undefined) {
    userToUpdate.reportConfigs.monthlySummary.contactsVI = args.reportConfigsMonthlySummaryContactsVI;
  }

  if (userToUpdate.reportConfigs) {
    // ENABLE / DISABLE SO THEY ACTUALLY RECEIVE (OR NOT) THEIR MAILS
    const reportKeys = [
      'unsatisfiedApv',
      'unsatisfiedVn',
      'unsatisfiedVo',
      'UnsatisfiedVI',
      'leadVn',
      'leadVo',
      'contactsApv',
      'contactsVn',
      'contactsVo',
      'contactsVI',
    ];
    Object.keys(userToUpdate.reportConfigs).forEach((k) => {
      const userReportConfig = userToUpdate.reportConfigs[k];
      const shouldBe = Object.keys(userReportConfig).some((c) => userReportConfig[c] && reportKeys.includes(c));
      if (userReportConfig.enable !== shouldBe) userToUpdate.reportConfigs[k].enable = shouldBe;
    });
  }
  //
  // Authorisations
  //
  if (
    userToUpdate.subscriptionStatus === UserSubscriptionStatus.INITIALIZED &&
    userToUpdate.civility &&
    userToUpdate.lastName &&
    userToUpdate.firstName &&
    userToUpdate.job &&
    userToUpdate.email &&
    (userToUpdate.phone || userToUpdate.mobilePhone)
  ) {
    userToUpdate.subscriptionStatus = UserSubscriptionStatus.TERMINATED;
    // if have only E-reputation subscription => must stop subscription process
    if (
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_SATISFACTION] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_UNSATISFIED] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_LEADS] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_AUTOMATION] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_CONTACTS] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_ESTABLISHMENT] &&
      !userToUpdate.authorization[UserAuthorization.ACCESS_TO_TEAM] &&
      userToUpdate.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]
    ) {
      userToUpdate.subscriptionStatus = UserSubscriptionStatus.TERMINATED;
    }
  }
  //
  // Role
  //
  if (args.role) {
    userToUpdate.role = args.role;
  }
  //
  // Garages
  //
  const canModifyGarages =
    !isGod({ email: userToUpdate.email, garageIds: userToUpdate.garageIds }) &&
    !userToUpdate._id.equals(connectedUser.getId());
  if (canModifyGarages) {
    if (args.addGarages) {
      userToUpdate.garageIds = [...userToUpdate.garageIds, ...args.addGarages.map((id) => ObjectId(id))];
    }
    if (args.removeGarages) {
      userToUpdate.garageIds = userToUpdate.garageIds.filter((id) => !args.removeGarages.includes(id.toString()));
    }
  }
  userToUpdate.isManagerJob = await app.models.User.isManager(userToUpdate);
  return await app.models.User.getMongoConnector().updateOne({ _id: userToUpdate._id }, { $set: userToUpdate });
};

module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id, mobilePhone, email } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        const userToUpdate = await app.models.User.getMongoConnector().findOne(ObjectId(id));
        if (!userToUpdate) {
          return {
            message: `userNotFound|${id}`,
            status: false,
            user: {},
          };
        }
        if (mobilePhone && userToUpdate.mobilePhone !== mobilePhone) {
          // Test if the mobile phone is not already taken
          const usersWithSameMobilePhone = await app.models.User.getMongoConnector().findOne(
            { mobilePhone: mobilePhone },
            { projection: { _id: true } }
          );
          if (usersWithSameMobilePhone) {
            return {
              message: `mobileTaken|${mobilePhone}`,
              status: false,
              user: {},
            };
          }
        }
        if (email && userToUpdate.email !== email) {
          // Test if the email is not already taken
          let userWithSameEmail = await app.models.User.getMongoConnector().findOne(
            { email: email },
            { projection: { _id: true } }
          );
          if (userWithSameEmail) {
            return {
              message: `emailTaken|${email}`,
              status: false,
              user: {},
            };
          }
        }
        const updateDataUser = await setInformation(userToUpdate, user, args, app);
        const projection = {
          id: '$_id',
          garageIds: true,
          firstName: true,
          email: true,
          civility: true,
          phone: true,
          mobilePhone: true,
          businessName: true,
          address: true,
          lastName: true,
          postCode: true,
          job: true,
          role: true,
          city: true,
          subscriptionStatus: true,
          isPriorityProfile: true,
          isGod: true,
          isDefaultTicketManagerSomewhere: true,
          defaultManagerGaragesIds: true,
          allGaragesAlerts: true,
          authorization: true,
          reportConfigs: true,
        };
        const updatedUser = await app.models.User.getMongoConnector().findOne(ObjectId(id), {
          projection,
        });
        updatedUser.isGod = !!isGod({ email: updatedUser.email, garageIds: updatedUser.garageIds });
        return {
          message: 'user Updated !',
          status: true,
          user: updatedUser,
        };
      } catch (error) {
        log.error(IZAD, error);
        return { message: (error && error.message) || error, status: false };
      }
    },
  },
};
