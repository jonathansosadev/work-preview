export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToContacts']) {
    return redirect('/cockpit');
  }
}
