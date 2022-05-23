export default function ({ redirect, store, route }) {
  const { getters, state } = store;
  const { path, fullPath } = route;

  const rootPathRegExp = /cockpit\/?$/;
  const isCockpitRootPage = (
    rootPathRegExp.test(path)
    && rootPathRegExp.test(fullPath)
  );
  if (!isCockpitRootPage) {
    return;
  }

  if (!state.auth.isAuthenticated) {
    return redirect(302, '/auth/signin');
  }
  if (getters['auth/hasAccessToWelcome']) {
    return redirect(302, '/cockpit/welcome');
  }
  if (getters['auth/hasAccessToSatisfaction']) {
    return redirect(302, '/cockpit/satisfaction/reviews');
  }
  if (getters['auth/hasAccessToUnsatisfied']) {
    return redirect(302, '/cockpit/unsatisfied/reviews');
  }
  if (
    getters['auth/hasAccessToLeads']
    || getters['auth/hasAccessToCrossLeads']
  ) {
    return redirect(302, '/cockpit/leads/reviews');
  }
  if (getters['auth/hasAccessToContacts']) {
    return redirect(302, '/cockpit/contacts/reviews');
  }
  if (getters['auth/hasAccessToTeam']) {
    return redirect(302, '/cockpit/analytics/dataRecord');
  }
  if (getters['auth/hasAccessToEreputation']) {
    return redirect(302, '/cockpit/e-reputation/reviews');
  }
  if (getters['auth/hasAccessToDarkbo']) {
    return redirect(302, '/backoffice');
  }
  return redirect(302, '/cockpit/admin/profile');
}
