<template>
  <div class="dropdown" v-click-outside="closeDropdown">
    <DropdownButton
      @click="toggleDropdown"
      :active="active"
      :open="dropdownOpen"
      :disabled="disabled"
      :track-id="trackId"
      :isValid="isValid"
      :noMaxWidth="noMaxWidth"
      :type="dropdownButtonType"
      :size="size"
      :iconColor="iconColor"
      :caretColor="caretColor"
      :caret="caret"
      :labelTop="labelTop"
    >
      <template slot="icon">
        <slot name="icon"></slot>
      </template>
      <template slot="label">
        <slot name="label"></slot>
      </template>
      <template slot="button">
        <slot name="button"></slot>
      </template>
    </DropdownButton>
    <div
      v-if="dropdownOpen"
      class="dropdown__dropdown custom-scrollbar"
      :class="sizeClassBinding"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import DropdownButton from "./DropdownButton";

export default {
  components: {
    DropdownButton
  },

  props: {
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    trackId: { type: String, default: '' },
    isValid: { type: String, default: 'Empty' },
    noMaxWidth: { type: Boolean, default: false },
    type: { type: String, default: ''},
    size: { type: String, default: ''},
    iconColor:{ type: String, default: ''},
    caretColor:{ type: String, default: ''} ,
    caret: {
      type: Boolean,
      default: true
    },
    labelTop: String,
  },
  data() {
    return {
      dropdownOpen: false
    };
  },
  computed: {
    dropdownButtonType() {
      return this.type;
    },
    sizeClassBinding() {
      const sizeClassBinding = {};
      sizeClassBinding[`dropdown__dropdown--${this.size}`] = this.size;
      return sizeClassBinding;
    },
  },
  methods: {
    toggleDropdown() {
      if (!this.disabled) {
        this.dropdownOpen = !this.dropdownOpen;
      }
    },
    closeDropdown() {
      this.dropdownOpen = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown {
  position: relative;

  &__dropdown {
    position: absolute;
    top: calc(100% + 3px);
    z-index: 99;
    width: calc(100% + 14px);
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 6px 0 rgba($black, .16);

    &--large {
      width: 250px;
    }

    &--max-width {
      max-width: 100%;
    }
  }
}
</style>
