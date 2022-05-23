export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToUnsatisfied']) {
    return redirect('/cockpit');
  }
}
