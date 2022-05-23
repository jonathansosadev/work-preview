const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891ee5aef4c0400ca96da"),
	"name" : "Direction de la communication groupe",
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : false,
			"UnsatisfiedVo" : false,
			"UnsatisfiedMaintenance" : false,
			"unsatisfiedVo" : false,
			"LeadVn" : false,
			"LeadVo" : false,
			"UnsatisfiedFollowup" : false,
			"ExogenousNewReview" : true,
			"EscalationLeadVn" : false,
			"EscalationLeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : false,
			"EscalationUnsatisfiedVn" : false,
			"EscalationUnsatisfiedVo" : false
		},
		"reportConfigs" : {
			"daily" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVo" : false,
				"leadVn" : false,
				"unsatisfiedFollowup" : false,
				"enable" : false,
				"generalVue" : false
			},
			"weekly" : {
				"lead" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
				"leadVn" : true,
				"leadVo" : true,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
				"leadVo" : true,
				"leadVn" : true,
				"unsatisfiedFollowup" : true,
				"enable" : true,
				"generalVue" : true
			},
			"monthlySummary" : {
				"enable" : true,
				"lead" : true,
				"leadVn" : true,
				"leadVo" : true,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
				"contactsApv" : true,
				"contactsVn" : true,
				"contactsVo" : true
			}
		}
	},
	"garageType" : "Dealership",
	"isManager" : true
};