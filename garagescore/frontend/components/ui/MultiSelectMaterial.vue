<template>
<div class="multiselect-component">
  <Multiselect
    :placeholder="placeholder"
    label="label"
    :track-by="trackBy"
    tag-placeholder="Add this as new tag"
    v-model="inputValue"
    :multiple="multiple"
    :hide-selected="true"
    :options="options"
    :disabled="disabled"
    :select-label="''"
    v-bind="$attrs"
    v-tooltip="{ content: tooltip }"
  >
    <template slot="noResult">{{ noResult }}</template>
  </Multiselect>
  <span class="label" v-if="label">
    {{ label }}
    <AppText tag="span" type="orange" v-if="required" class="multiselect-component__required">*</AppText>
  </span>
</div>
</template>

<script>
export default {
  name:"MultiSelectMaterial",
  inheritAttrs: false,
  props: {
    value: [String, Number, Date, Array, Object],
    placeholder: String,
    options: Array,
    multiple: Boolean,
    disabled: Boolean,
    tooltip: String,
    noResult: String,
    label: String,
    required: Boolean,
    trackBy: {
      type: String,
      default: 'value'
    },
    comparatorFunction: Function
  },
  computed: {
    inputValue: {
      get () { return this.value },
      set (value) {
        const key = this.trackBy || 'value';
        if(this.comparatorFunction) {
          const option = this.comparatorFunction({options : this.options, key, value});
          if(option) {
            this.$emit('input', option);
          }
        }
        else {
          this.$emit('input', this.options.filter((e) => value.map((f) => f[key]).includes(e[key])));
        }
      },
    },
  }
};
</script>

<style lang="scss" scoped>

.multiselect-component {
  position: relative;

  .label{
    position: absolute;
    top: -12px;
    font-size: .8rem;
    color: $dark-grey;
  }
  &__required {
    margin-left: 0.15rem;
  }
}

::v-deep .multiselect__tag {
  position: relative;
  z-index: 1;
  border-radius: 20px;
  border: solid 1px $grey;
  background: $white;
  color: $blue;
  font-size: .92rem;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  margin-right: .5rem;
  line-height: inherit;
  margin-bottom: 3px;
  padding: .3rem 2.5rem .3rem 1rem;
}
::v-deep.multiselect__tag-icon {
  background: $dark-grey;
  color: $white;
  width: 1rem;
  height: 1rem;
  border-radius: 100%;
  top: .4rem;
  right: 1rem;
  border: 1px solid $dark-grey;
}
::v-deep.multiselect__tag-icon:hover {
  background: $greyish-brown;
  border: 1px solid $greyish-brown;
}

::v-deep .multiselect__tag-icon::before, ::v-deep .multiselect__tag-icon::after {
	position: absolute;
	top: 5px;
	left: 2px;
	width: 8px;
	height: 2px;
	content: "";
	background-color: $white;
	}
::v-deep .multiselect__tag-icon::before {
	-ms-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
	transform: rotate(-45deg);
	}
::v-deep.multiselect__tag-icon::after {
	-ms-transform: rotate(45deg);
	-webkit-transform: rotate(45deg);
	transform: rotate(45deg);
	}
::v-deep.multiselect__tag-icon:hover { cursor: pointer; }
::v-deep.multiselect__tag-icon:hover::before, ::v-deep.multiselect__tag-icon:hover::after { display: block; }



::v-deep .multiselect__input {
  position: relative!important;
  display: inline-block;
  min-height: 2rem;
  line-height: 20px;
  width: 100%!important;
  top:0;
  left: 0;
  padding-right: 25px!important;
  text-overflow: ellipsis;
  border: none;
  border-radius: 0;
  background: transparent;
  color: $black;
  padding: 0;
  transition: border .1s ease;
  box-sizing: border-box;
  margin-bottom: 0;
  vertical-align: top;
}
::v-deep .multiselect__option {
  height: 30px;
  font-family: 'Lato', sans-serif;
  color: $black;
  font-size: 1rem;
  font-weight: 300;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: .5rem 1rem;
  min-height: 31px;
  text-decoration: none;
  text-transform: none;
  vertical-align: middle;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
}
::v-deep .multiselect__option--highlight {
  background: rgba($grey, .2);
}
::v-deep .multiselect__option:hover {
  background: rgba($grey, .2);
}
::v-deep .multiselect__tags {
  border-radius: 0;
  border: none;
  border-bottom: 2px solid $grey;
  padding-left: 0;
  padding-right: 40px;
}
::v-deep .multiselect__placeholder {
    display: none;
}
::v-deep .multiselect__option--disabled {
  background: $white!important;
  color: $grey!important;
  cursor: help;
  pointer-events: inherit;
}
::v-deep .multiselect__content-wrapper {
  max-height: 180px!important;
}
::v-deep .multiselect__input::placeholder {
  position: relative!important;
  color: $grey!important;
  top: -2px!important;
}
::v-deep .multiselect__tags:hover {
  border-bottom: 2px solid $greyish-brown!important;
}
::v-deep .multiselect__select {
  widows: 25px!important;
}
</style>
