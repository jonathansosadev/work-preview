<template>
  <div class="wizard-step-plan">
    <DatePicker ref="datepicker" v-model="selectedDate" v-bind="datePickerProps" v-on:change="validate()">
    </DatePicker>
  </div>
</template>

<script>

export default {
  data() {
    return {
      selectedDate: "",
      beforeDate: this.$moment().endOf('day').valueOf(),
      disabledDate: (date) => this.$moment(date, 'DD-MM-YYYY').isBefore(this.$moment().endOf('day'))
    }
  },
  computed: {
    datePickerProps() {
      return {
        placeholder: this.$t_locale('components/global/WizardStepPlan')('selectDate'),
        type: 'date',
        disabledDate: this.disabledDate,
        valueType: 'YYYY-MM-DD', // To allow for new Date(selectedDate). If I choose date here it messes with timezone
        firstDayOfWeek: 1,
      }
    }
  },
  methods: {
    validate() {
      const selectedDate = new Date(this.selectedDate)
      if (selectedDate.getTime() > this.beforeDate) {
        this.$emit('validate', selectedDate);
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.wizard-step-plan {
  width: 100%;
  display:  flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.714rem;

  .footer-handler{
    width:100%;
    &__button{
      margin:0 auto 1rem auto;
    }
  }
}
</style>
