<template>
  <div class="page-cockpit-surveys">
    <div class="page-cockpit-surveys__loading" v-if="isLoading">
      <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    <template v-else>
      <Notification :type="notificationType" class="page-cockpit-surveys__notification" v-if="displayNotification && notificationMessage && !loading" @close="displayNotification = false">
        <template slot>
          {{ notificationMessage }}
        </template>
      </Notification>
      <Recommendations :recommendations="recommendationContent"/>
      <Tab class="page-cockpit-surveys__survey">
        <template slot="title">
          <Title type="black" icon="icon-gs-cog">{{ $t_locale('pages/cockpit/admin/surveys')('titleSurveyTable') }}</Title>
        </template>
        <template slot="body">
          <SurveyTable
            :garages="garages"
            :serviceTypes="serviceTypes"
            :areSurveysLoading="isLoading"
            :hasMoreSurveys="hasMore"
            :fetchMakeSurveysGarages="fetchMakeSurveysGarages"
            :updateSurveySignature="updateSurveySignature"
            :closeModal="closeModal"
            :openModal="openModal"
            :currentUser="currentUser"
            :surveyHandlers="surveyHandlers"
            class="page-cockpit-surveys__survey-table"
          />
        </template>
      </Tab>
      <span class="page-cockpit-surveys__validation-error-msg" v-if="errorMsg">{{ errorMsg }}</span>
      <div class="page-cockpit-surveys__btn-wrapper">
        <Button
          :disabled="!isSurveyValid || hasErrorMessage"
          @click="sendModifications"
          type="orange"
          class="page-cockpit-surveys__btn-wrapper__btn"
        >
          <span>{{ $t_locale('pages/cockpit/admin/surveys')('validate') }}</span>
        </Button>
      </div>
    </template>
  </div>
</template>

<script>
  import SurveyTable from '~/components/cockpit/admin/surveys/SurveyTable';
