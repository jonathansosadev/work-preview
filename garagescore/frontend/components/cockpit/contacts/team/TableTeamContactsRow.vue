<template>
  <div>
    <TableRow>
      <TableRowCell :style="{ flex: 2 }" :display="['sm']">
        <TeamDetails
          :index="index"
          @click="filterByDms(row)"
          :name="row.frontDesk"
          :garageName="row.garagePublicDisplayName"
          baseRoute="cockpit-contacts"
        />
      </TableRowCell>
    </TableRow>
    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['lg', 'md']">
        <TeamDetails
          :index="index"
          @click="filterByDms(row)"
          :name="row.frontDesk"
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
        <template v-if="isValidKPI(validEmailsPercent(row))">
          <KPINumber
            :value="validEmailsPercent(row)"
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
        <template v-if="isValidKPI(validPhonesPercent(row))">
          <KPINumber
            :value="validPhonesPercent(row)"
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
            {{ `(${totalValidPhones(row)})` }}
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
import TeamDetails from "~/components/global/TeamDetails.vue";
import KPINumber from "~/components/ui/KPINumber.vue";

export default {
  components: { TeamDetails, KPINumber },

  props: {
    row: Object,
    index: Number,
    filterByDms: Function,
  },

  methods: {
    totalValidEmails(row) {
      return (row.countValidEmails || 0) + (row.countBlockedByEmail || 0);
    },
    totalEmails(row) {
      return this.totalValidEmails(row) + (row.countWrongEmails || 0) + (row.countNotPresentEmails || 0);
    },
    validEmailsPercent(row) {
      return 100 * (this.totalValidEmails(row) / this.totalEmails(row));
    },
    totalValidPhones(row) {
      return (row.countValidPhones || 0) + (row.countBlockedByPhone || 0);
    },
    totalPhones(row) {
      return this.totalValidPhones(row) + (row.countWrongPhones || 0) + (row.countNotPresentPhones || 0);
    },
    validPhonesPercent(row) {
      return 100 * (this.totalValidPhones(row) / this.totalPhones(row));
    },

    isValidKPI(value) {
      return value && !isNaN(value);
    },
  },
};
</script>
