<template>
  <div class="msg" :class="msgClassBinding" v-if="msg">
    <div class="msg__content">
      <div class="msg__content__icon"><i :class="iconClassBinding"></i></div>
      <div class="msg__content__text"><span>{{ msg }}</span></div>
    </div>
  </div>
</template>

<script>

  export default {
    props: {
      msg: {type: String},
      type: {type: String}
    },
    computed: {
      msgClassBinding() {
        return {
          'msg--danger': this.type === 'danger',
          'msg--primary': this.type === 'primary',
          'msg--success': this.type === 'success',
          'msg--warning': this.type === 'warning',
        }
      },
      iconClassBinding() {
        return {
          'icon-gs-login-password-false': this.type === 'danger',
          'icon-gs-alert-information-circle': this.type === 'primary',
          'icon-gs-validation-check-circle': this.type === 'success',
          'icon-gs-alert-warning-circle': this.type === 'warning',
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .msg {
    &--danger {
      border-left: 5px solid $red;
      color: $red;
    }
    &--primary {
      border-left: 5px solid $blue;
      color: $blue;
    }
    &--success {
      border-left: 5px solid $green;
      color: $green;
    }
    &--warning {
      border-left: 5px solid $yellow-darker;
      color: $yellow-darker;
    }
    display:flex;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: center;
    width: 100%;
    height: 50px;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
    padding-left:16px;
    margin-bottom: 16px;
    background-color: $white;
    border-radius: 5px;

    &__content {
      display:flex;
      flex-direction: row;
      box-sizing: border-box;
      justify-content: flex-start;
      &__icon {
        font-size:21px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: center;
        align-content: center;
        margin-right: 7px;
      }
      &__text {
        display:flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: center;
        align-content: center;
      }
    }
  }
</style>
