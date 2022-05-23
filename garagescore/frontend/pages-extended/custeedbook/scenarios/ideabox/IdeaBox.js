/** IdeasList with add button */
import IdeaBox from "~/components/ideabox/IdeaBox";
const ideas =
[
    {
        "_id" : "58e80f496d25c51a00725456",
        "title" : "Pour le suivi des leads, envisager un questionnaire à M+x en se servant du prétexte de l'évaluation du véhicule,pour savoir si il a concrétisé son achat et où il l'a effectué",
        "author" : "awettling",
        "category" : "Enquêtes",
        "likes" : [],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-04-07T22:14:33.868Z"),
        "updatedAt" : new Date("2017-04-07T22:14:33.868Z")
    },
    {
        "_id" : "5953d16b72687e1a008e027a",
        "title" : "demande nomblot : ajouter dans les alertes le nom du réceptionnaire/vendeur",
        "author" : "bbodrefaux",
        "category" : "Alertes",
        "likes" : [],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-06-28T15:55:23.693Z"),
        "updatedAt" : new Date("2017-06-28T15:55:23.693Z")
    },
    {
        "_id" : "591d9b172ec0da1a00fb46dd",
        "title" : "MB Paris : voir la nouvelle note du J+7 pour ceux qui ont dit \"oui je souhiate changer ma note\n\"",
        "author" : "bbodrefaux",
        "category" : "Cockpit",
        "likes" : [ 
            "oabida", 
            "bdechenaud", 
            "awettling", 
            "demo", 
            "abiarneix", 
            "adamase", 
            "eguillou", 
            "oguillemot"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-18T13:01:11.843Z"),
        "updatedAt" : new Date("2017-05-29T13:29:18.878Z")
    },
    {
        "_id" : "591c6b240261751a00132b26",
        "title" : "différencier le taux de recommandation par secteur (APV/VN/VO) sur cockpit",
        "author" : "abiarneix",
        "category" : "Prospection",
        "likes" : [ 
            "oabida", 
            "bdechenaud", 
            "demo", 
            "adamase", 
            "lfrechin", 
            "oguillemot"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-17T15:24:20.729Z"),
        "updatedAt" : new Date("2017-05-29T13:30:22.385Z")
    },
    {
        "_id" : "591e9b5cffc7951a0045c024",
        "title" : "possibilité d'imprimer les médailles de score pour affichage façon TripAdvisor pour les hôtels (idée de P. Le Crom Opel Pontivy",
        "author" : "bdechenaud",
        "category" : "Marketing et Communication",
        "likes" : [ 
            "bdechenaud", 
            "dkali", 
            "cseguy", 
            "demo", 
            "eguillou", 
            "oguillemot"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-19T07:14:36.426Z"),
        "updatedAt" : new Date("2017-05-29T13:25:47.851Z")
    },
    {
        "_id" : "5922ec00ba8e6a1a00586732",
        "title" : "Ne pas comptabiliser la connexion \"en tant que\" quand nous allons sur la session d'un client ",
        "author" : "demo",
        "category" : "Prospection",
        "likes" : [ 
            "oabida", 
            "awettling", 
            "demo", 
            "dkali", 
            "abiarneix", 
            "adamase", 
            "eguillou", 
            "lfrechin", 
            "oguillemot", 
            "bdechenaud", 
            "tauzou", 
            "mkouakoukan"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-22T13:47:44.509Z"),
        "updatedAt" : new Date("2018-03-21T15:12:41.068Z")
    },
    {
        "_id" : "591f13aaffc7951a00467f94",
        "title" : "Filtrer les taux de remplissage e-mail/sms sur analytics par secteur (APV vs VN/VO)",
        "author" : "demo",
        "category" : "Prospection",
        "likes" : [ 
            "oabida", 
            "abiarneix"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-19T15:47:54.360Z"),
        "updatedAt" : new Date("2017-05-23T09:16:08.065Z")
    },
    {
        "_id" : "5923f270f372661a0096608f",
        "title" : "Pouvoir saisir les informations sur un Lead concrétiser dans cockpit et demander l'envoie d'une enquête de satisfaction.",
        "author" : "oabida",
        "category" : "Cockpit",
        "likes" : [ 
            "oabida", 
            "lfrechin", 
            "bdechenaud"
        ],
        "comments" : [],
        "open" : true,
        "createdAt" : new Date("2017-05-23T08:27:28.056Z"),
        "updatedAt" : new Date("2017-05-31T14:12:53.929Z")
    },
    {
        "_id" : "5923f249f372661a0096608b",
        "title" : "Fonction traitée / pas traité + remarque pour les clients mécontents (comme réalisé dans l'interface de gestion de la pression)\nObjectif : permettre la traçabilité et le partage d'informations entre les gestionnaires des clients mécontents chez nos clients",
        "author" : "oguillemot",
        "category" : "Prospection",
        "likes" : [ 
            "oabida", 
            "awettling", 
            "dkali", 
            "adamase", 
            "eguillou", 
            "oguillemot", 
            "bdechenaud"
        ],
        "comments" : [ 
            {
                "author" : "oabida",
                "comment" : "On peut donner la possibilité de choisir les colonnes à afficher dans cokpit de façon à afficher le mélange des colonnes actuellement sur cockpit et celle de la page 'qualification des contacts'",
                "createdAt" : new Date("2017-05-23T08:29:21.147Z")
            }
        ],
        "open" : true,
        "createdAt" : new Date("2017-05-23T08:26:49.814Z"),
        "updatedAt" : new Date("2017-05-31T14:13:00.669Z")
    },
    {
        "_id" : "592835719ab17c1a0024b89e",
        "title" : "Faire un certificat groupe ?\n=> faire pointer les widget groupes\n=> avoir des rich snippets pour les sites de groupes",
        "author" : "jscarinos",
        "category" : "Certificat",
        "likes" : [ 
            "tauzou", 
            "lfrechin", 
            "demo", 
            "bdechenaud", 
            "oabida"
        ],
        "comments" : [ 
            {
                "author" : "tauzou",
                "comment" : ":+1:",
                "createdAt" : new Date("2017-05-26T14:07:31.232Z")
            }
        ],
        "open" : true,
        "createdAt" : new Date("2017-05-26T14:02:25.197Z"),
        "updatedAt" : new Date("2017-06-01T07:22:23.407Z")
    }
];
export default {
  component: IdeaBox,
  props: [
    {
          label: 'currentUser',
          value: 'jscarinos',
          inputType: 'text',
        },
        {
          label: 'categories',
          value: ['Automation', 'XLeads', 'Prospection', 'Marketing et Communication', 'Cockpit', 'Analytics', 'Enquêtes', 'Alertes', 'Rapports clients', 'Certificat', 'Widget', 'Organisationnel', 'Amélioration boite à idées', 'Monétisation', 'Technique', 'Divers'],
      },
      {label: 'ideas',
          value:ideas.slice(5)
        },

        {
          label: 'fetchIdeas',
            value: async ({ }) => {
            return { hasMore: true, ideas: ideas.slice(0, 5) };
          }
        },
        {
          label: 'postIdea',
          value: async () => {}
        },
        {
          label: 'updateIdea',
          value: async () => {}
        },
        {
          label: 'likeIdea',
          value: async () => {}
        },
        {
          label: 'commentIdea',
          value: async () => {}
        },
        {
          label: 'updateIdeaComment',
          value: async () => {}
        },
      ]
}