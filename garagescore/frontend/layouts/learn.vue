<template>
  <BaseLayoutNoSidebar>
    <template slot="header">
      <CockpitHeader />
    </template>
    <div class="learn-header-logo">
      <nuxt-link class="learn-header-logo__link" :to="{ name: 'cockpit' }">
        <img src="/logo/logo-custeed-long.svg" class="learn-header-logo__logo" />
      </nuxt-link>
    </div>
  </BaseLayoutNoSidebar>
</template>

<script>
import CockpitHeader from '~/components/cockpit/CockpitHeader.vue';

export default {
  components: { CockpitHeader },
  middleware: ['appMounted', 'authenticated']
};
</script>
<style lang="scss" scoped>
.learn-header-logo {
    background-color: $custeedBrandColor;
    height: 3.5rem;
    display: none;
  &__link {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__logo {
    width: auto;
    height: 100%;
    box-sizing: border-box;
    padding: 0.25rem;
  }
}

@media (min-width: $breakpoint-min-md) {
  .learn-header-logo {
      display: block;
    }
}
</style>
