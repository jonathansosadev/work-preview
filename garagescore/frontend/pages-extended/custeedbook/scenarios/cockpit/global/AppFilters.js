import AppFilters from "~/components/global/AppFilters";

export default {
  component: AppFilters,
  props: [
    {
      label: 'loading',
      inputType: 'select',
      inputOptions: [
        true,
        false
      ]
    },
    {
      label: 'headerFilters',
      inpuType: 'select',
      inputOptions: [
        true,
        false
      ]
    }
  ]
}