// add { disableZohoUrl: true } field for null or empty field zohoDealUrl
// standardize zohoDealUrl (only empty string, no more missing field or null value)
db.getCollection('garages').updateMany({
  zohoDealUrl: {
    $in: [null, '']
  }
}, {
  $set: {
    disableZohoUrl: true,
    zohoDealUrl: ''
  }
})