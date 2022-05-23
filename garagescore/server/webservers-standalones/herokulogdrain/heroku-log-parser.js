// https://raw.githubusercontent.com/darbyfrey/heroku-log-parser/master/heroku-log-parser.js
// The code has been modified to clean and add structured data
/* eslint-disable */

function _split_lines(data) {
  return data
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function _counting_frame(line) {
  let frame = /^(\d+) /.exec(line);
  if (frame === null) {
    console.log('Unable to parse counting frame');
    return 0;
  } else {
    return Number.parseInt(frame[0]);
  }
}

function _parse_line(line) {
  let byte_length = _counting_frame(line);
  let offset = byte_length.toString().length + 1;

  return line.slice(offset, byte_length + offset);
}

function _extract_event_data(line) {
  let regex = /\<(\d+)\>(1) (\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d\d\d\d\d\d)?\+00:00) ([a-z0-9\-\_\.]+) ([a-z0-9\.-]+) ([a-z0-9\-\_\.]+) (\-) (.*)$/;
  let extracted_data = regex.exec(_parse_line(line));
  let event = {};
  if (extracted_data === null) {
    return null;
  } else {
    event.priority = Number.parseInt(extracted_data[1]);
    event.syslog_version = Number.parseInt(extracted_data[2]);
    event.emitted_at = extracted_data[3];
    event.hostname = extracted_data[4];
    event.appname = extracted_data[5];
    event.proc_id = extracted_data[6];
    event.msg_id = null;
    event.message = extracted_data[8];
    event.structured_data = {};
    const others = event.message.split(' ');
    for (let i = 0; i < others.length; i++) {
      const p = others[i].split('=');
      event.structured_data[p[0]] = p.length > 1 ? p[1] : '';
    }
    event.original = extracted_data[0];
    return event;
  }
}

module.exports = function parse(data) {
  let events = [];
  let lines = _split_lines(data);

  lines.forEach(function (line) {
    let event_data = _extract_event_data(line);
    events.push(event_data || { parseError: true, original: line });
  });
  return events;
};
