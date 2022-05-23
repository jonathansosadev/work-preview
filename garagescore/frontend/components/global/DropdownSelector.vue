<template>
    <div class="dropdown-selector-component">
      <Dropdown
        v-tooltip="{ content: disabled && disabledTooltip}"
        :disabled="disabled"
        :isValid="isValid"
        :size="size"
        :type="type"
        :labelTop="labelTop"
        :active="active"
        ref="dropdown"
      >
        <!-- LABEL -->
        <template v-if="label" #label>
          <span class="dropdown-selector-component__label">
            {{ label }}
            <AppText
              v-if="required"
              tag="span"
              type="orange"
              class="dropdown-selector-component__label__required"
            >
              *
            </AppText>
          </span>
        </template>

        <!-- ICON -->
        <template v-if="icon" #icon>
          <i :class="icon" class="dropdown-selector-component__icon"></i>
        </template>

        <!-- TITLE -->
        <template v-if="title" #label>
          <span class="dropdown-selector-component__title color">{{ title }}</span>
        </template>

        <!-- MAIN SLUT -->
        <template>

          <!-- SUBTITLE IF PROVIDED -->
            <div v-if="subtitle" class="dropdown-selector-component__subtitle">
              <span class="dropdown-selector-component__subtitle__text">
                {{ subtitle }}
              </span>
            </div>

          <!-- LIST OF ITEMS IN DROPDOWN -->
          <div class="dropdown-selector-component__content custom-scrollbar">
            <div
              v-for="item in items"
              :key="item.id"
              v-tooltip="{content: item.hoverText}"
              class="dropdown-selector-component__content__items"
            >
              <Button
                :disabled="item.disabled"
                :type="item.buttonType || 'dropdown-item'"
                @click="triggerChoice(item)"
              >
              <template v-if="item.icon" #left>
                <i :class="item.icon" />
              </template>
                {{ item.label }}
              </Button>
            </div>
          </div>
          <div
           v-if="fixedFooter"
           v-tooltip="{content: fixedFooter.hoverText}"
           class="dropdown-selector-component__content__items"
          >
            <Button
              :disabled="fixedFooter.disabled"
              :type="fixedFooter.buttonType || 'dropdown-item'"
              @click="triggerChoice(fixedFooter)"
            >
              <template v-if="fixedFooter.icon" #left>
                <i :class="fixedFooter.icon" />
              </template>
              {{ fixedFooter.label }}
            </Button>
          </div>
        </template>
      </Dropdown>
    </div>
</template>

<script>
  export default {
    props: {
      icon: String,
      title: String,
      subtitle: String,
      label: String,
      labelTop: String,
      callback: {
        type: Function,
        required: true,
      },
      items: {
        type: Array,
        default: () => [],
      },
      fixedFooter: Object,
      disabled: Boolean,
      disabledTooltip: String,
      type: String,
      size: String,
      required: Boolean,
      isValid: {
        type: String,
        default: 'Empty',
      },
      active: { type: Boolean, default: false },
    },
    methods: {
      triggerChoice(item) {
        // Close dropdown mobile on change
        this.callback(item);
        this.$refs.dropdown.closeDropdown();
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dropdown-selector-component {

    &__icon {
      font-size: 1rem!important;
    }
    &__label {
      position: absolute;
      top: 3px;
      font-size: .8rem;
      color: $dark-grey;

      &__required {
        margin-left: 0.25rem;
      }
    }
    &__subtitle {
      padding: .5rem 1rem;
      border-bottom: 1px solid rgba($grey, .5);
      text-align: left;

      &__text {
        font-size: 0.8rem;
        color: $dark-grey;
      }
    }
    &__content {
      max-height: 170px;
      overflow: auto;
      border-radius: 5px;

      &__items {
        position: relative;
        
        &--fixed-footer {
          position: absolute;
          bottom: 0;
        }
      }
    }
    :focus {outline:none;}
  }

</style>
