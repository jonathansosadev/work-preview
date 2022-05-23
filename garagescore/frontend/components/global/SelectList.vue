<template>
  <div class="select-list">
    <div class="select-list__title">
      <slot name="icon" />
      <slot name="title" />
    </div>
    <div class="select-list__search-block" v-if="searchCallback">
      <div class="select-list__search">
        <div class="select-list__search-icon">
          <i class="icon-gs-search" />
        </div>
        <input :placeholder="placeholder" v-model="search" ref="search" />
      </div>
    </div>
    <div class="select-list__items">
      <button
        class="select-list__item"
        v-for="(item, index) in filteredItems"
        :key="index"
        @click="changeValue(item)"
        :class="classBindingItem(item)"
      >
        <span>{{ item.label }}</span>
        <i class="icon-gs-validation-check-circle select-list__item-icon" v-if="isActive(item)" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: String,
    items: Array,
    value: [Object, String, Number],
    withSearch: { type: Boolean, default: false },
    searchCallback: Function,
    limit: Number
  },

  data() {
    return {
      search: null
    };
  },

  mounted() {
    this.$refs.search && this.$refs.search.focus();
  },

  computed: {
    filteredItems() {
      const items = this.searchCallback
        ? this.items.filter(i => this.searchCallback(this.search, i))
        : this.items;

      return this.limit ? items.slice(0, this.limit) : items;
    }
  },

  methods: {
    isActive(item) {
      return item.key === this.value.key;
    },

    classBindingItem(item) {
      return {
        "select-list__item--active": this.isActive(item)
      };
    },

    changeValue(item) {
      if (item.key !== this.value.key) {
        this.$emit("input", item);
        this.search = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.select-list {
  height: 100%;

  &__title {
    font-size: 12px;
    color: $black;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: bold;

    i {
      margin-right: 7px;
      font-size: 1rem;
    }
  }

  &__search-block {
    margin-bottom: 10px;
  }

  &__search-icon {
    i {
      font-size: 14px;
      margin: 0 7px;
    }

    color: $white;
    padding: 9px;
    background-color: $grey;
  }

  &__search {
    border: 1px solid $grey;
    border-radius: 3px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 7px;

    input {
      border: none;
      padding: 9px;
      outline: 0px;
      width: 100%;
    }
  }

  &__items {
    background-color: $white;
    overflow-y: scroll;
    border-radius: 3px;
    max-height: 90%;
  }

  &__item {
    padding: 7px 1rem;
    color: $black;
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-weight: 300;

    &:first-of-type {
      padding-top: 1rem;
    }

    display: flex;
    flex-direction: row;
    align-items: center;

    &--active {
      color: $blue;
    }

    &:focus,
    &:hover {
      background-color: $very-light-grey;
    }

    span {
      flex: 1;
      text-align: left;

      text-overflow: ellipsis;
      max-width: 100%;
      overflow: hidden;
      display: block;
      white-space: nowrap;
    }
  }

  &__item-icon {
    font-size: 10px;
    margin-left: 3px;
  }
}
</style>
