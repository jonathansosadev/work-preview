// @ts-nocheck

function initHubspot(path: string) {
  const hubspot = (window._hsq = window._hsq || []);

  hubspot.push(['setPath', path]);
  hubspot.push(['trackPageView']);
}

function openHubspotChat() {
  if (window.HubSpotConversations) {
    window.HubSpotConversations.widget.open();
  }
}

function resetHubspot() {
  window.hsConversationsSettings = {
    loadImmediately: false,
  };

  if (window.HubSpotConversations) {
    window.HubSpotConversations.resetAndReloadWidget();
    window.HubSpotConversations.widget.remove();
    window.HubSpotConversations.widget.load();
  }
}

export {initHubspot, openHubspotChat, resetHubspot};
