import TextAreaHighlight from "~/components/global/TextAreaHighlight.vue";

export default {
  component: TextAreaHighlight,
  props: [
    {
        label: 'labelTag',
        value: 'Ajouter une balise',
        inputType: 'text'
    },
    {
      label: 'labelTextarea',
      value:  'Votre réponse ici...',
      inputType: 'text'
    },
    {
      label: 'value',
      value:'',
      inputType: 'text'
    },
    {
      label:'itemsTag',
      value: [
        {label: 'Initial Name', value: "InitialName"},
        {label: 'Garage Name', value: "GarageName"},
        {label: 'Last Name', value: "LastName"},
        {label: 'First Name', value: "FirstName"},
        {label: 'Sign', value: "Sign"},
        {label: 'Collaborator', value: "Collaborator"},
        {label: 'Group Name', value: "GroupName"}
      ],
      inputType:'json'
    }
  ]
}