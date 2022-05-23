<template>
   <section id="erep-demonstration-wrapper">
      <template>
        <EreputationDemonstration v-bind="layoverProps" :askDemonstration="askDemonstration" />

        <vue-snotify></vue-snotify>
      </template>
  </section>
</template>

<script>
import EreputationDemonstration from "~/components/cockpit/e-reputation/EreputationDemonstration";
import { makeApolloMutations } from '../../../util/graphql';

export default {
  layout: "cockpit",
  components: { EreputationDemonstration },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    layoverProps() {
      return {
        loading: this.loading,
        availableGarages: this.availableGarages,
        isPrioritaryProfile: this.isPrioritaryProfile
      }
    },
    availableGarages() {
      return this.$store.getters['cockpit/availableGarages'] || [];
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
            productName: 'ERep'
          },
          fields: `
            message
            status
          `
        };
        const resp = await makeApolloMutations([request]);
        if (resp.data.garageAskProductDemo.status) {
          this.$snotify.success(this.$t_locale('pages/cockpit/e-reputation/demonstration')('demo_success_content'), this.$t_locale('pages/cockpit/e-reputation/demonstration')('demo_success_title'));
          setTimeout(() => {
            this.$router.push('/cockpit/welcome');
          }, 4000);
        } else {
          this.$snotify.error(this.$t_locale('pages/cockpit/e-reputation/demonstration')('demo_fail_content', { error: resp.data.garageAskProductDemo.message.toString()}), this.$t_locale('pages/cockpit/e-reputation/demonstration')('demo_fail_title'));
        }
        this.loading = false;
    }
  }
};
</script>