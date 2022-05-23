import Vue from 'vue';

const Toast = Vue.component('Toast', {
  name: 'Toast',
  render: function(createElement) {
    return createElement('button', {
      domProps: {
        innerHTML: 'Faire apparaître une notification'
      },
      on: {
        click: () => this.$toast[this.type](`Ceci est un toast de type ${this.type}`)
      }
    });
  },
  props: {
    type: {
      type: String,
      default: 'error'
    }
  },
});

export default {
  name: 'Toast',
  component: Toast,

  props: [
    {
      label: 'type',
      value: 'error',
      inputType: 'select',
      inputOptions: [
        'info',
        'success',
        'error',
        'warning'
      ]
    }
  ]
}