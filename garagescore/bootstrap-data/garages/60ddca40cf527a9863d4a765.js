const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("60ddca40cf527a9863d4a765"),
    "type" : "Caravanning",
    "slug" : "garagescore-fr_be-example-caravanning",
    "publicDisplayName" : "Caravanning Richard",
    "securedDisplayName" : "Caravanning Richard",
    "brandNames" : [],
    "logoEmail" : [],
    "logoDirectoryPage" : [],
    "googleCampaignActivated" : true,
    "googleCampaignLock" : false,
    "streetAddress" : "5 Boulevard Anspach",
    "postalCode" : "1000",
    "region" : "Bruxelles",
    "subRegion" : "Bruxelles",
    "city" : "Bruxelles",
    "phone" : "",
    "googlePlaceId" : "ChIJtwjrCaR75kcRljeYYTYTyfE",
    "links" : [],
    "usersQuota" : 5,
    "surveySignature" : {
        "useDefault": true,
        "defaultSignature": {
            "lastName" : "Lambert",
            "firstName" : "Michel",
            "job" : "Directeur"
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
    "zohoDealUrl" : "https://crm.zoho.com/crm/org000000000/tab/Potentials/1886266000011044001",
    "disableZohoUrl" : false,
    "bizDevId" : "59ad70a93671e31b008a5400",
    "hideDirectoryPage" : true,
    "disableAutoAllowCrawlers" : true,
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
    "businessId" : "43210987654321",
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
    "locale" : "fr_BE",
    "timezone" : "Europe/Paris",
    "allowReviewCreationFromContactTicket" : false,
    "enableCrossLeadsSelfAssignCallAlert" : true,
    "createdAt" : new Date("2016-07-04T09:48:07.456Z"),
    "updatedAt" : new Date("2016-07-04T09:48:07.456Z"),
    "campaignScenarioId" : ObjectID("60fa80f1e942bb4d13f330b8"),
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