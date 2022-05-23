import TagSelector from "~/components/global/TagSelector";

export default {
  component: TagSelector,
  props: [
    {
      label: 'tags',
      inputType: 'json',
      value: [
        { id: '1', label: 'Par établissements', icon: 'icon-gs-garage', tooltip: 'Exporter les données établissements' },
        { id: '2', label: 'Par collaborateurs', icon: 'icon-gs-group', tooltip: 'Exporter les données collaborateurs' },
        { id: '3', label: 'Par clients', icon: 'icon-gs-customer', tooltip: 'Exporter les données clients', subTags: [
            { id: '4', label: 'Avis', icon: 'icon-gs-chat-bubble', tooltip: 'Exporter le détail des avis' },
            { id: '5', label: 'Mécontents', icon: 'icon-gs-sad', tooltip: 'Exporter le détail des mécontents' },
            { id: '6', label: 'Leads', icon: 'icon-gs-car-repair', tooltip: 'Exporter le détail des leads' },
            { id: '7', label: 'Contacts', icon: 'icon-gs-database', tooltip: 'Exporter le détail des contacts', disabled: true },
            { id: '8', label: 'E-Réputation', icon: 'icon-gs-desktop-star', tooltip: 'Exporter le détail de E-réputation' },
          ]
        },
      ]
    },
  ]
}
