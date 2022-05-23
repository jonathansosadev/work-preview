const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("5bfff5c8c8613c00147ebced"),
    "type" : "Agent",
    "slug" : "garagescore-fr_fr-example-agent",
    "publicDisplayName" : "Agent dupont",
    "securedDisplayName" : "Agent dupont",
    "brandNames" : [],
    "logoEmail" : [],
    "logoDirectoryPage" : [],
    "googleCampaignActivated" : true,
    "googleCampaignLock" : false,
    "streetAddress" : "50 Rue Alphonse Melun",
    "postalCode" : "94230",
    "region" : "Île-de-France",
    "subRegion" : "Val-de-Marne",
    "city" : "Cachan",
    "phone" : "01 84 23 27 17",
    "googlePlaceId" : "ChIJ1SfnIBJx5kcRZS5kijZrH_4",
    "googlePlace" : {
        "id" : "ChIJ1SfnIBJx5kcRZS5kijZrH_4",
        "latitude" : 48.817277,
        "longitude" : 2.269697,
        "phone" : "01 84 23 27 17",
        "rating" : 4.5,
        "reviewCount" : 5,
        "website" : "http://www.custeed.com/",
        "url" : "https://maps.google.com/?cid=18311472491905953381",
        "city" : "Cachan",
        "postalCode" : "94230",
        "region" : "Île-de-France",
        "subRegion" : "Val-de-Marne",
        "streetAddress" : "50 Rue Alphonse Melun",
        "businessStatus" : "OPERATIONAL",
        "openingHours" : null,
        "lastUpdate" : new Date()
    },
    "links" : [],
    "usersQuota" : 5,
    "surveySignature" : {
        "useDefault": true,
        "defaultSignature": {
            "lastName" : "Dupont",
            "firstName" : "M",
            "job" : "Gérant"
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
            "price" : 29
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
    "ratingType" : "stars",
    "isReverseRating" : false,
    "certificateWording" : "appointment",
    "zohoDealUrl" : "https://crm.zoho.com/crm/org000000000/tab/Potentials/1886266000011044001",
    "disableZohoUrl" : false,
    "bizDevId" : "5ed63efbb8abf30016dfeca2",
    "performerId" : "5ab51feeae5ed600131faf3f",
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
    "businessId" : "01234567891011",
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
    "locale" : "fr_FR",
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