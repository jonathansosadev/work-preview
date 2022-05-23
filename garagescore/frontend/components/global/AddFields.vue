<template>
  <div class="add-filed">

    <!-- Left bloc -->
    <div>
      <AppText tag="p" type="muted" size="sm">{{ $t_locale('components/global/AddFields')('Title') }}</AppText>
      <div class="add-filed__bloc add-filed__bloc__left custom-scrollbar">
        <ul class="add-filed__bloc__list">
          <OpenableListItem
            v-for="(category, index) in fieldsByCategories"
            :key="index"
            :open="activeItem === index"
            @click="open(index)"
          >
            <template slot="header">
              <span class="add-filed__category__label">{{ category.title }}</span>
              <Tag
                class="add-filed__category__counter"
                :content="`${selectedFieldsForCategory(category).length}/${category.fields.length}`"
                :background="getTagType(category)"
                padding="xs"
              />
            </template>
            <template>
              <li class="add-filed__bloc__list__items wrapper" v-for="(field, index) in category.fields" :key="field.id">
                  <div class="add-filed__bloc__list__items__item">
                    <input class="checkbox" type="checkbox" :id="field.id" :value="field" v-model="selectedFields" >
                    <label class="add-filed__bloc__list__items--label selected" :for="field.id">{{ field.title }}</label>
                    <span class="checkmark"></span>
                    <button role="button" class="add-filed__bloc__list__items__item__button" v-if="field.subfields" @click="openSubfields(index)">
                      <i :class="triggerIcon(index)" class="add-filed__bloc__list__items--trigger-icon" />
                    </button>
                  </div>
                  <div v-if="field.subfields && activeSubfields === index" class="add-filed__bloc__list__items__motifs">
                    <span class="add-filed__bloc__list__items__motif" v-for="subfield in field.subfields" :key="subfield.id">
                      <input class="checkbox" type="checkbox" :id="subfield.id" :value="subfield" v-model="selectedFields" >
                      <label class="selected" :for="subfield.id">
                        <i class="icon-gs-add-outline-circle add-filed__bloc__list__items__motif--trigger-icon" />
                        <span class="add-filed__bloc__list__items__motif--label">{{ subfield.title }}</span>
                      </label>
                    </span>
                  </div>
              </li>
            </template>
          </OpenableListItem>
        </ul>
      </div>
    </div>

  </div>

</template>

<script>
import Tag from "~/components/ui/Tag.vue";
import OpenableListItem from "~/components/ui/OpenableListItem";

export default {
  name: 'AddFields',
  components: { Tag, OpenableListItem },
  props: {
    fieldsByCategories: {
      type: Array,
      default: () => [],
    },
    savedFields: {
      type: Array,
      default: () => [],
    },
    onSelectedFieldsChange: Function,
  },

  data() {
    return {
      selectedFields: [],
      activeItem: null,
      activeSubfields: null,
    }
  },

  mounted() {
    if (this.savedFields) {
      this.selectedFields = [...this.savedFields];
    }
  },
  methods: {
    selectedFieldsForCategory(category) {
      return category.fields.filter(({ id }) => this.selectedFields.find(field => field.id == id));
    },
    open(index) {
      this.activeItem = index === this.activeItem ? null : index;
    },
    clear() {
      this.selectedFields = []
    },
    getTagType(category) {
      const selectedFieldsForCategory = this.selectedFieldsForCategory(category);

      if(selectedFieldsForCategory.length > 0 ) {
        return 'primary-default';
      }
      return 'grey-disabled';
    },
    openSubfields(index) {
      this.activeSubfields = index === this.activeSubfields ? null : index;
    },
    triggerIcon(index) {
      if (this.activeSubfields === index) {
        return 'icon-gs-up';
      }
      return 'icon-gs-down';
    }
  },

  watch: {
    selectedFields: {
      deep: true,
      handler(newValue) {
        if (this.onSelectedFieldsChange) {
          this.onSelectedFieldsChange(newValue);
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.add-filed {
  display: flex;
  flex-direction: row;

  &__bloc {
    background-color: $white;
    border: 1px solid rgba($grey, .5);
    border-radius: 3px;
    height: 170px;
    width: 300px;
    margin-top: .5rem;
    padding: 10px;
    overflow-y: auto;
    overflow-x: hidden;

    &__list {
      list-style: none;
      padding: 0;
      margin: 0;

      &__items {
      margin-bottom: 10px;

      &--trigger-icon {
        margin-left: auto;
        font-size: 10px;
        color: $dark-grey;
      }

      &__item {
        display: flex;
        margin-bottom: 10px;

        &__button {
          border: none;
          background-color: transparent;
          outline: 0;
          cursor: pointer;
          margin-left: auto;
          padding: 0;
          position: relative;
          top: -3px;
        }
      }

      &__motifs {
        display: flex;
        flex-direction: column;
      }

      &__motif {
        margin-bottom: .7rem;
        color: $dark-grey;
        font-size: .85rem;

        &--label {
          padding-left: .5rem;
          cursor: pointer;
        }
        &--trigger-icon {
          position: relative;
          top: 2px;
          left: 1px;
        }
      }

      &--label {
        color: $dark-grey;
        font-weight: 700;
        font-size: 12px;
        position: relative;
        padding-left: 1.5rem;
        cursor: pointer;
        z-index: 1;
      }
      }
    }

  }

  &__category {
    display: flex;

    &__label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: $grey;
      padding-bottom: .4rem;
    }
    &__counter {
      margin-left: auto;
      font-size: 9px!important;
      font-weight: 900;
      border-radius: 20px!important;
      height: 1.4rem;
      box-sizing: border-box;
      padding: .3rem .25rem;
      margin-bottom: 0.3rem;
    }
  }
}

// To clean

::v-deep .list-item__content--open {
  max-height: none;
}
::v-deep .list-item__header {
  height: 2rem;
  padding: 0.3rem 0 0 0;
}
::v-deep .list-item__header__icon-container {
  font-size: 10px;
}
::v-deep .list-item__header__icon-container {
  margin-left: 10px;
}
::v-deep .list-item__header--open {
  background-color: $white;
  border-bottom: none;
}
::v-deep .list-item__content__footer {
  display: none;
}

.wrapper {
  display: block;
  position: relative;
  //padding-left: 1.5rem;
  box-sizing: border-box;
  margin-bottom: .5rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-size: 1.14rem;
}
/* Hide the browser's default checkbox */
.wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 1rem;
  width: 1rem;
  border-radius: 3px;
  background-color: $white;
  border: 2px solid $dark-grey;
  box-sizing: border-box;
}
/* On mouse-over, add a grey background color */
.wrapper:hover input ~ .checkmark {
  background-color: rgba($dark-grey, .1);
  border: 2px solid $greyish-brown;
}
/* When the checkbox is checked, add a blue background */
.wrapper input:checked ~ .checkmark {
  background-color: $white;
  border: 2px solid $blue;
}

.wrapper input:checked ~ .selected {
  color: $blue;
}
/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
/* Show the checkmark when checked */
.wrapper input:checked ~ .checkmark:after {
  display: block;
}
/* Style the checkmark/indicator */
.wrapper .checkmark:after {
  left: 3px;
  top: 1px;
  width: 2px;
  height: 5px;
  border: solid $blue;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>
