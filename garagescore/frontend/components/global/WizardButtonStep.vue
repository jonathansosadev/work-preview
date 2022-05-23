<template>
  <div class="wizard-button">
    <div
      class="wizard-button__item"
      :class="wizardButtonClass(option)"
      v-for="option in options"
      :key="option.value"
      @click="onWizardButtonClick($el, option)"
    >
      <i class="wizard-button__item-icon" :class="option.icon" />
      <h2 class="wizard-button__item-title">{{ option.label }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: Array,
    active: Boolean,
    value: String
  },
  computed: {
    wizardButtonClass() {
      return (option) => ({
        'wizard-button__item--50': this.options.length > 1,
        'wizard-button__item--active': (this.value === option.value) || this.active
      });
    }
  },
  methods: {
    onWizardButtonClick($el, option) {
      this.$emit('input', option.value);
      this.$emit('click', $el);
    }
  }
};
</script>

style.<style lang="scss">
.wizard-button {
  height: 102px;
  width: 100%;

  &__item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
    border: 1px solid $orange;
    cursor: pointer;
    height: 100%;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 5px;

    &:hover {
      background-color: lighten($orange, 40%);
    }

    &--active {
      background-color: $orange;

      .wizard-button__item-title,
      .wizard-button__item-icon {
        color: $white;
      }

      &:hover {
        background-color: $orange;
      }
    }

    &--50 {
      height: calc(100% / 2);
      width: 100%;
      flex-flow: row;
      justify-content: left;
      align-items: center;
      padding: 0 0 0 1rem;
      border-radius: 5px 5px 0 0;

      &:nth-child(1) {
        border-bottom: none;
      }
      &:last-child {
        border-radius: 0 0 5px 5px;
      }

      .wizard-button__item-title {
        font-size: 1rem;
        margin-top: 0;
      }

      .wizard-button__item-icon {
        font-size: 1rem;
        margin-right: 0.5rem;
      }
    }
  }

  &__item-icon {
    color: $orange;
    font-size: 2rem;
  }

  &__item-title {
    color: $black;
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    margin-top: 1rem;
    text-align: center;

    // IE Trick
    width: auto;
    max-width: 100%;
  }
}
</style>
