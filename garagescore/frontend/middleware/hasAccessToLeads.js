export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToLeads'] && !store.getters['auth/hasAccessToCrossLeads']) {
    return redirect('/cockpit');
  }
}
