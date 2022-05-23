const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("5bd1b7f5d80c8500140ea5ec"),
	"garageType" : "VehicleInspection",
	"name" : "Direction de plaque",
	"createdAt" : new Date(),
	"updatedAt" : new Date(),
	"defaultUserConfig" : {
		"allGaragesAlerts" : {
			"UnsatisfiedMaintenance" : false,
			"UnsatisfiedVn" : false,
			"UnsatisfiedVo" : false,
			"UnsatisfiedVI" : false,
			"LeadApv" : false,
			"LeadVn" : false,
			"LeadVo" : false,
			"EscalationUnsatisfiedMaintenance" : false,
			"EscalationUnsatisfiedVn" : false,
			"EscalationUnsatisfiedVo" : false,
			"EscalationUnsatisfiedVi" : false,
			"EscalationLeadMaintenance" : false,
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
				"unsatisfiedApv" : false,
				"unsatisfiedVn" : false,
				"unsatisfiedVo" : false,
				"leadVn" : false,
				"leadVo" : false,
				"unsatisfiedFollowup" : false,
				"UnsatisfiedVI" : false,
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
				"UnsatisfiedVI" : false,
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
	},
	"isManager" : true
};