<template>
  <div class="notification" :class="notificationClass">
    <div class="notification__slot">
      <slot/>
    </div>
    <span v-if="!fixed" class="notification__close" v-on:click="$emit('close', true)">
      <i class="icon-gs-close"></i>
    </span>
  </div>
</template>

<script>
  export default {
    props: {
      type: String,
      fixed: Boolean
    },
    computed: {
      notificationClass() {
        return {
          'notification--primary': this.type === 'primary',
          'notification--success': this.type === 'success',
          'notification--danger': this.type === 'danger',
          'notification--warning': this.type === 'warning',
        };
      }
    }
  }
</script>


<style lang="scss" scoped>
.notification {
  box-sizing: border-box;
  width: 100%;
  padding: 1rem;
  display:flex;
  flex-direction:row;
  align-items:center;
  justify-content:flex-start;
  border-radius: 5px;

  &--primary {
    color: $blue;
    background-color: #e9f5f7;
    border: 1px solid #67b3ff;
  }
  &--success {
    color: #155724;
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  }
  &--danger {
    color: $red;
    background-color: #edd4da;
    border: 1px solid $red;
  }
  &--warning {
    color: #8a6d3b;
    background-color: #fcf8e3;
    border: 1px solid #faebcc;
  }
  &__slot {
    flex-grow:1;
    .bold {
      font-weight: 700;
    }
  }
  &__close {
    flex-grow: 0;
    margin-left: 3rem;
    font-size:0.8rem;
    cursor:pointer;
  }
}
</style>
