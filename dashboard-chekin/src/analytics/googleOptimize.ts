const GOOGLE_OPTIMIZE_SCRIPT_ID = 'googleOptimizeScript';
export const GOOGLE_OPTIMIZE_PAGES_IDS = {
  housings: 'OPT-W356NZB',
  reservations: 'OPT-TV33SC3',
  subscriptions: 'OPT-M9KJ4RG',
  upselling: 'OPT-5S4HVVQ',
  documents: 'OPT-TJFPWTT',
  account: 'OPT-NX79XS4',
  marketplace: 'OPT-TQ5X5NC',
};

function initGoogleOptimize(id: string, reinstall?: boolean) {
  const scriptSrc = `https://www.googleoptimize.com/optimize.js?id=${id}`;

  if (reinstall) {
    const foundScripts = document.querySelectorAll(`#${GOOGLE_OPTIMIZE_SCRIPT_ID}`);

    for (let script of Array.from(foundScripts)) {
      if (script.getAttribute('src') === scriptSrc) return;
      script.remove();
    }
  } else {
    const foundSameScript = document.querySelector(`script[src~="${scriptSrc}"]`);
    if (foundSameScript) return;
  }

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.id = GOOGLE_OPTIMIZE_SCRIPT_ID;
  script.src = scriptSrc;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

export {initGoogleOptimize};
