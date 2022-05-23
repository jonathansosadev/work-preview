import TableAdminUsersUsers from "~/components/cockpit/user/TableAdminUsersUsers";
import { UserRoles } from '~/utils/enumV2';

export default {
  component: TableAdminUsersUsers,
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
      label: 'currentUser',
      value: {
        email: 'jean.menbalek@gmail.com',
        firstName: 'Jean',
        lastName: 'MENBALEK'
      },
      inputType: 'json'
    },
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    },
    {
      label: 'users',
      value: [{
        "id": "5ad5c57245188e0013ee7cb7",
        "email": "p.rajsavong@etoile35-rennes.fr",
        "firstName": "Pierre",
        "lastName": "Rajsavong",
        "job": "Responsable des ventes VN concession",
        "role": "SuperAdmin",
        "garagesCount": 6,
        "lastCockpitOpenAt": "2021-07-10T08:42:27.722Z",
        "isDefaultTicketManagerSomewhere": true
      }, {
        "id": "58d3f892e325651a00d902e5",
        "email": "f.picard@cobredia.fr",
        "firstName": "François",
        "lastName": "PICARD",
        "job": "Actionnaire / Président",
        "role": "Admin",
        "garagesCount": 48,
        "lastCockpitOpenAt": "2021-02-10T10:20:11.849Z",
        "isDefaultTicketManagerSomewhere": false
      }, {
        "id": "57e52edaa7cae519005224d0",
        "email": "lead-msc@garage-etoile-brest.fr",
        "firstName": null,
        "lastName": null,
        "job": "",
        "role": "Admin",
        "garagesCount": 1,
        "lastCockpitOpenAt": null,
        "isDefaultTicketManagerSomewhere": true
      }, {
        "id": "562f4d39baf25619004f6a6d",
        "email": "ffollet@cobredia.fr",
        "firstName": "Franck",
        "lastName": "Follet",
        "job": "Direction marketing groupe",
        "role": "Admin",
        "garagesCount": 49,
        "lastCockpitOpenAt": "2021-02-09T17:50:04.985Z",
        "isDefaultTicketManagerSomewhere": true
      }, {
        "id": "59c27f962388431b00c8ff91",
        "email": "stephane.gaye@etoile-brest.fr",
        "firstName": "Stéphane",
        "lastName": "GAYE",
        "job": "Directeur de marque",
        "role": "Admin",
        "garagesCount": 6,
        "lastCockpitOpenAt": "2021-02-03T10:59:46.101Z",
        "isDefaultTicketManagerSomewhere": false
      }],
      inputType: 'json',
    },
  ]
}
