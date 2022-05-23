export default async ({ route, store, redirect }) => {
  const availableGarages = store.getters['cockpit/availableGarages'];
  const hasGarageAccess = store.getters['auth/hasAccessToEstablishment'];
  const hasTeamAccess = store.getters['auth/hasAccessToTeam'];
  const isSharingAllTicket = (garage) => garage.isAgentSharingAllTickets === true;
  const isAvailableGaragesShareAllTickets = availableGarages.every(isSharingAllTicket);
  let label = 'reviews';
  if (isAvailableGaragesShareAllTickets && route.path.includes('leads')) {
    label = 'followed';
  } else if (hasGarageAccess) {
    label = 'garages';
  } else if (hasTeamAccess && !route.path.includes('e-reputation')) {
    label = 'team';
  }
  const reviewsString = route.path.endsWith('/') ? label : `/${label}`;
  const newRoute = route.fullPath.replace(route.path, `${route.path}${reviewsString}`);
  redirect(newRoute);
};
