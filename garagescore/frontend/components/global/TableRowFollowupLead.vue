<template>
  <TableRow>
    <div class="row__cell" :style="{ flex: colspan }">
      <div class="row__card">
        <CardGrey>
          <template slot="title">{{ $t_locale('components/global/TableRowFollowupLead')('answer') }}</template>

          <div class="row__card-part">
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowupLead')('followupLeadDetails') }}</AppText>
              <AppText tag="span" type="primary">{{ formattedFollowupSendDate }}</AppText>
            </div>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowupLead')('followupLeadAnswerDate') }}</AppText>
              <AppText tag="span" type="primary">{{ formattedFollowupResponseDate }}</AppText>
            </div>
          </div>
          <div class="row__card-part" v-if="surveyFollowupFirstRespondedAt">
            <AppText tag="h1" class="row__title" type="danger" bold>
              {{ $t_locale('components/global/TableRowFollowupLead')('followupLeadAnswerDetails') }}
            </AppText>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowupLead')('recontacted') }}</AppText>
              <AppText tag="span" type="primary" v-if="surveyFollowupFirstRespondedAt">
                {{ $t_locale('components/global/TableRowFollowupLead')(leadTicketFollowupRecontacted || 'false') }}
              </AppText>
            </div>
            <div class="row__group" v-if="hasBeenRecontacted">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowupLead')('satisfied') }}</AppText>
              <AppText tag="span" type="primary">{{ $t_locale('components/global/TableRowFollowupLead')(leadTicketFollowupSatisfied || 'false') }}</AppText>
            </div>
            <div class="row__group" v-if="hasBeenRecontacted">
              <AppText tag="div">
                {{ followupSatisfactionTitle }}:
              </AppText>
              <div v-for="reason in reasons" v-bind:key="reason">
                <AppText tag="span" type="primary" style="margin-left: 1rem">- {{ $t_locale('components/global/TableRowFollowupLead')(reason) }}</AppText>
              </div>
            </div>
            <div class="row__group" v-if="leadTicketFollowupAppointment">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowupLead')('appointment') }}</AppText>
              <AppText tag="span" type="primary">{{ $t_locale('components/global/TableRowFollowupLead')(leadTicketFollowupAppointment) }}</AppText>
            </div>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from "~/components/global/CardGrey.vue";
import { getDeepFieldValue } from "~/utils/object";

export default {
  components: { CardGrey },

  props: {
    leadTicket: Object,
    surveyFollowupLead: Object,

    colspan: Number,
    colspanBg: Number,
    colspanEnd: Number
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this, fieldName),
    };
  },

  methods: {
    dateFormat(val) {
      if (val) {
        return this.$t_locale('components/global/TableRowFollowupLead')('dateFormat', {
          date: this.$moment(val).format('DD/MM/YYYY'),
          time: this.$moment(val).format('HH:mm')
        });
      }
      return '';
    }
  },

  computed: {
    surveyFollowupFirstRespondedAt() {
      return this.deep('surveyFollowupLead.firstRespondedAt');
    },
    leadTicketFollowupRecontacted() {
      return this.deep('leadTicket.followup.recontacted');
    },
    leadTicketFollowupSatisfied() {
      return this.deep('leadTicket.followup.satisfied');
    },
    leadTicketFollowupSatisfiedReasons() {
      return this.deep('leadTicket.followup.satisfiedReasons');
    },
    leadTicketFollowupNotSatisfiedReasons() {
      return this.deep('leadTicket.followup.notSatisfiedReasons');
    },
    leadTicketFollowupAppointment() {
      return this.deep('leadTicket.followup.appointment');
    },
    hasBeenRecontacted() {
      return this.deep('leadTicket.followup.recontacted') === true;
    },
    formattedFollowupSendDate() {
      const sendDate = this.deep('surveyFollowupLead.sendAt');
      return sendDate ? this.dateFormat(sendDate) : this.$t_locale('components/global/TableRowFollowupLead')('notSentYet');
    },
    formattedFollowupResponseDate() {
      const responseDate = this.surveyFollowupFirstRespondedAt;
      return responseDate ? this.dateFormat(responseDate) : this.$t_locale('components/global/TableRowFollowupLead')('noAnswer');
    },
    followupSatisfactionTitle() {
      const titleKey = this.leadTicketFollowupSatisfied ? 'satisfiedTitle' : 'notSatisfiedTitle';
      return this.$t_locale('components/global/TableRowFollowupLead')(titleKey, {}, titleKey);
    },
    reasons() {
      return this.leadTicketFollowupSatisfied
        ? this.leadTicketFollowupSatisfiedReasons
        : this.leadTicketFollowupNotSatisfiedReasons;
    }
  }
};
</script>

<style lang="scss" scoped>
.row {
  &__cell {
    padding: 0;
  }

  &__card-part {
    margin-bottom: 1rem;
  }

  &__group {
    *:not(:last-child) {
      margin-right: 0.5rem;
    }

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  &__title {
    font-size: 1rem;
    margin-bottom: 1.25rem;
    text-decoration: underline;
  }
}

.row-bg {
  background-color: $active-cell-color;
  border-bottom: 1px solid $white;
  display: none;
}

.row-end {
  display: none;
}

@media (min-width: $breakpoint-min-md) {
  .row-end,
  .row-bg {
    display: unset;
  }
}
</style>
