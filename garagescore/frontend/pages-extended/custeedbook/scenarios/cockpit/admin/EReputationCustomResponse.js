import CustomResponse from "~/components/cockpit/admin/CustomResponse.vue";

export default {
  component: CustomResponse,
  props: [
    {
      label: 'customResponses',
      value: [{
        _id: '"619968e4087fed0ca9e4bf91"',
        title:"Remerciement",
        content: "Bonjour @InitialName \nMerci d'avior pris le temps de nous lassier votre avis\nBonne journèe\nasd\nL'equipe @GarageName",
        contentTemp: "<div class=\"title\">Remerciement</div><div class=\"body\">Bonjour <span style=\"background: #e0e0e0; border-radius: 3px; padding: .2rem .25rem; font-weight: 700;\">@Iniciales del nombre y Apellido del Cliente</span> \nMerci d'avior pris le temps de nous lassier votre avis\nBonne journèe\nasd\nL'equipe <span style=\"background: #e0e0e0; border-radius: 3px; padding: .2rem .25rem; font-weight: 700;\">@Nombre del taller</span></div><div class=\"footer\">Modificado 22/11/2021 por C.T.</div>",
        ratingCategories: [
          'promoter',
          'passive',
          'detractor'
        ],
        sources: [
          'DataFile',
          'Google',
          'Facebook'
        ],
        garageIds: ['577a30d774616c1a0056c263', '5ca1d4b04a7aa10015fc9eba'],
        automated: true,
        createdAt: "2021-11-20T21:30:12.856Z",
        createdBy: "Cus Teed",
        updatedAt: "2021-11-22T20:06:20.030Z",
        updatedBy: "Cus Teed"
      }],
      inputType: 'json',
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    }
  ]
}
