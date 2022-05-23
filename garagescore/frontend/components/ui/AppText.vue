<script>
import Vue from "vue";

export default {
  props: {
    type: String,
    bold: Boolean,
    extraBold: Boolean,
    nowrap: Boolean,
    italic: Boolean,
    lineThrough: Boolean,
    tag: String,
    size: String,
    align: String,
    light: Boolean
  },

  render(createElement) {
    return createElement(
      this.tag,
      {
        class: this.cssClasses,
      },
      this.$slots.default
    );
  },

  computed: {
    // Computed property used in extended components from AppText to keep styling behaviour (Ex: ./ElapsedTime.vue)
    cssClasses: function() {
      return {
        text: true,
        "text--bold": this.bold === true,
        "text--extra-bold": this.extraBold === true,
        "text--nowrap": this.nowrap === true,
        "text--line-through": this.lineThrough === true,
        "text--italic": this.italic === true,
        "text--danger": this.type === "danger",
        "text--primary": this.type === "primary",
        "text--warning": this.type === "warning",
        "text--warning-darker": this.type === "warning-darker",
        "text--success": this.type === "success",
        "text--muted": this.type === "muted",
        "text--muted-light": this.type === "muted-light",
        "text--gold": this.type === "gold",
        "text--orange": this.type === "orange",
        "text--golden": this.type === "golden",
        "text--erep-gold": this.type === "erep-gold",
        "text--black": this.type === "black",
        "text--xs": this.size === "xs",
        "text--sm": this.size === "sm",
        "text--sm-larger": this.size === "sml",
        "text--md-smaller": this.size === "mds",
        "text--md": this.size === "md",
        "text--md-medium": this.size === "mdm",
        "text--md-larger": this.size === "mdl",
        "text--lg": this.size === "lg",
        "text--lg-larger": this.size === "lgl",
        "text--xl": this.size === "xl",
        "text--center": this.align === "center",
        "text--justify": this.align === "justify",
        "text--light": this.light === true
      }
    },
  }

};
</script>


<style lang="scss" scoped>
.text {
  margin: 0;
  padding: 0;
  font-weight: normal;

  &--center {
    text-align: center;
  }

  &--justify {
    text-align: justify;
  }

  &--line-through {
    text-decoration: line-through;
  }

  &--primary {
    color: $blue;
  }

  &--warning {
    color: $yellow;
  }

  &--warning-darker {
    color: $yellow-darker;
  }

  &--danger {
    color: $red;
  }

  &--black {
    color: $black;
  }

  &--success {
    color: $green;
  }

  &--gold {
    color: $gold;
  }

  &--muted {
    color: $dark-grey;
  }

  &--muted-light {
    color: $grey;
  }

  &--orange {
    color: $orange;
  }

  &--golden {
    color: $golden;
  }

  &--erep-gold {
    color: $erep-gold;
  }

  &--bold {
    font-weight: 700;
  }

  &--extra-bold {
    font-weight: 900;
  }

  &--light {
    font-weight: 300;
  }

  &--nowrap {
    white-space: nowrap;
  }

  &--italic {
    font-style: italic;
  }

  &--xs {
    line-height: 1rem;
    font-size: 0.75rem;
  }

  &--sm {
    line-height: 1rem;
    font-size: 0.8rem;
  }

  &--sm-larger {
    line-height: 1rem;
    font-size: 0.85rem;
  }

  &--md-smaller {
    line-height: 1.5;
    font-size: 0.92rem;
  }

  &--md {
    font-size: 1.2rem;
  }

  &--md-medium {
    font-size: 1.14rem;
  }

  &--md-larger {
    font-size: 1.3rem;
  }

  &--lg {
    font-size: 1.5rem;
  }

  &--lg-larger {
    font-size: 1.9rem;
  }

  &--xl {
    font-size: 2rem;
  }
}
</style>
