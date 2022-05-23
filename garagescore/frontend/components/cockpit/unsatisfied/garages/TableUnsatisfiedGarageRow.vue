<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        <GarageDetails
          :index="index"
          :certificateUrl="certifUrl"
          :certificatePublished="!this.row.hideDirectoryPage"
          :garageId="row.garageId"
          :externalId="row.externalId"
          :garageName="row.displayName"
          baseRoute="cockpit-unsatisfied"
        />
      </TableRowCell>
    </TableRow>
    <TableRow class="table">
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <GarageDetails
          :index="index"
          :certificateUrl="certifUrl"
          :certificatePublished="!this.row.hideDirectoryPage"
          :garageId="row.garageId"
          :externalId="row.externalId"
          :garageName="row.displayName"
          baseRoute="cockpit-unsatisfied"
        />
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.countUnsatisfied">
          <AppText
            tag="span"
            type="muted"
            bold
          >
            {{ row.countUnsatisfied }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="!isNaN(prcUntouched)">
          <KPINumber
            :value="prcUntouched"
            reverse
            :positiveValue="20"
            :neutralValue="20"
            :warningValue="50"
            :dangerValue="100"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countUnsatisfiedUntouched})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="!isNaN(prcTouched)">
          <KPINumber
            :value="prcTouched"
            :dangerValue="0"
            :warningValue="50"
            :neutralValue="80"
            :positiveValue="80"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countUnsatisfiedTouched})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="!isNaN(prcClosedWithResolution)">
          <KPINumber
            :value="prcClosedWithResolution"
            :dangerValue="0"
            :warningValue="50"
            :neutralValue="75"
            :positiveValue="75"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countUnsatisfiedClosedWithResolution})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="!isNaN(prcReactivity)">
          <KPINumber
            :value="prcReactivity"
            :positiveValue="80"
            :neutralValue="80"
            :warningValue="50"
            :dangerValue="0"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countUnsatisfiedReactive})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import GarageDetails from '~/components/global/GarageDetails';
import KPINumber from '~/components/ui/KPINumber.vue';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  components: {
    KPINumber,
    GarageDetails,
  },

  props: {
    row: Object,
    index: Number,
    cockpitType: String,
    wwwUrl: String,
  },

  computed: {
    certifUrl() {
      return `${this.wwwUrl}/${GarageTypes.getSlug(this.cockpitType)}/${this.row.garageSlug}`;
    },

    prcTouched() {
      return (
        (this.row.countUnsatisfiedTouched / this.row.countUnsatisfied) * 100
      );
    },

    prcClosedWithResolution() {
      return (
        (this.row.countUnsatisfiedClosedWithResolution /
          this.row.countUnsatisfied) *
        100
      );
    },

    prcUntouched() {
      return (
        (this.row.countUnsatisfiedUntouched / this.row.countUnsatisfied) * 100
      );
    },

    prcReactivity() {
      return (
        (this.row.countUnsatisfiedReactive / this.row.countUnsatisfied) * 100
      );
    },
  },
};
</script>
