<template>
  <nuxt-link class="interface-link" :to="{ name: this.routename }" @click.native="onClick">
    <slot />
    <i class="interface-link__chevron icon-gs-right" />
  </nuxt-link>
</template>

<script>
export default {
  props: {
    routename: String,
    valid: Boolean
  },

  methods: {
    onClick(e) {
      if (!this.valid) {
        e.preventDefault();

        this.$store.dispatch(
          "openModal",
          { component: "ModalNoAccess" },
          { root: true }
        );
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.interface-link {
  margin-top: 10px;
  text-align: right;
  color: $orange;
  text-decoration: none;
  width: 100%;
  font-size: .9rem;
  cursor: pointer;

  &__chevron {
    font-size: .75rem;
    margin-left: 1px;
    position: relative;
    top: 1px;
  }
  &:hover {
    color: darken($orange, 2%);
  }
}
</style>
