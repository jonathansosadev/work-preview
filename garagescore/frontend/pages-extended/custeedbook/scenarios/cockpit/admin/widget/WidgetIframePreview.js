import WidgetIframePreview
  from "~/components/cockpit/admin/widget/WidgetIframePreview.vue";

export default {
  component: WidgetIframePreview,
  props: [
    {
      label: 'slug',
      value: 'cachan-auto',
      inputType: 'text'
    },
    {
      label: 'iframeStyle',
      value: '',
      inputType: 'text'
    },
    {
      label: 'baseUrlScript',
      value: `${process.env.www_url || ''}/seo/garage`,
      inputType: 'text'
    },
    {
      label: 'iframeUrl',
      value: `${process.env.www_url || ''}/widget/garage/cachan-auto/rectangle?size=xsmall&background=true&locale=fr-fr&brand=garagescore`,
      inputType: 'text'
    },
  ]
}
