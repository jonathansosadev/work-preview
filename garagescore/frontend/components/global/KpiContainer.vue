<template>
  <section class="kpi-container">

    <!-- HEADER PART -->
    <div class="kpi-container__header" :class="headerClassBinding">
      <div class="kpi-container__header__title">
        <AppText class="kpi-container__header__title__text" tag="div" :type="type" size="mdl" extra-bold>
          <slot name="title"></slot>
        </AppText>
      </div>
      <div class="kpi-container__header__subtitle">
        <AppText class="kpi-container__header__subtitle__text" tag="div" :type="type" size="sml">
          <slot name="subtitle"></slot>
        </AppText>
      </div>
    </div>

    <!-- CONTENT PART -->
    <div class="kpi-container__content">
      <slot name="kpi"></slot>
    </div>

  </section>
</template>

<script>
export default {
  name: "KpiContainer",

  props: {
    type: { type: String, default: 'primary' }
  },

  computed: {
    headerClassBinding() {
      return {
        'kpi-container__header--primary': !this.type || this.type === 'primary',
        'kpi-container__header--muted': this.type === 'muted-light'
      };
    }
  }
}
</script>

<style lang="scss" scoped>
  .kpi-container {

    &__header {
      &--primary {
        border-bottom: 3px solid $blue;
      }
      &--muted {
        border-bottom: 3px solid $grey;
      }
      &__subtitle {
        padding: 0.3rem 0 0.5rem 0;;
      }
    }

    &__content {
      display: flex;
      flex-flow: row;
    }
  }

  @media (max-width: $breakpoint-max-md) {
    .kpi-container {
      &__header {
        &__title {
          &__text {
            font-size: 1rem;
          }
        }
        &__subtitle {
          padding: 0.2rem 0 0.3rem 0;;
        }
      }
    }
  }

  @media (max-width: $breakpoint-max-sm) {
    .kpi-container {
      &__header {
        text-align: center;
        padding: 0 0 0.6rem 0;
        &__title, &__subtitle {
          display: inline-block;
        }
        &__title {
          padding: 0 0.4rem 0 0;
        }
        &__subtitle {
          padding: 0;
        }
      }

      &__content {
        display: block;
        flex: none;
      }
    }
  }
</style>
