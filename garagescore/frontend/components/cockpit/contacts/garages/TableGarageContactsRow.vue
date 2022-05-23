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
          :garageName="row.garagePublicDisplayName"
          baseRoute="cockpit-contacts"
        />
      </TableRowCell>
    </TableRow>
    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <GarageDetails
          :index="index"
          :certificateUrl="certifUrl"
          :certificatePublished="!this.row.hideDirectoryPage"
          :garageId="row.garageId"
          :externalId="row.externalId"
          :garageName="row.garagePublicDisplayName"
          baseRoute="cockpit-contacts"
        />
      </TableRowCell>
      <TableRowCell center>
        <template v-if="isValidKPI(row.countSurveysRespondedPercent)">
          <KPINumber
            :value="row.countSurveysRespondedPercent"
            :dangerValue="0"
            :warningValue="20"
            :neutralValue="27"
            :positiveValue="27"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countSurveysResponded})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="isValidKPI(row.countValidEmailsPercent)">
          <KPINumber
            :value="row.countValidEmailsPercent"
            :dangerValue="0"
            :warningValue="65"
            :neutralValue="75"
            :positiveValue="75"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${totalValidEmails(row)})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="isValidKPI(row.countValidPhonesPercent)">
          <KPINumber
            :value="row.countValidPhonesPercent"
            :dangerValue="0"
            :warningValue="65"
            :neutralValue="75"
            :positiveValue="75"
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countValidPhones})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="isValidKPI(row.countNotContactablePercent)">
          <KPINumber
            :value="row.countNotContactablePercent"
            :positiveValue="5"
            :neutralValue="5"
            :warningValue="15"
            :dangerValue="100"
            reverse
            prc
          />&nbsp;
          <AppText
            tag="span"
            size="mds"
            type="muted"
          >
            {{ `(${row.countNotContactable})` }}
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
  components: { KPINumber, GarageDetails },

  props: {
    row: Object,
    index: Number,
    cockpitType: String,
    wwwUrl: String,
  },

  computed: {
    certifUrl() {
      const cockpitType = this.cockpitType;
      return `${this.wwwUrl}/${GarageTypes.getSlug(cockpitType)}/${this.row.garageSlug}`;
    },
  },

  methods: {
    totalValidEmails(row) {
      return row.countValidEmails + row.countBlockedByEmail;
    },

    isValidKPI(value) {
      return value && !isNaN(value);
    },

  },
};
</script>
