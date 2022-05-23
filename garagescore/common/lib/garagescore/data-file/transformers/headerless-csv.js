/** Add an header */

var transform = function transform(options, content, dataFileType) {
  // replace tab by ;
  var header = (options[dataFileType] && options[dataFileType].header) || options.header;

  var c = content;
  if (!content) {
    return header;
  }
  if (!header) {
    return content;
  }
  c = header + '\n' + c;
  return c;
};

module.exports = {
  transform: transform,
};
