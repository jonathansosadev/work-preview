<template>
  <div class="leads-details">
    <PlaceholderLoading v-if="loading" fullScreen/>
    <template v-else-if="dataGetLeadTicket">
      <HeaderNavFolder
        class="leads-details__header"
        :currentId="dataGetLeadTicket.id"
        :items="leadsList"
        routeList="cockpit-leads-reviews"
        routeItem="cockpit-leads-id"
        :sidebarTiny="classBindingSideBarTiny"
      />
      <div class="leads-details__body">
        <div class="leads-details__part">
          <CardFolderResume
            v-bind="{dataGetLeadTicket}"
            :openModalDispatch="openModal"
            :add-ticket-action="addTicketAction"
          />
        </div>
        <div class="leads-details__part leads-details__part--steps">
          <!-- TO VALIDATE
          <div class="leads-details__section leads-details__section--title">
            <Title>{{ $t_locale('pages/cockpit/leads/_id')('stepsTitle') }}</Title>
          </div>
          -->
          <div class="leads-details__section">
            <StepsLead v-bind="{dataGetLeadTicket}"/>
          </div>
        </div>
        <div class="leads-details__part">
          <div class="leads-details__grid">
            <div class="leads-details__grid-part leads-details__grid-part--left">
              <CardCustomerInfo :id="dataGetLeadTicket.id" v-bind="{dataGetLeadTicket}" :updateTicketDispatch="updateTicket"/>
              <CardPurchaseProject :id="dataGetLeadTicket.id" v-bind="{dataGetLeadTicket}" :updateTicketDispatch="updateTicket"/>
            </div>
            <div class="leads-details__grid-part leads-details__grid-part--right">
              <CardFolderManagement
                class="leads-details__item"
                :id="dataGetLeadTicket.id"
                v-if="!isClose"
                folderManagementComponent="WizardLeadsFolder"
                :garage="dataGetLeadTicket.garage"
                :leadTicket="dataGetLeadTicket.leadTicket"
                :updateTicketDispatch="updateTicket"
                :addTicketActionDispatch="addTicketAction"
                :openModalDispatch="openModal"
                :appendTicketUserDispatch="appendTicketUser"
                :ticketManagerId="ticketManagerId"
                :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
                :jobsByCockpitType="jobsByCockpitType"
                :userRole="userRole"
                ticketType="leadTicket"
              />
              <HistoryTicket
                class="leads-details__item"
                :id="dataGetLeadTicket.id"
                type="lead"
                :sourceType="deep('dataGetLeadTicket.source.type')"
                :ticket="deep('dataGetLeadTicket.leadTicket')"
                :agentGarageName="deep('dataGetLeadTicket.source.agent.publicDisplayName')"
                :automationCampaign="dataGetLeadTicket.automationCampaign"
                :cockpitType="deep('dataGetLeadTicket.garage.type')"
                :cancelReminderDispatch="cancelReminder"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="selfAssignedUserName">
      <AppText class="leads-details__error" tag="span" align="center" type="danger" size="lg">
        {{ $t_locale('pages/cockpit/leads/_id')('alreadySelfAssignedTo_part_1') }} <b> {{ selfAssignedUserName }} </b> &#128531;<br>
        {{ $t_locale('pages/cockpit/leads/_id')('alreadySelfAssignedTo_part_2') }} &#128521;
      </AppText>
    </template>
    <template v-else-if="!dataGetLeadTicket">
      <AppText class="leads-details__error" tag="span" bold align="center" type="danger" size="lg">
        {{ $t_locale('pages/cockpit/leads/_id')('accessForbidden') }}
      </AppText>
    </template>
  </div>
</template>

<script>
import CardCustomerInfo from '~/components/cockpit/leads/_id/CardCustomerInfo';
import CardFolderManagement from '~/components/global/CardFolderManagement';
import CardFolderResume from '~/components/cockpit/leads/_id/CardFolderResume';
import CardPurchaseProject from '~/components/cockpit/leads/_id/CardPurchaseProject';
import HeaderNavFolder from '~/components/global/HeaderNavFolder';
import HistoryTicket from '~/components/global/HistoryTicket';
import StepsLead from '~/components/cockpit/leads/_id/StepsLead';
import {makeApolloMutations, makeApolloQueries} from '@/util/graphql';
import {getDeepFieldValue as deep} from '~/utils/object';
import {setupHotJar} from '~/util/externalScripts/hotjar';
import {TicketActionNames} from '~/utils/enumV2';

