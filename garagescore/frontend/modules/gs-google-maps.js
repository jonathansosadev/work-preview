/**
 * Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * this is a copy of https://github.com/WilliamDASILVA/nuxt-google-maps-module
 *
 * there an issue related to Internet Explorer and we posted an issue on github and waiting for fix
 *
 * when fixed we must remove this module and the related plugin and replace '~/modules/gs-google-maps', by the original module
 *
 * the issue link https://github.com/WilliamDASILVA/nuxt-google-maps-module/issues/7
 *
 * Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */

import { resolve } from 'path';

export default function (moduleOptions) {
  const defaults = {
    defer: true,
    async: true,
    body: true,
    key: null,
    libraries: [
      'places',
    ],
  };

  const options = {
    ...defaults,
    ...this.options.maps,
    ...moduleOptions,
  };

  const libraries = options.libraries.join(',');

  /**
   * Make sure the initMap function is created in the DOM
   * before we even think to initialize the Google Maps API
   */
  // eslint-disable-next-line
  this.options.head.__dangerouslyDisableSanitizers = ['script'];
  this.options.head.script.push({
    innerHTML: `window.initMap = function(){
      var event = document.createEvent("Event");
      event.initEvent("maps-module:loaded", false, true);
      window.dispatchEvent(event);
      window.addEventListener('maps-module:initiated', function(){
        setTimeout(function(){
          window.dispatchEvent(new Event('maps-module:loaded'));
        });
      });
    }`,
    type: 'text/javascript',
  });

  /**
   * Import the Google Maps script with initMap callback.
   */
  this.options.head.script.push({
    src: `//maps.googleapis.com/maps/api/js?key=${options.key}&libraries=${libraries}&callback=initMap`,
    defer: options.defer,
    async: options.async,
  });

  /**
   * Inject the plugin to inject the Google object in the Vue instance
   */
  this.addPlugin({
    src: resolve(__dirname, '../plugins/gs-google-maps.js'),
    options,
  });
};
