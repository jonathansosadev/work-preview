export default function ({ store, redirect }) {
  if (!store.state.auth.ACCESS_TO_E_REPUTATION && store.getters['cockpit/authorizations'].hasEReputationAtLeast) {
    return redirect('/cockpit');
  }
}
