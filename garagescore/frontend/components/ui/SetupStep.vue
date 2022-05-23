<template>
  <div class="setup-step" :style="displayHeadlineStyle" v-if="!loading">
    <div class="setup-step__headline" v-show="displayHeadline">
      <div class="setup-step__headline__left">
        <i v-show="!isModification" :class="checkIconClass" v-tooltip="{ content: checkIconTitle, html: true }" class="setup-step__headline__left__icon icon-gs-validation-check-circle"/>
        <div class="setup-step__headline__left__titles">
          <div class="setup-step__headline__left__titles__title">{{ label }}</div>
          <div class="setup-step__headline__left__titles__subtitle">{{ subLabel }}</div>
        </div>
      </div>
      <div class="setup-step__headline__right" v-if="!isOpen || disabled">
        <div v-tooltip="{ content: disabledTooltip }">
          <Button
            class="setup-step__headline__modify-button"
            type="secondary"
            @click="onSetActive(stepName)"
            :disabled="disabled"
          >
            {{ buttonLabel }}
          </Button>
        </div>
      </div>
    </div>
    <div :class="contentClassBinding" v-if="isOpen && !disabled">
      <slot name="input"/>
      <div class="setup-step__error" v-if="error">{{ error }}</div>
      <div class="setup-step__content__buttons" v-if="!noButtons">
        <Button class="setup-step__content__validate" type="orange" @click="onValidate(stepName)" :disabled="!isValid">{{ $t_locale('components/ui/SetupStep')('validate') }}</Button>
        <Button class="setup-step__content__cancel" type="phantom" @click="onCancel(stepName)">{{ $t_locale('components/ui/SetupStep')('cancel') }}</Button>
      </div>
    </div>
  </div>
  <div class="setup-step" :style="displayHeadlineStyle" v-else>
    <Skeleton style="height : 35px;"/>
  </div>
</template>

<script>
export default {
  name: "SetupStep",
  data() {
    return {
    };
  },
  props: {
    emptyValue: null, // means the type is "any"
    stepName: String,
    label: String,
    subLabel: String,
    isOpen: Boolean,
    isModification: Boolean,
    isValid: Boolean,
    filled: Boolean,
    onSetActive: Function,
    onValidate: Function,
    onCancel: Function,
    noButtons: Boolean,
    noHeader: Boolean,
    error: String,
    noBorder: Boolean,
    disabled: Boolean,
    disabledTooltip: String,
    loading: { type: Boolean , default: false},
  },
  methods: {
  },
  computed: {
    contentClassBinding() {
      return {
        'setup-step__content--no-modification' : this.isModification,
        'setup-step__content': !(this.noHeader)
      }
    },
    classBinding() {
      return {
        "card-dropdown--open": this.open,
        "card-dropdown--disabled": this.disabled
      };
    },
    displayHeadline() {
      if (!(this.isOpen)) {
        return true;
      }
      return !(this.noHeader)
    },
    displayHeadlineStyle() {
      const style = {};
      if (this.noHeader && this.isOpen) style['padding-top'] = 0
      if (this.noBorder) style['border'] = '0px'
      return style;
    },
    checkIconClass() {
      return this.filled ? 'setup-step__headline__left__icon--green' : '';
    },
    checkIconTitle() {
      return this.filled ? this.$t_locale('components/ui/SetupStep')('isValidated') : this.$t_locale('components/ui/SetupStep')('isNotValidated');
    },
    buttonLabel() {
      return this.isModification || this.filled ? this.$t_locale('components/ui/SetupStep')('modify') : this.$t_locale('components/ui/SetupStep')('add');
    }
  }
};
</script>

<style lang="scss" scoped>
.setup-step {
  padding: 1rem .5rem;
  box-sizing: border-box;
  border-bottom: 1px solid rgba($grey, .5);

  &:first-child {
    padding-top: 0;
  }

  &__error {
    color: $red;
    font-weight: bold;
  }
  &__headline {
    display: flex;
    flex-direction: row;

    &__left {
      display: flex;
      flex-direction: row;
      flex-grow: 1;

      &__titles {
        font-size: 1rem;
        font-weight: 700;

        &__title {
          color: $black;
          margin-bottom: .15rem;
        }
        &__subtitle {
          color: $dark-grey;
          word-break: break-word;
          overflow: hidden;
          display: block;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 475px;
        }
      }
      &__icon {
        font-size: 1.5rem;
        margin-right: 0.7rem;
        color: $grey;
        &--green {
          color: $green;
        }
      }
    }
    &__right {
      flex-grow: 0;
    }
  }
  &__content {
    margin-top: 1rem;
    margin-left: 2.4rem;
    &--no-modification {
      margin-left: 0;
    }
    &__buttons {
      margin-top: 1rem;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
    }
  }
}
  @media (max-width: $breakpoint-max-sm) {
    .setup-step {
      &__headline {
        &__left {
          &__titles {
             &__subtitle {
               max-width: 230px;
             }
          }
        }
      }
    }
  }
</style>
