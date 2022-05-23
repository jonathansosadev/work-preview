<template>
  <section class="kpi-box" :class="classBinding">
    <div class="kpi-box__clicking-zone" :class="clickingZoneClassBinding" @click="clickable.link(active)"></div>

    <!-- TITLE -->
    <div class="kpi-box__title">
      <AppText class="kpi-box__title__text" tag="span" bold>{{ title }}</AppText>
    </div>

    <!-- CONTENT -->
    <div class="kpi-box__content">
      <slot></slot>
    </div>

  </section>
</template>

<script>
export default {
  name: "KpiBox",

  props: {
    type: { type: String, required: false, default: "primary" },
    title: { type: String, required: true },
    time: { type: Number, required: false },
    clickable: {
      type: Object,
      required: false,
      default: () => ({ visible: false, top: false, all: false })
    }
  },

  computed: {
    classBinding() {
      return {
        "kpi-box--primary": !this.type || this.type === "primary",
        "kpi-box--muted": this.type === "muted-light",
        "kpi-box--clickable": this.clickable && this.clickable.visible
      };
    },
    clickingZoneClassBinding() {
      return {
        "kpi-box__clicking-zone--visible":
          this.clickable && this.clickable.visible,
        "kpi-box__clicking-zone--top": this.clickable && this.clickable.top,
        "kpi-box__clicking-zone--all": this.clickable && this.clickable.all,
        "kpi-box__clicking-zone--active":
          this.clickable && this.clickable.visible && this.active
      };
    },
    active() {
      return (
        this.clickable &&
        this.clickable.query &&
        this.clickable.query.length &&
        this.clickable.query.every(
          q =>
            this.$route.query[q.name] === q.val ||
            (!this.$route.query[q.name] && !q.val)
        )
      );
    }
  }
};
</script>

<style lang="scss" scoped>
$box-border: 1px;
$box-padding: 1rem 1.5rem;
$box-margin: 1rem;

.kpi-box {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;
  padding: $box-padding;
  text-align: center;
  box-sizing: border-box;
  min-width: 8rem;
  position: relative;
  background-color: $white;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  border-radius: 5px;

  &--muted {
    border: $box-border solid $grey;
  }

  &__clicking-zone {
    z-index: 0;
    position: absolute;
    left: 0.5rem;
    top: 0.5rem;
    right: 0.5rem;
    &--top {
      bottom: calc(50% + 0.25rem);
    }
    &--all {
      bottom: 0.5rem;
    }
    &--active {
      background: $extra-light-grey;
    }
    &:hover {
      background: $extra-light-grey;
      cursor: pointer;
      border-radius: 5px;
    }
  }

  &__title {
    z-index: 1;
    pointer-events: none;
  }

  &__content {
    z-index: 1;
    display: flex;
    flex-flow: column;
    flex: 1 0 auto;
    pointer-events: none;
  }

  &__footer {
    z-index: 1;
    pointer-events: none;
  }
}

@media (max-width: $breakpoint-max-sm) {
  $box-padding: 1rem;

  .kpi-box {
    display: inline-block;
    height: auto;
    padding: $box-padding;

    width: 100%;
    box-sizing: border-box;

    &__title {
      margin: 0 0 $box-margin 0;
      position: relative;
    }

    &__content {
      position: relative;
    }

    &__clicking-zone {
      left: 0.25rem;
      top: 0.25rem;
      bottom: 0.25rem;
      &--top {
        top: 1.75rem;
        right: calc(50% + 0.25rem);
      }
      &--all {
        right: 0.25rem;
      }
    }
  }
}
</style>
