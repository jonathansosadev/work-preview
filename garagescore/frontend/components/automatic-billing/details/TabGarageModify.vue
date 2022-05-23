<template>
  <div>
    <div class="pending-wrapper" v-if="pending">
      <i class="icon-gs-loading" />
    </div>
    <div class="error" v-if="err">
      {{ err[0].message }}
    </div>
    <GarageInfo
      :mirror="mirror"
      :garageId="garage && garage.id"
      :form="form"
      modify
      :submit="onSubmit"
      :type="'update'"
      :garages="garages"
    />
  </div>
</template>

<script>
import GarageInfo from '~/components/automatic-billing/details/GarageInfo.vue';

export default {
  components: { GarageInfo },

  props: {
    garages: {
      type: Array,
      default: () => [],
    },
    garage: { type: Object },
    mirror: { type: Boolean },
    action_updateGarage: { type: Function },
  },

  data() {
    return {
      form: {},
      pending: false,
      err: null,
    };
  },

  methods: {
    onSubmit(form) {
      if (!this.canSubmit) {
        return;
      }
      this.pending = true;
      this.action_updateGarage(this.garage.id, form).then(() => {
        this.pending = false;
      });
    },
  },

  computed: {
    canSubmit() {
      return this.garage !== null;
    },
  },
  mounted() {
    // TODO #3569 Regarder si l'absence de manager ne crée pas de grabuge
    if (this.garage) {
      const link = this.garage.links ? this.garage.links.find((link) => link.name === 'appointment') : null;
      this.form = {
        id: this.garage.id,
        externalId: this.garage.externalId || '',
        type: this.garage.type || '',
        name: this.garage.publicDisplayName || '',
        group: this.garage.group || '',
        businessId: this.garage.businessId || '',
        googlePlaceId: this.garage.googlePlaceId || '',
        zohoDealUrl: this.garage.zohoDealUrl || '',
        disableZohoUrl: this.garage.disableZohoUrl || false,
        ratingType: this.garage.ratingType || '',
        isReverseRating: this.garage.isReverseRating || false,
        certificateWording: this.garage.certificateWording || '',
        locale: this.garage.locale || '',
        additionalLocales: this.garage.additionalLocales || [],
        timezone: this.garage.timezone || '',
        brandNames: this.garage.brandNames || [],
        performerId: this.garage.performerId || '',
        surveySignature: {
          defaultSignature: {
            firstName:
              this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                ? this.garage.surveySignature.defaultSignature.firstName
                : '',
            lastName:
              this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                ? this.garage.surveySignature.defaultSignature.lastName
                : '',
            job:
              this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                ? this.garage.surveySignature.defaultSignature.job
                : '',
          },
        },
        apv:
          this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
            ? this.garage.thresholds.alertSensitiveThreshold.maintenance
            : 0,
        vn:
          this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
            ? this.garage.thresholds.alertSensitiveThreshold.sale_new
            : 0,
        vo:
          this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
            ? this.garage.thresholds.alertSensitiveThreshold.sale_used
            : 0,
        link: link ? link.url : '',
        parentGarageId: (this.garage.parent && this.garage.parent.garageId) || '',
        shareLeadTicket:
          (this.garage.parent && this.garage.parent.shareLeadTicket && this.garage.parent.shareLeadTicket.enabled) ||
          false,
        shareLeadTicketNewVehicleSale:
          (this.garage.parent &&
            this.garage.parent.shareLeadTicket &&
            this.garage.parent.shareLeadTicket.NewVehicleSale) ||
          false,
        shareLeadTicketUsedVehicleSale:
          (this.garage.parent &&
            this.garage.parent.shareLeadTicket &&
            this.garage.parent.shareLeadTicket.UsedVehicleSale) ||
          false,
        allowReviewCreationFromContactTicket: this.garage.allowReviewCreationFromContactTicket ?? false,
        enableCrossLeadsSelfAssignCallAlert: this.garage.enableCrossLeadsSelfAssignCallAlert ?? true,
        leadsVisibleToEveryone: this.garage.leadsVisibleToEveryone ?? false
      };
    }
  },

  watch: {
    garage() {
      if (this.garage) {
        const link = this.garage.links ? this.garage.links.find((link) => link.name === 'appointment') : null;
        this.form = {
          id: this.garage.id,
          externalId: this.garage.externalId || '',
          type: this.garage.type || '',
          name: this.garage.publicDisplayName || '',
          group: this.garage.group || '',
          businessId: this.garage.businessId || '',
          googlePlaceId: this.garage.googlePlaceId || '',
          zohoDealUrl: this.garage.zohoDealUrl || '',
          disableZohoUrl: this.garage.disableZohoUrl || false,
          ratingType: this.garage.ratingType || '',
          isReverseRating: this.garage.isReverseRating || false,
          certificateWording: this.garage.certificateWording || '',
          locale: this.garage.locale || '',
          additionalLocales: this.garage.additionalLocales || [],
          timezone: this.garage.timezone || '',
          brandNames: this.garage.brandNames || [],
          performerId: this.garage.performerId || '',
          surveySignature: {
            defaultSignature: {
              firstName:
                this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                  ? this.garage.surveySignature.defaultSignature.firstName
                  : '',
              lastName:
                this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                  ? this.garage.surveySignature.defaultSignature.lastName
                  : '',
              job:
                this.garage.surveySignature && this.garage.surveySignature.defaultSignature
                  ? this.garage.surveySignature.defaultSignature.job
                  : '',
            },
          },
          apv:
            this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
              ? this.garage.thresholds.alertSensitiveThreshold.maintenance
              : 0,
          vn:
            this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
              ? this.garage.thresholds.alertSensitiveThreshold.sale_new
              : 0,
          vo:
            this.garage.thresholds && this.garage.thresholds.alertSensitiveThreshold
              ? this.garage.thresholds.alertSensitiveThreshold.sale_used
              : 0,
          link: link ? link.url : '',
          parentGarageId: (this.garage.parent && this.garage.parent.garageId) || '',
          shareLeadTicket:
            (this.garage.parent && this.garage.parent.shareLeadTicket && this.garage.parent.shareLeadTicket.enabled) ||
            false,
          shareLeadTicketNewVehicleSale:
            (this.garage.parent &&
              this.garage.parent.shareLeadTicket &&
              this.garage.parent.shareLeadTicket.NewVehicleSale) ||
            false,
          shareLeadTicketUsedVehicleSale:
            (this.garage.parent &&
              this.garage.parent.shareLeadTicket &&
              this.garage.parent.shareLeadTicket.UsedVehicleSale) ||
            false,
          allowReviewCreationFromContactTicket: this.garage.allowReviewCreationFromContactTicket ?? false,
          enableCrossLeadsSelfAssignCallAlert: this.garage.enableCrossLeadsSelfAssignCallAlert ?? true,
          leadsVisibleToEveryone: this.garage.leadsVisibleToEveryone ?? false
        };
      }
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
.error {
  color: orangered;
}
</style>
