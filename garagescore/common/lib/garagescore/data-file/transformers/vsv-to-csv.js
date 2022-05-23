/** Replace colon by ; */

var transform = function transform(options, content) {
  return content
    .replace(/[\r\n]+$/, '')
    .replace(/,/g, ';')
    .replace(/[^\S\n];[^\S\n]*/g, ';'); // [^\S\n]* => space without new line
};

module.exports = {
  transform: transform,
};
