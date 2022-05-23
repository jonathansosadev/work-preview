const { ObjectId } = require('mongodb');

const dataClosedWithoutSale = {
    "_id" : ObjectId("618e76f6cd89fd0004045b1b"),
    "type" : "Maintenance",
    "garageType" : "Dealership",
    "shouldSurfaceInStatistics" : true,
    "service" : {
        "isQuote" : null,
        "providedAt" : new Date("2021-11-11T23:00:00.000Z"),
        "frontDeskUserName" : "UNDEFINED"
    },
    "customer" : {
        "contact" : {
            "email" : {
                "value" : "bbtestconversion@bb.com",
                "original" : "bbtestconversion@bb.com",
                "isSyntaxOK" : true,
                "isEmpty" : false
            },
            "mobilePhone" : {
                "isEmpty" : true
            }
        },
        "gender" : {
            "value" : "M",
            "original" : "M",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "title" : {
            "value" : "Monsieur",
            "original" : "Monsieur",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "firstName" : {
            "value" : "Pascal",
            "original" : "Pascal",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "lastName" : {
            "value" : "Dubois",
            "original" : "Dubois",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "fullName" : {
            "value" : "Pascal Dubois",
            "original" : "Pascal Dubois",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "street" : {
            "value" : "44 Rue Cauchy",
            "original" : "44 Rue Cauchy",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "postalCode" : {
            "value" : "94110",
            "original" : "94110",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "city" : {
            "value" : "Arcueil",
            "original" : "Arcueil",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "countryCode" : {
            "value" : "FR",
            "original" : "FR",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "rgpd" : {
            "optOutMailing" : {
                "isEmpty" : true
            },
            "optOutSMS" : {
                "isEmpty" : true
            }
        }
    },
    "vehicle" : {
        "isRevised" : false,
        "isValidated" : false,
        "make" : {
            "isEmpty" : true
        },
        "model" : {
            "value" : "Clio",
            "original" : "Clio",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "mileage" : {
            "isEmpty" : true
        },
        "plate" : {
            "isEmpty" : true
        },
        "vin" : {
            "isEmpty" : true
        },
        "countryCode" : {
            "isEmpty" : true
        },
        "registrationDate" : {
            "isEmpty" : true
        }
    },
    "campaign" : {
        "campaignId" : ObjectId("618e76f6cd89fd0004045b1e"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:15:18.562Z"),
        "contactStatus" : {
            "hasBeenContactedByPhone" : false,
            "hasBeenContactedByEmail" : true,
            "hasOriginalBeenContactedByPhone" : false,
            "hasOriginalBeenContactedByEmail" : false,
            "status" : "Received",
            "phoneStatus" : "Empty",
            "emailStatus" : "Valid",
            "previouslyContactedByPhone" : false,
            "previouslyContactedByEmail" : false,
            "previouslyDroppedEmail" : false,
            "previouslyDroppedPhone" : false,
            "previouslyUnsubscribedByEmail" : false,
            "previouslyUnsubscribedByPhone" : false,
            "previouslyComplainedByEmail" : false
        },
        "contactScenario" : {
            "deltaContact" : 0,
            "firstContactedAt" : new Date("2021-11-12T14:15:19.134Z"),
            "nextCampaignReContactDay" : 18960,
            "nextCampaignContact" : null,
            "nextCampaignContactDay" : null,
            "lastCampaignContactSent" : "maintenance_email_thanks_1_make",
            "lastCampaignContactSentAt" : new Date("2021-11-12T14:19:27.108Z"),
            "nextCheckSurveyUpdatesDecaminute" : null,
            "firstContactByEmailDay" : 18943,
            "firstContactByPhoneDay" : 18943,
            "nextCampaignContactEvent" : "CONTACT_SENT",
            "nextCampaignContactAt" : new Date("1970-01-01T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e76f6cd89fd0004045b18"),
        "importedAt" : new Date("2021-11-12T14:15:18.246Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Pascal DUBOIS",
                "firstName" : "Pascal",
                "lastName" : "DUBOIS",
                "email" : "bbtestconversion@bb.com",
                "ville" : "Arcueil",
                "rue" : "44 rue Cauchy",
                "cp" : "94110",
                "marque" : "Renault",
                "modele" : "Clio",
                "mobilePhone" : ""
            }
        },
        "type" : "DataFile"
    },
    "createdAt" : new Date("2021-11-12T14:15:18.284Z"),
    "updatedAt" : new Date("2021-11-12T14:21:28.146Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "lastRespondedAt" : new Date("2021-11-12T14:17:43.256Z"),
        "firstRespondedAt" : new Date("2021-11-12T14:17:13.253Z"),
        "foreignResponses" : [ 
            {
                "source" : "Internal survey",
                "date" : new Date("2021-11-12T14:17:13.247Z"),
                "payload" : {
                    "rating" : "10",
                    "isComplete" : false,
                    "pageNumber" : 0,
                    "pageCount" : 5,
                    "timestamp" : 1636726630460.0
                }
            }, 
            {
                "source" : "Internal survey",
                "date" : new Date("2021-11-12T14:17:43.253Z"),
                "payload" : {
                    "rating" : "10",
                    "acceptTermOfUse" : true,
                    "dataType" : "Maintenance",
                    "leadType" : "Interested",
                    "comment" : "test bb conversion Ticket fermé sans vente",
                    "isComplete" : false,
                    "pageNumber" : 1,
                    "pageCount" : 5,
                    "timestamp" : 1636726662376.0
                }
            }
        ],
        "progress" : {
            "isComplete" : false,
            "pageCount" : 5,
            "pageNumber" : 1
        },
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886a2e3c014daa57d2b6f91d",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/lgM0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886a2e3c014daa57d2b6f91d",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886a2e3c014daa57d2b6f91d"
        },
        "lastRespondentIP" : "92.139.24.193",
        "lastRespondentFingerPrint" : "87de826c631cdb675e5d74bba2aec513",
        "type" : "Maintenance",
        "sendAt" : new Date("2021-11-12T14:15:18.916Z"),
        "isIntern" : true
    },
    "alert" : {
        "checkAlertHour" : 454647
    },
    "lead" : {
        "reportedAt" : new Date("2021-11-12T14:17:43.366Z"),
        "potentialSale" : true,
        "saleType" : null,
        "timing" : null,
        "knowVehicle" : false,
        "vehicle" : null,
        "brands" : null,
        "energyType" : null,
        "bodyType" : null,
        "tradeIn" : null,
        "financing" : null,
        "isConverted" : false,
        "isConvertedToSale" : false,
        "isConvertedToTradeIn" : false,
        "type" : "Interested"
    },
    "review" : {
        "createdAt" : new Date("2021-11-12T14:17:13.294Z"),
        "rating" : {
            "value" : 10
        },
        "comment" : {
            "text" : "test bb conversion Ticket fermé sans vente",
            "status" : "Approved",
            "updatedAt" : new Date("2021-11-12T14:17:43.288Z"),
            "approvedAt" : new Date("2021-11-12T14:17:43.335Z"),
            "rejectedReason" : null
        }
    },
    "leadTicket" : {
        "createdAt" : new Date("2021-11-12T14:19:27.203Z"),
        "touched" : true,
        "reactive" : true,
        "status" : "ClosedWithoutSale",
        "wasTransformedToSale" : false,
        "missedSaleReason" : [ 
            "APV_AlreadyDone"
        ],
        "closedAt" : new Date("2021-11-12T14:20:56.833Z"),
        "actions" : [ 
            {
                "name" : "leadStarted",
                "createdAt" : new Date("2021-11-12T14:19:27.306Z"),
                "assignerUserId" : null,
                "ticketManagerId" : ObjectId("5e7cd6cb4dc30a001605654a"),
                "comment" : "",
                "isManual" : false
            }, 
            {
                "name" : "leadClosed",
                "createdAt" : new Date("2021-11-12T14:20:56.833Z"),
                "assignerUserId" : ObjectId("55f18971b592111900363574"),
                "comment" : "commentaire obligatoire",
                "missedSaleReason" : [ 
                    "APV_AlreadyDone"
                ],
                "type" : "lead",
                "wasTransformedToSale" : false,
                "alertContributors" : false,
                "id" : {}
            }
        ],
        "checkNotificationDay" : 0,
        "budget" : NaN,
        "manager" : "5e7cd6cb4dc30a001605654a",
        "comment" : "",
        "referenceDate" : new Date("2021-11-12T14:19:27.203Z"),
        "temperature" : "Unknown",
        "timing" : null,
        "saleType" : null,
        "energyType" : null,
        "cylinder" : [],
        "bodyType" : null,
        "knowVehicle" : false,
        "financing" : null,
        "tradeIn" : null,
        "customer" : {
            "contact" : {
                "mobilePhone" : null,
                "email" : "bbtestconversion@bb.com"
            },
            "fullName" : "Pascal Dubois"
        },
        "leadVehicle" : null,
        "vehicle" : {
            "plate" : null,
            "makeModel" : "Clio"
        },
        "type" : "Maintenance",
        "brandModel" : null,
        "followUpDelayDays" : 10
    }
}

const convertedSaleDataClosedWithoutSale = {
    "_id" : ObjectId("618e787bcd89fd0004045b48"),
    "type" : "NewVehicleSale",
    "garageType" : "Dealership",
    "shouldSurfaceInStatistics" : true,
    "service" : {
        "isQuote" : false,
        "providedAt" : new Date("2021-11-12T23:00:00.000Z"),
        "frontDeskUserName" : "UNDEFINED"
    },
    "customer" : {
        "contact" : {
            "email" : {
                "value" : "bbtestconversion@bb.com",
                "original" : "bbtestconversion@bb.com",
                "isSyntaxOK" : true,
                "isEmpty" : false
            },
            "mobilePhone" : {
                "isEmpty" : true
            }
        },
        "gender" : {
            "value" : "M",
            "original" : "M",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "title" : {
            "value" : "Monsieur",
            "original" : "Monsieur",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "firstName" : {
            "value" : "Pascal",
            "original" : "Pascal",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "lastName" : {
            "value" : "Robert",
            "original" : "Robert",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "fullName" : {
            "value" : "Pascal Robert",
            "original" : "Pascal Robert",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "street" : {
            "value" : "44 Rue Cauchy",
            "original" : "44 Rue Cauchy",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "postalCode" : {
            "value" : "94110",
            "original" : "94110",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "city" : {
            "value" : "Arcueil",
            "original" : "Arcueil",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "countryCode" : {
            "value" : "FR",
            "original" : "FR",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "rgpd" : {
            "optOutMailing" : {
                "isEmpty" : true
            },
            "optOutSMS" : {
                "isEmpty" : true
            }
        }
    },
    "vehicle" : {
        "isRevised" : false,
        "isValidated" : false,
        "make" : {
            "isEmpty" : true
        },
        "model" : {
            "value" : "Clio",
            "original" : "Clio",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "mileage" : {
            "isEmpty" : true
        },
        "plate" : {
            "isEmpty" : true
        },
        "vin" : {
            "isEmpty" : true
        },
        "countryCode" : {
            "isEmpty" : true
        },
        "registrationDate" : {
            "isEmpty" : true
        }
    },
    "campaign" : {
        "campaignId" : ObjectId("618e787bcd89fd0004045b4a"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:21:47.469Z"),
        "contactStatus" : {
            "hasBeenContactedByPhone" : false,
            "hasBeenContactedByEmail" : false,
            "hasOriginalBeenContactedByPhone" : false,
            "hasOriginalBeenContactedByEmail" : false,
            "status" : "Scheduled",
            "phoneStatus" : "Empty",
            "emailStatus" : "Valid",
            "previouslyContactedByPhone" : false,
            "previouslyContactedByEmail" : false,
            "previouslyDroppedEmail" : false,
            "previouslyDroppedPhone" : false,
            "previouslyUnsubscribedByEmail" : false,
            "previouslyUnsubscribedByPhone" : false,
            "previouslyComplainedByEmail" : false
        },
        "contactScenario" : {
            "deltaContact" : 4,
            "nextCampaignReContactDay" : 18960,
            "nextCampaignContact" : "sale_email_1_make",
            "nextCampaignContactDay" : 18947,
            "firstContactByEmailDay" : 18947,
            "firstContactByPhoneDay" : 18947,
            "nextCampaignContactEvent" : "CAMPAIGN_STARTED",
            "nextCampaignContactAt" : new Date("2021-11-16T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e787bcd89fd0004045b45"),
        "importedAt" : new Date("2021-11-12T14:21:47.186Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Pascal ROBERT",
                "firstName" : "Pascal",
                "lastName" : "ROBERT",
                "email" : "bbtestconversion@bb.com",
                "ville" : "Arcueil",
                "rue" : "44 rue Cauchy",
                "cp" : "94110",
                "marque" : "Renault",
                "modele" : "Clio",
                "mobilePhone" : ""
            }
        },
        "type" : "DataFile"
    },
    "createdAt" : new Date("2021-11-12T14:21:47.200Z"),
    "updatedAt" : new Date("2021-11-12T14:21:47.691Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886ac6ec014daa57d2b6fc24",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/a4N0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886ac6ec014daa57d2b6fc24",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886ac6ec014daa57d2b6fc24"
        },
        "type" : "NewVehicleSale"
    }
}

module.exports = {
    dataClosedWithoutSale, 
    convertedSaleDataClosedWithoutSale
};