<template>
  <li class="breadcrumbs-item" :class="classBinding" v-on="listeners">
    <slot/>
  </li>
</template>


<script>
export default {
  props: {
    active: Boolean,
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners,
      }
    },

    classBinding() {
      return {
        'breadcrumbs-item--active': this.active
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.breadcrumbs-item {
  flex: 1;
  padding: 1rem;
  height: 2.6rem;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
  color: $white;

  &:before {
    content: " "; 
    display: block; 
    width: 0; 
    height: 0;
    border-top: 1.3rem solid transparent; /* Go big on the size, and let overflow hide */
    border-bottom: 1.3rem  solid transparent;
    border-left: 1.3rem  solid $grey;
    position: absolute;
    top: 50%;
    margin-top: -1.3rem; 
    left: 100%;
    z-index: 3; 
  }

  &:after {
    content: " "; 
    display: block; 
    width: 0; 
    height: 0;
    border-top: 1.7rem solid transparent; /* Go big on the size, and let overflow hide */
    border-bottom: 1.7rem  solid transparent;
    border-left: 1.7rem  solid $white;
    position: absolute;
    top: 50%;
    margin-top: -1.7rem;
    margin-left: 0px;
    left: 100%;
    z-index: 2; 
  }

  &--active {
    background-color: $blue;
    color: $white;
    font-weight: 700;

    &:first-child {
      border-radius: 5px 0 0 5px;
    }
    &:last-child {
      border-radius: 0 5px 5px 0;
    }

    &:before {
      border-left-color: $blue;
    }
  }

  &:not(:first-child) {
    padding-left: 1.5rem;
  }

  
  &:last-child {
    &:before {
      display: none;
    }

    &:after {
      display: none;
    }
  }
}
</style>
