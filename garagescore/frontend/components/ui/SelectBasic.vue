<template>
  <div class="select-basic" :class="classBinding">
    <template v-if="!multi">
      <div class="select-basic__part">
        <div class="select-basic__wrapper">
          <select class="select-basic__select" v-bind="$attrs" :value="value" v-on="listeners">
            <option v-for="(option, index) in options" :key="index" :value="option.value">
              <slot :option="option">
                {{ option.text }}
              </slot>
            </option>
          </select>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="select-basic__part">
        <div class="select-basic__wrapper">
          <select class="select-basic__select" v-bind="$attrs" v-on="listeners">
            <option selected disabled ref="disabledOption"></option>
            <option v-for="(option, index) in optionsAvailable" :key="index" :value="option.value">
              <slot :option="option">
                {{ option.text }}
              </slot>
            </option>
          </select>
        </div>
      </div>
      <div class="select-basic__part">
        <div class="select-basic__item" v-for="(v, index) in value" :key="v">
          <div class="select-basic__content">
            <slot name="item" :option="getOption(v)">
              {{ getOption(v) ? getOption(v).text : v }}
            </slot>
          </div>
          <button class="select-basic__item-remove" @click="removeItem(index)">
            <i class="icon-gs-close-circle" />
          </button>
        </div>
      </div>
      <div class="select-basic__part select-basic__part--center" v-if="validateEvent">
        <Button class="select-basic__button" type="primary" @click="$emit('validate')">Valider</Button>
      </div>
    </template>
  </div>
</template>


<script>
export default {
  inheritAttrs: false,

  props: {
    value: [String, Number, Object, Array],
    options: Array,
    multi: {
      default: false,
      type: Boolean,
    },

    validateEvent: Boolean,
    size: String,
  },


  methods: {
    removeItem(index) {
      this.value.splice(index, 1)
      this.$emit('input', this.value);
    },

    getOption(value) {
      return this.options.find((option) => option.value === value);
    },
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners,

        change: (event) => {
          if (this.multi) {
            const option = this.getOption(event.target.value);
            (option.exclusive) ? this.$emit('input', [event.target.value]) : this.$emit('input', [...this.value.filter(e => this.getOption(e) && !this.getOption(e).exclusive), event.target.value]);

            this.$refs.disabledOption.selected = true;
          } else {
            this.$emit('input', event.target.value);
            if (this.validateEvent) {
              this.$emit('validate');
            }
          }
        },
      };
    },

    classBinding() {
      return {
        'select-basic--sm': this.size === 'sm',
      }
    },

    optionsAvailable() {
      if (!this.value) {
        return this.options;
      }
      return this.options.filter((option) => !this.value.includes(option.value));
    },
  }
}
</script>

<style lang="scss" scoped>
$border-radius: 3px;

.select-basic {
  display: flex;
  flex-flow: column;

  &__wrapper {
    background-color: white;
    border-radius: $border-radius;
    border: 1px solid $grey;
  }

  &__part {
    &:not(:last-child) {
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid $grey;
    }

    &--center {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__select {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.6rem;
    border-radius: $border-radius 0 0 $border-radius;
    width: 100%;

    &:placeholder {
      color: $black-grey;
    }
  }

  &__item {
    display: flex;
    align-items: center;
  }

  &__content {
    flex: 1;
  }

  &__item-remove {
    color: $red;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    outline: 0;
    padding: 0.25rem;
  }

  &--sm {
    .select-basic__select {
      padding: 0.5rem;
    }
  }
}
</style>
