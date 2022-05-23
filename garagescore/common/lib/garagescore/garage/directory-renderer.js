var path = require('path');
var fs = require('fs');
var lru = require('lru-cache');
var resolve = function (file) {
  return path.resolve(__dirname, file);
};

var template = fs.readFileSync(resolve('../../../templates/www/certificate/src/index.template.html'), 'utf-8');

module.exports = function createRenderer(bundle, options) {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return require('vue-server-renderer').createBundleRenderer(
    bundle,
    Object.assign(options, {
      template: template,
      // for component caching
      cache: lru({
        max: 1000,
        maxAge: 1000 * 60 * 15,
      }),
      // this is only needed when vue-server-renderer is npm-linked
      basedir: resolve('../../templates/www/certificate/dist'),
      // recommended for performance
      runInNewContext: false,
    })
  );
};
