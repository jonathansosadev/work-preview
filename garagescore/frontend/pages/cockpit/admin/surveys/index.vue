<template>
  <div class="page-cockpit-surveys">
    <div v-if="isLoading" class="page-cockpit-surveys__loading">
      <LDSRollerLoader />
    </div>
    <template v-else>
      <Notification
        v-if="showNotification"
        :type="notificationType"
        @close="toggleNotification(false)"
        class="page-cockpit-surveys__notification"
      >
        <template #default>
          {{ notificationMessage }}
        </template>
      </Notification>
      <Recommendations :recommendations="recommendationContent"/>
      <Tab class="page-cockpit-surveys__survey">
        <template #title>
          <Title
            icon="icon-gs-cog"
            type="black"
          >
            {{ $t('titleSurveyTable') }}
          </Title>
        </template>
        <template #body>
          <SurveyTable
            :garages="garages"
            :serviceTypes="serviceTypes"
            :areSurveysLoading="isLoading"
            :hasMoreSurveys="hasMore"
            :fetchMakeSurveysGarages="fetchMakeSurveysGarages"
            :updateSurveySignature="updateSurveySignature"
            :closeModal="modalMixin.closeModal"
            :openModal="modalMixin.openModal"
            :currentUser="currentUser"
            :surveyHandlers="surveyHandlers"
            class="page-cockpit-surveys__survey-table"
          />
        </template>
      </Tab>
      <span
        v-if="errorMessage"
        class="page-cockpit-surveys__validation-error-msg"
      >
        {{ errorMessage }}
      </span>
      <div class="page-cockpit-surveys__btn-wrapper">
        <Button
          :disabled="!isSurveyValid || hasErrorMessage"
          @click="sendModifications"
          type="orange"
          class="page-cockpit-surveys__btn-wrapper__btn"
        >
          <span>{{ translatedButtonText }}</span>
        </Button>
      </div>
    </template>
  </div>
</template>

