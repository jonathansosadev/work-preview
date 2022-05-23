import Vue from 'vue'
import ModalAdminTag from '~/components/global/ModalAdminTag.vue';
import { resetAllRecordedPageTimes } from '~/static/tracking/user-tracking';

const test = Vue.component("ModalAdminTag", {
  name: 'ModalAdminTag',
  render: function (createElement) {
    return createElement(
      'div',
      [
        createElement(ModalAdminTag, {
          ref: 'ModalAdminTag',
          props: {
            garagesOptions: this.garagesOptions,
            id: this.id,
            nameValue: this.nameValue,
            garagesIds: this.garagesIds,
            closeModal: this.closeModal,
            createNewTag: this.createNewTag,
            updateTag: this.updateTag
          },
        }),
        createElement('hr'),
        createElement('div', this.result)
      ]
    )
  },
  components: { ModalAdminTag },
  props: {
    id: {
      type: String,
      default: ''
    },
    nameValue: {
      type: String, 
      default: ''
    },
    garagesIds: {
      type: Array,
      default: () => [],
    },
    garagesOptions: {
      type: Array,
      default: () => []
    },
  },
  data: function() { return { result: '' } },
  methods: {
    closeModal() {
      alert('Closing Modal')
    },
    createNewTag(data) {
      this.result = `Saving ${JSON.stringify(data)}`
    },
    updateTag(data) {
      this.result = `Updating ${JSON.stringify(data)}`
    }
  },
  
});

export default {
  component: test,
  props: [
    {
      label: 'garagesOptions',
      value: [
        {
          "label": "GarageScore",
          "value": "1"
        },
        {
          "label": "Manager",
          "value": "2"
        },
        {
          "label": "E-Réputation",
          "value": "3"
        },
        {
          "label": "Automation",
          "value": "4"
        },
        {
          "label": "XLeads",
          "value": "5"
        }
      ],
      inputType: 'json',
    },
    {
      label: 'id',
      value: '',
      inputType: 'text'
    },
    {
      label: 'nameTag',
      value: '',
      inputType: 'text'
    },
    {
      label: 'garagesIds',
      value: [{"label":"GarageScore","value":"1"}, {"label":"Manager","value":"2"}],
      inputType: 'json'
    }
  ],
};