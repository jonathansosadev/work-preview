<template>
  <div class="searchbar-accordion" :class="classBinding">
    <button class="searchbar-accordion__accordion" @click="toggleIsOpen">
      <div class="searchbar-accordion__content">
        <div class="searchbar-accordion__icon" v-if="icon">
          <i :class="icon" />
        </div>
        <label class="searchbar-accordion__label">{{ label }}</label>
      </div>
      <div class="searchbar-accordion__active" v-if="valueActive"></div>
      <div class="searchbar-accordion__caret">
        <i class="icon-gs-down"></i>
      </div>
    </button>
    <ul class="searchbar-accordion__items custom-scrollbar" ref="items" :style="style">
      <li class="searchbar-accordion__item" v-for="item in items" :key="item.value">
        <SearchbarAccordionItem
          :label="item.label"
          :value="item.value"
          :active="valueActive === item.value"
          @click="onItemClick(item.value)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import SearchbarAccordionItem from "./SearchbarAccordionItem";

export default {
  components: { SearchbarAccordionItem },

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },

    label: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      required: false
    },

    items: {
      type: Array,
      default: () => []
    },

    valueActive: {
      type: String
    }
  },

  computed: {
    style() {
      return {
        height: "auto",
        //"max-height": this.isOpen ? `${this.$refs.items.scrollHeight}px` : "0px",
        "max-height": this.isOpen ? `150px` : "0px"
      };
    },

    classBinding() {
      return {
        "searchbar-accordion--open": this.isOpen
      };
    }
  },

  methods: {
    toggleIsOpen() {
      this.$emit("onAccordionClick");
    },

    onItemClick(value) {
      this.$emit("change", this.valueActive === value ? undefined : value);
      this.$emit("onAccordionItemClick");
    }
  }
};
</script>

<style lang="scss" scoped>
.searchbar-accordion {
  &__accordion {
    padding: 7px 14px;
    height: 36px;
    width: 100%;
    cursor: pointer;
    border: none;
    background-color: transparent;
    outline: 0px;
    display: flex;
    flex-direction: row;
    align-items: center;

    &:focus {
      background-color: $bg-grey;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: $dark-grey;
    cursor: pointer;

    &:hover {
      color: $greyish-brown;
    }

    * + * {
      margin-left: .5rem;
    }
  }

  &__caret {
    font-size: 10px;
    height: 10px;
    color: $dark-grey;
    transition: transform 0.2s ease-in-out;

    &:hover {
      color: $greyish-brown;
    }
  }

  &__icon {
    align-self: flex-end;
  }

  &__active {
    height: 7px;
    width: 7px;
    background-color: $blue;
    border-radius: 50%;

    margin-right: 14px;
  }

  &__items {
    list-style: none;
    padding: 0px;
    margin: 0px;
    height: 0;
    overflow-x: hidden;
    overflow-y: auto;

    transition: max-height 0.3s ease-in-out;
  }

  &--active,
  &:hover {
    .searchbar-accordion__accordion {
      background-color: #f2f2f2;
    }
  }

  &--open {
    .searchbar-accordion {
      &__caret {
        transform: rotate(180deg);
      }

      &__icon,
      &__label {
        color: $blue;
        font-weight: bold;
      }
    }
  }
}
</style>
