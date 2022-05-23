<template>
  <button
    role="button"
    class="button"
    :class="classBinding"
    v-if="!link"
    v-on="listeners"
    :disabled="disabled"
    v-tooltip.top="{ content: tooltip }"
  >
    <div class="button__left" v-if="this.$slots.left">
      <slot name="left" />
    </div>

    <!-- Migrate icon to props -->
    <i v-if="icon" :class="icon"/>

    <div class="button__content">
      <i v-if="loading" class="icon-gs-loading" />
      <slot />

      <!-- Migrate content to props -->
      <span class="button__content__text" v-if="content">{{ content }}</span>

    </div>
  </button>
  <nuxt-link :to="to" role="button" class="button" :class="classBinding" v-tooltip.top="{ content: tooltip }" v-else>
    <div class="button__left" v-if="this.$slots.left">
      <slot name="left" />
    </div>
    <div class="button__content">
      <i v-if="loading" class="icon-gs-loading" />
      <slot />
    </div>
  </nuxt-link>
</template>


<script>
export default {
  name: 'Button',

  props: {
    type: String,
    size: String,
    loading: Boolean,
    link: Boolean,
    border: String,
    to: { required: false, type: [Object, String] },
    disabled: Boolean,
    thick: Boolean,
    fullSized: Boolean,
    fullSizedNoPadding: Boolean,
    active: Boolean,
    popOver: Boolean,
    icon: String,
    content: [Number, String, Array],
    tooltip: String,
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners
      };
    },

    classBinding() {
      return {
        "button--disabled": this.disabled,
        "button--fullsize": this.fullSized,
        "button--fullsize-no-padding": this.fullSizedNoPadding,
        "button--active": this.active,

        "button--primary": this.type === "primary",
        "button--secondary": this.type === "secondary",
        "button--success": this.type === "success",
        "button--warning": this.type === "warning",
        "button--danger": this.type === "danger",
        "button--cancel": this.type === "cancel",
        "button--phantom": this.type === "phantom",
        "button--orange": this.type === "orange",
        "button--picture": this.type === "picture",
        "button--contained-white": this.type === "contained-white",
        "button--contained-orange": this.type === "contained-orange",
        "button--contained-dark-grey": this.type === "contained-dark-grey",
        "button--contained-grey": this.type === "contained-grey",
        "button--dropdown-item": this.type === "dropdown-item",
        "button--dropdown-btn": this.type === "dropdown-btn",
        "button--icon-btn": this.type === "icon-btn",
        "button--icon-btn-md": this.type === "icon-btn-md",
        "button--contained-icon-white": this.type === "contained-icon-white",
        "button--contained-icon-grey": this.type === "contained-icon-grey",
        "button--white": this.type === "white",
        "button--muted": this.type === "muted",
        "button--link": this.type === "link",
        "button--link-grey": this.type === "link-grey",
        "button--options": this.type === "options",
        "button--options-dark": this.type === "options-dark",
        "button--options-dark-active": this.type === "options-dark-active",
        "button--primary-text": this.type === "primary-text",
        "button--secondary-text": this.type === "secondary-text",

        "button--md": this.size === "md",
        "button--sm": this.size === "sm",
        "button--xs": this.size === "xs",
        "button--lg": this.size === "lg",

        "button--xs-options": this.size === "xs-options",
        "button--md-options": this.size === "md-options",

        "button--thick": this.thick,

        "button--round": this.border === "round",
        "button--square": this.border === "square",

        // NOT GOOD ABSTRACTION
        "button--white-border": this.type === "white-border",
        "button--orange-border": this.type === "orange-border"
      };
    }
  }
};
</script>


