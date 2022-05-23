const { ObjectID } = require('mongodb');

module.exports = { 
    "_id" : ObjectID("5bef01681a01cd0014cbb145"),
    "name" : "VI - VUL par défaut",
    "type" : "UtilityCarDealership",
    "duration" : 60.0,
    "disableSmsWithValidEmails" : true,
    "chains" : {
        "Maintenance" : {
            "contacts" : [ 
                {
                    "key" : "maintenance_email_1_make",
                    "delay" : 0.0
                }, 
                {
                    "key" : "maintenance_sms_1",
                    "delay" : 0.0
                }, 
                {
                    "key" : "maintenance_email_2_make",
                    "delay" : 6.0
                }, 
                {
                    "key" : "maintenance_email_3",
                    "delay" : 19.0
                }
            ],
            "thanks" : {
                "complete_satisfied" : "maintenance_email_thanks_1_make",
                "complete_unsatisfied" : "maintenance_email_thanks_2_car_repairer",
                "incomplete_satisfied" : "maintenance_email_thanks_3_car_repairer",
                "incomplete_unsatisfied" : "maintenance_email_thanks_4_car_repairer"
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
            "contacts" : [ 
                {
                    "key" : "sale_email_1_make",
                    "delay" : 19.0
                }, 
                {
                    "key" : "sale_sms_1",
                    "delay" : 19.0
                }, 
                {
                    "key" : "sale_email_2",
                    "delay" : 24.0
                },
                {
                    "key" : "sale_email_3",
                    "delay" : 29.0
                }
            ],
            "thanks" : {
                "complete_satisfied" : "sale_email_thanks_1_make",
                "complete_unsatisfied" : "sale_email_thanks_2_make",
                "incomplete_satisfied" : "sale_email_thanks_3_make",
                "incomplete_unsatisfied" : "sale_email_thanks_4_make"
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
            "contacts" : [ 
                {
                    "key" : "sale_email_1",
                    "delay" : 3.0
                }, 
                {
                    "key" : "sale_sms_1",
                    "delay" : 3.0
                }, 
                {
                    "key" : "sale_email_3",
                    "delay" : 9.0
                }
            ],
            "thanks" : {
                "complete_satisfied" : "sale_email_thanks_1_car_repairer",
                "complete_unsatisfied" : "sale_email_thanks_2_car_repairer",
                "incomplete_satisfied" : "maintenance_email_thanks_3_car_repairer",
                "incomplete_unsatisfied" : "sale_email_thanks_4_car_repairer"
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
        }
    },
    "createdAt" : new Date(),
    "updatedAt" : new Date(),
    "followupAndEscalate" : {
        "DataFile" : {
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
            },
            "unsatisfied" : {
                "followup" : {
                    "enabled" : true,
                    "delay" : 45.0
                },
                "escalate" : {
                    "enabled" : true,
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
                    "enabled" : true,
                    "delay" : 90.0
                },
                "escalate" : {
                    "enabled" : true,
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
                    "enabled" : true,
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