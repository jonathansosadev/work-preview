<script>
import Vue from "vue";
import AppText from "./AppText";

export default {
  extends: AppText,
  props: ['startDate', 'endDate'],

  render(createElement) {
    return createElement(
      this.tag,
      {
        class: this.cssClasses,
        domProps: {
          innerHTML: this.formatedElapsedTime
        }
      }
    );
  },

  computed: {
    formatedElapsedTime() {
      const moment = this.$moment;
      const startDate = moment(this.startDate);
      const endDate = this.endDate ? moment(this.endDate) : moment();
      const elapsedTime = moment.duration(moment(endDate).diff(startDate));
      return this.formatElapsedTime(elapsedTime);
    },
  },

  methods: {
    formatElapsedTime(elapsedTime) {
      const days = elapsedTime.days();
      const hours = elapsedTime.hours();
      const minutes = elapsedTime.minutes();
      const dayUnit = this.$t_locale('components/ui/ElapsedTime')('day');
      const hourUnit = this.$t_locale('components/ui/ElapsedTime')('hour');
      const minUnit = this.$t_locale('components/ui/ElapsedTime')('minute');
      if (!days && !hours && !minutes) { return `1${minUnit}`; }
      if (!days && !hours) { return `${minutes}${minUnit}`; }
      if (!days && !minutes) { return `${hours}${hourUnit}`; }
      if (!days) { return `${hours}${hourUnit} ${minutes}${minUnit}`; }
      return `${days}${dayUnit} ${this.roundHours(hours, minutes)}${hourUnit}`;
    },
    roundHours(hours, minutes) {
      if (minutes >= 30) { return hours + 1; }
      return hours;
    }
  }
}
</script>
