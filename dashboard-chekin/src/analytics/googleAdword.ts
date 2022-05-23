// @ts-nocheck

function gtag() {
  window.dataLayer = window.dataLayer || [];
  dataLayer.push(arguments);
}

function initGoogleAdword() {
  gtag('js', new Date());
  gtag('config', 'AW-481274774');
}

function sendConversion(to: string) {
  gtag('event', 'conversion', {send_to: to});
}

export {initGoogleAdword, sendConversion};
