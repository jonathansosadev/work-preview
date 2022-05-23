export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToCrossLeads']) {
    return redirect('/cockpit');
  }
}
