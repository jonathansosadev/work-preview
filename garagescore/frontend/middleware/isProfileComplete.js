export default function ({ store, route }) {
  if (!store.getters['auth/isProfileComplete'] && route.name && route.name !== 'cockpit-admin-profile' && !route.name.match(/auth/)) {
    store.dispatch('openModal', { component: 'ModalCompleteProfile', fullScreen: true });
  }
}
