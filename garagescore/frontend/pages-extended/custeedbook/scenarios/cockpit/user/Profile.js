import Profile from '~/components/cockpit/user/Profile';

const user = {
  "id": "58d3f892e325651a00d902e5",
  "garageIds": ["5609171770ad25190055d4fc", "5609173770ad25190055d4fd", "5609174f70ad25190055d4fe", "5609175e70ad25190055d4ff", "5609177770ad25190055d500", "5609178370ad25190055d501", "5745ba2ca5acd11a004cb748", "5745bd1da5acd11a004cb767", "5745bebba5acd11a004cb76c", "581b39779a66dd1900212dfa", "5824902fc15c611a00d53dd3", "582491d0c15c611a00d53e08", "583c3f585c2f5519000bba6b", "583c3ff05c2f5519000bba6d", "583c407f5c2f5519000bba73", "583c41115c2f5519000bba77", "583c41bb5c2f5519000bba7a", "583c42b25c2f5519000bba7b", "583c43315c2f5519000bba7e", "583c43d05c2f5519000bba80", "583c445d5c2f5519000bba81", "583c44ca5c2f5519000bba84", "583c452e5c2f5519000bba87", "583c45b35c2f5519000bba92", "583c46225c2f5519000bba95", "583c468e5c2f5519000bba9f", "583c48ff5c2f5519000bbab3", "583c717c6aa18c1900299872", "583c73146aa18c1900299892", "595ce85fa917841a00dfd069", "595ce9c8a917841a00dfd2cf", "595ceab6a917841a00dfd48b", "56f179f82e9e671a00162e71", "5a9955e46385580013839fcc", "5a995aa9638558001383a431", "59df8897e4654211003b42ba", "5a9956be638558001383a042", "5a995d9f638558001383a566", "56f17a0b2e9e671a00162e72", "5afd8e0ca562d500138bda59", "5b97df5f5f3c630013e8e619", "5b97dff65f3c630013e8e671", "5b97e05b5f3c630013e8e6a0", "5dde5b6bc481f5001537fca5", "5dea88d7ba5f0e0015bd6647", "5dea87caba5f0e0015bd6614", "5dea866aba5f0e0015bd65d4", "5dbae20db35f8f0015e6e88e"],
  "lastName": "PICARD",
  "firstName": "François",
  "email": "f.picard@cobredia.fr",
  "civility": "M",
  "phone": "",
  "mobilePhone": "",
  "businessName": "",
  "address": "",
  "postCode": "",
  "job": "Actionnaire / Président",
  "role": "SuperAdmin",
  "city": "",
  "subscriptionStatus": "Terminated",
  "isGod": null,
  "defaultManagerGaragesIds": [],
  "allGaragesAlerts": {
    "UnsatisfiedVI": false,
    "UnsatisfiedVo": true,
    "UnsatisfiedVn": true,
    "UnsatisfiedMaintenance": true,
    "LeadApv": false,
    "LeadVn": true,
    "LeadVo": true,
    "ExogenousNewReview": true,
    "EscalationUnsatisfiedMaintenance": false,
    "EscalationUnsatisfiedVn": false,
    "EscalationUnsatisfiedVo": false,
    "EscalationUnsatisfiedVi": null,
    "EscalationLeadMaintenance": false,
    "EscalationLeadVn": false,
    "EscalationLeadVo": false
  },
  "authorization": {
    "ACCESS_TO_COCKPIT": true,
    "ACCESS_TO_ADMIN": true,
    "WIDGET_MANAGEMENT": true,
    "ACCESS_TO_WELCOME": false,
    "ACCESS_TO_SATISFACTION": true,
    "ACCESS_TO_UNSATISFIED": true,
    "ACCESS_TO_LEADS": true,
    "ACCESS_TO_AUTOMATION": true,
    "ACCESS_TO_CONTACTS": true,
    "ACCESS_TO_E_REPUTATION": true,
    "ACCESS_TO_ESTABLISHMENT": false,
    "ACCESS_TO_TEAM": false,
    "ACCESS_TO_DARKBO": null,
    "ACCESS_TO_GREYBO": null
  },
  "reportConfigs": {
    "daily": {
      "unsatisfiedApv": false,
      "unsatisfiedVn": false,
      "unsatisfiedVo": false,
      "UnsatisfiedVI": null,
      "leadVn": null,
      "leadVo": null
    },
    "weekly": {
      "unsatisfiedApv": false,
      "unsatisfiedVn": false,
      "unsatisfiedVo": false,
      "UnsatisfiedVI": null,
      "leadVn": null,
      "leadVo": null
    },
    "monthly": {
      "unsatisfiedApv": true,
      "unsatisfiedVn": true,
      "unsatisfiedVo": true,
      "UnsatisfiedVI": false,
      "leadVn": true,
      "leadVo": true
    },
    "monthlySummary": {
      "unsatisfiedApv": true,
      "unsatisfiedVn": true,
      "unsatisfiedVo": true,
      "unsatisfiedVI": null,
      "leadVn": true,
      "leadVo": true,
      "contactsApv": true,
      "contactsVn": true,
      "contactsVo": true,
      "contactsVI": null
    }
  }
}

