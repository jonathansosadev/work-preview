const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96df"),
	"name" : "Direction atelier groupe",
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
			"EscalationLeadVn" : false,
			"EscalationLeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : true,
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
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVn" : false,
				"leadVo" : false,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVo" : false,
				"leadVn" : false,
				"unsatisfiedFollowup" : true,
				"enable" : true,
				"generalVue" : true
			},
			"monthlySummary" : {
				"enable" : true,
				"lead" : false,
				"leadVn" : false,
				"leadVo" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"contactsApv" : true,
				"contactsVn" : false,
				"contactsVo" : false
			}
		}
	},
	"garageType" : "Dealership",
	"isManager" : true
};