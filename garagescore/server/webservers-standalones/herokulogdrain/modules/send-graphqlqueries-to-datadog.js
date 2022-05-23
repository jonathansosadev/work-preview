/* Send an event to datadog every time a query is made */
// require('dotenv').config({ silent: true });
const datadog = require('./_datadog');

module.exports = (log, headers, db, cb) => {
  if (log.original && log.original.indexOf('method=POST path="/graphql"') >= 0) {
    const title = 'Graphql query POST';
    console.log(title);
    datadog.async.create(title, '', {}, (err) => {
      if (err) {
        console.error(err);
        cb();
        return;
      }
      datadog.async.send('log.event.grapqhlquery', 1, {}, (err2) => {
        if (err2) {
          console.error(err2);
        }
        cb();
      });
    });
  } else {
    cb();
  }
};