import Recommendations from "~/components/global/Recommendations.vue";
import { setupHotJar } from '../../../util/externalScripts/hotjar';
import {makeApolloMutations, makeApolloQueries} from '~/util/graphql';

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
    middleware: ['hasAccessToSurveys'],
    components: { SurveyTable, Recommendations },
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
    data() {
      return {
        displayNotification: true,
        recommendationContent: this.$t_locale('pages/cockpit/admin/surveys')('recommendationsContent'),
        garageSurveySignatureModifications: [],
        isGarageSignatureModificationsValid: false,
        successfullySaved: false,
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
      };
    },
    watch: {
      isLoading() {
        this.updateSurveySignature([]);
      }
    },
    computed: {
      surveyHandlers() {
        return {
          removeMakeSurvey: this.removeMakeSurvey,
          updateMakeSurvey: this.updateMakeSurvey,
        };
      },
      currentUser() {
        return this.$store.getters['auth/currentUser'];
      },
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
      errorMsg() {
        return false;
      },
      notificationMessage() {
        switch (this.$route.query.results) {
          case 'yes': return this.$t_locale('pages/cockpit/admin/surveys')('notificationYes');
          case 'partially': return this.$t_locale('pages/cockpit/admin/surveys')('notificationPartially');
          case 'no': return this.$t_locale('pages/cockpit/admin/surveys')('notificationNo');
          case 'unsubscribed': return this.$t_locale('pages/cockpit/admin/surveys')('notificationUnsubscribed');
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
      setSearch(search) {
        if (this.search !== search) {
          this.page = 0;
        }
        this.search = search;
      },
      setIsLoading(isLoading) {
        this.isLoading = isLoading;
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
      openModal(payload) {
        return this.$store.dispatch('openModal', payload);
      },
      closeModal(payload) {
        return this.$store.dispatch('closeModal', payload);
      },
      async updateMakeSurvey({ value, brand, garageId, type }) {
        await this.removeMakeSurvey({ value, brand, garageId, type });
        this.addModification({ value, brand, garageId, type });
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
      async removeMakeSurvey({ brand, garageId, type }) {
        this.removeModification({ brand, garageId, type});
      },
      sendModifications() {
        const modifications = this.getCleanSurveySignatureModifications();
        this.saveModificationsPopup(modifications);
      },
      async saveModificationsPopup(surveySignaturesModifications) {
        const wereSurveyDataModified = this.gsModifications > 0;
        const wereSignaturesModified = surveySignaturesModifications?.length;

        if (wereSurveyDataModified || wereSignaturesModified) {
          if (wereSurveyDataModified) {
            this.openModal({
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
      getCleanSurveySignatureModifications() {
        // Not a computed because I want it only when requested, not something that will update on each change
        // The goal here is to avoid changing other signatures than the default one if useDefault flag has been set to true
        const modifications = this.garageSurveySignatureModifications.map(({ garageId, surveySignature }) => {
          if (surveySignature.useDefault) {
            const onlyDefaultSignatureIfPresent = {
              useDefault: surveySignature.useDefault,
              ...(surveySignature.defaultSignature ? { defaultSignature: surveySignature.defaultSignature } : {})
            };
            return { garageId, surveySignature: onlyDefaultSignatureIfPresent };
          }
          return { garageId, surveySignature };
        });
        return modifications;
      },
      validateGarageSignatureModifications() {
        if (!this.garageSurveySignatureModifications.length) return false;
        let areModificationsValid = true;
        for (const { surveySignature } of this.garageSurveySignatureModifications) {
          if (surveySignature.useDefault && surveySignature.defaultSignature) {
            const { lastName, firstName, job } = surveySignature.defaultSignature;
            if (lastName === '' || firstName === '' || job === '') areModificationsValid = false;
          }
          const { defaultSignature = {}, Maintenance = {}, NewVehicleSale = {}, UsedVehicleSale = {} } = surveySignature;
          for (const { lastName, firstName, job } of [defaultSignature, Maintenance, NewVehicleSale, UsedVehicleSale]) {
            if (lastName === '' || firstName === '' || job === '') areModificationsValid = false;
          }
        }
        return areModificationsValid;
      },
      resetState() {
        this.garages = [];
        this.serviceTypes = defaultState.serviceTypes;
        this.page = 0;
        this.gsModifications = 0;
        this.modifications = [];
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
      },
      updateSurveySignature(newSurveySignatureModifications) {
        // Normally I should handle the event here but...
        // I will just retreive an object from the child component who handled it
        this.garageSurveySignatureModifications = newSurveySignatureModifications;
        this.isGarageSignatureModificationsValid = this.validateGarageSignatureModifications();
      },
    },
    mounted() {
      const { locale } = this.navigationDataProvider;
      setupHotJar(locale, 'admin_survey');
      if (this.$route.query.results === 'unsubscribed') {
        this.unsubscribe();
      }
      this.fetchMakeSurveysGarages('');
    }
  }
</script>

<style lang="scss" scoped>
  $all-around-margin: 1rem;
  .page-cockpit-surveys {
    min-height: calc(100vh - 5rem);
    position:relative;
    background-color: $bg-grey;
    padding: $all-around-margin;
    padding-bottom: 0;
    min-width: calc(75rem + 2 * #{$all-around-margin});
    &__loading {
      position:absolute;
      width:100%;
      top:0;
      left: 0;
      right: 0;
      display:flex;
      justify-content:center;
      padding-top:40vh;
      height:100%;
      background-color: rgba(white, .9);
      z-index:10;
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
      text-align:center;
      width:100%;
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

    /* loading */
  .lds-roller {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
  }
  .lds-roller div {
    animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    transform-origin: 32px 32px;
  }
  .lds-roller div:after {
    content: " ";
    display: block;
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $blue;
    margin: -3px 0 0 -3px;
  }
  .lds-roller div:nth-child(1) {
    animation-delay: -0.036s;
  }
  .lds-roller div:nth-child(1):after {
    top: 50px;
    left: 50px;
  }
  .lds-roller div:nth-child(2) {
    animation-delay: -0.072s;
  }
  .lds-roller div:nth-child(2):after {
    top: 54px;
    left: 45px;
  }
  .lds-roller div:nth-child(3) {
    animation-delay: -0.108s;
  }
  .lds-roller div:nth-child(3):after {
    top: 57px;
    left: 39px;
  }
  .lds-roller div:nth-child(4) {
    animation-delay: -0.144s;
  }
  .lds-roller div:nth-child(4):after {
    top: 58px;
    left: 32px;
  }
  .lds-roller div:nth-child(5) {
    animation-delay: -0.18s;
  }
  .lds-roller div:nth-child(5):after {
    top: 57px;
    left: 25px;
  }
  .lds-roller div:nth-child(6) {
    animation-delay: -0.216s;
  }
  .lds-roller div:nth-child(6):after {
    top: 54px;
    left: 19px;
  }
  .lds-roller div:nth-child(7) {
    animation-delay: -0.252s;
  }
  .lds-roller div:nth-child(7):after {
    top: 50px;
    left: 14px;
  }
  .lds-roller div:nth-child(8) {
    animation-delay: -0.288s;
  }
  .lds-roller div:nth-child(8):after {
    top: 45px;
    left: 10px;
  }
  @keyframes lds-roller {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

</style>
