const appInfos = require('../../app-infos.js');

module.exports = class GsApiInterface {
  static $promisify(fn, ...args) {
    return new Promise((resolve, reject) => fn(...args, (e, d) => (e ? reject(e) : resolve(d))));
  }

  static $to(promise) {
    return promise.then((data) => [null, data]).catch((err) => [err, null]);
  }

  static $brandLogo(brand) {
    return `${process.env.WWW_URL}/certificate/images/logos/Logo-h90px-${brand
      .replace(/[\s-]/g, '')
      .replace('ë', 'e')
      .replace('Š', 'S')}.png`;
  }

  static $getLogoPath(logo) {
    return `${process.env.WWW_URL}/certificate/images/logos/${logo}`;
  }

  static $hasAccess(appId, garageId) {
    if (appId === null) {
      return { authorizedGarages: [], allGaragesAuthorized: true, fullData: true };
    } else if (!this.$apps[appId]) {
      return { authorizedGarages: [], allGaragesAuthorized: false, fullData: false };
    } else if (!this.$hasAccessToGarage(appId, garageId)) {
      throw new Error(`You do not have access to the garage ${garageId}`);
    }
    return this.$apps[appId];
  }

  static $hasAccessToGarage(appId, garageId) {
    return (
      this.$apps[appId] &&
      (this.$apps[appId].allGaragesAuthorized ||
        (this.$apps[appId].authorizedGarages && this.$apps[appId].authorizedGarages.includes(garageId)))
    );
  }

  static get $apps() {
    return appInfos.currentApps;
  }
};
