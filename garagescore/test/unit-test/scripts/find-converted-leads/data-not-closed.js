const { ObjectId } = require('mongodb');

const dataNotClosed = {
    "_id" : ObjectId("618e79e2cd89fd0004045b78"),
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
                "value" : "bbtestconversion3@bb.com",
                "original" : "bbtestconversion3@bb.com",
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
            "value" : "Benjamin",
            "original" : "Benjamin",
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
            "value" : "Benjamin Richard",
            "original" : "Benjamin Richard",
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
        "campaignId" : ObjectId("618e79e2cd89fd0004045b7b"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:27:46.404Z"),
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
            "firstContactedAt" : new Date("2021-11-12T14:27:46.712Z"),
            "nextCampaignReContactDay" : 18958,
            "nextCampaignContact" : null,
            "nextCampaignContactDay" : null,
            "lastCampaignContactSent" : "maintenance_email_thanks_1_make",
            "lastCampaignContactSentAt" : new Date("2021-11-12T14:28:38.108Z"),
            "nextCheckSurveyUpdatesDecaminute" : null,
            "firstContactByEmailDay" : 18943,
            "firstContactByPhoneDay" : 18943,
            "nextCampaignContactEvent" : "CONTACT_SENT",
            "nextCampaignContactAt" : new Date("1970-01-01T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e79e2cd89fd0004045b75"),
        "importedAt" : new Date("2021-11-12T14:27:46.272Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Benjamin RICHARD",
                "firstName" : "Benjamin",
                "lastName" : "RICHARD",
                "email" : "bbtestconversion3@bb.com",
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
    "createdAt" : new Date("2021-11-12T14:27:46.287Z"),
    "updatedAt" : new Date("2021-11-12T14:28:38.778Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "lastRespondedAt" : new Date("2021-11-12T14:28:28.577Z"),
        "firstRespondedAt" : new Date("2021-11-12T14:28:28.577Z"),
        "foreignResponses" : [ 
            {
                "source" : "Internal survey",
                "date" : new Date("2021-11-12T14:28:28.574Z"),
                "payload" : {
                    "acceptTermOfUse" : true,
                    "dataType" : "Maintenance",
                    "rating" : "10",
                    "leadType" : "Interested",
                    "comment" : "test bb conversion d'un ticket non fermé",
                    "isComplete" : false,
                    "pageNumber" : 1,
                    "pageCount" : 5,
                    "timestamp" : 1636727305204.0
                }
            }
        ],
        "progress" : {
            "isComplete" : false,
            "pageNumber" : 1,
            "pageCount" : 5
        },
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886adf7c014daa57d2b6ff25",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/xxS0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886adf7c014daa57d2b6ff25",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886adf7c014daa57d2b6ff25"
        },
        "lastRespondentIP" : "92.139.24.193",
        "lastRespondentFingerPrint" : "87de826c631cdb675e5d74bba2aec513",
        "type" : "Maintenance",
        "sendAt" : new Date("2021-11-12T14:27:46.673Z"),
        "isIntern" : true
    },
    "alert" : {
        "checkAlertHour" : 454647
    },
    "lead" : {
        "reportedAt" : new Date("2021-11-12T14:28:28.647Z"),
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
        "createdAt" : new Date("2021-11-12T14:28:28.606Z"),
        "rating" : {
            "value" : 10
        },
        "comment" : {
            "text" : "test bb conversion d'un ticket non fermé",
            "status" : "Approved",
            "updatedAt" : new Date("2021-11-12T14:28:28.610Z"),
            "approvedAt" : new Date("2021-11-12T14:28:28.619Z"),
            "rejectedReason" : null
        }
    },
    "leadTicket" : {
        "createdAt" : new Date("2021-11-12T14:28:38.189Z"),
        "touched" : false,
        "reactive" : false,
        "status" : "WaitingForContact",
        "actions" : [ 
            {
                "name" : "leadStarted",
                "createdAt" : new Date("2021-11-12T14:28:38.300Z"),
                "assignerUserId" : null,
                "ticketManagerId" : ObjectId("5e7cd6cb4dc30a001605654a"),
                "comment" : "",
                "isManual" : false
            }
        ],
        "budget" : NaN,
        "manager" : "5e7cd6cb4dc30a001605654a",
        "comment" : "",
        "referenceDate" : new Date("2021-11-12T14:28:38.189Z"),
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
                "email" : "bbtestconversion3@bb.com"
            },
            "fullName" : "Benjamin Richard"
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

const convertedSaleDataNotClosed = {
    "_id" : ObjectId("618e7a35cd89fd0004045b86"),
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
                "value" : "bbtestconversion3@bb.com",
                "original" : "bbtestconversion3@bb.com",
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
            "value" : "Jean",
            "original" : "Jean",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "lastName" : {
            "value" : "Thomas",
            "original" : "Thomas",
            "isSyntaxOK" : true,
            "isEmpty" : false
        },
        "fullName" : {
            "value" : "Jean Thomas",
            "original" : "Jean Thomas",
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
        "campaignId" : ObjectId("618e7a35cd89fd0004045b88"),
        "status" : "Running",
        "importedAt" : new Date("2021-11-12T14:29:09.341Z"),
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
            "nextCampaignReContactDay" : 18958,
            "nextCampaignContact" : "sale_email_1_make",
            "nextCampaignContactDay" : 18947,
            "firstContactByEmailDay" : 18947,
            "firstContactByPhoneDay" : 18947,
            "nextCampaignContactEvent" : "CAMPAIGN_STARTED",
            "nextCampaignContactAt" : new Date("2021-11-16T00:00:00.000Z")
        }
    },
    "source" : {
        "sourceId" : ObjectId("618e7a34cd89fd0004045b83"),
        "importedAt" : new Date("2021-11-12T14:29:09.218Z"),
        "raw" : {
            "index" : 0,
            "cells" : {
                "dateinter" : "12/11/2021",
                "genre" : "Mr",
                "fullName" : "Jean THOMAS",
                "firstName" : "Jean",
                "lastName" : "THOMAS",
                "email" : "bbtestconversion3@bb.com",
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
    "createdAt" : new Date("2021-11-12T14:29:09.239Z"),
    "updatedAt" : new Date("2021-11-12T14:29:09.563Z"),
    "survey" : {
        "acceptNewResponses" : true,
        "urls" : {
            "base" : "https://beta-survey-pr-4563.herokuapp.com/s/7886ae20c014daa57d2b6f0c8",
            "baseShort" : "https://beta-app-pr-4563.herokuapp.com/8KT0cPqA2",
            "mobileLanding" : "https://beta-survey-pr-4563.herokuapp.com/m/7886ae20c014daa57d2b6f0c8",
            "unsatisfiedLanding" : "https://beta-survey-pr-4563.herokuapp.com/u/7886ae20c014daa57d2b6f0c8"
        },
        "type" : "NewVehicleSale"
    }
}

module.exports = {
    dataNotClosed, 
    convertedSaleDataNotClosed
};