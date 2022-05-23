// Update garage and set "allowReviewCreationFromContactTicket" field as false and enableCrossLeadsSelfAssignCallAlert as true
db.getCollection('garages').updateMany({}, {
  $set: {
    allowReviewCreationFromContactTicket: false,
    enableCrossLeadsSelfAssignCallAlert: true
  }
})