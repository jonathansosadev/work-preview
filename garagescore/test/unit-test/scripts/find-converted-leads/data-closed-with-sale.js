const { ObjectId } = require('mongodb');

const dataClosedWithSale = {
    "_id" : ObjectId("618e78b9cd89fd0004045b53"),
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
                "value" : "bbtestconversion2@bb.com",
                "original" : "bbtestconversion2@bb.com",
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
            "value" : "Michel",
            "original" : "Michel",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "lastName" : {
            "value" : "Richard",
            "original" : "Richard",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "fullName" : {
            "value" : "Michel Richard",
            "original" : "Michel Richard",
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
        "campaignId" : ObjectId("618e78b9cd89fd0004045b56"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:22:49.192Z"),
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
            "firstContactedAt" : new Date("2021-11-12T14:22:49.443Z"),
            "nextCampaignReContactDay" : 18959,
            "nextCampaignContact" : null,
            "nextCampaignContactDay" : null,
            "lastCampaignContactSent" : "maintenance_email_thanks_1_make",
            "lastCampaignContactSentAt" : new Date("2021-11-12T14:23:52.134Z"),
            "nextCheckSurveyUpdatesDecaminute" : null,
            "firstContactByEmailDay" : 18943,
            "firstContactByPhoneDay" : 18943,
            "nextCampaignContactEvent" : "CONTACT_SENT",
            "nextCampaignContactAt" : new Date("1970-01-01T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e78b8cd89fd0004045b50"),
        "importedAt" : new Date("2021-11-12T14:22:48.763Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Michel RICHARD",
                "firstName" : "Michel",
                "lastName" : "RICHARD",
                "email" : "bbtestconversion2@bb.com",
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
    "createdAt" : new Date("2021-11-12T14:22:49.095Z"),
    "updatedAt" : new Date("2021-11-12T14:25:42.287Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "lastRespondedAt" : new Date("2021-11-12T14:23:43.480Z"),
        "firstRespondedAt" : new Date("2021-11-12T14:23:43.480Z"),
        "foreignResponses" : [ 
            {
                "source" : "Internal survey",
                "date" : new Date("2021-11-12T14:23:43.477Z"),
                "payload" : {
                    "acceptTermOfUse" : true,
                    "dataType" : "Maintenance",
                    "rating" : "10",
                    "comment" : "test leadTicket ferm?? vendu",
                    "leadType" : "Interested",
                    "isComplete" : false,
                    "pageNumber" : 1,
                    "pageCount" : 5,
                    "timestamp" : 1636727018743.0
                }
            }
        ],
        "progress" : {
            "isComplete" : false,
            "pageNumber" : 1,
            "pageCount" : 5
        },
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886acacc014daa57d2b6fd94",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/iAO0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886acacc014daa57d2b6fd94",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886acacc014daa57d2b6fd94"
        },
        "lastRespondentIP" : "92.139.24.193",
        "lastRespondentFingerPrint" : "87de826c631cdb675e5d74bba2aec513",
        "type" : "Maintenance",
        "sendAt" : new Date("2021-11-12T14:22:49.396Z"),
        "isIntern" : true
    },
    "alert" : {
        "checkAlertHour" : 454647
    },
    "lead" : {
        "reportedAt" : new Date("2021-11-12T14:23:43.547Z"),
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
        "createdAt" : new Date("2021-11-12T14:23:43.506Z"),
        "rating" : {
            "value" : 10
        },
        "comment" : {
            "text" : "test leadTicket ferm?? vendu",
            "status" : "Approved",
            "updatedAt" : new Date("2021-11-12T14:23:43.509Z"),
            "approvedAt" : new Date("2021-11-12T14:23:43.516Z"),
            "rejectedReason" : null
        }
    },
    "leadTicket" : {
        "createdAt" : new Date("2021-11-12T14:23:52.189Z"),
        "touched" : true,
        "reactive" : true,
        "status" : "ClosedWithSale",
        "wasTransformedToSale" : true,
        "missedSaleReason" : null,
        "closedAt" : new Date("2021-11-12T14:25:31.703Z"),
        "actions" : [ 
            {
                "name" : "leadStarted",
                "createdAt" : new Date("2021-11-12T14:23:52.285Z"),
                "assignerUserId" : null,
                "ticketManagerId" : ObjectId("5e7cd6cb4dc30a001605654a"),
                "comment" : "",
                "isManual" : false
            }, 
            {
                "name" : "leadClosed",
                "createdAt" : new Date("2021-11-12T14:25:31.703Z"),
                "assignerUserId" : ObjectId("55f18971b592111900363574"),
                "comment" : "test conversion",
                "missedSaleReason" : null,
                "type" : "lead",
                "wasTransformedToSale" : true,
                "alertContributors" : false,
                "id" : {}
            }
        ],
        "checkNotificationDay" : 0,
        "budget" : NaN,
        "manager" : "5e7cd6cb4dc30a001605654a",
        "comment" : "",
        "referenceDate" : new Date("2021-11-12T14:23:52.189Z"),
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
                "email" : "bbtestconversion2@bb.com"
            },
            "fullName" : "Michel Richard"
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

const convertedSaleDataClosedWithSale = {
    "_id" : ObjectId("618e7975cd89fd0004045b6d"),
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
                "value" : "bbtestconversion2@bb.com",
                "original" : "bbtestconversion2@bb.com",
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
            "value" : "Richard",
            "original" : "Richard",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "fullName" : {
            "value" : "Pascal Richard",
            "original" : "Pascal Richard",
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
        "campaignId" : ObjectId("618e7975cd89fd0004045b6f"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:25:57.185Z"),
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
            "nextCampaignReContactDay" : 18959,
            "nextCampaignContact" : "sale_email_1_make",
            "nextCampaignContactDay" : 18947,
            "firstContactByEmailDay" : 18947,
            "firstContactByPhoneDay" : 18947,
            "nextCampaignContactEvent" : "CAMPAIGN_STARTED",
            "nextCampaignContactAt" : new Date("2021-11-16T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e7974cd89fd0004045b6a"),
        "importedAt" : new Date("2021-11-12T14:25:57.038Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Pascal RICHARD",
                "firstName" : "Pascal",
                "lastName" : "RICHARD",
                "email" : "bbtestconversion2@bb.com",
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
    "createdAt" : new Date("2021-11-12T14:25:57.058Z"),
    "updatedAt" : new Date("2021-11-12T14:25:57.381Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886ad60c014daa57d2b6fe73",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/fqR0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886ad60c014daa57d2b6fe73",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886ad60c014daa57d2b6fe73"
        },
        "type" : "NewVehicleSale"
    }
}
      

module.exports = {
    dataClosedWithSale, 
    convertedSaleDataClosedWithSale
};