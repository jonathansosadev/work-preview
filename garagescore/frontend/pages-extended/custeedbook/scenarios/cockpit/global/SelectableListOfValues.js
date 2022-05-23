import Vue from 'vue'
import SelectableListOfValues from "~/components/global/SelectableListOfValues.vue";
import { UserRoles } from "~/utils/enumV2";
const test = Vue.component("SelectableList", {
  name: 'SelectableList',
  render: function (createElement) {
    return createElement(
      'div',
      [
        createElement(SelectableListOfValues, {
          ref: 'SelectableListOfValues',
          props: {
            userRole: this.userRole,
            items: this.items,
            options: this.options,
            updateOption: () => alert('Modal Update will open '),
            deleteOption: () => alert('Modal Delete will open ')
          },
        }),
        createElement('div', [
          createElement('button', {
            domProps: {
              innerHTML: 'Get items selected'
            },
            on: { click: this.getItems }
          })
        ]),
        createElement('hr'),
        createElement('div', this.result)
      ]
    )
  },
  components: { SelectableListOfValues },
  props: {
    userRole: {
      type: String,
      default: ''
    },
    items:{
      type: Array,
      default: () => []
    },
    options:{
      type: Boolean,
      default: true
    }
  },
  data: function() {
		return {
			result: ''
		}
  },
  methods: {
    getItems() {
      const itemsSelected = this.$refs.SelectableListOfValues.getItemsSelected.toString()
      this.result = JSON.stringify(this.items.filter(item => itemsSelected.includes(item.key)).map(item=>item.value))
    }
  },
  
});


export default {
  component: test,
  props: [
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    },
    {
      label: 'items',
      value: [{ key: '1', value: 'Dupont' },
        { key: '2', value: 'Smith' },
        {key: '3', value: 'Smith 2'}
      ],
      inputType: 'json'
    },
    {
      label: 'options',
      value: true,
      inputType: 'checkbox'
    }
  ]
}
