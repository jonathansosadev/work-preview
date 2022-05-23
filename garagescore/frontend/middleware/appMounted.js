export default function ({ store, error }) {
  if (!store.state.mountApp) {
    return error({ statusCode: 404 });
  }
}
