<template>
  <div class="searchbar-filter">
    <ul class="searchbar-filter__category-list">
      <li
        class="searchbar-filter__category-list-item"
        v-for="(option, i) in options"
        :key="option.key"
      >
        <SearchbarAccordion
          @onAccordionClick="setOpenAccordion(i)"
          @onAccordionItemClick="closeAccordion()"
          @change="(value) => onChange(option.key, value)"
          :isOpen="openAccordion === i"
          :icon="option.icon"
          :label="option.label"
          :items="option.values"
          :valueActive="value[option.key]"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import SearchbarAccordion from "./SearchbarAccordion";

export default {
  components: { SearchbarAccordion },

  props: {
    options: {
      type: Array,
      default: () => []
    },

    value: {
      type: Object
    }
  },

  data() {
    return {
      openAccordion: null
    };
  },

  methods: {
    setOpenAccordion(index) {
      this.openAccordion = index === this.openAccordion ? null : index;
    },

    closeAccordion() {
      this.openAccordion = null;
    },

    onChange(key, value) {
      if (value === undefined) {
        const { [key]: value, ...valueExcludeKey } = this.value;
        this.$emit("change", valueExcludeKey);
      } else {
        this.$emit("change", { ...this.value, [key]: value });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.searchbar-filter {
  width: 100%;
  overflow: hidden;

  &__category-list {
    width: 100%;
    list-style: none;
    padding: 0px;
    margin: 0.5rem 0px;
  }

  &__category-list-item {
    width: 100%;
  }
}
</style>