import DropdownUser from '~/components/global/DropdownUser.vue'
export default {
    component: DropdownUser,
    props: [
        {
          label: "availableUsers",
          value:[
            {  
              userId: "1",
              name: "user1"
            },
            {  
              userId: "2",
              name: "user2"
            },
          ],
          inputType: "json"
        },
        {
          label: 'currentUserId',
          value: '',
          inputType: 'string'
        },
        {
          label: 'setCurrentUser',
          value: (userId)=>(alert(`Current User ${userId}`)),
          inputType: 'function'
        }
        
    ],
  }
  