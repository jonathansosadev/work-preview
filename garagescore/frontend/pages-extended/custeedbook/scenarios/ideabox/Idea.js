/** A single, editable, likable, commentable idea, displayed usually in list */
import Idea from "~/components/ideabox/Idea";
export default {
  component: Idea,
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
          label: '_id',
          value: 1,
          inputType: 'text'
        },
        { 
          label: 'userLiked',
          value: (user,_id,like) => {
            if(like) {
              alert(`${user} like the idea #${_id}`);

            } else {
              alert(`${user} unlike the idea #${_id}`);
            }
          }
        },
        { 
          label: 'userCommented',
          value: (user,_id,comment) => {
            alert(`${user} left a comment: ${comment}`);
          }
        },
        { 
          label: 'userUpdatedContentOrStatus',
          value: (user, _id, title, category, status) => {
            alert(`${user} edited: [${status?"open":"closed"}] ${category} ${title}`);
          }
    },
        { 
          label: 'userUpdatedIdeaComment',
          value: (user, _id, commentNumber, comment) => {
            alert(`${user} edited comment #${_id}_${commentNumber}: ${comment}`);
          }
    },
        
        
        {
          label: 'title',
          value: 'Dans les enquêtes suite à un achat VO, introduire un questionnaire pour savoir si le client compte faire l\'entretien à la concession et si non pourquoi',
          inputType: 'text'
        },
        {
          label: 'author',
          value: 'awettling',
          inputType: 'text'
        },
        {
          label: 'category',
          value: 'Enquêtes',
          inputType: 'text'
        },
        {
          label: 'likes',
          value: ["awettling"],
          inputType: 'json',
        },
        {
          label: 'comments',
          value: [],
          inputType: 'json',
        },
        {
          label: 'open',
          value: true,
          inputType: 'checkbox',
        },
        {
          label: 'createdAt',
          value: new Date("2017-04-07T22:14:18.393Z"),
          inputType: 'json',
        },
        {
          label: 'updatedAt',
          value: new Date("2017-05-23T08:29:29.767Z"),
          inputType: 'json',
        },
        {
          label: 'categories',
          value: ['Automation', 'XLeads', 'Prospection', 'Marketing et Communication', 'Cockpit', 'Analytics', 'Enquêtes', 'Alertes', 'Rapports clients', 'Certificat', 'Widget', 'Organisationnel', 'Amélioration boite à idées', 'Monétisation', 'Technique', 'Divers'],
          inpuType: 'json',
        },
        {
          label: 'isNew',
          value: true,
          inputType: 'checkbox',
        },
      ]
}