<template>
  <div class="searchbar" v-click-outside="closeDropdown" :class="{ 'searchbar--input-focus': this.inputFocus }">
    <div class="searchbar__searchbar">
      <button class="searchbar__button-left" @click="() => onSearchClick()">
        <i class="icon-gs-search"></i>
      </button>
      <div class="searchbar__active-filters" ref="activeFilterContainer" v-show="!menuOpen">
        <!-- loop on an object : index is the key and v is the value -->
        <SearchbarActiveFilter
          v-for="(v, index) in filters"
          :key="index"
          :label="getOptionValue(index, v).label"
          :icon="getOption(index) && getOption(index).icon"
          ref="activeFilters"
          @click="removeFilter(index)"
        />
        <div class="searchbar__hidden-filter" v-if="hiddenFilterCount > 0">+{{ hiddenFilterCount }}</div>
      </div>
      <input
        v-if="noValue"
        class="searchbar__input"
        @keydown="onKeydown"
        :placeholder="placeholder"
        @input="handleSearchChange"
        @focus="() => (this.inputFocus = true)"
        @blur="() => (this.inputFocus = false)"
        :disabled="menuOpen"
      />
      <input
        v-else
        class="searchbar__input"
        @keydown="onKeydown"
        :placeholder="placeholder"
        :value="value"
        @input="handleSearchChange"
        @focus="() => (this.inputFocus = true)"
        @blur="() => (this.inputFocus = false)"
        :disabled="menuOpen"
      />
      <div class="searchbar__right" v-if="options.length > 0">
        <button v-if="!filtersDisabled" class="searchbar__button" @click="onFilterClick">
          <i class="icon-gs-setting-slider"></i>
          <span class="searchbar__right__text">{{ $t_locale('components/ui/searchbar/Searchbar')('filter') }}</span>
        </button>
        <button v-else class="searchbar__button searchbar__button--disabled" v-tooltip="filtersDisabledTooltip">
          <i class="icon-gs-setting-slider"></i>
          <span class="searchbar__right__text">{{ $t_locale('components/ui/searchbar/Searchbar')('filter') }}</span>
        </button>
      </div>
    </div>
    <div class="searchbar__dropdown" v-if="menuOpen && !isMobile">
      <div class="searchbar__new-filters" v-if="Object.keys(newFilters).length > 0">
        <SearchbarActiveFilter
          v-for="(value, index) in newFilters"
          :key="index"
          :label="getOptionValue(index, value).label"
          :icon="getOption(index) && getOption(index).icon"
          @click="removeNewFilter(index)"
        />
      </div>
      <div class="searchbar__filter">
        <SearchbarFilter :options="options" :value="newFilters" @change="handleFilterChange" />
      </div>
      <div class="searchbar__actions">
        <Button @click="toggleMenu(false)" type="phantom">{{ $t_locale('components/ui/searchbar/Searchbar')('cancel')}}</Button>
        <Button
          type="phantom"
          @click="removeAllFilters"
          v-if="Object.keys(newFilters).length > 0"
        >{{ $t_locale('components/ui/searchbar/Searchbar')('delete') }}</Button>
        <Button
          @click="toggleMenu(true)"
          type="orange"
          :disabled="isSameFilters"
        >{{ $t_locale('components/ui/searchbar/Searchbar')('applyFilters') }}</Button>
      </div>
    </div>
    <div class="searchbar__mobile" v-if="menuOpen && isMobile">
      <MobileModalFilters
        :filters="filters"
        @close="toggleMenu(false)"
        :value="newFilters"
        :options="options"
        @change="onModalSaveChange"
      />
    </div>
  </div>
</template>

<script>
import SearchbarActiveFilter from "./SeachbarActiveFilter";
import SearchbarFilter from "./SearchbarFilter";
import MobileModalFilters from "./MobileModalFilters";
import { isEqual } from "lodash";

