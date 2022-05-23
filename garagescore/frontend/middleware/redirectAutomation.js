export default async ({ route, store, redirect }) => {
  const currentGarage = store.getters['cockpit/selectedGarage'];
  const hasAccess = currentGarage?.length ?
    currentGarage.some(garage => garage?.subscriptions?.Automation === true) :
    store.getters['cockpit/authorizations'].hasAutomationAtLeast;
  if (hasAccess) {
    const availableGarages = store.getters['cockpit/availableGarages'].filter((g) => g.subscriptions && g.subscriptions.Automation === true);
    const hasGarageAccess = availableGarages && availableGarages.length > 1;
    const label = hasGarageAccess ? 'garages' : 'campaigns';
    const subRoute = route.path.endsWith('/') ? label : `/${label}`;
    const newRoute = route.fullPath.replace(route.path, `${route.path}${subRoute}`);
    redirect(newRoute);
  }
};
