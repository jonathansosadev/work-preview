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
          baseRoute="cockpit-leads"
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
          baseRoute="cockpit-leads"
        />
      </TableRowCell>
      <TableRowCell center>
        <AppText tag="span" type="muted" bold>{{ row.countLeads }}</AppText>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.countLeadsUntouched">
          <KPINumber
            :value="untreatedPercentage"
            prc
            reverse
            :positiveValue="20"
            :neutralValue="20"
            :warningValue="50"
            :dangerValue="100"
          />&nbsp;
          <AppText tag="span" size="mds" type="muted">
            {{ `(${row.countLeadsUntouched})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.countLeadsTouched">
          <KPINumber
            :value="treatedPercentage"
            :dangerValue="0"
            :warningValue="50"
            :neutralValue="80"
            :positiveValue="80"
            prc
          />&nbsp;
          <AppText tag="span" size="mds" type="muted">
            {{ `(${row.countLeadsTouched})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.countLeadsClosedWithSale">
          <KPINumber
            :value="convertedPercentage"
            :positiveValue="20" :neutralValue="20" :warningValue="10" :dangerValue="0"
            prc
          />&nbsp;
          <AppText tag="span" size="mds" type="muted">
            {{ `(${row.countLeadsClosedWithSale})` }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <KPINumber
          v-if="row.countLeadsReactive"
          :value="reactivePercentage"
          :positiveValue="80"
          :neutralValue="80"
          :warningValue="50"
          :dangerValue="0"
          prc
        />
        <span v-else>--</span>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import GarageTypes from "~/utils/models/garage.type.js";
import KPINumber from "~/components/ui/KPINumber.vue";
import GarageDetails from "~/components/global/GarageDetails";

export default {
  components: {
    KPINumber,
    GarageDetails
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

    untreatedPercentage() {
      return (this.row.countLeadsUntouched / this.row.countLeads) * 100;
    },

    treatedPercentage() {
      return (this.row.countLeadsTouched / this.row.countLeads) * 100;
    },

    convertedPercentage() {
      return (this.row.countLeadsClosedWithSale / this.row.countLeads) * 100;
    },

    reactivePercentage() {
      return (this.row.countLeadsReactive / this.row.countLeads) * 100;
    }
  },
};
</script>
