<script>
import Vue from "vue";
import AppText from "./AppText";

export default {
  extends: AppText,
  props: ['value'],

  render(createElement) {
    return createElement(
      this.tag,
      {
        class: this.cssClasses,
        domProps: {
          innerHTML: this.formatedValue,
        }
      }
    );
  },

  computed: {
    formatedValue() {
      const value = this.value;
      const undefinedString = this.$t_locale('components/ui/FormattedValueWithMissingHandling')('undefined');
      if (!value) { return this.$t_locale('components/ui/FormattedValueWithMissingHandling')('undefined'); }
      if (Array.isArray(value)) { return this.formatArrayValue(value, undefinedString); }
      return value;
    },
  },

  methods: {
    formatArrayValue(value, undefinedString) {
      if(value.length === 0) { return undefinedString; }
      return value
        .map(v => (v === "Je ne sais pas" ? undefinedString : v))
        .join(", ");
    }
  }

};
</script>
