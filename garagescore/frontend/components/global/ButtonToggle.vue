<template>
  <div class="button-toggle">
    <div class="button-toggle__content">
      <button @click="selectedOptionToggle(firstOption.value)" :class="[firstOptionChecked ? 'active': '']"><span>{{firstOption.label}}</span></button>
      <button @click="selectedOptionToggle(secondOption.value)" :class="[!firstOptionChecked ? 'active': '']"><span>{{secondOption.label}}</span></button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ButtonToggle',
  props:{
    firstOption:{
      type: Object,
      default: {
        label: 'Option 1',
        value: 'option1'
      }
    },
    secondOption:{
      type: Object,
      default: {
        label: 'Option 2',
        value: 'option2'
      }
    },
    selectedOption:{
      type: Function,
      default: () => console.error('ButtonToggle.vue :: selectedOption is not set')
    },
    optionSelected: {
      type: String,
      default: 'option1' 
    }
  },
  computed :{
    firstOptionChecked() {
      return this.firstOption.value === this.optionSelectedValue
    }
  },
  data() {
    return {
      optionSelectedValue: this.optionSelected
    }
  },
  methods: {
    selectedOptionToggle(value){
      this.optionSelectedValue = value
      this.selectedOption(value)
    },
  },
}
</script>
<style lang="scss">
  .button-toggle{
    display: flex;
    &__content{
      display: inline-flex;
      justify-content: center;
      align-content: center;
      border-radius: 5px;
      background-color: #e8e8e8;
      padding: 0.071rem;
      width: 100%;
      button{
        width: 100%;
        min-width: 7.786rem;
        border-radius: 5px;
        color: $dark-grey;
        background: transparent;
        border: none;
        font-size: 0.714rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0.214rem 0.714rem 0.286rem 0.786rem;
        span{
          white-space: nowrap;
          padding-right: 0.5rem;
        }
      }
      .active{
        box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.16);
        background-color: $white;
        color: $blue;
        opacity: 100;
        font-weight: 900;
      }
    }
  }
</style>