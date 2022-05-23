import scriptLoader from './script-loader';

export default (facebookId) => {
  const onScriptLoaded = () => FB.init({ appId: facebookId, version: "v11.0", status: true,
  xfbml: true, });
  scriptLoader(
    'https://connect.facebook.net/en_US/sdk.js',
    window.FB,
    { onScriptLoaded, async: false, defer: false }
  );
}