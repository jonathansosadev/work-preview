export default function ({ store, req, redirect }) {
	const logoutRedirectPath = '/auth/signout';

  if (req && req.query) {
    const token = req.query.token;
    const hasClearedCookie = req.query.finishSession;
  
    if (!!token && !store.state.auth.isAuthenticated && !hasClearedCookie) {
      return redirect(`${logoutRedirectPath}?token=${token}`);
    }
  }
}