<script>
  import SurveyTable from '~/components/cockpit/admin/surveys/SurveyTable';
  import Recommendations from '~/components/global/Recommendations.vue';
  import { setupHotJar } from '~/util/externalScripts/hotjar';
  import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';

  import LDSRollerLoader from './LDSRollerLoader';

  const defaultState = {
    garages: [],
    serviceTypes: {
      Maintenance: 0,
      NewVehicleSale: 0,
      UsedVehicleSale: 0
    },
    loading: true,
    hasMore: true,
    page: 0,
    gsModifications: 0,
    search: 0,

    modifications: [],
  };

  export default {
    name: "SurveysPage",
    components: {
      LDSRollerLoader,
      Recommendations,
      SurveyTable,
    },
    props: {
      navigationDataProvider: {
        type: Object,
        required: true,
      },
      modalMixin: {
        type: Object,
        required: true,
      },
    },
    middleware: ['hasAccessToSurveys'],

    mounted() {
      const { locale } = this.navigationDataProvider;
      setupHotJar(locale, 'admin_survey');
      if (this.$route.query.results === 'unsubscribed') {
        this.unsubscribe();
      }
      this.fetchMakeSurveysGarages('');
    },

    data() {
      return {
        successfullySaved: false,
        displayNotification: true,
        recommendationContent: this.$t('recommendationsContent'),
        garages: [],
        serviceTypes: {
          Maintenance: 0,
          NewVehicleSale: 0,
          UsedVehicleSale: 0,
        },
        isLoading: true,
        hasMore: true,
        page: 0,
        gsModifications: 0,
        search: 0,
        modifications: [],
        garageSurveySignatureModifications: [],
        isGarageSignatureModificationsValid: false,
      };
    },

    computed: {
      // State
      translatedButtonText() {
        return this.$t('validate');
      },
      // Prop Drilling
      surveyHandlers() {
        return {
          removeMakeSurvey: this.removeMakeSurvey,
          updateMakeSurvey: this.updateMakeSurvey,
        };
      },
      currentUser() {
        return this.$store.getters['auth/currentUser'];
      },
      // Survey
      isSurveyValid() {
        return (
          this.modifications.length > 0
          || this.isGarageSignatureModificationsValid
        );
      },
      errorMessage() {
        return false;
      },
      hasErrorMessage() {
        return !!this.errorMessage;
      },
      //Notification
      showNotification() {
        return (
          this.displayNotification
          && this.notificationMessage
          && !this.isLoading
        );
      },
      notificationMessage() {
        switch (this.$route.query.results) {
          case 'yes': return this.$t('notificationYes');
          case 'partially': return this.$t('notificationPartially');
          case 'no': return this.$t('notificationNo');
          case 'unsubscribed': return this.$t('notificationUnsubscribed');
          default : return null;
        }
      },
      notificationType() {
        switch (this.$route.query.results) {
          case 'yes': return 'success';
          case 'partially': return 'danger';
          case 'no': return 'danger';
          case 'unsubscribed': return 'danger';
          default : return null;
        }
      }
    },
    methods: {
      // State
      setIsLoading(isLoading) {
        this.isLoading = isLoading;
      },
      setSearch(search) {
        if (this.search !== search) {
          this.page = 0;
        }
        this.search = search;
      },
      addModification({ value, brand, isMaker, garageId, type }) {
        this.modifications.push({
          brand,
          garageId,
          isMaker,
          type,
          value,
        });
        this.gsModifications++;
      },
      removeModification({ brand, isMaker, garageId, type }) {
        const previousLength = this.modifications.length;
        this.modifications = this.modifications.filter(
          entry => (
            entry.brand !== brand
            || entry.isMaker !== isMaker
            || entry.garageId !== garageId
            || entry.type !== type
          )
        );
        this.gsModifications -= previousLength - this.modifications.length;
      },
      resetState() {
        this.garages = [];
        this.serviceTypes = defaultState.serviceTypes;
        this.loading = true; // TODO Useful ?
        this.hasMore = true; // TODO Useful ?
        this.page = 0;
        this.gsModifications = 0;
        this.modifications = [];
      },
      setGarages(data) {
        if (data?.length) {
          if (data.length > 10) {
            data.length = 10;
            this.hasMore = true;
          } else {
            this.hasMore = false;
          }
          for (const garage of data) {
            if (garage.firstContactDelay) {
              const keys = Object.keys(garage.firstContactDelay);
              for (const key of keys) {
                if (garage.firstContactDelay[key]) {
                  this.serviceTypes[key]
                    ? this.serviceTypes[key]++
                    : this.serviceTypes[key] = 1;
                }
              }
            }
          }
        }
        if (this.page === 0) {
          this.garages= [];
        }
        this.garages = this.garages.concat(data);
        this.page++;
      },
      setSurveySignatures(modifiedGaragesArray) {
        for (const modifiedGarage in modifiedGaragesArray) {
          const {
            id: newId,
            surveySignature: newSurveySignature,
          } = modifiedGarage;
          const garageIndex = this.garages.findIndex(
            ({ id }) => id === newId
          );

          if (garageIndex !== -1) {
            this.garages[garageIndex].surveySignature = newSurveySignature;
          }
        }
      },
      resetGarages() {
        this.garages = [];
      },
      // Toast
      displayToast(withNotification = false) {
        if (withNotification) {
          this.displaySavedWithNotificationToast();
        } else {
          this.displaySavedToast();
        }
      },
      displaySavedToast() {
        return this.$toast.success(this.$t('saved'));
      },
      displaySavedWithNotificationToast() {
        return this.$toast.success(this.$t('savedWithNotification'));
      },
      // Notification
      toggleNotification(value) {
        this.displayNotification = value ?? !this.displayNotification;
      },
      // Survey
      sendModifications() {
        const modifications = this.getCleanSurveySignatureModifications();
        this.saveModificationsPopup(modifications);
      },
      getCleanSurveySignatureModifications() {
        // Not a computed because I want it only when requested,
        // not something that will update on each change
        // The goal here is to avoid changing other signatures
        // than the default one if useDefault flag has been set to true
        return this.garageSurveySignatureModifications.map(
          ({ garageId, surveySignature }) => {
            const isCustomSignature = !surveySignature.useDefault;
            if (isCustomSignature) {
              return { garageId, surveySignature };
            }

            const onlyDefaultSignatureIfPresent = {
              useDefault: surveySignature.useDefault,
              ...(
                surveySignature.defaultSignature
                  ? { defaultSignature: surveySignature.defaultSignature }
                  : {}
              ),
            };
            return {
              garageId,
              surveySignature: onlyDefaultSignatureIfPresent
            };
          }
        );
      },
      validateGarageSignatureModifications() {
        if (!this.garageSurveySignatureModifications.length) {
          return false;
        }

        let areModificationsValid = true;
        for (const { surveySignature } of this.garageSurveySignatureModifications) {
          if (surveySignature.useDefault && surveySignature.defaultSignature) {
            const {
              lastName,
              firstName,
              job,
            } = surveySignature.defaultSignature;
            if (lastName === '' || firstName === '' || job === '') {
              areModificationsValid = false;
            }
          }
          const {
            defaultSignature = {},
            Maintenance = {},
            NewVehicleSale = {},
            UsedVehicleSale = {},
          } = surveySignature;
          const surveySignatureFragments = [
            defaultSignature,
            Maintenance,
            NewVehicleSale,
            UsedVehicleSale
          ];
          for (const { lastName, firstName, job } of surveySignatureFragments) {
            if (lastName === '' || firstName === '' || job === '') {
              areModificationsValid = false;
            }
          }
        }
        return areModificationsValid;
      },
      updateSurveySignature(newSurveySignatureModifications) {
        // Normally I should handle the event here but...
        // I will just retrieve an object from the child component who handled it
        this.garageSurveySignatureModifications = newSurveySignatureModifications;
        this.isGarageSignatureModificationsValid = this.validateGarageSignatureModifications();
      },
      // Actions
      async sendContact({ form, context }) {
        const request = {
          name: 'contactSetContactToBeSent',
          args: {
            ...form,
            context,
          },
          fields: `
            status
            error
          `
        };
        const { data } = await makeApolloMutations([request]);
        return data.contactSetContactToBeSent.status;
      },
      async fetchMakeSurveysGarages(search) {
        if (this.hasMore || this.search !== search) {
          this.setIsLoading(true);
          this.setSearch(search);
          const garageGetMakeSurveyGarages = {
            name: 'garageGetMakeSurveyGarages',
            args: {
              page: this.page,
              search: this.search
            },
            fields:`
              id
              publicDisplayName
              brands
              contactIds {
                Maintenance
                NewVehicleSale
                UsedVehicleSale
              }
              garageType
              firstContactDelay {
                Maintenance {
                  value
                  history {
                    userId
                    userFirstName
                    userLastName
                    userEmail
                    date
                    value
                    prevValue
                  }
                }
                NewVehicleSale {
                  value
                  history {
                    userId
                    userFirstName
                    userLastName
                    userEmail
                    date
                    value
                    prevValue
                  }
                }
                UsedVehicleSale {
                  value
                  history {
                    userId
                    userFirstName
                    userLastName
                    userEmail
                    date
                    value
                    prevValue
                  }
                }
              }
              surveySignature {
                useDefault
                defaultSignature {
                  lastName
                  firstName
                  job
                }
                Maintenance {
                  lastName
                  firstName
                  job
                }
                NewVehicleSale {
                  lastName
                  firstName
                  job
                }
                UsedVehicleSale {
                  lastName
                  firstName
                  job
                }
              }
            `
          };
          const { data } = await makeApolloQueries([garageGetMakeSurveyGarages]);
          this.setGarages(data.garageGetMakeSurveyGarages);
          this.setIsLoading(false);
        }
      },
      async updateMakeSurvey({ value, brand, garageId, type }) {
        await this.removeMakeSurvey({ value, brand, garageId, type });
        this.addModification({ value, brand, garageId, type });
      },
      async removeMakeSurvey({ brand, garageId, type }) {
        this.removeModification({ brand, garageId, type});
      },
      async unsubscribe() {
        this.setIsLoading(true);
        const request = {
          name: 'userSetUserUnsubscribeMakeSurveys',
          args: { },
          fields: `
            success
          `,
        };
        const { data } = await makeApolloMutations([request]);
        if (data.userSetUserUnsubscribeMakeSurveys.success) {
          this.setIsLoading(false);
        } else {
          console.error('Can\'t unsubscribe. Server error.');
        }
      },
      async saveModificationsPopup(surveySignaturesModifications) {
        const wereSurveyDataModified = this.gsModifications > 0;
        const wereSignaturesModified = surveySignaturesModifications?.length;

        if (wereSurveyDataModified || wereSignaturesModified) {
          if (wereSurveyDataModified) {
            this.$store.dispatch('openModal', {
              component: 'ModalMakeSurveys',
              props: {
                closeModal: () => this.$store.dispatch('closeModal'),
                surveySignaturesModifications,
                saveModifications: this.saveModifications,
                updateGarageSurveySignature: this.updateGarageSurveySignature,
              },
            });
          } else if (wereSignaturesModified) {
            await this.updateGarageSurveySignature(
              surveySignaturesModifications,
            );
          }
        }
      },
      async updateGarageSurveySignature(modificationsArray) {
        const updateSignaturesRequest = {
          name: 'garageSetSurveySignature',
          args: { modifications: modificationsArray },
          fields: `
            status
            message
            modifiedGarages {
              id
              surveySignature {
                useDefault
                defaultSignature {
                  lastName
                  firstName
                  job
                }
                Maintenance {
                  lastName
                  firstName
                  job
                }
                NewVehicleSale {
                  lastName
                  firstName
                  job
                }
                UsedVehicleSale {
                  lastName
                  firstName
                  job
                }
              }
            }
          `
        };
        const { data } = await makeApolloMutations([updateSignaturesRequest]);
        if (data?.garageSetSurveySignature?.status === 200) {
          const wereSurveyDataModified = this.gsModifications > 0;
          if (!wereSurveyDataModified) {
            this.displayToast();
          }
          this.setSurveySignatures(
            data.garageSetSurveySignature.modifiedGarages
          );
        }
      },
      async saveModifications({ shouldNotifyAdmin }) {
        this.resetGarages();
        this.setIsLoading(true);
        const request = {
          name: 'GarageSetGarageMakeSurveys',
          args: {
            modifications: this.modifications,
            isAlertAdmin: shouldNotifyAdmin,
          },
          fields: `
            success
          `,
        };
        const { data } = await makeApolloMutations([request]);

        if (data.GarageSetGarageMakeSurveys.success) {
          this.displayToast(shouldNotifyAdmin);
          this.resetState();
          await this.fetchMakeSurveysGarages(this.search);
        }
        this.setIsLoading(false);
      }
    },
    watch: {
      isLoading() {
        this.updateSurveySignature([]);
      }
    },
  }
