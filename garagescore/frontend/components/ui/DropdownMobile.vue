<template>
  <div class="dropdown">
    <DropdownButtonMobile @click="openModal" :active="active" :open="open" :disabled="disabled" :track-id="trackId">
      <template slot="icon">
        <slot name="icon"></slot>
      </template>
      <template slot="dropdown-label">
        <slot name="label"></slot>
      </template>
    </DropdownButtonMobile>
    <ModalMobile v-if="open" class="dropdown__modal" @close="closeDropdown">
      <template slot="title">
        <slot name="modal-title" />
      </template>
      <slot />
    </ModalMobile>
  </div>
</template>


<script>
import DropdownButtonMobile from "./DropdownButtonMobile";
import ModalMobile from "./ModalMobile";

export default {
  components: {
    DropdownButtonMobile,
    ModalMobile
  },

  props: {
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    trackId: { type: String, default: ''}
  },

  data() {
    return {
      open: false
    };
  },

  methods: {
    openModal() {
      if (!this.disabled) {
        this.open = true;
      }
    },

    closeDropdown() {
      this.open = false;
    }
  }
};
</script>


<style lang="scss" scoped>
.dropdown {
  position: relative;
}
</style>
