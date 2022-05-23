<template>
  <section id="automation-wrapper">
    <template>
      <AutomationDemonstration
        v-bind="layoverProps"
        :askDemonstration="askDemonstration"
      />
      <vue-snotify></vue-snotify>
   </template>
  </section>
</template>

<script>
  import AutomationDemonstration
    from "~/components/cockpit/automation/AutomationDemonstration";
  import { makeApolloMutations } from '~/util/graphql';

  export default {
    name: "AutomationPage",
    components: { AutomationDemonstration },
    inheritAttrs: false,
    middleware: ['redirectAutomation'],

    data() {
      return {
        loading: false
      };
    },

    computed: {
      layoverProps() {
        return {
          loading: this.loading,
          availableGarages: this.availableGarages
        }
      },
      availableGarages() {
        return this.$store.getters['cockpit/canSubscribeToAutomation'];
      },
    },
    methods: {
      async askDemonstration() {
        this.loading = true;
        const request = {
          name: 'garageAskProductDemo',
          args: {
            productName: 'Automation'
          },
          fields: `
            message
            status
          `
        };
        const resp = await makeApolloMutations([request]);
        if (resp.data.garageAskProductDemo.status) {
          this.$snotify.success(this.$t_locale('pages/cockpit/automation/index')('demo_success_content'), this.$t_locale('pages/cockpit/automation/index')('demo_success_title'));
          setTimeout(() => {
            this.$router.push('/cockpit/welcome');
          }, 4000);
        } else {
          this.$snotify.error(this.$t_locale('pages/cockpit/automation/index')('demo_fail_content', { error: resp.data.garageAskProductDemo.message.toString()}), this.$t_locale('pages/cockpit/automation/index')('demo_fail_title'));
        }
        this.loading = false;
      }
    },
  }
</script>
