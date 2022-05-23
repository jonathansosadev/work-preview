<template>
  <div class="placeholder-loading" :class="classBinding">
    <div class="placeholder-loading__content">
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      <div class="explications">
        <div class="logo" v-if="logo && logo.length">
          <img :src="`/e-reputation/${logo}.svg`" alt="logo">
        </div>
        <div class="text">
          <slot>
            {{ $t_locale('components/ui/PlaceholderLoading')("Loading") }}...
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    logo: String,
    absolute: Boolean,
    fullScreen: Boolean,
  },

  computed: {
    classBinding() {
      return {
        'placeholder-loading--absolute': this.absolute,
        'placeholder-loading--fullscreen': this.fullScreen,
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.placeholder-loading {
  height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;

  &__content {
    color: $blue;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    & > * {
      margin-bottom: 1rem;
    }

    .explications {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .text {
        font-size: 1.2rem;
      }
      .logo {
        margin-right: 20px;
        img {
          height: 50px;
        }
      }
    }

    .lds-roller {
      display: inline-block;
      position: relative;
      width: 64px;
      height: 64px;
    }
    .lds-roller div {
      animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      transform-origin: 32px 32px;
    }
    .lds-roller div:after {
      content: " ";
      display: block;
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $blue;
      margin: -3px 0 0 -3px;
    }
    .lds-roller div:nth-child(1) {
      animation-delay: -0.036s;
    }
    .lds-roller div:nth-child(1):after {
      top: 50px;
      left: 50px;
    }
    .lds-roller div:nth-child(2) {
      animation-delay: -0.072s;
    }
    .lds-roller div:nth-child(2):after {
      top: 54px;
      left: 45px;
    }
    .lds-roller div:nth-child(3) {
      animation-delay: -0.108s;
    }
    .lds-roller div:nth-child(3):after {
      top: 57px;
      left: 39px;
    }
    .lds-roller div:nth-child(4) {
      animation-delay: -0.144s;
    }
    .lds-roller div:nth-child(4):after {
      top: 58px;
      left: 32px;
    }
    .lds-roller div:nth-child(5) {
      animation-delay: -0.18s;
    }
    .lds-roller div:nth-child(5):after {
      top: 57px;
      left: 25px;
    }
    .lds-roller div:nth-child(6) {
      animation-delay: -0.216s;
    }
    .lds-roller div:nth-child(6):after {
      top: 54px;
      left: 19px;
    }
    .lds-roller div:nth-child(7) {
      animation-delay: -0.252s;
    }
    .lds-roller div:nth-child(7):after {
      top: 50px;
      left: 14px;
    }
    .lds-roller div:nth-child(8) {
      animation-delay: -0.288s;
    }
    .lds-roller div:nth-child(8):after {
      top: 45px;
      left: 10px;
    }
    @keyframes lds-roller {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }

  &--fullscreen {
    height: calc(100vh - 4.5rem); // header size
  }

  &--absolute {
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba($white, 0.9);
  }
}
</style>
