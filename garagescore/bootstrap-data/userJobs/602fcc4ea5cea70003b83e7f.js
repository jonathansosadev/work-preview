const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("602fcc4ea5cea70003b83e7f"),
	"garageType" : "Dealership",
	"name" : "Responsable Lead Ventes",
	"isManager" : true,
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"UnsatisfiedMaintenance" : false,
			"UnsatisfiedVn" : false,
			"UnsatisfiedVo" : false,
			"UnsatisfiedVI" : false,
			"LeadApv" : false,
			"LeadVn" : true,
			"LeadVo" : true,
			"EscalationUnsatisfiedMaintenance" : false,
			"EscalationUnsatisfiedVn" : false,
			"EscalationUnsatisfiedVo" : false,
			"EscalationUnsatisfiedVi" : false,
			"EscalationLeadMaintenance" : false,
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