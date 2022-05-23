import UserRole from "~/components/global/UserRole.vue";
import { UserRoles } from "~/utils/enumV2";

export default {
  component: UserRole,
  props: [
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    }
  ]
}
