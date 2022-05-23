<template>
  <div class="unsatisfied-details">
    <PlaceholderLoading v-if="loading" fullScreen />
    <template v-else-if="unsatisfiedTicket">
      <HeaderNavFolder
        class="unsatisfied-details__header"
        :currentId="unsatisfiedTicket.id"
        :items="unsatisfiedList"
        routeList="cockpit-unsatisfied-reviews"
        routeItem="cockpit-unsatisfied-id"
        :sidebarTiny="classBindingSideBarTiny"
      />
      <div class="unsatisfied-details__body">
        <div class="unsatisfied-details__part">
          <CardFolderResume
            v-bind="{ unsatisfiedTicket }"
            :isClose="isClose"
            :configResponsesScore="configResponsesScore"
            :garageSignatures="garageSignatures"
            :currentUser="currentUser"
            :customResponseLoading="customResponseLoading"
            :customResponseHasMoreTemplates="customResponseHasMoreTemplates"
            :fetchResponses="fetchResponses"
            :createReviewReply="createReviewReply"
            :updateReviewReply="updateReviewReply"
            :openModal="openModal"
            :customResponseAppendResponses="customResponseAppendResponses"
            :addTicketAction="addTicketAction"
          />
        </div>
        <div class="unsatisfied-details__part unsatisfied-details__part--steps">
          <div class="unsatisfied-details__section">
            <StepsUnsatisfied
              :actions="ticketActions"
              :ticketStatus="ticketStatus"
              :cockpitType="navigationDataProvider.cockpitType"
              :isManual="!(ticketRatingValue || ticketRatingValue === 0)"
            />
          </div>
        </div>
        <div class="unsatisfied-details__part">
          <div class="unsatisfied-details__grid">
            <div class="unsatisfied-details__grid-part unsatisfied-details__grid-part--left">
              <CardCustomerInfo v-bind="unsatisfiedTicket" :updateTicketFunction="updateTicket" />
            </div>
            <div class="unsatisfied-details__grid-part unsatisfied-details__grid-part--right">
              <CardFolderManagement
                v-if="!isClose"
                class="unsatisfied-details__item"
                :unsatisfiedTicket="unsatisfiedTicket.unsatisfiedTicket"
                :openModalDispatch="openModal"
                :appendTicketUserDispatch="appendTicketUser"
                :cockpitType="navigationDataProvider.cockpitType"
                folderManagementComponent="WizardUnsatisfiedFolder"
                :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
                :jobsByCockpitType="jobsByCockpitType"
                :userRole="userRole"
                :id="unsatisfiedTicket.id"
                :garage="unsatisfiedTicket.garage"
                ticketType="unsatisfiedTicket"
                :solutionOptions="solutionOptions"
                :claimOptions="claimOptions"
                :addTicketAction="addTicketAction"
                :availableGarages="navigationDataProvider.availableGarages"
              />
              <HistoryTicket
                class="unsatisfied-details__item"
                :id="unsatisfiedTicket.id"
                type="unsatisfied"
                :ticket="unsatisfiedTicket.unsatisfiedTicket"
                :cockpitType="ticketGarageType"
                :cancelReminderDispatch="cancelReminder"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="!ticket">
      <AppText class="unsatisfied-details__error" tag="span" bold align="center" :type="errorType" size="lg">
        {{ errorName }}
      </AppText>
    </template>
  </div>
</template>

