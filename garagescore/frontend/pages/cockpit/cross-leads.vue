<template>
  <section id="cross-leads-wrapper">
    <template>
      <CrossLeadsDemonstration v-bind="layoverProps" :askDemonstration="askDemonstration" />

      <vue-snotify></vue-snotify>
   </template>
  </section>
<!--  <CrossLeadsSubscription v-bind="layoverProps" :setLoading="setLoading" />-->

</template>

<script>
  import CrossLeadsDemonstration from "~/components/cockpit/leads/CrossLeadsDemonstration";
  import { makeApolloMutations } from '../../util/graphql';

  export default {
    layout: 'cockpit',
    middleware: ["redirectToAdminSource"], // redirect to admin/sources if he can't subscribe any more garages
    components: { CrossLeadsDemonstration },
    data() {
      return {
        loading: false
      };
    },
    computed: {
      layoverProps() {
        return {
          loading: this.loading,
          availableGarages: this.availableGarages,
          isPrioritaryProfile: this.isPrioritaryProfile,
        }
      },
      availableGarages() {
        return this.$store.getters['cockpit/canSubscribeToCrossLeads'];
      },
      isPrioritaryProfile() {
        return this.$store.getters['auth/isPriorityProfile'];
      },
    },
    methods: {
      async askDemonstration() {
        this.loading = true;
        const request = {
          name: 'garageAskProductDemo',
          args: {
            productName: 'XLeads'
          },
          fields: `
            message
            status
          `
        };
        const resp = await makeApolloMutations([request]);
        if (resp.data.garageAskProductDemo.status) {
          this.$snotify.success(this.$t_locale('pages/cockpit/cross-leads')('demo_success_content'), this.$t_locale('pages/cockpit/cross-leads')('demo_success_title'));
          setTimeout(() => {
            this.$router.push('/cockpit/welcome');
          }, 4000);
        } else {
          this.$snotify.error(this.$t_locale('pages/cockpit/cross-leads')('demo_fail_content', { error: resp.data.garageAskProductDemo.message.toString()}), this.$t_locale('pages/cockpit/cross-leads')('demo_fail_title'));
        }
        this.loading = false;
      }
    }
  }
</script>
