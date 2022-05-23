export default (src, checkVar, { onScriptLoaded, async = false, defer = false }) => {
  if (!checkVar) {
    const scriptElt = document.createElement('script');
    scriptElt.type = 'text/javascript';
    scriptElt.src = src;
    scriptElt.async = async;
    scriptElt.defer = defer;
    if (onScriptLoaded) {
      scriptElt.onload = onScriptLoaded;
    }
    document.head.appendChild(scriptElt);
  } else {
    if (onScriptLoaded) {
      onScriptLoaded();
    }
  }
}