<template>
  <div class="dropdown-button-label">
    <!-- labelTop -->
    <template  v-if="labelTop">
      <span class="dropdown-button-label__placeholder">
        <AppText
          tag="span"
          :type="open ? 'primary' : 'muted'"
          size="sm"
        >
          {{ labelTop }}
        </AppText>
      </span>
    </template>
    <button class="dropdown-button" v-on="$listeners" :class="classBinding" :track-id="trackId">
      <div class="dropdown-button__right" :class="iconClassBinding" v-if="$slots.icon" :track-id="trackId">
        <slot name="icon" />
      </div>
      <div class="dropdown-button__label" :track-id="trackId" :class="labelClassBinding">
        <slot name="label" />
      </div>
      <!--<div class="dropdown-button__caret" v-if="!disabled">-->
      <div class="dropdown-button__caret" :class="classBindingCaret" :track-id="trackId" v-if="caret">
        <i class="icon-gs-down" />
      </div>
      <div class="dropdown-button__btn" :class="classBindingCaret" >
        <slot name="button"/>
      </div>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    open: { type:  Boolean, default: false },
    active: { type: Boolean, default: false },
    disabled: {type: Boolean, default: false },
    trackId: { type: String, default: '' },
    isValid: { type: String, default: 'Empty' },
    noMaxWidth: { type: Boolean, default: false },
    type: { type: String, default: '' },
    size: { type: String, default: ''  },
    iconColor:{ type: String, default: '' },
    caretColor:{ type: String, default: '' },
    caret: {type: Boolean, default: true},
    labelTop: String,
  },
  computed: {
    classBinding() {
      const classBinding = {
        "dropdown-button--active": this.active,
        "dropdown-button--open": this.open,
        "dropdown-button--disabled": this.disabled,
        //'dropdown-button--valid': this.isValid === 'Valid' && this.value && this.value !== 0,
      };
      classBinding[`dropdown-button--${this.type}`] = this.type;
      classBinding[`dropdown-button--${this.size}`] = this.size;
      classBinding[`dropdown-button--${this.type}--active`] = this.active;
      classBinding[`dropdown-button--${this.type}--disabled`] = this.disabled;
      classBinding[`dropdown-button--${this.type}--open`] = this.open;
      classBinding[`dropdown-button--${this.type}--valid`] = this.isValid === 'Valid';
      return classBinding;
    },
    classBindingCaret() {
      const classBinding = {};
      classBinding[`dropdown-button__caret--${this.size}`] = this.size;
      classBinding[`dropdown-button--${this.type}--${this.caretColor}`] = true
      return classBinding;
    },
    labelClassBinding() {
      return {
        "dropdown-button__label--no-max-width": this.noMaxWidth
      }
    },
    iconClassBinding(){
      const iconClassBinding = {}
      iconClassBinding[`dropdown-button--${this.type}--${this.iconColor}`] = true
      return iconClassBinding
    }
  }
};
</script>

<style lang="scss" scoped>
@mixin phantom{
  background-color: transparent;
  box-shadow: none;
  border: none!important;
}
.dropdown-button-label {

  &__placeholder {
    display: flex;
    margin-bottom: .5rem;
  }
}
.dropdown-button {
  background-color: $white;
  border-radius: 20px;
  padding: .5rem 1rem;
  box-shadow: 0 0 3px 0 rgba($black, 0.16);
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  border: none;
  color: $dark-grey;
  cursor: pointer;

  &--open {
    color: $greyish-brown;

    .dropdown-button__right {
      color: $blue;
    }

    .dropdown-button__caret {
      transform: rotate(180deg);
      padding-top: 1.5%;
    }
  }

  &--active {
    color: $blue!important;
    font-weight: 700;
  }

  &--disabled {
    cursor: default;
  }
  &--material {
    background-color: transparent;
    width: 100%;
    border-bottom: 2px solid $grey;
    box-shadow: none;
    border-radius: 0;
    padding: 1rem .5rem 0 0;
    height: 52px;
    align-items: center;

    &--valid {
      border-bottom-color: $green;
      color: $greyish-brown;
    }

    &:hover {
      border-bottom-color: $greyish-brown;
    }
    ::v-deep .button {
      background-color: $white;
      height: 2.2rem;
      padding: 0.5rem 1rem;
      box-shadow: none;
      width: 100%;
      text-align: left;
      display: inherit;
    }
    ::v-deep .button:hover {
      background-color: rgba($grey, .2);
    }
    ::v-deep .dropdown {
      &__dropdown {
        border-radius: 3px;
        background-color: $white;
        overflow: hidden;
        max-width: 200px;
        box-shadow: 0 0 6px 0 rgba($black, .16);
      }
    }
  }
  &--new-design{
    border-radius: 20px;
    box-shadow: 0 0 3px 0 rgba($black, 0.32);
    background-color: $white;
    padding: 0.5rem 1rem 0.429rem;
    height: 2.143rem;
    &:hover{
      color: $black;
    }
    &--open {
      color: $black;

      .dropdown-button__right {
        color: $blue;
      }

      .dropdown-button__caret {
        color: $blue;
      }
    }
    &--active{
      color: $blue!important;
      font-size: 1rem;
      line-height: 1.43;
      font-weight: 700;

      &:hover{
        color: $blue;
      }
    }
  }

  &--new-design-flat{
    border-radius: 20px;
    box-shadow: none;
    border: 1px solid rgba($grey, .5);
    background-color: $white;
    padding: 0.5rem 1rem 0.429rem;
    height: 2.143rem;
    &:hover{
      color: $black;
    }
    &--open {
      color: $black;
      border: 1px solid rgba($blue, 1);
      .dropdown-button__right {
        color: $blue;
      }
      .dropdown-button__caret {
        color: $blue;
      }
    }
  }

  &--max-width{
    width: 100%;
  }


  &--automation {

    color: $orange;
    &--active {
      color: $orange;
    }
    &--open {
      color: $blue;
    }
    &--disabled {
      color: $grey;
    }
  }
  &--phantom {
    @include phantom;
    color: $blue!important;
  }

  &--phantom-btn {
    @include phantom;
    color: $dark-grey!important;
  }

  &--phantom-orange {
    @include phantom;
    color: $orange!important;
    font-size: 1rem;
    font-weight: 700;
    align-items: center;
  }

  &--lg {
    font-size: 1.5rem;
    font-weight: bold;
  }

  &__right {
    margin-right: .5rem;

    i {
      font-size: 1rem;
      position: relative;
      top: 1px;
    }
  }

  &__label {
    max-width: 42rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    padding-right: .4rem;
    &--no-max-width {
      max-width: none;
    }
  }

  &__caret {
    transition: transform 0.3s;
    margin-left: auto;
    font-size: 0.71rem;
    padding-top: 1.5%;
    &--lg {
      font-size: 1rem;
    }
  }
}
</style>
