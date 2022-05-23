export default function ({ store, error }) {
  if (!store.state.mountWww) {
    return error({ statusCode: 404 });
  }
}
