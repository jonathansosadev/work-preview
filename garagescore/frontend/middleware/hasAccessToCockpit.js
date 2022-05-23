export default function ({ store, redirect }) {
  const redirectPage = store.state.auth.currentUser.indexPage;

  if (!store.state.auth.ACCESS_TO_COCKPIT) {
    return redirect(redirectPage);
  }
}