export default {
  name: "LeadsDetailPage",
  components: {
    CardCustomerInfo,
    CardFolderManagement,
    CardFolderResume,
    CardPurchaseProject,
    HeaderNavFolder,
    HistoryTicket,
    StepsLead
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true
    }
  },
  inheritAttrs: false,
  middleware: ['hasAccessToLeads'],

  async mounted () {
    setupHotJar(this.navigationDataProvider.locale, 'leads');
    await this.refreshView();
  },

  data () {
    return {
      loading: true,
      selfAssignedUserName: '',
      deep: (fieldName) => deep(this, fieldName),
      dataGetLeadTicket: null,
      leadsList: []
    };
  },

  computed: {
    userRole () {
      return this.deep('$store.state.auth.currentUser.role');
    },
    isClose () {
      return (this.deep('dataGetLeadTicket.leadTicket.status') || '').includes('Closed');
    },
    classBindingSideBarTiny () {
      return this.navigationDataProvider.sidebarTiny;
    },
    ticketManagerId () {
      return this.dataGetLeadTicket?.leadTicket?.manager?.id || null;
    },
    currentUserIsGarageScoreUser () {
      return !!this.$store.getters['auth/isGaragescoreUser'];
    },
    jobsByCockpitType () {
      const cockpitType = this.navigationDataProvider.cockpitType;
      return this.$store.getters['profile/jobsByCockpitType'](cockpitType) || [];
    }
  },
  methods: {
    async refreshView () {
      await this.setLeadTicketSelfAssigned();
      await this.fetchLeadsList();
    },

    openModal (payload) {
      return this.$store.dispatch('openModal', payload);
    },
    async updateTicket ({dataId, field, value}) {
      const request = {
        name: 'dataSetLeadTicket',
        args: {
          dataId,
          field,
          ...(Array.isArray(value) ? {arrayValue: value} : {value})
        },
        fields: `
        message
        status
      `
      };
      const res = await makeApolloMutations([request]);
      const success = res.data && res.data.dataSetLeadTicket && res.data.dataSetLeadTicket.status === 'OK';
      if (success) {
        await this.fetchLeadTicket({dataId});
      }
      return success;
    },
    async addTicketAction ({id, action, comment, reminder, transferTo, closeReason}) {
      const args = {
        id,
        name: action,
        createdAt: new Date(),
        type: 'lead',
        assignerUserId: this.$store.state.auth.currentUser.id,
        comment: comment,
        alertContributors: false
      };

      const {POSTPONED_LEAD, LEAD_CLOSED, LEAD_REOPENED, TRANSFER, REMINDER} = TicketActionNames;
      // transfer
      if (action === TRANSFER) {
        args.previousTicketManagerId = deep(this.dataGetLeadTicket, 'leadTicket.manager.id') || null;
        args.ticketManagerId = transferTo;
      }

      // first action assign people
      if (!deep(this.dataGetLeadTicket, 'leadTicket.manager.id') && !args.ticketManagerId) {
        args.ticketManagerId = this.$store.state.auth.currentUser.id;
      }

      // closing details
      if (action === LEAD_CLOSED) {
        args.wasTransformedToSale =
          closeReason === 'NewVehicleSale' || closeReason === 'UsedVehicleSale' || closeReason === 'Maintenance';
        args.missedSaleReason = !args.wasTransformedToSale ? closeReason : null;
      }

      // reminder management
      if (reminder && ![LEAD_CLOSED, LEAD_REOPENED, TRANSFER, POSTPONED_LEAD].includes(action)) {
        args.name = REMINDER;
        args.reminderFirstDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderNextDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderActionName = action;
        args.reminderStatus = 'NotResolved';
        args.reminderDate = reminder;
      }

      // postponed lead
      if (action === POSTPONED_LEAD) {
        args.reminderFirstDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderNextDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderStatus = 'NotResolved';
        args.reminderDate = reminder;
      }

      const request = {
        name: 'dataSetAction',
        args,
        fields: `
        message
        status
      `
      };
      const resp = await makeApolloMutations([request]);

      const success = resp && resp.data && resp.data.dataSetAction && resp.data.dataSetAction.status === 'OK';
      if (success) {
        await this.onAfterAddTicketAction({
          id: args.id,
          fetchTicketManager: args.ticketManagerId !== null,
          fetchTicketStatus: ['leadClosed', 'leadReopened'].includes(action)
        });
      }
      return success;
    },
    appendTicketUser ({user}) {
      this.dataGetLeadTicket.garage.users.push(user);
    },
    async cancelReminder ({id, type, actionCreatedAt}) {
      const request = {
        name: 'dataSetCancelReminder',
        args: {
          id,
          userId: this.$store.state.auth.currentUser.id,
          createdAt: actionCreatedAt,
          ticketType: type
        },
        fields: `
        status
      `
      };
      const resp = await makeApolloMutations([request]);

      if (resp.data.dataSetCancelReminder.status) {
        await this.fetchLeadTicket({dataId: id})
      }
      return resp.data.dataSetCancelReminder.status;
    },
    async fetchDataGetLeadTicket ({dataId, fields}) {
      let partial = false;
      if (fields) partial = true;
      fields =
        fields ||
        `
        id
        source {
          type
          by
          agent {
            id
            publicDisplayName
          }
        }
        lead {
          reportedAt
          type
          brands
        }
        surveyFollowupLead {
          sendAt
          firstRespondedAt
        }
        customer {
          city {
            value
          }
        }
        followupLeadStatus
        garage {
          id
          type
          ratingType
          publicDisplayName
          users {
            id
            firstName
            lastName
            email
            job
            hasOnlyThisGarage
          }
        }
        leadTicket {
          status
          createdAt
          closedAt
          budget
          knowVehicle
          leadVehicle
          tradeIn
          energyType
          cylinder
          bodyType
          financing
          timing
          saleType
          requestType
          sourceSubtype
          brandModel
          vehicle {
            makeModel
            plate
            mileage
          }
          followup {
            recontacted
            satisfied
            satisfiedReasons
            notSatisfiedReasons
            appointment
          }
          customer {
            fullName
            contact {
              mobilePhone
              email
            }
          }
          manager {
            id
            firstName
            lastName
            email
          }
          automationCampaign {
            id
            displayName
            contactType
          }
          actions {
            name
            createdAt
            comment
            selfAssigned
            sourceType
            phone
            message
            adUrl
            missedSaleReason
            wasTransformedToSale
            isManual
            crossLeadConverted
            closedForInactivity
            automaticReopen
            reminderFirstDay
            reminderStatus
            reminderDate
            reminderNextDay
            reminderActionName
            newValue
            previousValue
            newArrayValue
            previousArrayValue
            field
            followupLeadSendDate
            followupLeadResponseDate
            followupLeadRecontacted
            followupLeadSatisfied
            followupLeadSatisfiedReasons
            followupLeadNotSatisfiedReasons
            followupLeadAppointment
            assigner {
              id
              lastName
              firstName
              email
            }
            ticketManager {
              id
              lastName
              firstName
              email
            }
            previousTicketManager {
              id
              lastName
              firstName
              email
            }
            reminderTriggeredBy {
              id
              lastName
              firstName
              email
            }
          }
        }
        review {
          rating {
            value
          }
          comment {
            text
          }
        }
      `;
      const dataGetLeadTicket = {
        name: 'dataGetLeadTicket',
        args: {dataId},
        fields
      };
      const apolloRes = await makeApolloQueries([dataGetLeadTicket]);
      if (apolloRes && apolloRes.data && apolloRes.data.dataGetLeadTicket) {
        this.setDataGetLeadTicket({partial, ...apolloRes.data.dataGetLeadTicket});
      }
    },
    async fetchLeadTicket ({dataId}) {
      await this.fetchDataGetLeadTicket({
        dataId,
        fields: `
          leadTicket {
            status
            createdAt
            closedAt
            budget
            knowVehicle
            leadVehicle
            tradeIn
            energyType
            cylinder
            bodyType
            financing
            timing
            saleType
            requestType
            brandModel
            vehicle {
              makeModel
              plate
              mileage
            }
            followup {
              recontacted
              satisfied
              satisfiedReasons
              notSatisfiedReasons
              appointment
            }
            customer {
              fullName
              contact {
                mobilePhone
                email
              }
            }
            manager {
              id
              firstName
              lastName
              email
            }
            automationCampaign {
              id
              displayName
              contactType
            }
            actions {
              name
              createdAt
              comment
              selfAssigned
              sourceType
              phone
              message
              adUrl
              missedSaleReason
              wasTransformedToSale
              isManual
              crossLeadConverted
              closedForInactivity
              automaticReopen
              reminderFirstDay
              reminderStatus
              reminderDate
              reminderNextDay
              reminderActionName
              newValue
              previousValue
              newArrayValue
              previousArrayValue
              field
              followupLeadSendDate
              followupLeadResponseDate
              followupLeadRecontacted
              followupLeadSatisfied
              followupLeadSatisfiedReasons
              followupLeadNotSatisfiedReasons
              followupLeadAppointment
              assigner {
                id
                lastName
                firstName
                email
              }
              ticketManager {
                id
                lastName
                firstName
                email
              }
              previousTicketManager {
                id
                lastName
                firstName
                email
              }
              reminderTriggeredBy {
                id
                lastName
                firstName
                email
              }
            }
          }
        `
      });
    },
    setDataGetLeadTicket ({partial, ...fields}) {
      this.dataGetLeadTicket = partial ? {...this.dataGetLeadTicket, ...fields} : fields;
    },

    async onAfterAddTicketAction ({id, fetchTicketManager, fetchTicketStatus}) {
      await this.fetchLeadTicket({dataId: id});

      if (fetchTicketManager) {
        await this.fetchLeadTicket({dataId: id});
      }

      if (fetchTicketStatus) {
        await this.fetchLeadTicket({dataId: id});
      }
    },

    async fetchLeadsList () {
      const {
        periodId,
        garageIds,
        cockpitType,
        leadSaleType,
      } = this.navigationDataProvider;
      const filters = {
        periodId,
        ...(
          garageIds === null
            ? { garageId: this.dataGetLeadTicket.garage.id }
            : { garageId: garageIds }
        ),
        ...(cockpitType ? {cockpitType} : {}),
        ...(leadSaleType ? {leadSaleType} : {})
      };
      const request = {
        name: 'dataGetLeadsList',
        args: {
          limit: this.paginate,
          ...filters
        },
        fields: `datas {
          id
          garage {
            id
            publicDisplayName
          }
          source {
            type
            by
            agent {
              id
              publicDisplayName
            }
          }
          review {
            rating {
              value
            }
            comment {
              text
            }
          }
          customer {
            fullName {
              value
            }
            contact {
              mobilePhone {
                value
              }
              email {
                value
              }
            }
            city {
              value
            }
          }
          lead {
            type
          }
          leadTicket {
            saleType
            requestType
            createdAt
            referenceDate
            bodyType
            energyType
            cylinder
            sourceSubtype
            financing
            tradeIn
            timing
            budget
            manager {
              id
              firstName
              lastName
              email
            }
            brandModel
            status
            actions {
              name
              createdAt
              closedForInactivity
              reminderDate
              reminderActionName
              reminderStatus
            }
            followup {
              recontacted
              satisfied
              satisfiedReasons
              notSatisfiedReasons
              appointment
            }
            vehicle {
              makeModel
            }
          }
          surveyFollowupLead {
            sendAt
            firstRespondedAt
          }
          followupLeadStatus
        }
        hasMore
        cursor
        noResultGodMode`
      };
      const resp = await makeApolloQueries([request]);
      const {datas: leadsList} = resp.data.dataGetLeadsList;

      this.leadsList = leadsList || [];
    },
    async setLeadTicketSelfAssigned () {
      let result = null;
      this.loading = true;
      if (typeof this.$route.query['self-assign'] !== 'undefined') {
        const resp = await makeApolloMutations([
          {
            name: 'DataSetLeadTicketSelfAssigned',
            args: {dataId: this.$route.params.id},
            fields: `
          message
          status
          selfAssignedUserName
        `
          }
        ]);
        result = resp.data.DataSetLeadTicketSelfAssigned;
      }
      if (!result || [201, 208].includes(result.status)) {
        await this.fetchDataGetLeadTicket({
          dataId: this.$route.params.id
        });
      } else if ([403].includes(result.status)) this.selfAssignedUserName = result.selfAssignedUserName;
      this.loading = false;
    }
  },
  watch: {
    '$route.params.id' () {
      this.refreshView();
    }
  }
};
</script>

