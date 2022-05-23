<template>
  <div class="wrapper">
    <input
      type="checkbox"
      class="css-checkbox"
      :id="uniqueID"
      :disabled="disabled"
      :checked="checked"
      @change="updateInput"
    />
    <label
      v-tooltip="{ content: tooltipContent }"
      :for="uniqueID"
      :style="labelStyle"
      :class="labelBinding"
      name="checkbox1_lbl"
      class="css-label"
    >
      <span>
        {{ label }}
      </span>
    </label>
  </div>
</template>

<script>
export default {
  name: "CheckBox",
  props: {
    checked: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    onClick: Function,
    labelStyle: {
      type: String,
      required: false
    },
    labelClass: {
      type: String,
      default: ''
    },
    disabled:{
      type: Boolean,
      default: false
    },
    checkStyle: {
      type: String,
      default: 'blue'
    },
    tooltipContent: {
      type: String,
      default: ''
    },
    bold:{
      type: Boolean,
      default: false
    }
  },
  computed: {
    labelBinding(){
      const classBinding = {}
      classBinding[this.labelClass] = true
      classBinding[`${this.checkStyle}-check`] = true
      classBinding['input-disabled-orange'] = this.checkStyle === 'orange' && this.disabled
      classBinding['input-disabled-default'] = this.checkStyle ===  'blue' && this.disabled && !this.checked
      classBinding['input-disabled-default-check'] = this.checkStyle === 'blue' && this.disabled && this.checked
      classBinding['labelBold'] = this.bold;
      return classBinding
    },
  },
  data(){
    return {
      uniqueID: this._uid
    }
  },
  methods: {
    updateInput() {
      this.$emit('change', !(this.checked))
    }
  },
}
</script>

<style lang="scss" scoped>
label {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input[type=checkbox].css-checkbox {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
}

input[type=checkbox].css-checkbox + label.css-label {
	padding-left: 20px;
	height: 15px;
	display: inline-block;
	line-height: 15px;
	background-repeat: no-repeat;
	font-size: 1rem;
	vertical-align: middle;
	cursor: pointer;
}

input[type=checkbox].css-checkbox:checked + label.css-label {
	background-position: 0 -30px;
}

input[type=checkbox].css-checkbox + label.black {
  display: flex;
  align-items: center;
  color: $black;
  font-weight: 300;
  line-height: 1.43;
}
input[type=checkbox].css-checkbox:checked + label.black {
  color: $blue;
  font-weight: bold;
}
label.black{
  span{
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 170px;
  }
}

input[type=checkbox].css-checkbox + label.darkGray {
  display: flex;
  align-items: center;
  line-height: 1.54;
  color: $dark-grey;
  font-size: 0.929rem;
}

input[type=checkbox].css-checkbox:checked + label.darkGray {
  color: $blue;
}

input[type=checkbox].css-checkbox + label.orange {
  display: flex;
  align-items: center;
  line-height: 1.54;
  color: $orange;
  font-size: 0.929rem;
  background-position: 0 -15px;
}
input[type=checkbox].css-checkbox:checked + label.orange {
  color: $blue;
  background-position: 0 -30px;
}

.input-disabled-orange {
  background-position: 0 0px;
}

input[type=checkbox].css-checkbox + label.gray {
  display: flex;
  align-items: center;
  line-height: 1.54;
  color: $grey;
  font-size: 0.929rem;
}

label.gray{
  span{
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    max-width: 170px;
  }
}

.input-disabled-default {
  background-position: 0 -15px;
}
.input-disabled-default-check{
  background-position: 0 -45px !important;
  color: $blue-light !important;
}

.blue-check{background-image:url("/global/blue-check.png");}

.orange-check{background-image:url("/global/orange-check.png");}


input[type=checkbox].css-checkbox.med + label.css-label.med {
	padding-left:22px;
  height:17px;
	display:inline-block;
	line-height:17px;
	background-repeat:no-repeat;
	background-position: 0 0;
	font-size:15px;
	vertical-align:middle;
  cursor:pointer;
}

input[type=checkbox].css-checkbox.med:checked + label.css-label.med {
  background-position: 0 -17px;
}
input[type=checkbox].css-checkbox.sme + label.css-label.sme {
	padding-left:22px;
  height:16px;
	display:inline-block;
	line-height:16px;
	background-repeat:no-repeat;
	background-position: 0 0;
	font-size:15px;
	vertical-align:middle;
  cursor:pointer;
}
input[type=checkbox].css-checkbox.sme:checked + label.css-label.sme{
  background-position: 0 -16px;
}
input[type=checkbox].css-checkbox.lrg + label.css-label.lrg {
	padding-left:22px;
  height:20px;
	display:inline-block;
	line-height:20px;
	background-repeat:no-repeat;
	background-position: 0 0;
	font-size:15px;
	vertical-align:middle;
  cursor:pointer;
}

input[type=checkbox].css-checkbox.lrg:checked + label.css-label.lrg{
  background-position: 0 -20px;
}

.labelBold{
  font-weight: bold;
}

</style>
