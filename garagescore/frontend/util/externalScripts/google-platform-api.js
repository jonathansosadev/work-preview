import scriptLoader from './script-loader';

export default () => {
  const onScriptLoaded = () => gapi.load("auth2", () => gapi.auth2.init());
  scriptLoader(
    'https://apis.google.com/js/platform.js',
    window.gapi,
    { onScriptLoaded, async: true, defer: true }
  );
}