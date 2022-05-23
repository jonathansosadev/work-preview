import Vue from 'vue';

const WidgetIframe = Vue.component('WidgetIframe', {
  name: 'WidgetIframe',
  render: function(h) {
    return h('div', [
      h(
        'iframe',
        {
          domProps: {
            src: `${this.$props.iframeUrl}&preview=true`,
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
  },
});

export default {
  name: 'WidgetIframe',
  component: WidgetIframe,
  props: [
    {
      label: 'iframeUrl',
      value: `${process.env.www_url || ''}/widget/garage/cachan-auto/rectangle?size=xsmall&background=true&locale=fr-fr&brand=garagescore`,
      inputType: 'text',
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