export default {
  component: Profile,
  props: [
    {
      label: 'isGod',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'classBindingSideBarTiny',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'currentUserIsGarageScoreUser',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'isGod',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'currentUserSubscriptionStatus',
      value: 'Terminated',
      inputType: 'select',
      inputOptions: ['Terminated', 'Initialized'],
    },
    {
      label: 'defaultManagerGaragesIds',
      value: [],
      inputType: 'json',
    },
    {
      label: 'lastRoute',
      value: 'cockpit-admin-users',
      inputType: 'text'
    },
    {
      label: 'currentUser',
      value: user,
      inputType: 'json'
    },
    {
      label: 'idInQuery',
      value: '58d3f892e325651a00d902e5',
      inputType: 'text'
    },
    {
      label: 'garagesFromCurrentUser',
      value: [
        {
          "id": "5609173770ad25190055d4fd",
          "publicDisplayName": "Étoile de Morlaix (Mercedes-Benz)",
          "type": "Dealership",
          "agents": []
        }, {
          "id": "5609174f70ad25190055d4fe",
          "publicDisplayName": "Garage Belleguic (Mercedes-Benz Quimper)",
          "type": "Dealership",
          "agents": []
        }
      ],
      inputType: 'json'
    },
    {
      label: 'agents',
      value: [],
      inputType: 'json'
    },
    {
      label: 'user',
      value: user,
      inputType: 'json'
    },
    {
      label: 'userRole',
      value: 'Admin',
      inputType: 'text'
    },
    {
      label: 'authorization',
      value: {
        "ACCESS_TO_COCKPIT": true,
        "ACCESS_TO_WELCOME": true,
        "ACCESS_TO_SATISFACTION": true,
        "ACCESS_TO_UNSATISFIED": true,
        "ACCESS_TO_LEADS": true,
        "ACCESS_TO_AUTOMATION": true,
        "ACCESS_TO_CONTACTS": true,
        "ACCESS_TO_E_REPUTATION": true,
        "ACCESS_TO_ESTABLISHMENT": true,
        "ACCESS_TO_TEAM": true,
        "ACCESS_TO_ADMIN": true,
        "WIDGET_MANAGEMENT": true,
        "ACCESS_TO_DARKBO": true,
        "ACCESS_TO_GREYBO": true
      },
      inputType: 'json',
    },
    {
      label: 'userJobs',
      value: ["Actionnaire / Président", "Directeur général", "Direction marketing groupe", "Direction de la communication groupe", "Direction qualité & méthodes groupe", "Direction des ventes groupe", "Direction des ventes VN groupe", "Direction des ventes VO groupe", "Direction atelier groupe", "Directeur de marque", "Directeur de concession", "Chef d'atelier concession", "Responsable carrosserie", "Commercial VN ou VO", "Conseiller services", "Responsable qualité concession", "Responsable des ventes VN & VO concession", "Responsable des ventes VN concession", "Responsable des ventes VO concession", "Responsable marketing concession", "Responsable digital", "Service ressources Humaines", "Service comptabilité et gestion", "Service client", "Secrétariat atelier", "Secrétariat vente", "Secrétariat général", "Service informatique ou technique", "Commercial secteur", "Responsable Lead Ventes", "Responsable Lead Après-vente", "Commercial VN", "Commercial VO"],
      inputType: 'json',
    },
    {
      label: 'conditions',
      value: {
        "hasMaintenanceAtLeast": true,
        "hasVnAtLeast": true,
        "hasVoAtLeast": true,
        "hasViAtLeast": true,
        "hasLeadAtLeast": true,
        "hasCrossLeadsAtLeast": true,
        "hasAutomationAtLeast": true,
        "hasEReputationAtLeast": true
      },
      inputType: 'json',
    },
  ]
}
