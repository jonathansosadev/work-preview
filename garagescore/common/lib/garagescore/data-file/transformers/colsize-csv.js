var debug = require('debug')('garagescore:common:lib:garagescore:data-file:transformers:colsize'); // eslint-disable-line max-len,no-unused-vars

/** set columns count to options.size for every lines, remove lines with too many columns */

var transform = function transform(options, content) {
  var lines = content.split('\n');
  var c = '';
  for (var l = 0; l < lines.length; l++) {
    var countCol = lines[l].split(';').length;
    if (countCol > options.size) {
      debug('Ignoring line ' + l + ' too many columns (' + countCol + '/' + options.size + ')');
      debug(lines[l]);
    } else {
      if (l !== 0) {
        c += '\n';
      }
      c += lines[l];
      while (countCol < options.size) {
        c += ';';
        countCol++;
      }
    }
  }
  return c;
};

module.exports = {
  transform: transform,
};
