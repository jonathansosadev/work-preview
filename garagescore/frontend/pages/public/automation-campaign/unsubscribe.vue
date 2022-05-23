<template>
  <section>
    <div v-if="loading">
      Chargement...
    </div>
    <div v-else class="thanks">
      <ThankYou>
        <template slot="title">{{ $t_locale('pages/public/automation-campaign/unsubscribe')('thankYou_title') }}</template>
        <template slot="content">{{ $t_locale('pages/public/automation-campaign/unsubscribe')('thankYou_content') }}</template>
        <template slot="signature">{{ $t_locale('pages/public/automation-campaign/unsubscribe')('thankYou_signature', { garageName: garageName || 'GarageScore' }) }}</template>
      </ThankYou>
    </div>
  </section>
</template>

<script>
  import ThankYou from '~/components/automation/ThankYou.vue';


  export default {
    name: 'Campaign',
    components: {
      ThankYou,
    },
    data() {
      return {
        loading: true,
        thanks: false,
        garageName: null,
      };
    },
    computed: {
    },
    methods: {
      uploadSuccess(response) {
        this.garageName = response.garageName;
      },
      uploadFailed(response) {
        console.error('Request Error', response);
      },
      handleServerResponse(url) {
        this.loading = true;
        const requestSubmit = new XMLHttpRequest();
        requestSubmit.open('POST', url);
        requestSubmit.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        requestSubmit.onload = function onload() {
          const response = JSON.parse(requestSubmit.response);
          if (requestSubmit.status !== 200) {
            this.uploadFailed(response);
          } else {
            this.uploadSuccess(response);
          }
          this.loading = false;
        }.bind(this);
        requestSubmit.send();
      }
    },
    async mounted() {
      if (this.$route.query && this.$route.query.customerid && this.$route.query.campaignid){
        const url = `/automation-campaign/unsubscribe/${this.$route.query.customerid}/${this.$route.query.campaignid}`;
        this.handleServerResponse(url);
      }      
    },
  }
</script>

<style lang="scss">
  .thanks {
    margin-top: 2rem;
  }
</style>
