/** Replace tabs by ; */

var transform = function transform(options, content) {
  return content
    .replace(/[\r\n]+$/, '')
    .replace(/\|/g, ';')
    .replace(/[^\S\n];[^\S\n]*/g, ';');
};

module.exports = {
  transform: transform,
};
