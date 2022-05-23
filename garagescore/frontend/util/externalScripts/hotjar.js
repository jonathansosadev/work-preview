import scriptLoader from './script-loader';

/** create trigger like this: automation_fr */
const setupHotJar = (locale, product) => {
  // triggers
  setTimeout(() => {
    if (window.hj && ['fr', 'es'].includes(locale)) {
      hj('trigger', product + '_' + locale);
    }
  }, 1000)
}

const hotjar = (hotjarId) => {
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:hotjarId,hjsv:6, hjdebug:false };
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');
    r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
};

export { hotjar, setupHotJar }
/* En gros ici j'ai traduit le code suivant avec possibilité de changer d'hotjar id:
--> ça marche MAIS pas avec les triggers :(
--> le code d'origine de hotjar va rajouter un autre script avec un id en paramètre propre à hotjar:
--> ex: <script async="" src="https://script.hotjar.com/modules.5a9f57d95ecbb1bf1965.js" charset="utf-8"></script>
// Hotjar Tracking Code for https://app.custeed.com/
const defaultHjFct = function () {
  (window.hj.q=window.hj.q||[]).push(arguments);
}
window.hj = window.hj || defaultHjFct;
window._hjSettings = { hjid: hotjarId, hjsv: 6, hjdebug: true };

const hotjarSrc = `https://static.hotjar.com/c/hotjar-${hotjarId}.js?sv=${window._hjSettings.hjsv}`;
scriptLoader(hotjarSrc, false, { onScriptLoaded: () => {}, async: true });
*/
