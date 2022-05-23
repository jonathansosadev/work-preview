<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        {{ $t_locale('components/cockpit/automation/TableAutomationCampaignRowDetails')(title) }}
      </TableRowCell>
    </TableRow>

    <TableRow  class="row-details-background" border>
      <TableRowCell class="details-value" :style="{ flex: 2 }" :display="['md', 'lg']">
        {{ $t_locale('components/cockpit/automation/TableAutomationCampaignRowDetails')(title) }}
      </TableRowCell>

      <TableRowCell class="details-value" center>
        <template>
          <AppText tag="span" size="mds" type="muted" bold>{{ formatNumber(totalRunning) }} / {{ formatNumber(totalCampaigns) }}</AppText>
        </template>
      </TableRowCell>

      <TableRowCell class="details-value" center>
        <template v-if="totalSent">
          <KPINumber :value="formatNumber(totalSent)" :neutralValue="0" />
        </template>
        <span v-else>--</span>
      </TableRowCell>

      <TableRowCell class="details-value" center>
        <template v-if="totalOpened">
          <KPINumber :value="formatNumber(isMaintenance ? totalOpened : totalLead)" :neutralValue="0" />
        </template>
        <span v-else>--</span>
        &nbsp;
        <AppText tag="span" size="mds" type="muted" bold>
          ({{ percentageByCampaignType | percentage }})
        </AppText>
      </TableRowCell>

      <TableRowCell center>
        <template v-if="totalConverted">
          <KPINumber :value="formatNumber(totalConverted)" :neutralValue="0" :positiveValue="999999"/>
        </template>
        <span v-else>--</span>
        &nbsp;
        <AppText tag="span" size="mds" type="muted" bold>
            ({{ percentageConverted | percentage }})
        </AppText>
      </TableRowCell>

      <TableRowCell class="details-value" center :style="{ flex: 0.4 }"></TableRowCell>

    </TableRow>
  </div>
</template>

<script>
import AutomationCampaignTypes from '../../../utils/models/automation-campaign.type'
import AutomationCampaignDetails from './AutomationCampaignDetails.vue'
import KPINumber from '~/components/ui/KPINumber.vue'
import IconLabel from '~/components/global/IconLabel'
import ButtonStatus from '~/components/global/ButtonStatus'
import renderNumber from "~/util/renderNumber";

export default {
  components: {
    KPINumber,
    IconLabel,
    ButtonStatus,
    AutomationCampaignDetails
  },

  props: {
    title: String,
    row: Object,
    campaignType: String,
  },

  data() {
    return {}
  },

  computed: {
    isEmail() {
      return this.title === 'EMAIL';
    },
    isMaintenance() {
      return this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE;
    },
    totalRunning() {
      if (this.isEmail) {
        return this.row.runningEmail;
      }
      return this.row.runningSms;
    },
    totalCampaigns() {
      if (this.isEmail) {
        return this.row.totalCampaignsEmail;
      }
      return this.row.totalCampaignsSms;
    },
    totalSent() {
      if (this.isEmail) {
        return this.row.KPI_automationCountSentEmail;
      }
      return this.row.KPI_automationCountSentSms;
    },
    totalOpened() {
      if (this.isEmail) {
        return this.row.KPI_automationCountOpenedEmail;
      }
      return this.row.KPI_automationCountOpenedSms;
    },
    totalLead() {
      if (this.isEmail) {
        return this.row.KPI_automationCountLeadEmail;
      }
      return this.row.KPI_automationCountLeadSms;
    },
    totalConverted() {
      if (this.isEmail) {
        return this.row.KPI_automationCountConvertedEmail;
      }
      return this.row.KPI_automationCountConvertedSms;
    },
    percentageByCampaignType() {
      if (this.isMaintenance && this.totalSent > 0 && this.totalOpened > 0) {
        return (this.totalOpened / this.totalSent) * 100;
      }
      if (this.totalSent > 0 && this.totalLead > 0) {
        return (this.totalLead / this.totalSent) * 100;
      }
      return 0;
    },
    percentageConverted() {
      if (this.isMaintenance && this.totalOpened > 0) {
        return (this.totalConverted / this.totalOpened) * 100;
      }
      if (this.totalLead > 0) {
        return (this.totalConverted / this.totalLead) * 100;
      }
      return 0;
    },
  },

  methods: {
    formatNumber(numb) {
      return renderNumber(Math.max(0, numb));
    }
  }
}
</script>
<style lang="scss" scoped>
.hover-title {
  position: relative;
  top: 2px;
  padding-left: .3rem;
  font-size: .85rem;
  color: $grey;
}
.row-details-background {
  background: $bg-grey;
  border-bottom: 1px solid $white;
  padding: .5rem;
  width: calc(100% + 2rem);
  position: relative;
  left: -1rem;
}
.details-value {
  color: $dark-grey;

  &:first-child {
    padding-left: .9rem;
  }
  &:last-child {
    padding-right: .75rem;
  }
}
</style>
