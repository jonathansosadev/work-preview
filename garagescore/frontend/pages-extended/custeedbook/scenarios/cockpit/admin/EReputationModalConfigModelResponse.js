import ModalConfigModelResponse from "~/components/cockpit/admin/ModalConfigModelResponse.vue";

export default {
  component: ModalConfigModelResponse,
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
      label: 'itemsTag',
      value: [
        {
          "label": "Initiales du Client",
          "value": "1"
        },
        {
          "label": "Nom du garage",
          "value": "2"
        },
        {
          "label": "Mon nom",
          "value": "3"
        },
        {
          "label": "Signataire enquete",
          "value": "4"
        },
        {
          "label": "Nom du groupe",
          "value": "5"
        }
      ],
      inputType: 'json',
    },
  ]
}
