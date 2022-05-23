const { ObjectID } = require('mongodb');

module.exports = { 
    "_id" : ObjectID("5bd0c9de34f3e7001421c57f"),
    "name" : "Default",
    "type" : "VehicleInspection",
    "duration" : 60.0,
    "disableSmsWithValidEmails" : false,
    "chains" : {
        "Maintenance" : {
            "contacts" : [],
            "thanks" : {
                "complete_satisfied" : null,
                "complete_unsatisfied" : null,
                "incomplete_satisfied" : null,
                "incomplete_unsatisfied" : null
            },
            "recontacts" : {
                "enabled" : false,
                "dayOfNextMonth" : 0.0,
                "respondents" : {
                    "email" : "",
                    "sms" : ""
                },
                "nonRespondents" : {
                    "email" : "",
                    "sms" : ""
                }
            }
        },
        "NewVehicleSale" : {
            "contacts" : [],
            "thanks" : {
                "complete_satisfied" : null,
                "complete_unsatisfied" : null,
                "incomplete_satisfied" : null,
                "incomplete_unsatisfied" : null
            },
            "recontacts" : {
                "enabled" : false,
                "dayOfNextMonth" : 0.0,
                "respondents" : {
                    "email" : "",
                    "sms" : ""
                },
                "nonRespondents" : {
                    "email" : "",
                    "sms" : ""
                }
            }
        },
        "UsedVehicleSale" : {
            "contacts" : [],
            "thanks" : {
                "complete_satisfied" : null,
                "complete_unsatisfied" : null,
                "incomplete_satisfied" : null,
                "incomplete_unsatisfied" : null
            },
            "recontacts" : {
                "enabled" : false,
                "dayOfNextMonth" : 0.0,
                "respondents" : {
                    "email" : "",
                    "sms" : ""
                },
                "nonRespondents" : {
                    "email" : "",
                    "sms" : ""
                }
            }
        },
        "VehicleInspection" : {
            "contacts" : [ 
                {
                    "key" : "vehicle_inspection_email_1",
                    "delay" : 0.0
                }, 
                {
                    "key" : "vehicle_inspection_sms_1",
                    "delay" : 0.0
                }, 
                {
                    "key" : "vehicle_inspection_email_2",
                    "delay" : 4.0
                }, 
                {
                    "key" : "vehicle_inspection_email_3",
                    "delay" : 9.0
                }
            ],
            "thanks" : {
                "complete_satisfied" : "vehicle_inspection_email_thanks_1",
                "complete_unsatisfied" : "vehicle_inspection_email_thanks_2",
                "incomplete_satisfied" : "vehicle_inspection_email_thanks_3",
                "incomplete_unsatisfied" : "vehicle_inspection_email_thanks_4"
            },
            "recontacts" : {
                "enabled" : false,
                "dayOfNextMonth" : 0.0,
                "respondents" : {
                    "email" : "",
                    "sms" : ""
                },
                "nonRespondents" : {
                    "email" : "",
                    "sms" : ""
                }
            }
        }
    },
    "createdAt" : new Date(),
    "updatedAt" : new Date(),
    "followupAndEscalate" : {
        "DataFile" : {
            "lead" : {
                "followup" : {
                    "enabled" : false,
                    "delay" : 90.0
                },
                "escalate" : {
                    "enabled" : false,
                    "stage_1" : 27.0,
                    "stage_2" : 36.0
                }
            },
            "unsatisfied" : {
                "followup" : {
                    "enabled" : false,
                    "delay" : 45.0
                },
                "escalate" : {
                    "enabled" : false,
                    "stage_1" : 9.0,
                    "stage_2" : 27.0
                }
            }
        },
        "XLeads" : {
            "lead" : {
                "followup" : {
                    "enabled" : true,
                    "delay" : 9.0
                },
                "escalate" : {
                    "enabled" : true,
                    "stage_1" : 3.0,
                    "stage_2" : 4.0
                }
            }
        },
        "Manual" : {
            "lead" : {
                "followup" : {
                    "enabled" : false,
                    "delay" : 90.0
                },
                "escalate" : {
                    "enabled" : false,
                    "stage_1" : 27.0,
                    "stage_2" : 36.0
                }
            },
            "unsatisfied" : {
                "followup" : {
                    "enabled" : false,
                    "delay" : 45.0
                },
                "escalate" : {
                    "enabled" : false,
                    "stage_1" : 9.0,
                    "stage_2" : 27.0
                }
            }
        },
        "Automation" : {
            "lead" : {
                "followup" : {
                    "enabled" : true,
                    "delay" : 90.0
                },
                "escalate" : {
                    "enabled" : true,
                    "stage_1" : 27.0,
                    "stage_2" : 36.0
                }
            }
        }
    }
};