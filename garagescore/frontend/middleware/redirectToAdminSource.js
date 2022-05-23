export default function ({ store, redirect }) {
  if (store.getters['auth/hasAccessToCrossLeads'] && !store.getters['cockpit/canSubscribeToCrossLeads'].length) {
    return redirect('/cockpit/admin/sources');
  }
}
