// During a specific timeframe they was a bug in production
// The bug was preventing surveys with ratings > 8 to be completed
// As a result reviews with score > 8 where not shared with partners
// To limit impact on clients overall rating we decided to remove all reviews for this timeframe

// Only complete survey which last responce was during the timeframe
// Check if review object exists is to be safe
db.datas.updateMany(
  {
    'review.sharedWithPartnersAt': {
      $gte: new Date('2021-03-10'),
      $lte: new Date('2021-10-01'),
    },
    'review.shareWithPartners': true,
  },
  { $set: { 'review.shareWithPartners': false } }
);
