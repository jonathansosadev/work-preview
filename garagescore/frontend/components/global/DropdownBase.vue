<template>
  <div class="dropdown">
    <!-- Mobile -->
   <DropdownMobile :type="type" :size="size" v-if=" (['sm']).includes(this.$mq)" ref="dropdownMobile">
      <template slot="icon">
        <slot name="icon"></slot>
      </template>
      <template slot="label">
        <slot name="dropdown-label"></slot>
      </template>
      <template>
        <slot name="mobile-content" />
      </template>
      <template slot="modal-title">
        <slot name="modal-title"></slot>
      </template>
    </DropdownMobile>

    <!--  Desktop -->
    <Dropdown
      v-else
      :type="type"
      :size="size"
      :active="active"
      ref="dropdown"
      :noMaxWidth="noMaxWidth"
      :iconColor="iconColor"
      :caretColor="caretColor"
      :trackId="trackId"
      :labelTop="labelTop"
      >
        <template slot="icon">
          <slot name="icon"></slot>
        </template>
        <template slot="label">
          <slot name="label"></slot>
        </template>
        <template>
          <slot />
        </template>
    </Dropdown>
  </div>
</template>

<script>
import Dropdown from "~/components/ui/Dropdown";
import DropdownMobile from "~/components/ui/DropdownMobile";

export default {
  components: {
    Dropdown,
    DropdownMobile
  },
  props: {
    noMaxWidth: { type: Boolean, default: false},
    type: { type: String, default: ''},
    size: { type: String, default: ''},
    active: { type: Boolean, default: false},
    iconColor:{ type: String, default: ''},
    caretColor:{ type: String,default: ''},
    trackId: { type: String, default: '' },
    labelTop: String,
  }
};
</script>
