/* Send timeouts code=H12 desc="Request timeout" to datadog */
const datadog = require('./_datadog');

module.exports = (log, headers, db, cb) => {
  if (log.message && log.message.indexOf('code=H12') >= 0) {
    const app = (log.structured_data && log.structured_data && log.structured_data.host) || 'unknown';
    let path =
      (log.structured_data && log.structured_data && log.structured_data.path && log.structured_data.path) || 'unknown';
    path = path.replace(/"/g, '');
    const date = Math.round(new Date(log.emitted_at || 0).getTime() / 1000);
    const props = {
      host: (log.structured_data && log.structured_data && log.structured_data.dyno) || 'unknown',
      tags: ['code:H12', `app:${app}`, `path:${path}`],
      alert_type: 'error',
      date_happened: date,
    };
    const title = 'Request timeout';
    const text = `${log.emitted_at} ${JSON.stringify(props)}`;
    console.log(title, text);
    datadog.async.create(title, text, props, (err) => {
      if (err) {
        console.error(err);
      }
      datadog.async.send('log.event.H12', 1, (err2) => {
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

// eslint-disable-next-line
// const line = '347 <158>1 2019-08-23T09:17:38.458556+00:00 heroku router - - at=error code=H12 desc="Request timeout" method=POST path="/graphql" host=app.custeed.com request_id=d4cb0698-2d37-488c-9643-812ce3002089 fwd="134.213.5.52,162.158.154.222" dyno=web.1 connect=0ms service=30001ms status=503 bytes=0 protocol=https';
// const logs = require('../heroku-log-parser.js')(line);
// module.exports(logs[0], {}, () => { process.exit(); });
