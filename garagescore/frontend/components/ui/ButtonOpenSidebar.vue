<template>
  <button class="button" v-on="$listeners">
    <span class="button__bar"></span>
    <span class="button__bar"></span>
    <span class="button__mini-bar"></span>
  </button>
</template>


<script>
export default {
  computed: {
    listeners() {
      return {
        ...this.$listeners,
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.button {
  border: none;
  background-color: transparent;
  outline: 0;
  cursor: pointer;

  &__bar, &__mini-bar {
    border-bottom: 0.23rem solid $white;
    padding-bottom: 0.20rem;
    display: flex;
  }

  &__bar { 
    width: 2rem; 
  }
  
  &__mini-bar { 
    width: 1.4rem; 
  }
}
</style>
