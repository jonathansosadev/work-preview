export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToWelcome']) {
    return redirect('/cockpit');
  }
}
