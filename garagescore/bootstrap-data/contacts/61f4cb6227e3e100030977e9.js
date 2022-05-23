const { ObjectID } = require('mongodb');

module.exports = {
    "_id" : ObjectID("61f4cb6227e3e100030977e9"),
    "type" : "MONTHLY_SUMMARY_EMAIL",
    "from" : "no-reply@custeed.com",
    "sender" : "Custeed",
    "to" : "custeed@garagescore.com",
    "payload" : {
        "reportId" : "61f4cb6227e3e100030977e8",
        "mailgun" : {
            "id" : "20220129051203.2ae102f8c990aa5e@mg.garagescore.com",
            "message" : "Queued. Thank you."
        }
    },
    "createdAt" : new Date(),
    "updatedAt" : new Date(),
    "status" : "Delivered",
    "app_url" : "https://app.custeed.com",
    "sendAt" : new Date(),
    "sendDate" : new Date()
};