</script>

<style lang="scss" scoped>
  .page-cockpit-surveys {
    min-height: calc(100vh - 5rem);
    position:relative;
    background-color: $bg-grey;
    padding: 1rem 1rem 0;
    min-width: calc(75rem + 2 * 1rem);
    &__loading {
      position: absolute;
      width: 100%;
      top:0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      padding-top: 40vh;
      height: 100%;
      background-color: rgba(white, .9);
      z-index: 10;
    }
    &__notification {
      margin-bottom:1rem;
    }
    &__introduction {
      margin-bottom:1rem;
      min-width: 75rem;
    }
    &__survey {
      margin-top: 1rem;
      min-width: 75rem;
    }
    &__survey-table {
      padding: 0.5rem 1rem 0 1rem;
      width: calc(100% - 2rem);
    }
    &__btn-wrapper {
      position: sticky;
      bottom: 0;
      z-index: 2;
      padding: 1rem 2rem 1.5rem 2rem;
      background-color: $bg-grey;
      display: flex;
      align-items: center;
      justify-content: center;
      &__btn {
        width: 9rem;
      }
    }
    &__validation-error-msg {
      color: $red;
      display: block;
      text-align: center;
      width: 100%;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
  }

  @media screen and (max-width: calc(#{$breakpoint-max-md})) {
    .page-cockpit-surveys {
      min-width: 0;
      width:100%;
      &__introduction {
        width: calc(100% - 2 * 1rem);
        min-width: 0;
      }
      &__survey {
        width: calc(100% - 2 * 1rem);
        min-width: 0;
      }
      &__btn-wrapper {
        box-sizing: border-box;
        width: calc(100% - 2 * 1rem);
      }
      &__notification {
        box-sizing: border-box;
        width: calc(100% - 2 * 1rem);
      }
    }
  }
</style>
