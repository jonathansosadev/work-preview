/** Small user profile popup displayed on the top right of cockpit */
import UserProfileContent from "~/components/global/UserProfileContent.vue";
import { UserRoles } from "~/utils/enumV2";

export default {
  component: UserProfileContent,
  props: [
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    },
    {
      label: 'mode',
      value: 'desktop',
      inputType: 'select',
      inputOptions: [
        'desktop',
        'mobile'
      ]
    },
    {
      label: 'currentUser',
      value: {
        email: 'jean.menbalek@gmail.com',
        firstName: 'Jean',
        lastName: 'MENBALEK'
      },
      inputType: 'json'
    },

  ]
}
