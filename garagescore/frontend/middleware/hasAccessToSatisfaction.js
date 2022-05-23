export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToSatisfaction']) {
    return redirect('/cockpit');
  }
}
