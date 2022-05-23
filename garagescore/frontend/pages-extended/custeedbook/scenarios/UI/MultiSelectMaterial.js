/** A single, editable, likable, commentable idea, displayed usually in list */
import MultiSelectMaterial from "~/components/ui/MultiSelectMaterial";
export default {
  component: MultiSelectMaterial,
  props: [
    {
      label: 'placeholder',
      value: `Recherchez un établissement`,
      inputType: 'text'
    },
    {
      label: 'options',
      value: [ { label: "GarageScore", value: "1" }, { label: "Manager", value: "2" }, { label: "E-Réputation", value: "3" }, { label: "Automation", value: "4" }, { label: "XLeads", value: "5" } ],
      inputType: 'json',
    },
    {
      label: 'multiple',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'noResult',
      value: 'Aucun garage ne correspond à cette recherche',
      inputType: 'text',
    },
    {
      label: 'disabled',
      value: false,
      inputType: 'checkbox',
    },
  ],
}