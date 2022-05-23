const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96e9"),
	"garageType" : "Dealership",
	"name" : "Responsable des ventes VO concession",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : false,
			"UnsatisfiedVo" : true,
			"UnsatisfiedMaintenance" : false,
			"unsatisfiedVo" : false,
			"LeadVn" : false,
			"LeadVo" : true,
			"UnsatisfiedFollowup" : false,
			"EscalationUnsatisfiedVo" : true,
			"EscalationLeadVo" : true,
			"EscalationLeadVn" : false,
			"EscalationUnsatisfiedMaintenance" : false,
			"EscalationUnsatisfiedVn" : false
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
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : true,
				"leadVn" : false,
				"leadVo" : true,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : true,
				"leadVo" : true,
				"leadVn" : false,
				"unsatisfiedFollowup" : true,
				"enable" : true,
				"generalVue" : true
			},
			"monthlySummary" : {
				"enable" : true,
				"lead" : true,
				"leadVn" : false,
				"leadVo" : true,
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : true,
				"contactsApv" : false,
				"contactsVn" : false,
				"contactsVo" : true
			}
		}
	}
};