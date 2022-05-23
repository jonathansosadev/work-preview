// remove useless _wasManual fields and move google place fields to googlePlace
db.getCollection('garages').updateMany(
  {},
  {
    $unset: {
      city_wasManual: true,
      countryCode_wasManual: true,
      googlePlaceUrl_wasManual: true,
      googleWebsiteUrl_wasManual: true,
      latitude_wasManual: true,
      longitude_wasManual: true,
      phone_wasManual: true,
      postalCode_wasManual: true,
      region_wasManual: true,
      streetAddress_wasManual: true,
      subRegion_wasManual: true,

      googlePlaceNumberOfReviews: true, // Replaced by nothing, not used
      googlePlaceRating: true, // Replaced by googlePlace.rating
      googlePlaceLastUpdate: true, // Replaced by googlePlace.lastUpdate
      googlePlaceUrl: true, // Replaced by googlePlace.url
      googleOpeningHours: true, // Replaced by googlePlace.openingHours
      googleWebsiteUrl: true, // Replaced by googlePlace.website
      fax: true, // Not needed anymore, just cleaning
      latitude: true, // Replaced by googlePlace.latitude
      longitude: true, // Replaced by googlePlace.longitude
    },
  }
);
