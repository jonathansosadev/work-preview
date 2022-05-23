<template>
  <div class="page-cockpit">
    <Recommendations :recommendations="recommendationContent"/>
    <Card class="page-cockpit__sources">
      <h1>
        <i class="icon-gs-cog"></i>
        {{ $t_locale('pages/cockpit/admin/sources')("configureSources") }}
      </h1>
      <div class="horizontal-separator" />
      <div class="page-cockpit__sources__content">
        <SourcesList />
        <div class="page-cockpit__center">
          <h1 class="page-cockpit__goto">
            <img src="/logo/logo-custeed-xlead-picto.svg" class="page-cockpit__logo" />
            <span>{{ $t_locale('pages/cockpit/admin/sources')('nextStep') }} <a @click="goToLeads"> {{ $t_locale('pages/cockpit/admin/sources')('leads')}} </a></span>
          </h1>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import Card from "~/components/ui/Card";
import SourcesList from "~/components/cockpit/admin/sources/SourcesList";
import Recommendations from "~/components/global/Recommendations.vue";
import { setupHotJar } from "../../../util/externalScripts/hotjar";

export default {
  middleware: ["hasAccessToSources"],
  components: { Card, SourcesList, Recommendations },

  data() {
    return {
      recommendationContent: this.$t_locale('pages/cockpit/admin/sources')('recommendationsContent')
    };
  },
  methods: {
    goToLeads() {
      this.$router.push({ name: "cockpit-leads-reviews" });
    }
  },
  mounted() {
    setupHotJar(this.$store.getters["locale"], 'admin_source');
  },
};
</script>

<style lang="scss" scoped>
.page-cockpit {
  position: relative;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;

  &__goto {
    padding-top: 1.4rem;
    display: block !important;
  }

  &__center {
    text-align: center;
    span {
      vertical-align: middle;
    }
    a {
      color: #219ab5;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &__logo {
    vertical-align: middle;
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }

  &__sources {
    padding: 1rem;
    margin-top: 1rem;
    h1 {
      display: flex;
      align-items: center;
      font-size: 1.2rem;
      font-weight: bold;
      color: $black;
      margin: 0 0 0.7rem 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      i {
        font-size: 1.3rem;
        margin-right: 0.5rem;
      }
    }
    .__content {
      .--next-step {
        font-size: 1.2rem;
      }
    }
  }
  .horizontal-separator {
    width: 100%;
    height: 0.06rem;
    background-color: rgba(0, 0, 0, 0.16);
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-cockpit {
    &__header {
      &__separator {
        display: none;
      }

      &__part {
        &--small {
          flex: 0.5;
        }

        &--border {
          border-right: 0.06rem solid $grey;
        }
      }

      &__content {
        flex-direction: row;
      }
    }
  }
}
</style>