<script>
import CardCustomerInfo from '~/components/cockpit/unsatisfied/_id/CardCustomerInfo';
import CardFolderResume from '~/components/cockpit/unsatisfied/_id/CardFolderResume';
import StepsUnsatisfied from '~/components/cockpit/unsatisfied/_id/StepsUnsatisfied';
import CardFolderManagement from '~/components/global/CardFolderManagement';
import HeaderNavFolder from '~/components/global/HeaderNavFolder';
import HistoryTicket from '~/components/global/HistoryTicket';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { buildQuery, makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import { getDeepFieldValue as deep } from '~/utils/object';

export default {
  name: "UnsatisfiedDetailPage",
  components: {
    CardCustomerInfo,
    CardFolderManagement,
    CardFolderResume,
    HeaderNavFolder,
    HistoryTicket,
    StepsUnsatisfied,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToUnsatisfied'],

  data() {
    return {
      loadingReviews: true,
      unsatisfiedList: [],
      loading: true,

      unsatisfiedTicket: null,
      unsatisfiedTicketError: '',

      solutionOptions: [
        { value: 'CustomerCall' },
        { value: 'GarageSecondVisit' },
        { value: 'Voucher' },
        { value: 'Other' },
      ],

      claimOptions: [
        { value: 'UnreachableCustomer' },
        { value: 'RejectedSolution' },
        { value: 'ConstructorProblem' },
        { value: 'UnjustifiedClaim' },
        { value: 'OtherServiceProblem' },
      ],
    };
  },

  created() {
    this.deep = (fieldName) => deep(this.unsatisfiedTicket, fieldName);
  },
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'unsatisfied');
    this.navigationDataProvider.refreshRouteParameters();
    await this.navigationDataProvider.fetchGarageSignatures();
    await this.refreshView();
  },

  computed: {
    ticketActions() {
      return this.deep('unsatisfiedTicket.actions');
    },

    ticketStatus() {
      return this.deep('unsatisfiedTicket.status');
    },

    ticketRatingValue() {
      return this.deep('review.rating.value');
    },

    ticketGarageType() {
      return this.deep('garage.type');
    },
    userRole() {
      return this.$store.state.auth.currentUser.role;
    },

    errorName() {
      const error = this.unsatisfiedTicketError || 'DataNotfound';

      if (error.includes('|')) {
        return this.$t_locale('pages/cockpit/unsatisfied/_id')(error.split('|')[0], { score: error.split('|')[1] });
      }
      return this.$t_locale('pages/cockpit/unsatisfied/_id')(error);
    },

    errorType() {
      const error = this.unsatisfiedTicketError || 'DataNotfound';

      if (error.includes('|')) {
        return 'success';
      }
      return 'danger';
    },

    isClose() {
      return this.ticketStatus.includes('Closed');
    },

    classBindingSideBarTiny() {
      return this.navigationDataProvider.sidebarTiny;
    },

    currentUserIsGarageScoreUser() {
      return !!this.$store.getters['auth/isGaragescoreUser'];
    },

    jobsByCockpitType() {
      const cockpitType = this.navigationDataProvider.cockpitType;
      return this.$store.getters['profile/jobsByCockpitType'](cockpitType) || [];
    },
    configResponsesScore() {
      return this.$store.getters['cockpit/admin/customResponse/configResponsesScore'];
    },
    garageSignatures() {
      return this.navigationDataProvider.garageSignatures;
    },
    currentUser() {
      const user = this.$store.getters['auth/currentUser'];
      return {
        firstName: user.firstName,
        lastName: user.lastName,
      };
    },
    customResponseLoading() {
      return this.$store.getters['cockpit/admin/customResponse/loading'];
    },
    customResponseHasMoreTemplates() {
      return this.$store.getters['cockpit/admin/customResponse/hasMoreTemplates'];
    },
  },
  methods: {
    openModal(payload) {
      this.$store.dispatch('openModal', payload);
    },
    async customResponseAppendResponses(rating) {
      await this.$store.dispatch('cockpit/admin/customResponse/appendResponsesByScore', rating);
    },

    async fetchResponses(rating, garageId) {
      await this.$store.dispatch('cockpit/admin/customResponse/fetchResponses', { rating, garageId });
    },

    async updateTicket({ id, field, value }) {
      const prefix = 'unsatisfiedTicket';

      const getBackendField = (field) => {
        switch (field) {
          case 'customerFullName':
            return `${prefix}.customer.fullName`;
          case 'phone':
            return `${prefix}.customer.contact.mobilePhone`;
          case 'email':
            return `${prefix}.customer.contact.email`;
          case 'vehicleMakeModel':
            return `${prefix}.vehicle.makeModel`;
          case 'leadCylinder':
            return `${prefix}.cylinder`;
          case 'vehicleModel':
            return `${prefix}.vehicle.model`;
          case 'vehicleBrand':
            return `${prefix}.vehicle.make`;
          case 'vehiclePlate':
            return `${prefix}.vehicle.plate`;
          case 'vehicleMileage':
            return `${prefix}.vehicle.mileage`;
          case 'brands':
            return `${prefix}.brandModel`;
          default:
            return `${prefix}.${field}`;
        }
      };

      const backendField = getBackendField(field);
      const resp = await buildQuery(
        'updateActiveTicketInformation',
        {
          id,
          field: backendField,
          ...(Array.isArray(value) ? { arrayValue: value } : { value }),
        },
        { message: String, status: String },
        true
      );

      if (resp.errors && resp.errors.length) {
        return false;
      }
      const statusIsOK = resp?.data?.updateActiveTicketInformation?.status === 'OK';
      if (statusIsOK) {
        await this.fetchUnsatisfiedTicket({ id, method: 'setUnsatisfiedTicket' });
      }
      return statusIsOK;
    },

    async createReviewReply({ id, comment }) {
      const request = {
        name: 'dataSetCreateReply',
        args: { reviewId: id, comment },
        fields: `message
          status
          reviewReplyStatus
          reviewReplyRejectedReason
        `,
      };
      const resp = await makeApolloMutations([request]);
      const { data: { dataSetCreateReply } = {} } = resp;

      if (dataSetCreateReply?.status) {
        this.setUnsatisfiedTicketReply({
          text: comment,
          status: dataSetCreateReply?.reviewReplyStatus,
          rejectedReason: dataSetCreateReply?.reviewReplyRejectedReason,
        });
      }
      return resp?.data;
    },

    async updateReviewReply({ id, comment }) {
      const request = {
        name: 'dataSetUpdateReply',
        args: { reviewId: id, comment },
        fields: `message
          status
          reviewReplyStatus
          reviewReplyRejectedReason
        `,
      };
      const resp = await makeApolloMutations([request]);
      const { data: { dataSetUpdateReply } = {} } = resp;

      if (dataSetUpdateReply?.status) {
        this.setUnsatisfiedTicketReply({
          text: comment,
          status: dataSetUpdateReply?.reviewReplyStatus,
          rejectedReason: dataSetUpdateReply?.reviewReplyRejectedReason,
        });
      }
      return resp?.data;
    },

    async fetchUnsatisfiedTicket({ id, fields, method }) {
      if (!fields) {
        fields = `
        id
        unsatisfiedTicket {
            createdAt
            closedAt
            comment
            type
            status
            frontDeskUserName
            customer {
                fullName
                contact {
                    mobilePhone
                    email
                }
            }
            vehicle {
                model
                plate
                make
                mileage
            }
            actions {
                name
                createdAt
                reminderActionName
                reminderStatus
                reminderDate
                assigner {
                  id
                  email
                  firstName
                  lastName
                }
                reminderTriggeredBy {
                  id
                  email
                  firstName
                  lastName
                }
                ticketManager {
                  id
                  email
                  firstName
                  lastName
                  job
                }
                isManual
                unsatisfactionResolved
                followupIsRecontacted
                providedSolutions
                claimReasons
                newArrayValue
                previousArrayValue
                previousValue
                field
                comment
                followupStatus
            }
            manager {
                firstName
                lastName
                email
                id
            }
        }
        customer {
            city {
                value
            }
        }
        garage {
            id
            publicDisplayName
            type
            users {
              id
              email
              firstName
              lastName
              job
              hasOnlyThisGarage
            }
        }
        unsatisfied {
            criteria {
                label
                values
            }
        }
        review {
            comment {
                text
            }
            rating {
              value
            }
            reply {
              status
              text
              rejectedReason
            }
        }
        service {
          providedAt
        }
      `;
      }
      const request = {
        name: 'dataGetUnsatisfiedTicket',
        args: {
          id,
        },
        fields,
      };
      const resp = await makeApolloQueries([request]);
      this[method](resp.data.dataGetUnsatisfiedTicket || null);
      this.setUnsatisfiedTicketError((resp?.errors?.length && resp?.errors[0]?.message) || '');
    },

    async addTicketAction({ id, action, comment, reminder, transferTo, closeReason }) {
      const ticket = this.unsatisfiedTicket;

      const args = {
        id,
        name: action,
        createdAt: new Date(),
        type: 'unsatisfied',
        assignerUserId: this.$store.state.auth.currentUser.id,
        comment: comment,
        alertContributors: false,
      };

      // transfer
      if (action === 'transfer') {
        args.previousTicketManagerId = ticket.manager ? ticket.manager.id : null;
        args.ticketManagerId = transferTo;
      }

      // first action assign people
      if (!ticket.manager && !args.ticketManagerId) {
        args.ticketManagerId = this.$store.state.auth.currentUser.id;
      }

      // closing details
      if (action === 'unsatisfiedClosed') {
        const solution = this.solutionOptions.find((e) => e.value === closeReason);
        const claim = this.claimOptions.find((e) => e.value === closeReason);

        args.unsatisfactionResolved = solution !== undefined;
        args.providedSolutions = solution ? [solution.value] : null;
        args.claimReasons = claim ? [claim.value] : null;
      }

      // reminder management
      if (reminder && !['transfer', 'unsatisfiedClosed', 'unsatisfiedReopened'].includes(action)) {
        args.name = 'reminder';
        args.reminderFirstDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderNextDay = Math.floor(this.$moment.duration(this.$moment(reminder).valueOf()).asDays());
        args.reminderActionName = action;
        args.reminderStatus = 'NotResolved';
        args.reminderDate = reminder;
      }

      const request = {
        name: 'dataSetAction',
        args,
        fields: `
        message
        status
      `,
      };
      const resp = await makeApolloMutations([request]);
      const statusIsOk = resp.data.dataSetAction.status === 'OK';

      if (statusIsOk) {
        await this.onAfterAddTicketAction({
          id: args.id,
          fetchTicketManager: args.ticketManagerId !== null,
          fetchTicketStatus: ['unsatisfiedClosed', 'unsatisfiedReopened'].includes(action),
        });
      }
      return statusIsOk;
    },

    async onAfterAddTicketAction({ id, fetchTicketManager, fetchTicketStatus }) {
      let fields = `
        id
        unsatisfiedTicket {
            actions {
                name
                createdAt
                reminderActionName
                reminderStatus
                reminderDate
                assigner {
                  id
                  email
                  firstName
                  lastName
                }
                reminderTriggeredBy {
                  id
                  email
                  firstName
                  lastName
                }
                ticketManager {
                  id
                  email
                  firstName
                  lastName
                  job
                }
                isManual
                unsatisfactionResolved
                followupIsRecontacted
                providedSolutions
                claimReasons
                newArrayValue
                previousArrayValue
                previousValue
                field
                comment
                followupStatus
            }
        }`;
      await this.fetchUnsatisfiedTicket({ id, fields, method: 'setUnsatisfiedTicketActions' });

      if (fetchTicketManager) {
        fields = `
        id
        unsatisfiedTicket {
            manager {
                firstName
                lastName
                email
                id
            }
        }`;
        await this.fetchUnsatisfiedTicket({ id, fields, method: 'setUnsatisfiedTicketManager' });
      }

      if (fetchTicketStatus) {
        fields = `
        id
        unsatisfiedTicket {
            closedAt
            status
        }`;
        await this.fetchUnsatisfiedTicket({ id, fields, method: 'setUnsatisfiedTicketStatus' });
      }
    },

    async cancelReminder({ id, type, actionCreatedAt }) {
      const request = {
        name: 'dataSetCancelReminder',
        args: {
          id,
          userId: this.$store.state.auth.currentUser.id,
          createdAt: actionCreatedAt,
          ticketType: type,
        },
        fields: `
        status
      `,
      };
      const resp = await makeApolloMutations([request]);
      const { data: { dataSetCancelReminder: { status } = {} } = {} } = resp;

      if (status) {
        await this.onAfterCancelReminder({ id });
      }
      return status;
    },

    async onAfterCancelReminder({ id }) {
      const fields = `
        id
        unsatisfiedTicket {
            actions {
                name
                createdAt
                reminderActionName
                reminderStatus
                reminderDate
                assigner {
                  id
                  email
                  firstName
                  lastName
                }
                reminderTriggeredBy {
                  id
                  email
                  firstName
                  lastName
                }
                ticketManager {
                  id
                  email
                  firstName
                  lastName
                  job
                }
                isManual
                unsatisfactionResolved
                followupIsRecontacted
                providedSolutions
                claimReasons
                newArrayValue
                previousArrayValue
                previousValue
                field
                comment
                followupStatus
            }
        }
      `;
      await this.fetchUnsatisfiedTicket({ id, fields, method: 'setUnsatisfiedTicketActions' });
    },

    async fetchUnsatisfiedList({ page, append, before } = { page: 1, append: false }) {
      if (!append) {
        this.loadingReviews = true;
      }

      const filters = {
        garageId: this.unsatisfiedTicket.garage.id,
        periodId: this.navigationDataProvider.periodId,
      };

      const request = {
        name: 'dataGetUnsatisfiedList',
        args: {
          limit: this.paginate,
          before,
          ...filters,
          // ...this.currentFilters,
        },
        fields: `datas {
          id
          followupUnsatisfiedStatus
          customer {
            fullName
            contact {
              mobilePhone
              email
            }
            city
          }
          unsatisfiedTicket {
            type
            delayStatus
            status
            createdAt
            referenceDate
            closedAt
            frontDeskUserName
            criteria {
              label
              values
            }
            manager {
              id
              firstName
              lastName
              email
            }
            vehicle {
              make
              model
              plate
              vin
              mileage
              registrationDate
            }
            comment
            actions {
              name
              createdAt
              comment
              unsatisfactionResolved
              closedForInactivity
              providedSolutions
              claimReasons
              isManual
              newValue
              previousValue
              newArrayValue
              previousArrayValue
              field
              reminderDate
              reminderActionName
              reminderStatus
              followupStatus
              followupIsRecontacted
              followupUnsatisfiedCommentForManager
              assigner {
                lastName
                firstName
                email
              }
              ticketManager {
                id
                lastName
                firstName
                email
                job
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
              }
            }
          }
          garage {
            id
            ratingType
            publicDisplayName
            type
          }
          source {
            type
          }
          review {
            createdAt
            followupChangeEvaluation
            rating {
              value
            }
            comment {
              text
              moderated
            }
          }
          service {
            frontDeskCustomerId
            providedAt
          }
          surveyFollowupUnsatisfied {
            sendAt
            lastRespondedAt
          }
          unsatisfied {
            sendAt
            followupStatus
            isRecontacted
            criteria {
              label
              values
            }
          }
        }
        cursor
        hasMore
        noResultGodMode
        `,
      };
      const resp = await makeApolloQueries([request]);
      const { datas, hasMore, cursor, noResultGodMode } = resp.data.dataGetUnsatisfiedList;

      this.currentPage = page;
      this.unsatisfiedListCursor = cursor;
      this.hasMore = hasMore;
      this.noResultGodMode = noResultGodMode;

      if (append) {
        this.unsatisfiedList = [...this.unsatisfiedList, ...datas];
      } else {
        this.unsatisfiedList = datas;
      }
      this.loadingReviews = false;
    },

    setUnsatisfiedTicketReply({ text, status, rejectedReason }) {
      this.unsatisfiedTicket.review.reply = {
        text,
        status,
        rejectedReason,
      };
    },

    setUnsatisfiedTicket(data) {
      this.unsatisfiedTicket = data;
    },

    setUnsatisfiedTicketError(error) {
      this.unsatisfiedTicketError = error;
    },

    setUnsatisfiedTicketActions({ unsatisfiedTicket: { actions } }) {
      this.unsatisfiedTicket.unsatisfiedTicket.actions = actions;
    },

    setUnsatisfiedTicketManager({ unsatisfiedTicket: { manager } }) {
      this.unsatisfiedTicket.unsatisfiedTicket.manager = manager;
    },

    setUnsatisfiedTicketUsers(users) {
      this.unsatisfiedTicket.users = users;
    },

    setUnsatisfiedTicketStatus({ unsatisfiedTicket: { status, closedAt } }) {
      this.unsatisfiedTicket.unsatisfiedTicket.status = status;
      this.unsatisfiedTicket.unsatisfiedTicket.closedAt = closedAt;
    },

    appendTicketUser(user) {
      this.unsatisfiedTicket.users.push(user);
    },

    async refreshView() {
      this.loading = true;
      await this.fetchUnsatisfiedTicket({ id: this.$route.params.id, method: 'setUnsatisfiedTicket' });
      await this.fetchUnsatisfiedList();
      this.loading = false;
    },
  },
  watch: {
    '$route.params.id'() {
      this.refreshView();
    },
  },
};
</script>


<style lang="scss" scoped>
.unsatisfied-details {
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
  }

  &__item {
    & + & {
      margin-top: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .unsatisfied-details {
    &__part {
      &--steps {
        display: block;
      }
    }
  }
}

@media (min-width: $breakpoint-min-lg) {
  .unsatisfied-details {
    &__grid {
      flex-direction: row;
    }

    &__grid-part {
      & + & {
        margin-top: 0;
      }
    }

    &__grid-part--right {
      width: 100%;
    }

    &__grid-part--left {
      width: 30rem;
      min-width: 30rem;
      max-width: 30rem;
      margin-right: 1rem;
    }
  }
}
</style>
