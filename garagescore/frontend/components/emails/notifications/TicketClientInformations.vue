<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td class="margin"></td>
      <td>
        <div class="title">{{$t_locale('components/emails/notifications/TicketClientInformations')('title')}} :</div><br>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('name')}} :
          </span>
          <span :class="elementValueClass(ticket.customer.fullName)">
            {{ ticket.customer.fullName || $t_locale('components/emails/notifications/TicketClientInformations')('empty') }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('phone')}} :
          </span>
          <span :class="elementValueClass(ticket.customer.contact.mobilePhone)">
            {{ ticket.customer.contact.mobilePhone || $t_locale('components/emails/notifications/TicketClientInformations')('empty')  }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('email')}} :
          </span>
          <span :class="elementValueClass(ticket.customer.contact.email)">
            {{ ticket.customer.contact.email || $t_locale('components/emails/notifications/TicketClientInformations')('empty')  }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('immat')}} :
          </span>
          <span :class="elementValueClass(ticket.vehicle.plate)">
            {{ ticket.vehicle.plate || $t_locale('components/emails/notifications/TicketClientInformations')('empty')  }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('city')}} :
          </span>
          <span :class="elementValueClass(city)">
            {{ city || $t_locale('components/emails/notifications/TicketClientInformations')('empty')  }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('postalCode')}} :
          </span>
          <span :class="elementValueClass(postalCode)">
            {{ postalCode || $t_locale('components/emails/notifications/TicketClientInformations')('empty') }}
          </span>
        </div>
        <div class="spacing"></div>
        <div class="element">
          <span class="label">{{$t_locale('components/emails/notifications/TicketClientInformations')('manager')}} :
          </span>
          <span :class="elementValueClass(manager)">
            {{(manager !== 'UNDEFINED' && manager) || $t_locale('components/emails/notifications/TicketClientInformations')('empty') }}
          </span>
        </div>
      </td>
      <td class="margin"></td>
    </tr>
  </table>
</template>


<script>

export default {
  data() {
    return {
    }
  },
  components: { },
  methods: {
    elementValueClass(value) {
      return value && value !== 'UNDEFINED' ? 'filled' : 'empty'
    }
  },
  computed: {
  },
  props: {
    ticket: Object,
    city: String,
    postalCode: String,
    manager: String
  }
}
</script>


<style lang="scss" scoped>
  .filled {
    color: $blue;
  }
  .empty {
    color: $dark-grey
  }
  .margin {
    width: 20px;
  }
  .title {
    font-weight: bold;
  }
  .element {
    margin-bottom: 10px;
  }
  .label {
    font-weight: bold;
  }
</style>
