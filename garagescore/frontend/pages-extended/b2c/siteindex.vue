<template>
  <div id="content">
    <div id="title">{{$t_locale('pages-extended/b2c/siteindex')('siteindexTitle')}}</div>
    <div class="garages">
      <div v-for="garage in garages" :key="garage.slug" class="garages__garage">
        <a :href="garagePath(garage)">{{garage.publicDisplayName}}</a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  html {
    box-sizing:border-box;
  }
  #content {
    margin-top: 100px;
  }
  #title {
    font-family: 'Roboto', sans-serif;
    width: 100%;
    text-align: center;
    margin-top: 100px;
    color: $greyish-brown;
    font-size: 30px;
  }
  .garages {
    font-family: 'Lato';
    margin-left: 10%;
    margin-right: 10%;
    margin-top: 50px;
    a {
      text-decoration: none;
      color: #757575;
    } 
    a:hover {
      color: #43b9ad;
    }
    display: flex;
    flex-flow: row wrap;
    &__garage {
      margin-bottom: 5px;
      flex: 33%;
      @media (max-width: $breakpoint-min-md) {
      flex: 50%;margin-bottom: 25px;
      }
      @media (max-width: $breakpoint-min-sm) {
        flex: 100%;
      }
    }
  }
</style>

<script>
  export default {
    components: { },
    data() {
      return { }
    },
    async fetch ({ store, params, app }) {
      await store.dispatch("b2c/FETCH_SITEINDEX_B2C");
      if (store.getters['b2c/locale'] === 'es_ES') {
        store.commit('setLang', 'es');
        app.i18n.locale = 'es';
      } else if (store.getters['b2c/locale'] === 'en_US') {
        store.commit('setLang', 'en');
        app.i18n.locale = 'en';
      } else {
        store.commit('setLang', 'fr');
        app.i18n.locale = 'fr';
      }
    },
    layout () {
      return 'classic-b2c';
    },
    async mounted() {
    },
    methods: {
      garagePath(garage) {
        if (garage.locale === 'es_ES') {
          if (garage.type === 'VehicleInspection') {
            return `/inspeccion-tecnica/${garage.slug}`;
          }
          return `/garaje/${garage.slug}`;

        }
        if (garage.type === 'VehicleInspection') {
            return `/controle-technique/${garage.slug}`;
        }
        return `/garage/${garage.slug}`;
      }
    },
    computed: {
      garages() {
        return this.$store.state.b2c && this.$store.state.b2c.siteindex && this.$store.state.b2c.siteindex.garages
      },
    }
  }
</script>

