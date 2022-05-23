<template>
  <div class="create">
    <div class="pending-wrapper" v-if="pending">
      <i class="icon-gs-loading" />
    </div>
    <div class="error" v-if="err">
      {{ err[0].message }}
    </div>
    <GarageInfo
      all-fields-required
      :form="form"
      :submit="onSubmit"
      :garages="garages"
      :garageScorePerformersUsers="garageScorePerformersUsers"
    />
  </div>
</template>

<script>
import GarageInfo from '~/components/automatic-billing/details/GarageInfo.vue';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  components: { GarageInfo },
  props: {
    garages: {
      type: Array,
      default: () => [],
    },
    garageScorePerformersUsers: {
      type: Array,
      default: () => [],
    },
    billingAccount: { type: Object, required: true },
    action_createGarage: { type: Function, required: true },
  },

  data() {
    return {
      form: {
        type: GarageTypes.DEALERSHIP,
        ratingType: 'rating',
        isReverseRating: false,
        certificateWording: 'appointment',
        name: '',
        group: '',
        businessId: '',
        googlePlaceId: '',
        zohoDealUrl: '',
        disableZohoUrl: false,
        locale: '',
        additionalLocales: [],
        timezone: '',
        apv: 6,
        vn: 6,
        vo: 6,
        link: '',
        brandNames: [],
        shareLeadTicket: false,
        shareLeadTicketNewVehicleSale: false,
        shareLeadTicketUsedVehicleSale: false,
        parentGarageId: '',
        performerId: '',
        allowReviewCreationFromContactTicket: false,
        enableCrossLeadsSelfAssignCallAlert: true,
        leadsVisibleToEveryone: false
      },
      err: null,
      pending: false,
    };
  },

  mounted() {},

  methods: {
    onSubmit(form) {
      form.billingAccountId = this.billingAccount.id; // assign current billing account
      this.pending = true;
      this.action_createGarage(form).then(({ garage, err }) => {
        if (err) {
          this.err = err;
        } else {
          this.$store.dispatch(
            'openModal',
            {
              component: 'ModalMessage',
              props: {
                message: `Félicitations, l'ID pour zoho est : ${garage.id}`,
                type: 'success',
              },
            },
            { root: true }
          );
          this.resetForm();
          this.err = null;
        }
      });
      this.pending = false;
    },

    resetForm() {
      this.form = {
        type: GarageTypes.DEALERSHIP,
        ratingType: 'rating',
        isReverseRating: false,
        certificateWording: 'appointment',
        name: '',
        externalId: '',
        group: '',
        businessId: '',
        googlePlaceId: '',
        zohoDealUrl: '',
        disableZohoUrl: false,
        locale: '',
        additionalLocales: [],
        timezone: '',
        apv: 6,
        vn: 6,
        vo: 6,
        link: '',
        billingAccountId: this.billingAccount.id,
        brandNames: [],
        performerId: '',
        allowReviewCreationFromContactTicket: false,
        enableCrossLeadsSelfAssignCallAlert: true,
        leadsVisibleToEveryone: false
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.pending-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  z-index: 2;
}
.create {
  background: white;
  padding: 5px;
}
.error {
  color: orangered;
}
</style>
