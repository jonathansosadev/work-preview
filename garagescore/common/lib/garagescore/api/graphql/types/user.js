/**
 * insatisfaction that will be displayed on a row in the cockpit contact qualification page list
 */
const graphql = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLID },
    fullName: { type: graphql.GraphQLString },
    firstName: { type: graphql.GraphQLString },
    lastName: { type: graphql.GraphQLString },
    job: { type: graphql.GraphQLString },
    role: { type: graphql.GraphQLString },
    isManagerJob: { type: graphql.GraphQLBoolean },
    email: { type: graphql.GraphQLString },
    civility: { type: graphql.GraphQLString },
    phone: { type: graphql.GraphQLString },
    mobilePhone: { type: graphql.GraphQLString },
    businessName: { type: graphql.GraphQLString },
    address: { type: graphql.GraphQLString },
    postCode: { type: graphql.GraphQLString },
    city: { type: graphql.GraphQLString },
    subscriptionStatus: { type: graphql.GraphQLString },
    isPerfMan: { type: graphql.GraphQLBoolean },
    isBizDev: { type: graphql.GraphQLBoolean },
    isGod: { type: graphql.GraphQLBoolean },
    garages: { type: new graphql.GraphQLList(graphql.GraphQLString) },
    isAdmin: { type: graphql.GraphQLBoolean },
    garageIds: { type: new graphql.GraphQLList(graphql.GraphQLString) },
    lastConnected: { type: GraphQLDate },
    garagesAmount: { type: graphql.GraphQLInt },
    isDefaultTicketManagerSomewhere: { type: graphql.GraphQLBoolean },
    defaultManagerGaragesIds: { type: new graphql.GraphQLList(graphql.GraphQLString) },
    resetPasswordVeryRecent: { type: graphql.GraphQLBoolean },
    isPriorityProfile: { type: graphql.GraphQLBoolean },
    reportConfigs: {
      type: new graphql.GraphQLObjectType({
        name: 'reportConfig',
        fields: {
          daily: {
            type: new graphql.GraphQLObjectType({
              name: 'daily',
              fields: {
                enable: { type: graphql.GraphQLBoolean },
                generalVue: { type: graphql.GraphQLBoolean },
                lead: { type: graphql.GraphQLBoolean }, // NOT USED ?
                leadVn: { type: graphql.GraphQLBoolean },
                leadVo: { type: graphql.GraphQLBoolean },
                UnsatisfiedVI: { type: graphql.GraphQLBoolean },
                unsatisfiedApv: { type: graphql.GraphQLBoolean },
                unsatisfiedVn: { type: graphql.GraphQLBoolean },
                unsatisfiedVo: { type: graphql.GraphQLBoolean },
              },
            }),
          },
          weekly: {
            type: new graphql.GraphQLObjectType({
              name: 'weekly',
              fields: {
                enable: { type: graphql.GraphQLBoolean },
                generalVue: { type: graphql.GraphQLBoolean },
                UnsatisfiedVI: { type: graphql.GraphQLBoolean },
                unsatisfiedApv: { type: graphql.GraphQLBoolean },
                unsatisfiedVn: { type: graphql.GraphQLBoolean },
                unsatisfiedVo: { type: graphql.GraphQLBoolean },
                lead: { type: graphql.GraphQLBoolean }, // NOT USED ?
                leadVn: { type: graphql.GraphQLBoolean },
                leadVo: { type: graphql.GraphQLBoolean },
                contacts: { type: graphql.GraphQLBoolean },
              },
            }),
          },
          monthly: {
            type: new graphql.GraphQLObjectType({
              name: 'monthly',
              fields: {
                enable: { type: graphql.GraphQLBoolean },
                generalVue: { type: graphql.GraphQLBoolean },
                UnsatisfiedVI: { type: graphql.GraphQLBoolean },
                unsatisfiedApv: { type: graphql.GraphQLBoolean },
                unsatisfiedVn: { type: graphql.GraphQLBoolean },
                unsatisfiedVo: { type: graphql.GraphQLBoolean },
                lead: { type: graphql.GraphQLBoolean }, // NOT USED ?
                leadVn: { type: graphql.GraphQLBoolean },
                leadVo: { type: graphql.GraphQLBoolean },
              },
            }),
          },
          monthlySummary: {
            type: new graphql.GraphQLObjectType({
              name: 'monthlySummary',
              fields: {
                enable: { type: graphql.GraphQLBoolean },
                generalVue: { type: graphql.GraphQLBoolean },
                unsatisfiedApv: { type: graphql.GraphQLBoolean },
                unsatisfiedVn: { type: graphql.GraphQLBoolean },
                unsatisfiedVo: { type: graphql.GraphQLBoolean },
                unsatisfiedVI: { type: graphql.GraphQLBoolean }, // For the moment it's not in use
                lead: { type: graphql.GraphQLBoolean }, // NOT USED ?
                leadVn: { type: graphql.GraphQLBoolean },
                leadVo: { type: graphql.GraphQLBoolean },
                contactsApv: { type: graphql.GraphQLBoolean },
                contactsVn: { type: graphql.GraphQLBoolean },
                contactsVo: { type: graphql.GraphQLBoolean },
                contactsVI: { type: graphql.GraphQLBoolean }, // For the moment it's not in use
              },
            }),
          },
        },
      }),
    },
    authorization: {
      type: new graphql.GraphQLObjectType({
        name: 'authorization',
        fields: {
          ACCESS_TO_COCKPIT: { type: graphql.GraphQLBoolean },

          ACCESS_TO_WELCOME: { type: graphql.GraphQLBoolean },
          ACCESS_TO_SATISFACTION: { type: graphql.GraphQLBoolean },
          ACCESS_TO_UNSATISFIED: { type: graphql.GraphQLBoolean },
          ACCESS_TO_LEADS: { type: graphql.GraphQLBoolean },
          ACCESS_TO_AUTOMATION: { type: graphql.GraphQLBoolean },
          ACCESS_TO_CONTACTS: { type: graphql.GraphQLBoolean },
          ACCESS_TO_E_REPUTATION: { type: graphql.GraphQLBoolean },
          ACCESS_TO_ESTABLISHMENT: { type: graphql.GraphQLBoolean },
          ACCESS_TO_TEAM: { type: graphql.GraphQLBoolean },

          ACCESS_TO_ADMIN: { type: graphql.GraphQLBoolean },
          ACCESS_TO_DARKBO: { type: graphql.GraphQLBoolean },
          ACCESS_TO_GREYBO: { type: graphql.GraphQLBoolean },
          WIDGET_MANAGEMENT: { type: graphql.GraphQLBoolean },
        },
      }),
    },
    allGaragesAlerts: {
      type: new graphql.GraphQLObjectType({
        name: 'allGaragesAlerts',
        fields: {
          UnsatisfiedVI: { type: graphql.GraphQLBoolean },
          Lead: { type: graphql.GraphQLBoolean },
          LeadApv: { type: graphql.GraphQLBoolean },
          LeadVn: { type: graphql.GraphQLBoolean },
          LeadVo: { type: graphql.GraphQLBoolean },
          UnsatisfiedFollowup: { type: graphql.GraphQLBoolean },
          UnsatisfiedMaintenance: { type: graphql.GraphQLBoolean },
          UnsatisfiedVn: { type: graphql.GraphQLBoolean },
          UnsatisfiedVo: { type: graphql.GraphQLBoolean },
          ExogenousNewReview: { type: graphql.GraphQLBoolean },
          EscalationUnsatisfiedMaintenance: { type: graphql.GraphQLBoolean },
          EscalationUnsatisfiedVn: { type: graphql.GraphQLBoolean },
          EscalationUnsatisfiedVo: { type: graphql.GraphQLBoolean },
          EscalationUnsatisfiedVi: { type: graphql.GraphQLBoolean },
          EscalationLeadMaintenance: { type: graphql.GraphQLBoolean },
          EscalationLeadVn: { type: graphql.GraphQLBoolean },
          EscalationLeadVo: { type: graphql.GraphQLBoolean },
        },
      }),
    },
    directParent: {
      type: new graphql.GraphQLObjectType({
        name: 'directParent',
        fields: {
          id: { type: graphql.GraphQLString },
          fullName: { type: graphql.GraphQLString },
          email: { type: graphql.GraphQLString },
        },
      }),
    },
  },
});