<style lang="scss" scoped>
.button {
  position: relative;
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  height: 2.5rem;

  border: 0;
  background-color: darken($grey, 2%);
  border-radius: 20px;
  color: $black;
  box-shadow: 0 1px 3px 0 rgba($black, .2);
  outline: 0;

  overflow: hidden;

  padding: 0 1rem;
  box-sizing: border-box;

  &__content,
  &__left {
    z-index: 1;
  }

  &__left {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 0.5rem;
    width: 1rem;
    font-size: 1.2rem;
    
  }

  &__content {
    flex-grow: 1;
    display: inline;
    text-align: center;
    &__text {
      font-size: 1rem;
    }
  }

  &:hover {
    background-color: darken($grey, 5%);
  }

  &--round {
    border-radius: 20px;
  }

  &--square {
    border-radius: 20px;
  }

  &--thick {
    height: 40px;
    padding: 0 1.5rem;
  }

  &--md {
    font-size: 1.25rem;
  }

  &--lg {
    font-size: 1.5rem;
  }

  &--sm {
    font-size: 0.9rem;

    .button__content {
      padding: 0.5rem 0.75rem;
    }

    .button__left {
      padding: 0;
      padding-right: 0.15rem;
      padding-left: 0.5rem;
      font-size: 1.3rem;
    }
  }

  &--xs {
    font-size: 0.7rem;

    .button__content {
      padding: 0.2rem !important;
    }

    .button__left {
      padding: 0;
    }
  }

  &--xs-options {
    font-size: 0.9rem;
    height: 26px !important;

    .button__content {
      padding-left: 5px !important;
    }

    .button__left {
      padding: 0;
      font-size: 1rem;
    }
  }

  &--md-options {
    font-size: 1rem;
    height: 32x !important;

    .button__content {
      padding-left: .5rem !important;
    }

    .button__left {
      padding: 0;
      font-size: 1.2rem;
    }
  }

  &--primary {
    background-color: darken($blue, 2%);
    color: $white;

    &:hover {
      background-color: darken($blue, 5%);
    }
  }

  &--secondary {
    background-color: $dark-grey;
    color: $white;

    &:hover {
      background-color: $greyish-brown;
    }
  }

  &--danger {
    background-color: darken($red, 2%);
    color: $white;

    &:hover {
      background-color: darken($red, 5%);
    }
  }

  &--success {
    background-color: darken($green, 2%);
    color: $white;

    &:hover {
      background-color: darken($green, 5%);
    }
  }

  &--warning {
    background-color: darken($yellow, 2%);
    color: $white;

    &:hover {
      background-color: darken($yellow, 5%);
    }
  }

  &--orange {
    background-color: darken($orange, 2%);
    color: $white;

    &:hover {
      background-color: darken($orange, 5%);
    }
  }

  &--muted {
    background-color: $grey;
    color: $white;

    &:hover {
      background-color: darken($grey, 3%);
    }
  }

  &--disabled {
    background-color: $grey;
    color: $white;
    box-shadow: none;
    cursor: not-allowed;
    pointer-events: auto;
    &:hover {
      background-color: $grey;
    }
  }

  &--white {
    background-color: transparent;
    color: $dark-grey;
    border: 1px solid $dark-grey;
    box-shadow: none;

    .button__content {
      padding: 0.5rem;
    }

    &:hover {
      background-color: $grey;
      &:disabled {
        pointer-events: auto;
        cursor: alias;
        background-color: transparent;
      }
    }
  }

  &--phantom {
    background-color: transparent;
    color: $dark-grey;
    box-shadow: none;
    border: 1px solid transparent;

    &:hover {
      background-color: transparent;
      color: $greyish-brown;
    }

    &::before {
      display: none;
    }
  }

  &--options {
    background-color: rgba($white, .2);
    border-radius: 20px;
    color: $white;
    height: 32px;
    margin-right: 1rem;

    &:hover {
      background-color: rgba($white, .4);
    }
    &__active {
      background-color: $blue;
      font-weight: 700;

      &:hover {
        background-color: $blue;
      }
    }
  }

  &--icon-btn {
    background-color: rgba($dark-grey, 0.15);
    color: $dark-grey;
    height: 1.5rem;
    width: 1.5rem;
    padding: 0.375rem;
    display: inherit;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    margin-right: .4rem;
    border-radius: 5px;
    
    & i {
      font-size: 10px;
    }
    &:hover {
      box-shadow: 0 0 3px 0 rgba($black, 0.25);
      color: $greyish-brown;
    }
    &::before {
      display: none;
    }
  }

  &--picture {
    background-color: $black;
    background-image: url("https://i.imgur.com/7sJkTYw.jpg");
    color: transparent;
    box-shadow: none;
    border: 1px solid transparent;
    margin-right: inherit!important;
    width: 170px;
    height: 160px;
    filter: contrast(100%);
    //filter: brightness(1);

    &:hover {
      background-color: $black;
      content: "hello";
      filter: contrast(50%);
      //filter: brightness(25%);
      color: $white;
    }

    &::before {
      display: none;
    }
  }
&--contained-white {
    background-color: $white;
    color: $orange;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    height: 30px;
    padding: 0 1rem;

    .button__content {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
      font-size: 1rem;
    }
    &:hover {
      background-color: $white;
      color: darken($orange, 2%);
      box-shadow: 0 0 3px 0 rgba($black, .32);
    }
    &::before {
      display: none;
    }
  }

  &--contained-orange {
    background-color: $orange;
    color: $white;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    height: 30px;
    padding: 0 1rem;
    font-size: .92rem;
    font-weight: 700;

    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
      font-size: 1rem;
    }
    &:hover {
      background-color: darken($orange, 2%);
      color: $white;
      box-shadow: 0 0 3px 0 rgba($black, .32);
    }
    &::before {
      display: none;
    }
    &:disabled {
      background-color: $grey;
    }
  }

  &--contained-dark-grey {
    background-color: $dark-grey;
    color: $white;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    height: 30px;
    padding: 0 1rem;
    font-size: .92rem;
    font-weight: 700;

    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
      font-size: 1rem;
    }
    &:hover {
      background-color: $greyish-brown;
      color: $white;
      box-shadow: 0 0 3px 0 rgba($black, .32);
    }
    &::before {
      display: none;
    }
  }

  &--contained-grey {
    background-color: $white;
    color: $dark-grey;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    height: 30px;
    padding: 0 1rem;
    font-size: .92rem;
    font-weight: 700;
    
    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
      font-size: 1rem;
    }
    &:hover {
      background-color: $white;
      color: $greyish-brown;
      box-shadow: 0 0 3px 0 rgba($black, .32);
    }
    &::before {
      display: none;
    }
  }

  &--dropdown-item {
    background-color: $white;
    height: 2.2rem;
    padding: 0.5rem 1rem;
    box-shadow: none;
    width: 100%;
    text-align: left;
    display: inherit;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: 0;

    &:hover {
      background-color: rgba($grey, .2);
    }
    &::before {
      display: none;
    }
  }

  &--icon-btn {
    background-color: $bg-grey;
    color: $dark-grey;
    height: 1.5rem;
    width: 1.5rem;
    padding: 0;
    display: inherit;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    margin-right: .4rem;

    & i {
      font-size: 10px;
    }

    &:hover {
      background-color: $bg-grey;
      box-shadow: 0 0 3px 0 rgba($black, 0.25);
      color: $greyish-brown;
    }
    &::before {
      display: none;
    }
  }

  &--icon-btn-md {
    background-color: $bg-grey;
    color: $dark-grey;
    height: 2rem;
    width: 2rem;
    display: inherit;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    margin-right: .5rem;
    border-radius: 5px;

    & i {
      font-size: 1rem;
    }

    &:hover {
      background-color: $bg-grey;
      box-shadow: 0 0 3px 0 rgba($black, 0.25);
      color: $greyish-brown;
    }
    &::before {
      display: none;
    }
  }

   &--dropdown-btn {
    background-color: rgba($grey, .1);
    color: $dark-grey;
    height: 2.2rem;
    padding: 0.5rem 1rem;
    box-shadow: none;
    width: 100%;
    text-align: left;
    font-weight: 700;
    border-radius: 0;

    .button__content {
      text-align: left;
    }

    .button__left {
      padding: .4rem;
      background-color: rgba($grey, .15);
      border-radius: 3px;
      margin-right: .5rem;
      width: 10px;
      font-size: 10px;

      &:hover {
        color: $greyish-brown;
        background-color: rgba($grey, .4);
      }
    }

    &:hover {
      color: $greyish-brown;
      background-color: rgba($grey, .2);
    }
    &::before {
      display: none;
    }
  }
  &--cancel {
    background-color: transparent;
    color: $dark-grey;
    box-shadow: none;
    border: 1px solid $grey;

    &:hover {
      background-color: $light-grey;
      border: 1px solid $grey;
    }

    &::before {
      display: none;
    }
  }

  &--options-dark {
    background-color: $white;
    border: 1px solid $dark-grey;
    color: $dark-grey;
    border-radius: 20px;
    height: 32px;
    margin-right: 1rem;
    box-shadow: none;
    white-space: nowrap;
    box-sizing: border-box;

    &:hover {
      background-color: $white;
      color: $greyish-brown;
      border: 1px solid $greyish-brown;
    }
    &__active {
      background-color: $blue;
      color: $white;
      font-weight: 700;

      &:hover {
        background-color: $blue;
      }
    }

    &__disabled {
      background-color: $grey;
      color: $grey;
    }
  }

  &--contained-icon-white {
    background-color: $white;
    color: $orange;
    border: 1px solid $orange;
    height: 30px;
    padding: 0 10px;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    border-radius: 5px!important;
    
    & i {
      font-size: 1rem;
      //position: relative;
      //top: 2px;
    }
    &:hover {
      background-color: $white;
      box-shadow: 0 0 3px 0 rgba($black, 0.25);
      color: $orange;
      border: 1px solid $orange;
    }
    &::before {
      display: none;
    }
  }

  &--contained-icon-grey {
    background-color: $active-cell-color;
    color: $orange;
    border: 1px solid $active-cell-color;
    height: 30px;
    width: 30px;
    padding: 0;
    display: inherit;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    border-radius: 5px!important;
    
    & i {
      font-size: 1rem;
      position: relative;
      top: 2px;
    }
    &:hover {
      background-color: $active-cell-color;
      box-shadow: 0 0 3px 0 rgba($black, 0.25);
      color: $orange;
      border: 1px solid $active-cell-color;
    }
    &::before {
      display: none;
    }
  }

  &--options-dark-active {
    background-color: $blue;
    color: $white;
    font-weight: 700;
    border-radius: 20px;
    height: 32px;
    margin-right: 1rem;
    box-shadow: none;
    white-space: nowrap;
    box-sizing: border-box;

    &:hover {
      background-color: $blue;
      color: $white;
    }
  }

  &--primary-text {
    background-color: $white;
    color: $orange;
    box-shadow: none;
    height: 30px;
    padding: 0;

    .button__content {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      &__text {
        padding-left: .5rem;
        font-weight: 400;
        font-size: 1rem;
      }
    }
    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
    }
    &:hover {
      background-color: $white;
      color: darken($orange, 2%);
      box-shadow: none;
    }
    &::before {
      display: none;
    }
  }

  &--secondary-text {
    background-color: $white;
    color: $dark-grey;
    box-shadow: none;
    height: 30px;
    padding: 0;

    .button__content {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      &--text {
        padding-left: .5rem;
        font-weight: 400;
        font-size: 1rem;
      }
      &__text {
        padding-left: .5rem;
        font-weight: 400;
        font-size: 1rem;
      }
    }
    .button__left {
      padding: 0;
      margin-right: .5rem;
      width: inherit;
      font-size: 1rem;
    }
    &:hover {
      background-color: $white;
      color: $greyish-brown;
      box-shadow: none;
    }
    &::before {
      display: none;
    }
  }

  &--link-grey {
    background-color: transparent;
    color: $dark-grey;
    box-shadow: none;
    border: 1px solid transparent;

    .button__content {
      text-decoration: underline;
    }

    &:hover {
      background-color: transparent;
      text-decoration: underline;
    }

    &::before {
      display: none;
    }
  }

  &--link {
    background-color: transparent;
    color: $blue;
    box-shadow: none;
    border: 1px solid transparent;

    &:hover {
      background-color: transparent;
    }

    &::before {
      display: none;
    }
  }

  // -------------------
  // @TODO CHANGE THIS, is wrong abstraction

  &--orange-border {
    background-color: transparent;
    color: $orange;
    border: 1px solid $orange;
    box-shadow: none;

    .button__content {
      padding: 0.5rem;
    }

    &:hover {
      background-color: lighten($orange, 40%);
    }
  }

  &--white-border {
    background-color: transparent;
    color: $white;
    border: 1px solid $white;
    box-shadow: none;

    .button__content {
      padding: 0.3rem 0;
    }

    &:hover {
      background-color: rgba($grey, 0.5);
    }
  }

  &--fullsize {
    width: calc(100% - 2rem);
  }

  &--fullsize-no-padding {
    width: 100%;
  }
}
@media (max-width: $breakpoint-min-md) {
  .button {
    &--options {
      height: 30px;
      margin-right: .7rem;
    }
  }
}
</style>
