export default function ({ store, redirect }) {
  if (!store.getters['auth/hasAccessToSurveys']) {
    return redirect('/cockpit');
  }
}
