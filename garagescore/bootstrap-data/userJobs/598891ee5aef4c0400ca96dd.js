const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891ee5aef4c0400ca96dd"),
	"name" : "Direction des ventes VN groupe",
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
			"EscalationLeadVn" : true,
			"EscalationLeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : false,
			"EscalationUnsatisfiedVn" : true,
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
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : false,
				"leadVn" : true,
				"leadVo" : false,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : false,
				"leadVo" : false,
				"leadVn" : true,
				"unsatisfiedFollowup" : true,
				"enable" : true,
				"generalVue" : true
			},
			"monthlySummary" : {
				"enable" : true,
				"lead" : true,
				"leadVn" : true,
				"leadVo" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : false,
				"contactsApv" : false,
				"contactsVn" : true,
				"contactsVo" : false
			}
		}
	},
	"garageType" : "Dealership",
	"isManager" : true
};