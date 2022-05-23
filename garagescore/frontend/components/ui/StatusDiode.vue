<template>
    <div class="status-diode-component" v-tooltip="{ content: tooltip }">
      <div class="status-diode-component__diode" :class="diodeClassBinding"></div>
      <div class="status-diode-component__status">{{ status }}</div>
      <slot name="icon" />
    </div>
</template>

<script>
  export default {
    props: {
      status: String,
      diode: String,
      tooltip: String,
    },

    computed: {
      diodeClassBinding() {
        return {
          'status-diode-component__diode--success': this.diode === 'success',
          'status-diode-component__diode--muted': this.diode === 'muted',
          'status-diode-component__diode--warning': this.diode === 'warning',
        };
      }
    },

    methods: {

    },
  };
</script>

<style lang="scss" scoped>
  .status-diode-component {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;

    &__diode {
      height: 1rem;
      width: 1rem;
      border-radius: 1rem;
      margin: 0 .5rem 0 0;
      flex-shrink: 0;
      flex-grow: 0;

      &--success {
        background-color: darken($green, 2%);
      }

      &--muted {
        background-color: $grey;
      }

      &--warning {
        background-color: $yellow-darker;
      }
    }

    &__status {
      color: $dark-grey;
    }
  }
</style>
