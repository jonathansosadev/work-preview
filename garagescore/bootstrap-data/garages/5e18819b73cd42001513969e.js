const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("5e18819b73cd42001513969e"),
    "type" : "Dealership",
    "slug" : "garagescore-fr_be-example",
    "publicDisplayName" : "Garage Lambert",
    "securedDisplayName" : "Garage Lambert",
    "brandNames" : [],
    "logoEmail" : [],
    "logoDirectoryPage" : [],
    "googleCampaignActivated" : false,
    "googleCampaignLock" : false,
    "streetAddress" : "5 Boulevard Anspach",
    "postalCode" : "1000",
    "region" : "Bruxelles",
    "subRegion" : "Bruxelles",
    "city" : "Bruxelles",
    "phone" : "01 23 45 67 89",
    "googlePlaceId" : "ChIJtwjrCaR75kcRljeYYTYTyfY",
    "googlePlace" : {
        "id" : "ChIJx8qQG5R75kcRHVajLJUYOvJ",
        "latitude" : 48.817277,
        "longitude" : 2.269697,
        "phone" : "01 23 45 67 89",
        "rating" : 4.8,
        "reviewCount" : 5,
        "website" : null,
        "url" : "https://maps.google.com/?cid=17454290334805874205",
        "city" : "Bruxelles",
        "postalCode" : "1000",
        "region" : "Bruxelles",
        "subRegion" : "Bruxelles",
        "streetAddress" : "5 Boulevard Anspach",
        "businessStatus" : "OPERATIONAL",
        "openingHours" : null,
        "lastUpdate" : new Date()
    },
    "links" : [],
    "usersQuota" : 5,
    "surveySignature" : {
        "useDefault": true,
        "defaultSignature": {
            "lastName" : "Dubois",
            "firstName" : "Ricky",
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
    "zohoDealUrl" : "https://crm.zoho.com/crm/org321574269/tab/Potentials/1886266000011044001",
    "disableZohoUrl" : false,
    "bizDevId" : "5a008258ff67335f002d1705",
    "performerId" : "5b2d012347a22300138193c4",
    "hideDirectoryPage" : true,
    "disableAutoAllowCrawlers" : true,
    "updateFrequency" : "never",
    "status" : "RunningAuto",
    "group" : "garagescore",
    "enrichScriptEnabled" : false,
    "thresholds" : {
        "alertSensitiveThreshold" : {
            "maintenance" : 8,
            "sale_new" : 6,
            "sale_used" : 6,
            "vehicle_inspection" : 6
        }
    },
    "businessId" : "99999999999999",
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
    "campaignScenarioId" : ObjectID("5b50c4427c8ff70003e42a8a"),
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