export default {
  components: { SearchbarActiveFilter, SearchbarFilter, MobileModalFilters },

  props: {
    options: {
      type: Array,
      default: () => []
    },

    filters: {
      type: Object
    },

    noValue: {
      type: Boolean,
      default: false
    },

    value: {
      type: String,
      default: ""
    },

    placeholderString: {
      type: String
    },

    filtersDisabled: {
      type: Boolean,
      default: false
    }
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  data() {
    return {
      menuOpen: false,
      newFilters: this.filters,
      inputFocus: false,
      containerLength: 0,
      hiddenFilterCount: 0
    };
  },

  computed: {
    isMobile() {
      return ["sm", "md"].includes(this.$mq);
    },

    isSameFilters() {
      return isEqual(this.filters, this.newFilters);
    },

    placeholder() {
      let placeHolderType = '';
      if (this.$route.name.includes('team')) placeHolderType = '-team';
      if (this.$route.name.includes('garages')) placeHolderType = '-garages';
      if (this.$route.name.includes('reviews')) placeHolderType = '-reviews';
      if (this.$route.name.includes('followed')) placeHolderType = '-reviews';
      if (this.$route.name.includes('campaigns')) placeHolderType = '-campaigns';
      if (this.$route.name.includes('users')) placeHolderType = '-users';
      return this.placeholderString || this.$t_locale('components/ui/searchbar/Searchbar')(`placeholder${placeHolderType}`);
    },

    filtersDisabledTooltip() {
      return { content: this.$t_locale('components/ui/searchbar/Searchbar')('filtersDisabled') };
    }
  },

  watch: {
    filters: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.showFilters();
          this.containerLength = this.getContainerLength();
          this.hiddenFilterCount = this.getHiddenFilterCount();
          this.hideFilters();
        });
      }
    }
  },

  methods: {
    onFilterClick() {
      this.toggleMenu(false);
    },

    handleResize() {
      this.showFilters();
      this.containerLength = this.getContainerLength();
      this.hiddenFilterCount = this.getHiddenFilterCount();
      this.hideFilters();
    },

    hideFilters() {
      if (this.$refs.activeFilters) {
        const reserveArray = this.$refs.activeFilters.reverse();

        reserveArray.forEach((v, index) => {
          v.$el.style.display =
            index < this.hiddenFilterCount ? "none" : "flex";
        });
      }
    },

    showFilters() {
      if (this.$refs.activeFilters) {
        this.$refs.activeFilters.forEach((v, index) => {
          v.$el.style.display = "flex";
        });
      }
    },

    removeAllFilters() {
      this.newFilters = {};
    },

    getContainerLength() {
      if (this.$refs.activeFilterContainer) {
        this.$refs.activeFilterContainer.style.width = "50%";

        const width =
          (this.$refs.activeFilterContainer &&
            this.$refs.activeFilterContainer.getBoundingClientRect().width) ||
          0;

        this.$refs.activeFilterContainer.style.width = "auto";
        return width;
      }

      return 0;
    },

    getHiddenFilterCount() {
      let totalWidth = 0;
      let count = 0;
      const hiddenFilterCountWidth = 36;

      if (this.$refs.activeFilters) {
        const inverseArray = [...this.$refs.activeFilters].reverse();

        for (let element of inverseArray) {
          const width =
            element && element.$el && element.$el.getBoundingClientRect().width;
          totalWidth += width;

          if (totalWidth > this.containerLength - hiddenFilterCountWidth) {
            count += 1;
          }
        }
      }

      return count;
    },

    toggleMenu(save = false) {
      this.menuOpen = !this.menuOpen;

      if (save) {
        this.save();
      } else {
        this.newFilters = this.filters;
      }
    },

    closeDropdown() {
      this.menuOpen = false;
      this.newFilters = this.filters;
    },

    getOption(key) {
      return this.options.find(f => f.key === key);
    },

    getOptionValue(key, value) {
      const option = this.getOption(key);

      return option && option.values.find(v => v.value === value);
    },

    removeNewFilter(key) {
      const { [key]: undefined, ...newFilters } = this.newFilters || {};
      this.newFilters = newFilters;
    },

    removeFilter(key) {
      const { [key]: undefined, ...newFilters } = this.filters || {};

      this.$emit("filtersChange", newFilters);
      this.newFilters = newFilters;
    },

    save() {
      this.$emit("filtersChange", this.newFilters);
    },

    onKeydown(event) {
      if (event && event.key === "Enter") {
        this.onSearchClick();
      }
    },

    handleFilterChange(value) {
      this.newFilters = value;
    },

    onModalSaveChange(value) {
      this.newFilters = value;
      this.toggleMenu(true);
    },

    //Search
    handleSearchChange(event) {
      this.$emit("input", event.target.value);
    },

    onSearchClick() {
      this.$emit("searchClick");
    }
  }
};
</script>

<style lang="scss" scoped>
.searchbar {
  position: relative;

  &--input-focus {
    .searchbar__button-left {
      background-color: $dark-grey;
    }
  }

  &__hidden-filter {
    width: 26px;
    height: 26px;
    background-color: $dark-grey;
    color: $white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    user-select: none;
    flex-shrink: 0;
  }

  &__dropdown {
    position: absolute;
    top: 36px;
    width: 100%;
    background-color: $white;
    z-index: 94;
    margin-top: 3px;
    border-radius: 3px;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.15);
  }

  &__actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    border-top: 2px solid #dddddd;
    padding: 10px 14px;
    box-sizing: border-box;

    * + * {
      margin-left: 7px;
    }
  }

  &__new-filters {
    border-bottom: 2px solid #dddddd;

    padding: 10px;
    box-sizing: border-box;

    display: flex;
    flex-direction: row;

    * + * {
      margin-left: 7px;
    }
  }

  &__searchbar {
    height: 2.5rem;
    border-radius: 20px;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    background-color: $white;
    overflow: hidden;
    display: flex;
    flex-direction: row;
  }

  &__button-left {
    width: 46px;
    background-color: $grey;
    color: $white;
    margin-right: 7px;
    border: none;
    cursor: pointer;
    transition: background-color 0.1s ease-in;

    &:hover,
    &:focus {
      background-color: $dark-grey;
    }

    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__input {
    border: none;
    outline: 0px;
    flex: 1;
    padding: 10px 0px;

    &::placeholder {
      font-size: 12px;
    }

    &:disabled {
      background-color: $white;

      &::placeholder {
        color: transparent;
      }
    }
  }

  &__active-filters {
    box-sizing: border-box;

    display: flex;
    flex-direction: row;

    max-width: 50%;
    overflow: hidden;

    * {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }

    *:not(:first-child) {
      margin-left: 0.5rem;
    }

    *:last-child {
      margin-right: 0.5rem;
    }
  }

  &__right {
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__text {
      position: relative;
      top: 1px;
    }
  }

  &__button {
    height: auto;
    padding: 0.4rem 0.7rem;
    outline: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $dark-grey;
    border-radius: 20px;
    border: solid 1px $grey;
    background-color: $active-cell-color;
    font-size: 0.9rem;
    font-weight: 700;
    box-sizing: border-box;

    * + * {
      margin-left: 7px;
    }

    i {
      font-size: .92rem;
      position: relative;
      top: 1px;
    }

    span {
      display: block;
      font-weight: inherit;
    }

    &:hover {
      cursor: pointer;
      color: $greyish-brown;
    }

    &--disabled:hover {
      color: $dark-grey;
      cursor: unset;
    }
  }
}
</style>
