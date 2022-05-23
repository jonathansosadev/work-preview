<template>
  <div class="garage-autocomplete" v-click-outside="hideListing">
    <div class="garage-autocomplete__input-wrapper" :class="{ 'garage-autocomplete__input-wrapper--selected': this.selected }">
      <i class="garage-autocomplete__input-icon icon-gs-search" />
      <input class="garage-autocomplete__input" v-model="inputFilter" @click="showListing" @change="removeSelect"/>
    </div>
    <div class="garage-autocomplete__listing" v-if="visibilityListing">
      <div class="garage-autocomplete__listing-option" v-for="option in optionsFiltered" :key="option.id" tabindex="0" @click="selectOption(option)" @keyup.enter="selectOption(option)">
        {{ option.publicDisplayName }} [{{ option.slug }}] [{{ option.id }}]
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: { type: Array, default: [] },
    value: { type: [String, Object, Number], default: null },
  },


  data() {
    return {
      inputFilter: '',
      visibilityListing: false,
      selected: false,
    }
  },

  methods: {
    showListing() {
      this.visibilityListing = true;
    },

    hideListing() {
      this.visibilityListing = false;
    },

    selectOption(option) {
      this.$emit('input', option)
      this.visibilityListing = false;
      this.inputFilter =  `${option.publicDisplayName} [${option.slug}] [${option.id}]`
      this.selected = true;
    },

    removeSelect() {
      if (this.selected) {
        this.selected = false;
        this.$emit('input', null);
      }
    }
  },

  computed: {
    optionsFiltered() {
      if (this.inputFilter) {
        return this.options.filter((option) => {
          return option.publicDisplayName.includes(this.inputFilter) ||
            option.slug.includes(this.inputFilter) ||
            option.id.includes(this.inputFilter);
        })
      } else {
        return this.options;
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.garage-autocomplete {
  position: relative;
  width: 100%;

  &__input-wrapper {
    width: 100%;
    border: 1px solid silver;
    border-radius: 5px;
    padding-left: 10px; 

    display: flex;
    flex-flow: row;
    align-items: center;
    background-color: #F5F5F5;

    &--selected {
      border-color: #2ecc71;
    }
  }

  &__input {
    border: none;
    font-size: 16px;

    margin-left: 10px;
    width: 100%;
    outline: 0;
    background-color: transparent;
    border-radius: 0 5px 5px 0;
  }

  &__listing {
    position: absolute;
    top: 30px;
    background-color: #F5F5F5;
    border: 1px solid silver;
    border-radius: 5px;
    width: 100%;
    z-index: 10;
    overflow-y: scroll;
    max-height: 25vh;
  }

  &__listing-option {
    padding: 5px;
    &:hover, &:focus {
      background-color: darken(#F5F5F5, 2%);
      cursor: pointer;
      outline: 0;
    }
  }
}
</style>
