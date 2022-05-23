export default function ({ store, redirect }) {
	const loginRedirectPath = '/auth/signin';
  // if (store.state.auth.maintenance && !store.state.auth.isMaintenanceUser) {
  //   if (store.getters['auth/hasAccessToDarkbo']) {
  //     redirect(302, '/backoffice'); return;
  //   }
  //   redirect(302, '/cockpit/maintenance');
  //   return;
  // } hellofed maintenance
  if (!store.state.auth.isAuthenticated) {
    return redirect(loginRedirectPath);
  }
}
