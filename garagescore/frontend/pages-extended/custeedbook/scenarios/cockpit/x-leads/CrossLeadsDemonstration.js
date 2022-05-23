import CrossLeadsDemonstration from "~/components/cockpit/leads/CrossLeadsDemonstration";

export default {
  component: CrossLeadsDemonstration,
  props: [
    {
      label: 'loading',
      value: true,
      inputType: 'checkbox'
    },
    {
      label: 'isPrioritaryProfile',
      value: true,
      inputType: 'checkbox'
    },
    {
      label: 'availableGarages',
      value: [{
          "id": "60d59cf99e6dda0003c07857",
          "externalId": "029075.01",
          "usersQuota": null,
          "countAllSubscribedUsers": 2,
          "publicDisplayName": "(ASF) Auto Contrôle Fouesnant",
          "ticketsConfiguration": null,
          "users": [{
            "job": "Custeed",
            "role": "SuperAdmin",
            "fullName": "tu tu",
            "email": "tutu@garagescore.fr",
            "id": "5efa53b6779fb50033b78e35",
            "reportConfigs": {
              "daily": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "weekly": {
                "enable": true,
                "generalVue": false,
                "lead": false,
                "leadVn": true,
                "leadVo": true,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true
              },
              "monthly": {
                "enable": true,
                "generalVue": true,
                "lead": false,
                "leadVn": true,
                "leadVo": true,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true
              },
              "monthlySummary": {
                "enable": true,
                "generalVue": null,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true,
                "unsatisfiedVI": null,
                "lead": true,
                "leadVn": true,
                "leadVo": true,
                "contactsApv": true,
                "contactsVn": true,
                "contactsVo": true,
                "contactsVI": null
              }
            },
            "allGaragesAlerts": {
              "Lead": false,
              "LeadVn": true,
              "LeadVo": true,
              "UnsatisfiedFollowup": false,
              "UnsatisfiedMaintenance": true,
              "UnsatisfiedVn": true,
              "UnsatisfiedVo": true,
              "ExogenousNewReview": true,
              "EscalationUnsatisfiedMaintenance": false,
              "EscalationUnsatisfiedVn": false,
              "EscalationUnsatisfiedVo": false,
              "EscalationUnsatisfiedVi": null,
              "EscalationLeadMaintenance": null,
              "EscalationLeadVn": false,
              "EscalationLeadVo": false
            }
          }, {
            "job": "Direction marketing groupe",
            "role": "SuperAdmin",
            "fullName": "Adelaide Landeau",
            "email": "adelaide.landeau@sgs.com",
            "id": "5bd339aa981fc80014a950c3",
            "reportConfigs": {
              "daily": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "weekly": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "monthly": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "monthlySummary": {
                "enable": false,
                "generalVue": null,
                "unsatisfiedApv": null,
                "unsatisfiedVn": null,
                "unsatisfiedVo": null,
                "unsatisfiedVI": null,
                "lead": null,
                "leadVn": null,
                "leadVo": null,
                "contactsApv": null,
                "contactsVn": null,
                "contactsVo": null,
                "contactsVI": null
              }
            },
            "allGaragesAlerts": {
              "Lead": false,
              "LeadVn": false,
              "LeadVo": false,
              "UnsatisfiedFollowup": false,
              "UnsatisfiedMaintenance": false,
              "UnsatisfiedVn": false,
              "UnsatisfiedVo": false,
              "ExogenousNewReview": false,
              "EscalationUnsatisfiedMaintenance": false,
              "EscalationUnsatisfiedVn": false,
              "EscalationUnsatisfiedVo": false,
              "EscalationUnsatisfiedVi": false,
              "EscalationLeadMaintenance": false,
              "EscalationLeadVn": false,
              "EscalationLeadVo": false
            }
          }],
          "subscriptions": {
            "Maintenance": false,
            "NewVehicleSale": false,
            "UsedVehicleSale": false,
            "Lead": true
          },
          "displaySubView": false
        },
        {
          "id": "60a7d191e176200003edde2f",
          "externalId": "095052",
          "usersQuota": null,
          "countAllSubscribedUsers": 2,
          "publicDisplayName": "(ASF) Contrôle Technique Automobile de Saint-Brice",
          "ticketsConfiguration": null,
          "users": [{
            "job": "Direction marketing groupe",
            "role": "SuperAdmin",
            "fullName": "Adelaide Landeau",
            "email": "adelaide.landeau@sgs.com",
            "id": "5bd339aa981fc80014a950c3",
            "reportConfigs": {
              "daily": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "weekly": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "monthly": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "monthlySummary": {
                "enable": false,
                "generalVue": null,
                "unsatisfiedApv": null,
                "unsatisfiedVn": null,
                "unsatisfiedVo": null,
                "unsatisfiedVI": null,
                "lead": null,
                "leadVn": null,
                "leadVo": null,
                "contactsApv": null,
                "contactsVn": null,
                "contactsVo": null,
                "contactsVI": null
              }
            },
            "allGaragesAlerts": {
              "Lead": false,
              "LeadVn": false,
              "LeadVo": false,
              "UnsatisfiedFollowup": false,
              "UnsatisfiedMaintenance": false,
              "UnsatisfiedVn": false,
              "UnsatisfiedVo": false,
              "ExogenousNewReview": false,
              "EscalationUnsatisfiedMaintenance": false,
              "EscalationUnsatisfiedVn": false,
              "EscalationUnsatisfiedVo": false,
              "EscalationUnsatisfiedVi": false,
              "EscalationLeadMaintenance": false,
              "EscalationLeadVn": false,
              "EscalationLeadVo": false
            }
          }, {
            "job": "Custeed",
            "role": "SuperAdmin",
            "fullName": "tu tu",
            "email": "tutu@garagescore.fr",
            "id": "5efa53b6779fb50033b78e35",
            "reportConfigs": {
              "daily": {
                "enable": false,
                "generalVue": false,
                "lead": false,
                "leadVn": false,
                "leadVo": false,
                "unsatisfiedApv": false,
                "unsatisfiedVn": false,
                "unsatisfiedVo": false
              },
              "weekly": {
                "enable": true,
                "generalVue": false,
                "lead": false,
                "leadVn": true,
                "leadVo": true,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true
              },
              "monthly": {
                "enable": true,
                "generalVue": true,
                "lead": false,
                "leadVn": true,
                "leadVo": true,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true
              },
              "monthlySummary": {
                "enable": true,
                "generalVue": null,
                "unsatisfiedApv": true,
                "unsatisfiedVn": true,
                "unsatisfiedVo": true,
                "unsatisfiedVI": null,
                "lead": true,
                "leadVn": true,
                "leadVo": true,
                "contactsApv": true,
                "contactsVn": true,
                "contactsVo": true,
                "contactsVI": null
              }
            },
            "allGaragesAlerts": {
              "Lead": false,
              "LeadVn": true,
              "LeadVo": true,
              "UnsatisfiedFollowup": false,
              "UnsatisfiedMaintenance": true,
              "UnsatisfiedVn": true,
              "UnsatisfiedVo": true,
              "ExogenousNewReview": true,
              "EscalationUnsatisfiedMaintenance": false,
              "EscalationUnsatisfiedVn": false,
              "EscalationUnsatisfiedVo": false,
              "EscalationUnsatisfiedVi": null,
              "EscalationLeadMaintenance": null,
              "EscalationLeadVn": false,
              "EscalationLeadVo": false
            }
          }],
          "subscriptions": {
            "Maintenance": false,
            "NewVehicleSale": false,
            "UsedVehicleSale": false,
            "Lead": true
          },
          "displaySubView": false
        }
      ],
      inputType: 'json',
    },
  ]
};
