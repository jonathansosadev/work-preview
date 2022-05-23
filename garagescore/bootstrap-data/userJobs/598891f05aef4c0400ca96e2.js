const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("598891f05aef4c0400ca96e2"),
	"garageType" : "Dealership",
	"name" : "Chef d'atelier concession",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"UnsatisfiedMaintenance" : true,
			"UnsatisfiedVn" : false,
			"UnsatisfiedVo" : false,
			"UnsatisfiedVI" : false,
			"LeadApv" : true,
			"LeadVn" : false,
			"LeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : true,
			"EscalationUnsatisfiedVn" : false,
			"EscalationUnsatisfiedVo" : false,
			"EscalationUnsatisfiedVi" : false,
			"EscalationLeadMaintenance" : true,
			"EscalationLeadVn" : false,
			"EscalationLeadVo" : false,
			"Lead" : false,
			"unsatisfiedVo" : false,
			"UnsatisfiedFollowup" : false
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
				"lead" : false,
				"unsatisfiedApv" : true,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"unsatisfiedVI" : false,
				"leadVo" : false,
				"leadVn" : false,
				"contactsApv" : true,
				"contactsVn" : false,
				"contactsVo" : false,
				"contactsVI" : false,
				"enable" : true,
				"generalVue" : false
			}
		}
	}
};