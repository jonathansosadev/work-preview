<!-- ONLY WORKS FOR "vue": "2.5.16" #1281 - FIXED - 07/02/2019 -->

<template>
  <label class="toggle" :class="toggleClass" :title="title" v-on:click="click">
    <span class="toggle__icon"></span>
    <span :class="indicatorClass"/>
    <span class="toggle__label" v-if="$slots.default"><slot/></span>
  </label>
</template>

<script>/*


*/
  export default {
    inheritAttrs: false,
    props: {
      type: String,
      value: Boolean,
      disabled: { type: Boolean, default: false },
      title: String
    },
  methods: {
      click() {
        if (this.disabled) { return; }
        this.$emit('input', !this.value);
      },
  },
    computed: {
      toggleClass(){
        return {
          'toggle--danger': this.type === 'danger',
          'toggle--warning': this.type === 'warning',
          'toggle--disabled': this.disabled
        }
      },
      indicatorClass() {
        return {
          toggle__indicator: true,
          'toggle__indicator-active': this.value
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $yellow: #E8B331;

  .toggle {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;

    &__label {
      margin-left: 0.5rem;
      user-select: none;
    }

    &__icon {
      position: absolute;
      left: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;

      &__icon {
        font-size: 0.5rem;
      }
    }

    &__indicator {
      display: flex;
      height: 1rem;
      width:  34px;
      border-radius: 20px;
      background-color: rgba($dark-grey, .4);

      &:before {
        content: "";
        height: 1.5rem;
        width: 1.5rem;
        border-radius: 20px;
        left: -4px;
        top: -4px;
        transition: .4s;
        position: absolute;
        background-color: $white;
        box-shadow: 0 1px 3px 0 rgba($black, 0.21);
      }
    }

    &__indicator-active {
      background-color: rgba($blue, .4);

      &:before {
        transform: translateX(1.5rem);
        background-color: $blue;
      }
    }
    &--danger {
      .toggle__indicator {
        border-color: $red;
        background-color: $red;
      }
    }
    &--warning {
      .toggle__indicator {
        border-color: $yellow;
        background-color: $yellow;
      }
    }
    &--disabled {
      .toggle__indicator {
        background-color: rgba($grey, .4);

        &:before {
          background-color: #e4e4e4;
          box-shadow: 0 1px 3px 0 rgba($black, 0.05);
        }
      }
    }
  }
</style>

