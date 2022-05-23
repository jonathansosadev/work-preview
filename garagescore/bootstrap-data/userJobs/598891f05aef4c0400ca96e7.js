const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96e7"),
	"garageType" : "Dealership",
	"name" : "Responsable des ventes VN & VO concession",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : true,
			"UnsatisfiedVo" : true,
			"UnsatisfiedMaintenance" : false,
			"unsatisfiedVo" : false,
			"LeadVn" : true,
			"LeadVo" : true,
			"UnsatisfiedFollowup" : false,
			"EscalationUnsatisfiedVn" : true,
			"EscalationUnsatisfiedVo" : true,
			"EscalationLeadVn" : true,
			"EscalationLeadVo" : true,
			"EscalationUnsatisfiedMaintenance" : false
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
				"unsatisfiedVo" : true,
				"leadVn" : true,
				"leadVo" : true,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : false,
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
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
				"contactsApv" : false,
				"contactsVn" : true,
				"contactsVo" : true
			}
		}
	}
};