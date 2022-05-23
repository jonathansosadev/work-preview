/** Form to add an Idea */
import AddIdea from "~/components/ideabox/AddIdea";
export default {
  component: AddIdea,
  props: [
        {
          label: 'currentUser',
          value: 'awettling',
          inputType: 'select',
          inputOptions: [
            'awettling',
            'jscarinos'
          ]
        },
        {
          label: 'categories',
          value: ['Automation', 'XLeads', 'Prospection', 'Marketing et Communication', 'Cockpit', 'Analytics', 'Enquêtes', 'Alertes', 'Rapports clients', 'Certificat', 'Widget', 'Organisationnel', 'Amélioration boite à idées', 'Monétisation', 'Technique', 'Divers'],
          inpuType: 'json',
        },
        {
          label: 'userSaved',
          value: (user, title, category) => {
            alert(`${user} add the idea [${category}] ${title}`);
          }
        },
        {
          label: 'userCancelled',
          value: () => {
            alert('User cancelled');
          }
        },
      ]
}