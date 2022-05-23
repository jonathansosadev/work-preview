<template>
  <div class="msg" v-if="errorMsg">
    <div class="msg__text">
      <i class="msg__text__icon icon-gs-alert-information-circle"></i>
      &nbsp;&nbsp;<span class="msg__text__span">{{ errorMsg }}</span>
    </div>
  </div>
</template>

<script>

  export default {
  }
</script>

<style lang="scss" scoped>
  .msg {
    display:flex;
    flex-direction: column;
    box-sizing: border-box;
    justify-content: center;
    width: 440px;
    height: 50px;
    border-left: 5px solid $red;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
    padding-left:16px;
    margin-bottom: 16px;
    background-color: white;
    &__text {
      color: $red;
      &__icon {
        font-size:21px;
      }
      &__span {
        position:relative;
        top: -5px;
      }
    }
  }
</style>
