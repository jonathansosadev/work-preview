<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied/subject')('title', { unsatisfiedType: unsatisfiedType, type: displayType, garageName: garageName, client: customerFullName })   }}</span>
</template>

<script>
  import DataTypes from '~/utils/models/data/type/data-types';

  export default {
    methods: {

    },
    computed: {
      displayType() {
        switch (this.payload.data.get('type')) {
          case DataTypes.MAINTENANCE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/subject')('Maintenance');
          case DataTypes.NEW_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/subject')('NewVehicleSale');
          case DataTypes.USED_VEHICLE_SALE: return this.$t_locale('pages-extended/emails/notifications/unsatisfied/subject')('UsedVehicleSale');
          case DataTypes.VEHICLE_INSPECTION: return '';
          default: return this.payload.data.get('type');
        }
      },
      garageName() {
        return this.payload.garage.publicDisplayName;
      },
      customerFullName() {
        return this.payload.data.customer.fullName.value;
      },
      payload() { return this.$store.getters.payload; },
      isSensitive() {
        const data = this.payload.data;
        const garage = this.payload.garage;
        if (!data || !garage) { return false; }
        return data.review_isSensitive(garage);
      },
      unsatisfiedType() {
        return this.isSensitive ? this.$t_locale('pages-extended/emails/notifications/unsatisfied/subject')('sensitive') : this.$t_locale('pages-extended/emails/notifications/unsatisfied/subject')('unsatisfied')
      }
    },
  }
</script>
