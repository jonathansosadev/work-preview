/** A single, editable, likable, commentable idea, displayed usually in list */
import AddFields from "~/components/global/AddFields";
export default {
  component: AddFields,
  props: [
    {
      label: 'fieldsByCategories',
      value: [
        {
          title: 'Leads',
          fields: [
            { title: 'Lele', id: 'leleId' },
            { title: 'Lolo', id: 'loloId' }
          ]
        },
        {
          title: 'Mécontents',
          fields: [
            {
              title: 'Critères Insat. APV 1',
              id: 'tataId',
              subfields: [
                { title: 'Accueil', id:'accueilId' },
                { title: 'Conseil', id:'conseilId' },
                { title: 'Devis', id:'devisId' },
                { title: 'Engagement', id:'engagementId' },
                { title: 'Qualité', id:'qualiteId' }
              ]
            },
            {
              title: 'Critères Insat. APV 2',
              id: 'tataId2',
              subfields: [
                { title: 'Biloute', id:'bilouteId' },
                { title: 'Zboub', id:'zboubId' },
              ]
            },
            { title: 'Critère Insat. Contrôle Technique 1', id: 'totoId' },
          ]
        }
      ],
      inputType: 'json',
    },
  ]
}
