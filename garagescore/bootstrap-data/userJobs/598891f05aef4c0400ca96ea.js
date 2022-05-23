const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96ea"),
	"name" : "Responsable marketing concession",
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : true,
			"UnsatisfiedVo" : true,
			"UnsatisfiedMaintenance" : true,
			"unsatisfiedVo" : false,
			"LeadVn" : true,
			"LeadVo" : true,
			"UnsatisfiedFollowup" : false,
			"ExogenousNewReview" : true,
			"EscalationLeadVn" : true,
			"EscalationLeadVo" : true,
			"EscalationUnsatisfiedMaintenance" : true,
			"EscalationUnsatisfiedVn" : true,
			"EscalationUnsatisfiedVo" : true
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