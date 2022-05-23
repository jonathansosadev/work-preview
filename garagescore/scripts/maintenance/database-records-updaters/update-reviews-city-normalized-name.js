/*
 * Update all reviews, update the authorCityNormalizedName field
 */

var app = require('../../../server/server');
var Writable = require('stream').Writable;
var util = require('util');

var go = function () {
  console.log('Update authorCityNormalizedName');
  var count = 0;
  // uplaod data buffer to S3
  function Update() {
    if (!(this instanceof Update)) {
      return new Update({});
    }
    Writable.call(this, { objectMode: true });
  }
  util.inherits(Update, Writable);
  Update.prototype._write = function write(review, encoding, callback) {
    review.author(function (err, author) {
      if (err) {
        console.log(err);
        callback();
        return;
      }
      review.authorCityNormalizedName = author.getCityNormalizedName(); // eslint-disable-line
      count++;
      review.save(callback);
    });
  };
  var stream = app.models.PublicReview.findStream({});
  stream
    .pipe(new Update())
    .on('finish', function () {
      console.log(count + ' reviews updated');
      process.exit();
    })
    .on('error', function (err) {
      console.error('An error occured');
      console.error(err);
    });
  stream.count(function (err, c) {
    console.log('Reviews to process : ' + c);
  });
};

app.on('booted', function () {
  setTimeout(go, 1000 * 60);
});
