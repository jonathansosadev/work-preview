const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96e8"),
	"garageType" : "Dealership",
	"name" : "Responsable des ventes VN concession",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : true,
			"UnsatisfiedVo" : false,
			"UnsatisfiedMaintenance" : false,
			"unsatisfiedVo" : false,
			"LeadVn" : true,
			"LeadVo" : false,
			"UnsatisfiedFollowup" : false,
			"EscalationUnsatisfiedVn" : true,
			"EscalationLeadVn" : true,
			"EscalationLeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : false,
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
	}
};