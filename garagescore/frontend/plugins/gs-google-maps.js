import Vue from 'vue';

export default function (context, inject) {
  /**
   * Inject the Google object in the Nuxt instance, even if it's
   * not used server side.
   */
  Vue['__nuxt_$google_installed__'] = true;
  inject('google', {});

  /**
   * Apply the new Google object to the previously created one in our
   * Vue app (client side only)
   * Do an event boomerang to make sure the Google maps API callback was
   * called and google injected in Vue.
   */
  if (typeof window !== 'undefined') {
    var event = document.createEvent("Event");
    event.initEvent("maps-module:loaded", false, true);
    window.dispatchEvent(event);
    window.addEventListener('maps-module:loaded', () => {
      Object.defineProperty(Vue.prototype, '$google', {
        get() {
          return window.google;
        },
        configurable: true,
      });
    });
  }
}
