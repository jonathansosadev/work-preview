const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96e6"),
	"garageType" : "Dealership",
	"name" : "Responsable qualité concession",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"Lead" : false,
			"UnsatisfiedVn" : true,
			"UnsatisfiedVo" : true,
			"UnsatisfiedMaintenance" : true,
			"unsatisfiedVo" : false,
			"LeadVn" : false,
			"LeadVo" : false,
			"UnsatisfiedFollowup" : false,
			"ExogenousNewReview" : true,
			"EscalationUnsatisfiedMaintenance" : true,
			"EscalationUnsatisfiedVn" : true,
			"EscalationUnsatisfiedVo" : true,
			"EscalationLeadVn" : false,
			"EscalationLeadVo" : false
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
				"leadVn" : false,
				"leadVo" : false,
				"unsatisfiedFollowup" : false,
				"enable" : true,
				"generalVue" : false
			},
			"monthly" : {
				"lead" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
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
				"unsatisfiedVn" : true,
				"unsatisfiedVo" : true,
				"contactsApv" : true,
				"contactsVn" : true,
				"contactsVo" : true
			}
		}
	}
};