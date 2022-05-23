/** try every import options to check any syntax errors */

var app = require('../../../server/server.js');
var optionsParser = require('../../../common/lib/garagescore/data-file/options-parser');

app.models.Garage.find({}, function (err, garages) {
  if (err) {
    console.error(err);
    process.exit();
  }
  garages.forEach(function (garage) {
    var filter = garage.importSchema && garage.importSchema.options && garage.importSchema.options.filter;
    if (filter) {
      var keep = null;
      try {
        keep = optionsParser.parseRowsFilter(filter, null, true)[0];
      } catch (ep) {
        console.log(garage.publicDisplayName + ' - ' + garage.getId());
        console.error(filter);
        console.error(ep.message);
        console.log('-----------------');
      }
      if (keep) {
        try {
          keep({ x: 'toto' });
        } catch (ek) {
          console.log(garage.publicDisplayName + ' - ' + garage.getId());
          console.error(filter);
          console.error(ek.message);
          console.log('-----------------');
        }
      }
    }
  });
  process.exit();
});
