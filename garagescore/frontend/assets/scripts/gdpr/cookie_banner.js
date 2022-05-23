(function () {
  var DEBUG = false; // always shows the banner
  var COOKIE_NAME = 'acceptCookies';
  var BANNER_ID = 'cookieBanner';
  var OVERLAY_ID = 'cookieInfos';
  var OVERLAY_CLOSE_ID  = 'cookieInfosClose';
  var OVERLAY_CLOSE2_ID  = 'cookieInfosClose2';
  var OVERLAY_HTML = '';
  OVERLAY_HTML += '<br/><br/><b>Qu\'est ce qu\'un cookie ?</b>';
  OVERLAY_HTML += '<br/>Un cookie est un fichier texte déposé et conservé sur le disque dur de l\'internaute, sous réserve de ses choix, par le serveur du site visité ou par un serveur tiers (outil de web analytique , régie publicitaire, partenaires, etc .)';
  OVERLAY_HTML += '<br/>Un cookie permet donc de reconnaître le terminal de l\'Utilisateur lorsqu\'il revient sur un site web. En effet ce n\'est pas l\'Utilisateur qui est reconnu mais le terminal depuis lequel il visite un site web.';
  OVERLAY_HTML += '<br/><br/><b>A quoi servent les cookies émis sur nos Sites ?</b>';
  OVERLAY_HTML += '<br/>Seul l\'émetteur d\'un cookie est susceptible de lire ou de modifier des informations qui y sont contenues.';
  OVERLAY_HTML += '<br/>Les cookies que nous émettons sur nos Sites sont utilisés pour reconnaître le terminal de l\'Utilisateur lorsqu\'il se connecte à l\'un de nos Sites afin de :';
  OVERLAY_HTML += '<br/>- <b>Cookies fonctionnels</b> : Ces cookies nous permettent d’analyser l’utilisation du site afin de pouvoir en mesurer et en améliorer la performance. ';
  OVERLAY_HTML += '<br/>- <b>Cookies obligatoires</b> : Ces cookies sont nécessaires au bon fonctionnement du site.';
  OVERLAY_HTML += '<br/>- <b>Cookies publicitaires</b> : Ces cookies sont utilisés par des agences de publicité pour envoyer des annonces qui correspondent à vos centres d’intérêt.';
  OVERLAY_HTML += '<br/><br/>En plus : Fonctionnalité autorisée';
  OVERLAY_HTML += '<br/>- Fournissent une connexion sécuritaire ;';
  OVERLAY_HTML += '<br/>- Se souviennent de vos informations de connexion ;';
  OVERLAY_HTML += '<br/>- Plus grande cohérence dans l\'apparence du site ;';
  OVERLAY_HTML += '<br/>- Permettent de partager des pages avec des réseaux sociaux ;';
  OVERLAY_HTML += '<br/>- Permettent de publier des commentaires ;';
  OVERLAY_HTML += '<br/><br/><b>Accepter ou refuser les cookies</b>';
  OVERLAY_HTML += '<br/>Vous pouvez supprimer les cookies enregistrés sur votre ordinateur au moyen des procédures suivantes selon le navigateur que vous utilisez.';
  OVERLAY_HTML += '<br/><br/>Pour Microsoft Internet Explorer :';
  OVERLAY_HTML += '<br/>- Menu "Outils" (ou "Tools"), puis "Options Internet" (ou "Internet Options").';
  OVERLAY_HTML += '<br/>- Onglet "Confidentialité" (ou "Confidentiality")';
  OVERLAY_HTML += '<br/>- Sélection du niveau souhaité à l\'aide du curseur.';
  OVERLAY_HTML += '<br/><br/>Pour Mozilla Firefox :';
  OVERLAY_HTML += '<br/>- Menu "Outils" puis "Options"';
  OVERLAY_HTML += '<br/>- Cliquez sur l\'icône "vie privée"';
  OVERLAY_HTML += '<br/>- Repérez le menu « Cookie » et sélectionnez les options qui vous conviennent.';
  OVERLAY_HTML += '<br/><br/>Pour Google Chrome :';
  OVERLAY_HTML += '<br/>- Paramètres puis Paramètres avancés.';
  OVERLAY_HTML += '<br/>- Cliquez sur Paramètres du contenu puis sur Cookies.';
  OVERLAY_HTML += '<br/>- Cliquez sur Tout supprimer.';
  OVERLAY_HTML += '<br/><br/>Plus d\'information sur les cookies sur la CNIL : <a href="http://www.cnil.fr/vos-droits/vos-traces/les-cookies/">http://www.cnil.fr/vos-droits/vos-traces/les-cookies/ </a><br/><br/>';



  function acceptCookies(e) {
    var from = e.target && e.target.id;
    if (from === BANNER_ID + 'ShowInfos' || from === OVERLAY_ID || from === OVERLAY_CLOSE_ID) {
       // do not accept while reading infos
      return;
    }
    var tagName = e.target && e.target.tagName;
    if (from == BANNER_ID + 'Close' || tagName === 'A' ||  tagName === 'BUTTON' ||  tagName === 'INPUT') {
      var overlay = document.getElementById(OVERLAY_ID);
      if (overlay && overlay.style.display === 'block') { return; }
      if (overlay) { overlay.parentNode.removeChild(overlay); }
      var banner = document.getElementById(BANNER_ID);
      if (banner) { banner.parentNode.removeChild(banner); }
      createCookie(365);
      document.body.removeEventListener('click', acceptCookies, true);
   }
  }


  function showBanner() {
    var bodytag = document.getElementsByTagName('body')[0];

    // banner
    var div = document.createElement('div');
    div.setAttribute('id', BANNER_ID);
    div.style.backgroundColor = '#EEEEEE';
    div.style.color = 'black';
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.zIndex = 2;
    div.style.fontSize = '13px';
    div.style.padding = '10px';
    div.innerHTML = 'En poursuivant votre navigation, vous acceptez le dépôt de cookies destinés à améliorer votre expérience sur le site.';

    // En savoir plus link
    var a = document.createElement('span');
    a.setAttribute('id', BANNER_ID + 'ShowInfos');
    a.setAttribute('rel', 'nofollow');
    a.style.display = 'inline-block';
    a.style.marginLeft = '5px';
    a.style.cursor = 'pointer';
    a.style.textDecoration = 'underline';
    a.innerHTML = 'En savoir +';
    a.onclick = function showInfos() {
      var overlay = document.getElementById(OVERLAY_ID);
      if (overlay) { overlay.style.display= 'block'; }
      
      return false;
    }
    div.appendChild(a);

    // overlay infos
    var infos = document.createElement('div');
    infos.setAttribute('id', OVERLAY_ID);
    infos.style.position = 'fixed';
    infos.style.top = '0';
    infos.style.left = '0';
    infos.style.width = '100%';
    infos.style.display = 'none';
    infos.style.height = '100%';
    infos.style.padding = '10px';
    infos.style.backgroundColor = 'white';
    infos.style.overflowX = 'hidden';
    infos.innerHTML = OVERLAY_HTML;
    infos.style.zIndex = 20;

    // close banner
    var close = document.createElement('span');
    close.setAttribute('id', BANNER_ID + 'Close');
    close.style.cursor = 'pointer';
    close.style.display = 'inline-block';
    close.style.marginLeft = '80px';
    close.onclick = acceptCookies;
    close.innerHTML = 'X';
    div.appendChild(close);

    // close overlay infos
    var closeInfos = document.createElement('button');
    closeInfos.setAttribute('id', OVERLAY_CLOSE_ID);
    closeInfos.style.cursor = 'pointer';
    closeInfos.innerHTML = 'Fermer';
    closeInfos.style.fontSize = '15px';
    closeInfos.style.position = 'absolute';
    closeInfos.style.right = '5px';
    closeInfos.onclick = function() {
      var overlay = document.getElementById(OVERLAY_ID);
      if (overlay) { overlay.style.display = 'none'; }
    }
    infos.insertBefore(closeInfos, infos.lastChild);

    var closeInfos2 = document.createElement('span');
    closeInfos2.setAttribute('id', OVERLAY_CLOSE2_ID);
    closeInfos2.style.cursor = 'pointer';
    closeInfos2.innerHTML = 'X';
    closeInfos2.style.fontSize = '15px';
    closeInfos2.style.position = 'absolute';
    closeInfos2.style.right = '5px';
    closeInfos2.onclick = function() {
      var overlay = document.getElementById(OVERLAY_ID);
      if (overlay) { overlay.style.display = 'none'; }
    }
    infos.insertBefore(closeInfos2, infos.firstChild);

    bodytag.appendChild(div);
    bodytag.appendChild(infos);
    // bodytag.insertBefore(div, bodytag.firstChild);
  }


  function createCookie(days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
    var value = days > -1 ? 'yes' : 'no';
    document.cookie = COOKIE_NAME + "=" + value + expires + "; path=/";
  }

  function getCookieValue() {
    var nameEQ = COOKIE_NAME + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // function eraseCookie(name) { createCookie(name, "", -1); }

  window.onload = function () {
    if (DEBUG || getCookieValue() != 'yes') {
      showBanner();
      document.body.addEventListener('click', acceptCookies, true);
    }
  }
})();
