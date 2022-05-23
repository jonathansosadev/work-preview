const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96ee"),
	"name" : "Service client",
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"garageType" : "Dealership",
	"isManager" : true,
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : true,
			"UnsatisfiedVo" : true,
			"UnsatisfiedMaintenance" : true,
			"LeadVn" : false,
			"LeadVo" : false,
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
				"enable" : false,
				"generalVue" : false
			},
			"weekly" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVn" : false,
				"leadVo" : false,
				"enable" : false,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVo" : false,
				"leadVn" : false,
				"unsatisfiedFollowup" : true,
				"enable" : true,
				"generalVue" : true
			},
			"monthlySummary" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"unsatisfiedVI" : false,
				"leadVo" : false,
				"leadVn" : false,
				"contactsApv" : false,
				"contactsVn" : false,
				"contactsVo" : false,
				"contactsVI" : false,
				"enable" : false,
				"generalVue" : false
			}
		}
	}
};