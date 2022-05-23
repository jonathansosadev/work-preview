<template>
  <BaseLayout>
    <template slot="header">
      <GreyboHeader :currentUser="currentUser" />
    </template>

    <template slot="aside">
      <GreyboSidebar :currentUser="currentUser"/>
    </template>
  </BaseLayout>
</template>

<script>
import GreyboHeader from '~/components/automatic-billing/global/GreyboHeader.vue';
import GreyboSidebar from '~/components/automatic-billing/global/GreyboSidebar.vue';

export default {
  components: { GreyboHeader, GreyboSidebar },
  middleware: ['appMounted', 'authenticated', 'hasAccessToGreybo'],

  computed: {
    currentUser() {
      return this.$store.state.auth.currentUser;
    }
  },

  // @TODO Remove this ....
  head() {
    const head = {};

    head.link = [{rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'}];
    head.link.push({rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.2.0/css/all.css'});
    return head;
  },
}
</script>
