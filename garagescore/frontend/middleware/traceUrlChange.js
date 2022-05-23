export default function ({ store, route }) {
  if (!process.server && route && route.name && route.name.includes('cockpit')) {
    store.dispatch('processUrlChange', route.name );
  }
}
