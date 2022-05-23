db.getCollection('garages').updateMany({ 
  $or: [
      { 'exogenousReviewsConfigurations.Facebook.token': { $eq: '' }},
      { 'exogenousReviewsConfigurations.Facebook.externalId': { $eq: '' }}  
  ],
  'exogenousReviewsConfigurations.Facebook.error': { $ne: '' }, 
}, { 
  '$set': 
  {
      'exogenousReviewsConfigurations.Facebook.error': '',
      'exogenousReviewsConfigurations.Facebook.lastError': null 
  }
});