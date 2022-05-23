/** User add popup */
import ModalAddUser from "~/components/cockpit/modals/ModalAddUser.vue";
import { UserRoles } from "~/utils/enumV2";
const { GaragesTest } = require('~/utils/enumV2');

export default {
  component: ModalAddUser,
  props: [
    {
      label: 'currentUserIsGarageScoreUser',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'jobsByCockpitType',
      value: [
        {
          name: "Directeur"
        },
        {
          name: "Associé"
        },
        {
          name: "Président"
        }
      ],
      inputType: 'json',
    },
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    },
    {
      label: 'garages',
      value: [
        {
          id: GaragesTest.GARAGE_DUPONT,
          publicDisplayName: GaragesTest.getProperty('GARAGE_DUPONT', 'publicDisplayName')
        },{
          id: GaragesTest.AGENT_DUPONT,
          publicDisplayName: GaragesTest.getProperty('AGENT_DUPONT', 'publicDisplayName')
        },{
          id: GaragesTest.GARAGE_DEL_BOSQUE,
          publicDisplayName: GaragesTest.getProperty('GARAGE_DEL_BOSQUE', 'publicDisplayName')
        },
      ]
    }
  ]
}
