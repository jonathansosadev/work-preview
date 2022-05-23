const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("5d2d935668f9900015238ac9"),
    "type" : "Agent",
    "slug" : "garagescore-en_us-example-agent",
    "publicDisplayName" : "Agent Tesla Houston",
    "securedDisplayName" : "Agent Tesla Houston",
    "brandNames" : [],
    "logoEmail" : [],
    "logoDirectoryPage" : [],
    "googleCampaignActivated" : true,
    "googleCampaignLock" : false,
    "streetAddress" : "14820 North Freeway",
    "postalCode" : "77090",
    "region" : "Texas",
    "subRegion" : "Texas",
    "city" : "Houston",
    "phone" : "(281) 982-7130",
    "googlePlaceId" : "ChIJeZnJI0fKQIYR15QtFtvYJ",
    "links" : [],
    "usersQuota" : 5,
    "surveySignature" : {
        "useDefault": true,
        "defaultSignature": {
            "lastName" : "Oncle",
            "firstName" : "Sam",
            "job" : "Manager"
        }
    },
    "subscriptions" : {
        "priceValidated" : true,
        "Maintenance" : {
            "enabled" : true,
            "price" : 20
        },
        "NewVehicleSale" : {
            "enabled" : true,
            "price" : 20
        },
        "UsedVehicleSale" : {
            "enabled" : true,
            "price" : 20
        },
        "Lead" : {
            "enabled" : true,
            "price" : 20
        },
        "EReputation" : {
            "enabled" : true,
            "price" : 20
        },
        "VehicleInspection" : {
            "enabled" : true,
            "price" : 20
        },
        "Analytics" : {
            "enabled" : true,
            "price" : 20
        },
        "CrossLeads" : {
            "enabled" : false,
            "price" : 0,
            "included" : 2,
            "unitPrice" : 0,
            "restrictMobile" : false,
            "minutePrice" : 1
        },
        "Automation" : {
            "enabled" : true,
            "price" : 0,
            "included" : 0,
            "every" : 1
        },
        "active" : true,
        "dateStart" : new Date(),
        "dateEnd" : null,
        "setup" : null,
        "users" : {
            "included" : 5,
            "price" : 20
        },
        "contacts" : {
            "bundle" : false,
            "included" : 0,
            "every" : 0,
            "price" : 1
        },
        "AutomationApv" : {
            "enabled" : true
        },
        "AutomationVn" : {
            "enabled" : true
        },
        "AutomationVo" : {
            "enabled" : true
        }
    },
    "ratingType" : "rating",
    "isReverseRating" : false,
    "certificateWording" : "appointment",
    "zohoDealUrl" : "https://crm.zoho.com/crm/org321574269/tab/Potentials/1886266000011044999",
    "disableZohoUrl" : false,
    "bizDevId" : "55f18971b592111900363574",
    "hideDirectoryPage" : true,
    "disableAutoAllowCrawlers" : false,
    "updateFrequency" : "never",
    "status" : "Stopped",
    "group" : "garagescore",
    "enrichScriptEnabled" : false,
    "thresholds" : {
        "alertSensitiveThreshold" : {
            "maintenance" : 6,
            "sale_new" : 6,
            "sale_used" : 6,
            "vehicle_inspection" : 6
        }
    },
    "businessId" : "11122223333444",
    "externalId" : "",
    "shareReviews" : true,
    "postOnGoogleMyBusiness" : true,
    "exogenousReviewsConfigurations" : {
        "Google" : {
            "connectedBy" : "",
            "error" : "",
            "token" : "",
            "externalId" : "",
            "lastError" : null,
            "lastRefresh" : null,
            "lastFetch" : null
        },
        "PagesJaunes" : {
            "connectedBy" : "",
            "error" : "",
            "token" : "",
            "externalId" : "",
            "lastError" : null,
            "lastRefresh" : null,
            "lastFetch" : null
        },
        "Facebook" : {
            "connectedBy" : "",
            "error" : "",
            "token" : "",
            "externalId" : "",
            "lastError" : null,
            "lastRefresh" : null,
            "lastFetch" : null
        }
    },
    "parent" : {
        "garageId" : "",
        "shareLeadTicket" : {
            "enabled" : false,
            "NewVehicleSale" : false,
            "UsedVehicleSale" : false
        }
    },
    "locale" : "en_US",
    "timezone" : "Europe/Paris",
    "allowReviewCreationFromContactTicket" : false,
    "enableCrossLeadsSelfAssignCallAlert" : true,
    "createdAt" : new Date("2016-07-04T09:48:07.456Z"),
    "updatedAt" : new Date("2016-07-04T09:48:07.456Z"),
    "campaignScenarioId" : ObjectID("5beee8a4582cf900141a14b7"),
    "automaticBillingSubscriptionIds" : [],
    "monthPriceHistory" : [],
    "tva" : 20,
    "annexGarageId" : null,
    "dataFirstDays" : {
        "firstMaintenanceDay" : null,
        "firstNewVehicleSaleDay" : null,
        "firstUsedVehicleSaleDay" : null
    },
    "dms" : {},
    "importSchema" : {},
    "imports" : [],
    "stopShareReviewsAt" : null
};