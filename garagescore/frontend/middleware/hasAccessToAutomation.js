export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToAutomation']) {
    return redirect('/cockpit');
  }
}
