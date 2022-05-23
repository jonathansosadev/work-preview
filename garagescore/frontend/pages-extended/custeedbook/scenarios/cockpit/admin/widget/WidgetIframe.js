import Vue from 'vue';

export const WidgetIframe = Vue.component('WidgetIframe', {
  name: 'WidgetIframe',
  render: function(h) {
    return h('div', [
      h(
        'iframe',
        {
          domProps: {
            src: `${this.$props.iframeUrl.replace('<% shape %>', this.$props.shape).replace('<% brand %>', this.$props.brand)}&preview=true`,
            style: `height: ${this.$props.height}px; width: ${this.$props.width}px;`,
          }
        }
      ),
    ]);
  },
  props: {
    iframeUrl: {
      type: String,
      default: 'error'
    },
    height: {
      type: Number,
      default: 157,
    },
    width: {
      type: Number,
      default: 130,
    },
    shape: {
      type: String,
      default: 'rectangle'
    },
    brand: {
      type: String,
      default: 'garagescore'
    }
  },
});

export default {
  name: 'WidgetIframe',
  component: WidgetIframe,
  props: [
    {
      label: 'iframeUrl',
      value: `${process.env.www_url || ''}/widget/garage/cachan-auto/<% shape %>?size=xsmall&background=true&locale=fr-fr&brand=<% brand %>`,
      inputType: 'text',
    },
    {
      label: 'shape',
      value: 'rectangle',
      inputType: 'select',
      inputOptions: [
        'rectangle',
        'vertical',
        'banner',
      ]
    },
    {
      label: 'brand',
      value: 'garagescore',
      inputType: 'select',
      inputOptions: [
        'garagescore',
        'custeed',
      ]
    },
    {
      label: 'height',
      value: 157,
      inputType: 'number',
    },
    {
      label: 'width',
      value: 130,
      inputType: 'number',
    },
  ]
}
