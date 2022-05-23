<template>
  <textarea class="textarea-material" :class="classBinding" :value="value" v-on="listeners"></textarea>
</template>

<script>
export default {
  props: {
    type: String,
    value: String,
  },

  computed: {
    classBinding() {
      return {
        'textarea-material--muted': this.type === 'muted',
        'textarea-material--success': this.type === 'success',
        'textarea-material--danger': this.type === 'danger',
      }
    },

    listeners() {
      return {
        input: (event) => this.$emit('input', event.target.value),
      };
    },
  }
}
</script>


<style lang="scss" scoped>
.textarea-material {
  width: 100%;
  min-height: 6rem; // ?
  background-color: white;
  border: none;
  outline: none;

  border: 1px solid $grey;

  &--muted {
    border-bottom-color: $dark-grey;
  }

  &--success {
    border-bottom-color: $green;
  }

  &--danger {
    border-bottom-color: $red;
  }
}
</style>

