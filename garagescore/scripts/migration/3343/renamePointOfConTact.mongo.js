// collection billingAccounts
// rename "pointOfContact" field to "technicalContact"

db.getCollection('billingAccounts').updateMany({}, {
  $rename: { pointOfContact: 'technicalContact' }
})