<template>
  <div class="button-dropdwon">
    <Dropdown :active="false" type="phantom-btn" size="max-width" :caret="false" ref="dropdown" :disabled="disabled">
      <template slot="label">
        <div class="button-dropdwon__label">
          {{ label }}
        </div>
      </template>
      <template slot="button">
        <Button
          type="icon-btn"
          class="button-dropdwon__content__button"
          v-tooltip="{ content: '' }"
          :disabled="disabled"
        >
          <i class="icon-gs-edit" />
        </Button>
      </template>
      <template>
        <div class="button-dropdwon__items custom-scrollbar">
          <div v-for="(item, index) in items" :key="index" @click="selectItem(item)">
            <span>{{ item.label }}</span>
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>
<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    dropdownSelectedTime: {
      type: Function,
      default: () => ({}),
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    selectItem(item) {
      this.dropdownSelectedTime(item);
      this.$refs.dropdown.closeDropdown();
    },
  },
};
</script>
<style lang="scss" scoped>
.button-dropdwon {
  position: relative;
  display: inline-block;
  display: flex;
  align-items: center;
  &__label {
    position: relative;
    top: -3px;
    color: $dark-grey;
    font-size: 0.857rem;
    margin-right: 0.3rem;
  }
  &__items {
    display: block;
    position: absolute;
    background: $white;
    box-shadow: 0 0 6px 0 rgba($black, 0.16);
    border-radius: 5px;
    max-height: 200px;
    min-width: 128px;
    overflow-x: hidden;
    overflow-y: auto;
    z-index: 2;
    right: 0.5rem;
    span {
      display: block;
      font-weight: 300;
      color: $black;
      font-size: 1rem;
      padding: 0.6rem 1rem;
      &:hover {
        background-color: rgba(188, 188, 188, 0.2);
      }
    }
  }
}
.item-selected {
  background-color: $light-grey;
}
</style>
