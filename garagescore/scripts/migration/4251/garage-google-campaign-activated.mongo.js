// #4251 Set garages googleCampaignActivated as true
db.getCollection('garages').updateMany({
  googleCampaignActivated: false
}, {
  $set: {
    googleCampaignActivated: true
  }
})