<style lang="scss" scoped>
.leads-details {
  background-color: $bg-grey;
  min-height: 100vh;
  height: 100%;

  &__error {
    padding-top: 30%;
    display: block;
  }

  &__part {
    & + & {
      margin-top: 1rem;
    }
  }

  &__header {
    position: fixed;
    top: 3.5rem;
  }

  &__body {
    padding-top: calc(50px + 1rem);
    padding-right: 1rem;
    padding-left: 1rem;
    box-sizing: border-box;
  }

  &__section {
    &:not(:last-child) {
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
    }

    &--title {
      margin-left: 1rem;
    }
  }

  &__grid {
    display: flex;
    width: 100%;
    flex-direction: column;
  }

  &__part {
    &--steps {
      display: none;
    }

    & + * > * {
      margin-top: 1rem;
    }
  }

  &__grid-part {
    & + & {
      margin-top: 1rem;
    }

    * + * {
      margin-top: 1rem;
    }
  }

  &__item {
    & + & {
      margin-top: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .leads-details {
    &__part {
      &--steps {
        display: block;
      }
    }
  }
}

@media (min-width: $breakpoint-min-lg) {
  .leads-details {
    &__grid {
      flex-direction: row;
    }

    &__grid-part {
      & + & {
        margin-top: 0px;
      }
    }

    &__grid-part--right {
      width: 100%;
    }

    &__grid-part--left {
      // Do the same thing as flex: 0 0 30rem but with better compatibility with older browsers
      width: 30rem;
      min-width: 30rem;
      max-width: 30rem;
      margin-right: 1rem;
    }
  }
}
</style>

