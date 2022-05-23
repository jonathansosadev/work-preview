export default function ({ req, redirect, route }) {
  if (route.fullPath === '/') {
    const redirectsByLocale = { fr: '/', es: '/es_ES', ca: '/ca_ES', en: '/en_US' };
    // Let's give an example of one 'accept-language' header :
    // fr,es;q=0.9,tr;q=0.8,en-US;q=0.7
    // That represents the languages that are set as preffered in the browser, by order of preference
    // So, we need to extract the most preferred language that we actually support
    const clientLocale = req.headers['accept-language'] && req.headers['accept-language']
      .split(',') // Splitting the header into an array where each element is a locale => ['fr', 'es;q=0.9', 'tr;q=0.8', 'en-US;q=0.7']
      .map(lang => lang.substring(0, 2)) // Getting rid of country precision & locale weight ['fr', 'es', 'tr', 'en']
      .filter(lang => redirectsByLocale.hasOwnProperty(lang)) // Keeping only the locales that we support ['fr', 'es', 'en']
      .shift(); // We take the first one => 'fr'

    // If the detected language is French, then we're not redirecting because we're already in the french version
    if (clientLocale && clientLocale !== 'fr' && redirectsByLocale[clientLocale]) {
      return redirect(redirectsByLocale[clientLocale]);
    }
  }
}
