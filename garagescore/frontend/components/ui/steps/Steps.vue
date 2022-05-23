<template>
  <ul class="steps">
    <li class="steps__item" v-for="(step, index) in steps" :key="index" :class="stepClassBinding(step)">
      <slot name="step" :step="step">
      </slot>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    steps: Array,
  },

  methods: {
    stepClassBinding(step) {
      return {
        'steps__item--active': step.active,
        'steps__item--primary': step.type === 'primary',
        'steps__item--danger': step.type === 'danger',
        'steps__item--success': step.type === 'success',
        'steps__item--warning': step.type === 'warning',
      }
    }
  }
}
</script>



<style lang="scss" scoped>
.steps {
  list-style: none;
  padding: 0;
  display: flex;
  flex-flow: row;

  &__item {
    flex: 1;
    position: relative;

    &::before {
      content: "";
      width: 100%;
      height: 4px;
      background-color: $black-grey;
      position: absolute;
      top: calc(50% - 0.5rem);
      right: 50%;
      transform: translateY(50%);
    }

    &:first-child {
      &::before {
        display: none;
      }
    }

    &--danger.steps__item--active {
      &::before {
        background-color: $red;
      }
    }

    &--primary.steps__item--active {
      &::before {
        background-color: $blue;
      }
    }
    
    &--success.steps__item--active {
      &::before {
        background-color: $green;
      }
    }

    &--warning.steps__item--active {
      &::before {
        background-color: $yellow;
      }
    }
  }
}
</style>
