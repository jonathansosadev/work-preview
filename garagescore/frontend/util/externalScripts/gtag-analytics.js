import scriptLoader from './script-loader';

export default (gaMeasurementId, { send_page_view = true, onGtagConfigured } = {}) => {
  const onScriptLoaded = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    if (!send_page_view) {
      gtag('config', gaMeasurementId, { send_page_view: false });
    } else {
      gtag('config', gaMeasurementId);
    }
    if (onGtagConfigured) {
      onGtagConfigured(gtag);
    }
  };
  scriptLoader(
    `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
    window.gtag,
    { onScriptLoaded, async: true, defer: true }
  );

}